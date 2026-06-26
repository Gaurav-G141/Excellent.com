import { useCallback, useEffect, useState } from 'react'
import type { ChainRuleConfig, DemoSlide } from '../../types/lesson'
import { derivativeCoefficients } from '../../utils/polynomial'
import './Lesson2.css'

interface Props {
  slide: DemoSlide
  onContinue: () => void
}

const STEP_MS = 1500

function Superscript({ value }: { value: number }) {
  return <sup className="cr-sup">{value}</sup>
}

export function ChainRuleSlide({ slide, onContinue }: Props) {
  const config = slide.config as unknown as ChainRuleConfig
  const { outerCoefficients, innerCoefficients, innerDisplay } = config

  const n = outerCoefficients.length - 1
  const outerLead = outerCoefficients[n] ?? 1
  const innerDeriv = derivativeCoefficients(innerCoefficients)
  const innerDerivConstant = innerDeriv.length <= 1 ? (innerDeriv[0] ?? 0) : null

  // Step 1 coefficient: outerLead * n. Step 2 multiplies by inner'(x) (constant here).
  const step1Coeff = outerLead * n
  const step2Coeff = innerDerivConstant != null ? step1Coeff * innerDerivConstant : step1Coeff

  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [runId, setRunId] = useState(0)

  // Re-runs whenever a new play is requested (runId bump), animating both steps.
  // The first step reveals almost immediately so the animation starts as soon
  // as Play is pressed; the second follows one beat later.
  useEffect(() => {
    if (!playing) return
    const t1 = window.setTimeout(() => setStep(1), 60)
    const t2 = window.setTimeout(() => {
      setStep(2)
      setPlaying(false)
    }, STEP_MS + 60)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [playing, runId])

  const play = useCallback(() => {
    setStep(0)
    setPlaying(true)
    setRunId((r) => r + 1)
  }, [])

  const next = useCallback(() => {
    setPlaying(false)
    setStep((s) => Math.min(s + 1, 2))
  }, [])

  const prev = useCallback(() => {
    setPlaying(false)
    setStep((s) => Math.max(s - 1, 0))
  }, [])

  const coeffLabel = (c: number) => (c === 1 ? '' : String(c))

  const captions = [
    'A function inside a function: the outer power wraps the inner expression.',
    'Step 1. Differentiate the outer power: bring the exponent down, drop the power by one, and keep the inside untouched as a factor (still to be differentiated).',
    `Step 2. Multiply by the derivative of the inside: (${innerDisplay})\u2032 = ${innerDerivConstant ?? '?'}.`,
  ]

  return (
    <>
      <div className="slide-copy">
        <h2>{slide.title}</h2>
        <p>{slide.body}</p>
      </div>

      <div className="cr-stage">
        {/* f(x) line */}
        <div className="cr-line">
          <span className="cr-lhs">f(x) =</span>
          <span className={`cr-outer${step === 0 ? ' cr-hl' : ''}`}>
            ({innerDisplay})
            <Superscript value={n} />
          </span>
        </div>

        {/* derivative line, progressively revealed */}
        {step >= 1 && (
          <div className="cr-line cr-fade">
            <span className="cr-lhs">f&prime;(x) =</span>
            <span className={`cr-term${step === 1 ? ' cr-hl' : ''}`}>
              {coeffLabel(step1Coeff)}({innerDisplay})
              <Superscript value={n - 1} />
            </span>
            {/* The inside's derivative is part of f′(x) from the start; step 1 leaves
                it written symbolically, step 2 substitutes its value. */}
            <span className={`cr-mult${step === 2 ? ' cr-hl' : ''}`}>
              {' · '}
              {step >= 2 && innerDerivConstant != null
                ? innerDerivConstant
                : `(${innerDisplay})\u2032`}
            </span>
            {step >= 2 && innerDerivConstant != null && (
              <>
                <span className="cr-equals"> = </span>
                <span className="cr-result">
                  {coeffLabel(step2Coeff)}({innerDisplay})
                  <Superscript value={n - 1} />
                </span>
              </>
            )}
          </div>
        )}
      </div>

      <p className="cr-caption">{captions[step]}</p>

      <div className="cr-controls">
        <button type="button" className="cr-step-btn" onClick={prev} disabled={step === 0}>
          ‹ Back
        </button>
        <button type="button" className="cr-step-btn" onClick={play}>
          ▶ Play
        </button>
        <button type="button" className="cr-step-btn" onClick={next} disabled={step === 2}>
          Next ›
        </button>
      </div>

      <button type="button" className="slide-cta" onClick={onContinue}>
        {slide.ctaLabel ?? 'Continue'}
      </button>
    </>
  )
}
