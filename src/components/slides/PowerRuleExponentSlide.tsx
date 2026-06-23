import { useCallback, useRef, useState } from 'react'
import type { DemoSlide, PowerRuleExponentConfig } from '../../types/lesson'
import './Lesson2.css'

interface Props {
  slide: DemoSlide
  onContinue: () => void
}

const PULL_THRESHOLD = 36
const MAX_OFFSET = 72

interface Term {
  coefficient: number
  exponent: number
}

export function PowerRuleExponentSlide({ slide, onContinue }: Props) {
  const config = slide.config as unknown as PowerRuleExponentConfig
  const variable = config.variable ?? 'x'
  const initial: Term = { coefficient: config.coefficient, exponent: config.exponent }

  const [term, setTerm] = useState<Term>(initial)
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [instant, setInstant] = useState(false)
  const [steps, setSteps] = useState(0)
  const startYRef = useRef(0)

  const isConstant = term.exponent === 0
  const isZero = term.exponent === 0 && term.coefficient === 0
  const done = isZero
  const armed = dragging && offset >= PULL_THRESHOLD

  const applyStep = useCallback(() => {
    setTerm((prev) => {
      if (prev.exponent >= 1) {
        return { coefficient: prev.coefficient * prev.exponent, exponent: prev.exponent - 1 }
      }
      if (prev.coefficient !== 0) {
        return { coefficient: 0, exponent: 0 }
      }
      return prev
    })
    setSteps((s) => s + 1)
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    startYRef.current = e.clientY
    setInstant(false)
    setDragging(true)
    setOffset(0)
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
    const dy = e.clientY - startYRef.current
    setOffset(Math.max(0, Math.min(dy, MAX_OFFSET)))
  }, [])

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
      const committed = offset >= PULL_THRESHOLD
      setDragging(false)
      // On a successful pull, snap to place instantly and change the term.
      // On a short pull, leave instant off so it springs back smoothly.
      setInstant(committed)
      setOffset(0)
      if (committed) applyStep()
    },
    [offset, applyStep],
  )

  const reset = useCallback(() => {
    setTerm(initial)
    setSteps(0)
    setOffset(0)
    setDragging(false)
    setInstant(true)
  }, [initial.coefficient, initial.exponent])

  const showCoeff = isConstant || term.coefficient !== 1
  const dragOffset = offset
  const handleTransition =
    dragging || instant ? 'none' : 'transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.22s ease'
  const handleOpacity = dragging ? Math.max(0.5, 1 - (offset / MAX_OFFSET) * 0.5) : 1

  return (
    <>
      <div className="slide-copy">
        <h2>{slide.title}</h2>
        <p>{slide.body}</p>
      </div>

      <div className="pr-stage">
        <div className="pr-term" style={{ touchAction: 'none' }}>
          {isZero ? (
            <span className="pr-coeff">0</span>
          ) : isConstant ? (
            <span
              className={`pr-handle pr-const${armed ? ' pr-handle--armed' : ''}`}
              style={{
                transform: `translateY(${dragOffset}px)`,
                opacity: handleOpacity,
                transition: handleTransition,
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              {term.coefficient}
            </span>
          ) : (
            <>
              {showCoeff && <span className="pr-coeff">{term.coefficient}</span>}
              <span className="pr-var">{variable}</span>
              <span
                className={`pr-exp pr-handle${dragging ? ' pr-handle--dragging' : ''}${armed ? ' pr-handle--armed' : ''}`}
                style={{
                  transform: `translateY(${dragOffset}px)`,
                  opacity: handleOpacity,
                  transition: handleTransition,
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                {term.exponent}
              </span>
            </>
          )}
        </div>

        {!done && (
          <p className="pr-drag-hint">
            {steps === 0
              ? 'Drag the exponent down ↓'
              : isConstant
                ? 'The derivative of a constant is 0 — drag it down ↓'
                : 'Keep going — drag the exponent down ↓'}
          </p>
        )}
        {done && <p className="pr-drag-hint pr-drag-hint--done">Fully differentiated.</p>}
      </div>

      <div className="pr-rule">
        <span>
          {'d'}
          <span className="pr-rule-frac">/{'dx'}</span>
        </span>
        <span className="pr-rule-body">
          [{variable}
          <sup>n</sup>] = n·{variable}
          <sup>n−1</sup>
        </span>
      </div>

      <div className="lesson2-actions">
        <button type="button" className="slide-secondary-cta" onClick={reset}>
          Reset
        </button>
        <button type="button" className="slide-cta" onClick={onContinue}>
          {slide.ctaLabel ?? 'Continue'}
        </button>
      </div>
    </>
  )
}
