import { useMemo, useState } from 'react'
import type { MvtMultiPartConfig, ProblemSlide } from '../../types/lesson'
import {
  derivativeCoefficients,
  evaluatePoly,
  findWhereDerivativeEquals,
} from '../../utils/polynomial'
import { GraphCanvas } from '../graph/GraphCanvas'
import { SecantLine } from '../graph/SecantLine'
import { CorrectFlash } from '../lesson/CorrectFlash'
import { FeedbackPopup } from '../lesson/FeedbackPopup'
import './Lesson2.css'

interface Props {
  slide: ProblemSlide
  onCorrect: () => void
}

export function MvtMultiPartSlide({ slide, onCorrect }: Props) {
  const config = slide.config as unknown as MvtMultiPartConfig
  const {
    coefficients,
    viewport,
    ax,
    bx,
    functionDisplay,
    derivativeDisplay,
    slopeTolerance = 0.1,
    cTolerance = 0.2,
    derivativeTolerance = 0.12,
  } = config

  const lo = Math.min(ax, bx)
  const hi = Math.max(ax, bx)
  const derivative = useMemo(() => derivativeCoefficients(coefficients), [coefficients])
  const secantSlope = useMemo(
    () => (evaluatePoly(coefficients, hi) - evaluatePoly(coefficients, lo)) / (hi - lo),
    [coefficients, lo, hi],
  )
  const cValue = useMemo(
    () => findWhereDerivativeEquals(coefficients, secantSlope, lo, hi),
    [coefficients, secantSlope, lo, hi],
  )

  const [part, setPart] = useState(0)
  const [inputs, setInputs] = useState(['', ''])
  const [flash, setFlash] = useState(false)
  const [wrongFeedback, setWrongFeedback] = useState<string | null>(null)

  const prompts = [
    'Part 1 — slope of the secant from A to B:',
    'Part 2 — a value x = c in (a, b) where f\u2032(c) equals that slope:',
  ]
  const placeholders = ['enter a number', 'enter a number']

  function setInput(value: string) {
    setInputs((prev) => prev.map((v, i) => (i === part ? value : v)))
  }

  function checkPart() {
    const value = inputs[part].trim()
    if (value === '') return
    const entered = Number.parseFloat(value)
    if (Number.isNaN(entered)) {
      setWrongFeedback('Enter a number.')
      return
    }

    let correct = false
    if (part === 0) {
      correct = Math.abs(entered - secantSlope) <= slopeTolerance
    } else {
      correct =
        entered > lo &&
        entered < hi &&
        Math.abs(evaluatePoly(derivative, entered) - secantSlope) <= derivativeTolerance &&
        (cValue == null || Math.abs(entered - cValue) <= cTolerance + 0.5)
    }

    if (!correct) {
      setWrongFeedback(slide.feedback.wrong || 'Not quite — check your work and try again.')
      return
    }

    setWrongFeedback(null)
    setFlash(true)
    setPart((p) => p + 1)
  }

  const solved = part >= 2

  return (
    <>
      <CorrectFlash active={flash}>
        <div className="slide-copy">
          <h2>{slide.title}</h2>
          <p>{slide.body}</p>
        </div>

        <div className="mvt-given">
          <span>
            f(x) = <strong>{functionDisplay}</strong>
          </span>
          <span>
            f&prime;(x) = <strong>{derivativeDisplay}</strong>
          </span>
        </div>

        <GraphCanvas coefficients={coefficients} viewport={viewport} unitGrid showAxisLabels>
          {(api) => {
            const segment = api.secantSegment(ax, bx, 0)
            const aS = api.toScreen(ax, evaluatePoly(coefficients, ax))
            const bS = api.toScreen(bx, evaluatePoly(coefficients, bx))
            return (
              <>
                <SecantLine segment={segment} />
                <circle cx={aS.x} cy={aS.y} r={5} className="graph-target-dot" />
                <text x={aS.x} y={aS.y - 12} className="graph-target-label">A</text>
                <circle cx={bS.x} cy={bS.y} r={5} className="graph-target-dot" />
                <text x={bS.x} y={bS.y - 12} className="graph-target-label">B</text>
              </>
            )
          }}
        </GraphCanvas>

        <div className="mvt-steps">
          {prompts.map((prompt, i) => {
            const isActive = i === part
            const isDone = i < part
            return (
              <div
                key={prompt}
                className={`mvt-step${isActive ? ' mvt-step--active' : ''}${isDone ? ' mvt-step--done' : ''}`}
              >
                <p className="mvt-step-prompt">
                  {isDone && <span className="mvt-check">✓</span>} {prompt}
                </p>
                {isActive && !solved && (
                  <div className="slide-slope-input">
                    <input
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      spellCheck={false}
                      placeholder={placeholders[part]}
                      value={inputs[part]}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') checkPart()
                      }}
                    />
                    <button
                      type="button"
                      className="slide-cta"
                      disabled={inputs[part].trim() === ''}
                      onClick={checkPart}
                    >
                      Check
                    </button>
                  </div>
                )}
                {isDone && <p className="mvt-step-answer">{inputs[i]}</p>}
              </div>
            )
          })}
        </div>

        {solved && (
          <button type="button" className="slide-cta" onClick={onCorrect}>
            Continue
          </button>
        )}
      </CorrectFlash>

      {wrongFeedback && (
        <FeedbackPopup
          message={wrongFeedback}
          correct={false}
          onDismiss={() => setWrongFeedback(null)}
        />
      )}
    </>
  )
}
