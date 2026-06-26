import { useCallback, useEffect, useMemo, useState } from 'react'
import type { DemoSlide } from '../../types/lesson'
import {
  formatPolynomial,
  productRuleDerivative,
  trimPolynomial,
} from '../../utils/polynomial'
import { PolynomialBuilder } from '../lesson/PolynomialBuilder'
import './Lesson4.css'

export interface PolynomialPlaygroundConfig {
  maxDegree?: number
  maxCoefficient?: number
}

interface Props {
  slide: DemoSlide
  onContinue: () => void
}

const STEP_MS = 1500
const MAX_STEP = 5

export function PolynomialPlaygroundSlide({ slide, onContinue }: Props) {
  const config = slide.config as unknown as PolynomialPlaygroundConfig
  const { maxDegree = 4, maxCoefficient = 20 } = config

  const [u, setU] = useState<number[]>([])
  const [v, setV] = useState<number[]>([])

  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)

  // Derive the product rule and pre-format every display string once per [u, v]
  // change so the step-timer ticks don't recompute trim/format on each render.
  const derived = useMemo(() => {
    const { uPrime, vPrime, uPrimeV, uVPrime, sum } = productRuleDerivative(u, v)
    return {
      uPrime,
      vPrime,
      sum,
      uStr: formatPolynomial(trimPolynomial(u)),
      vStr: formatPolynomial(trimPolynomial(v)),
      uPrimeStr: formatPolynomial(trimPolynomial(uPrime)),
      vPrimeStr: formatPolynomial(trimPolynomial(vPrime)),
      uPrimeVStr: formatPolynomial(trimPolynomial(uPrimeV)),
      uVPrimeStr: formatPolynomial(trimPolynomial(uVPrime)),
      sumStr: formatPolynomial(trimPolynomial(sum)),
    }
  }, [u, v])

  const ready = trimPolynomial(u).some((c) => c !== 0) && trimPolynomial(v).some((c) => c !== 0)

  useEffect(() => {
    if (!playing) return
    if (step >= MAX_STEP) {
      setPlaying(false)
      return
    }
    const timer = window.setTimeout(() => setStep((s) => Math.min(s + 1, MAX_STEP)), STEP_MS)
    return () => window.clearTimeout(timer)
  }, [playing, step])

  const play = useCallback(() => {
    if (!ready) return
    setStep(0)
    setPlaying(true)
  }, [ready])

  const next = useCallback(() => {
    setPlaying(false)
    setStep((s) => Math.min(s + 1, MAX_STEP))
  }, [])

  const prev = useCallback(() => {
    setPlaying(false)
    setStep((s) => Math.max(s - 1, 0))
  }, [])

  const { uStr, vStr } = derived

  const captions = [
    'Build u(x) and v(x), then press Play to derive the product rule on your own polynomials.',
    'The product rule: (uv)\u2032 = u\u2032·v + u·v\u2032 — keep one factor, differentiate the other, and add.',
    'Differentiate each factor on its own with the power rule.',
    'Substitute your polynomials into the rule: (uv)\u2032 = (u\u2032)(v) + (u)(v\u2032).',
    'Multiply out each product on its own and simplify.',
    'Add the two simplified products and combine like terms for the derivative in standard form.',
  ]

  return (
    <>
      <div className="slide-copy">
        <h2>{slide.title}</h2>
        <p>{slide.body}</p>
      </div>

      <div className="pp-builders">
        <PolynomialBuilder
          value={u}
          onChange={setU}
          maxDegree={maxDegree}
          maxCoefficient={maxCoefficient}
          label="u(x)"
        />
        <PolynomialBuilder
          value={v}
          onChange={setV}
          maxDegree={maxDegree}
          maxCoefficient={maxCoefficient}
          label="v(x)"
        />
      </div>

      <div className="cr-stage">
        <div className="cr-line">
          <span className="cr-lhs">u(x) =</span>
          <span className={`cr-term${step === 0 ? ' cr-hl' : ''}`}>{uStr}</span>
          <span className="cr-lhs">v(x) =</span>
          <span className={`cr-term${step === 0 ? ' cr-hl' : ''}`}>{vStr}</span>
        </div>

        {/* Step 1 — state the rule itself */}
        {step >= 1 && (
          <div className="cr-line cr-fade">
            <span className="cr-lhs">(uv)&prime; =</span>
            <span className={`cr-term${step === 1 ? ' cr-hl' : ''}`}>u&prime;·v + u·v&prime;</span>
          </div>
        )}

        {/* Step 2 — differentiate each factor */}
        {step >= 2 && (
          <div className="cr-line cr-fade">
            <span className="cr-lhs">u&prime;(x) =</span>
            <span className={`cr-term${step === 2 ? ' cr-hl' : ''}`}>{derived.uPrimeStr}</span>
            <span className="cr-lhs">v&prime;(x) =</span>
            <span className={`cr-term${step === 2 ? ' cr-hl' : ''}`}>{derived.vPrimeStr}</span>
          </div>
        )}

        {/* Step 3 — substitute into the rule (unexpanded) */}
        {step >= 3 && (
          <div className="cr-line cr-fade">
            <span className="cr-lhs">(uv)&prime; =</span>
            <span className={`cr-term${step === 3 ? ' cr-hl' : ''}`}>
              ({derived.uPrimeStr})({vStr})
            </span>
            <span className="cr-mult"> + </span>
            <span className={`cr-term${step === 3 ? ' cr-hl' : ''}`}>
              ({uStr})({derived.vPrimeStr})
            </span>
          </div>
        )}

        {/* Step 4 — each product worked out and simplified */}
        {step >= 4 && (
          <div className="cr-line cr-fade">
            <span className="cr-lhs">u&prime;·v =</span>
            <span className={`cr-term${step === 4 ? ' cr-hl' : ''}`}>{derived.uPrimeVStr}</span>
            <span className="cr-lhs">u·v&prime; =</span>
            <span className={`cr-term${step === 4 ? ' cr-hl' : ''}`}>{derived.uVPrimeStr}</span>
          </div>
        )}

        {/* Step 5 — add and combine like terms */}
        {step >= 5 && (
          <div className="cr-line cr-fade">
            <span className="cr-lhs">(uv)&prime; =</span>
            <span className="cr-result">{derived.sumStr}</span>
          </div>
        )}
      </div>

      <p className="cr-caption">{captions[step]}</p>

      <div className="cr-controls">
        <button type="button" className="cr-step-btn" onClick={prev} disabled={step === 0}>
          ‹ Back
        </button>
        <button type="button" className="cr-step-btn" onClick={play} disabled={!ready}>
          ▶ Play
        </button>
        <button type="button" className="cr-step-btn" onClick={next} disabled={step >= MAX_STEP}>
          Next ›
        </button>
      </div>

      <button type="button" className="slide-cta" onClick={onContinue}>
        {slide.ctaLabel ?? 'Continue'}
      </button>
    </>
  )
}
