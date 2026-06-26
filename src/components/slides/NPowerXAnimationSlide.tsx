import { useCallback, useEffect, useState } from 'react'
import type { DemoSlide } from '../../types/lesson'
import './Lesson4.css'

export interface NPowerXAnimationConfig {
  /** The base n in d/dx[n^x], e.g. 2 or 3. */
  base: number
}

interface Props {
  slide: DemoSlide
  onContinue: () => void
}

const STEP_MS = 1400
const LAST_STEP = 3

function Superscript({ children }: { children: React.ReactNode }) {
  return <sup className="cr-sup">{children}</sup>
}

export function NPowerXAnimationSlide({ slide, onContinue }: Props) {
  const config = slide.config as unknown as NPowerXAnimationConfig
  const { base } = config

  const lnBase = Math.log(base)
  const lnApprox = lnBase.toFixed(3)

  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [runId, setRunId] = useState(0)

  // Each play run reveals the remaining steps one beat at a time until the
  // punchline (LAST_STEP) is on screen, then stops.
  useEffect(() => {
    if (!playing) return
    const t1 = window.setTimeout(() => setStep(1), STEP_MS)
    const t2 = window.setTimeout(() => setStep(2), STEP_MS * 2)
    const t3 = window.setTimeout(() => {
      setStep(LAST_STEP)
      setPlaying(false)
    }, STEP_MS * 3)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
    }
  }, [playing, runId])

  const play = useCallback(() => {
    setStep(0)
    setPlaying(true)
    setRunId((r) => r + 1)
  }, [])

  const next = useCallback(() => {
    setPlaying(false)
    setStep((s) => Math.min(s + 1, LAST_STEP))
  }, [])

  const prev = useCallback(() => {
    setPlaying(false)
    setStep((s) => Math.max(s - 1, 0))
  }, [])

  const captions = [
    `Start with the exponential n^x, where n = ${base}.`,
    `Rewrite the base using e: n = e^(ln n), so n^x = e^(ln(n)·x). Here ln ${base} \u2248 ${lnApprox}.`,
    'Differentiate with the chain rule: the derivative of e^(u) is e^(u)·u\u2032, and u = ln(n)·x has u\u2032 = ln(n).',
    `Since e^(ln(n)·x) is just n^x again, the derivative simplifies to the punchline: ln(n)·n^x.`,
  ]

  return (
    <>
      <div className="slide-copy">
        <h2>{slide.title}</h2>
        <p>{slide.body}</p>
      </div>

      <div className="cr-stage npx-stage">
        {/* Step 0 — the function itself */}
        <div className="cr-line">
          <span className="cr-lhs">f(x) =</span>
          <span className={`npx-expr${step === 0 ? ' cr-hl' : ''}`}>
            {base}
            <Superscript>x</Superscript>
          </span>
        </div>

        {/* Step 1 — rewrite via e */}
        {step >= 1 && (
          <div className="cr-line cr-fade">
            <span className="cr-lhs">=</span>
            <span className={`npx-expr${step === 1 ? ' cr-hl' : ''}`}>
              e<Superscript>(ln({base})·x)</Superscript>
            </span>
            <span className="npx-note">{`(ln ${base} \u2248 ${lnApprox})`}</span>
          </div>
        )}

        {/* Step 2 — chain rule applied */}
        {step >= 2 && (
          <div className="cr-line cr-fade">
            <span className="cr-lhs">f&prime;(x) =</span>
            <span className={`npx-expr${step === 2 ? ' cr-hl' : ''}`}>
              e<Superscript>(ln({base})·x)</Superscript>
            </span>
            <span className="cr-mult"> · ln({base})</span>
          </div>
        )}

        {/* Step 3 — the punchline */}
        {step >= LAST_STEP && (
          <div className="cr-line cr-fade">
            <span className="cr-lhs">f&prime;(x) =</span>
            <span className="npx-result">
              ln({base}) · {base}
              <Superscript>x</Superscript>
            </span>
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
        <button type="button" className="cr-step-btn" onClick={next} disabled={step === LAST_STEP}>
          Next ›
        </button>
      </div>

      <button type="button" className="slide-cta" onClick={onContinue}>
        {slide.ctaLabel ?? 'Continue'}
      </button>
    </>
  )
}
