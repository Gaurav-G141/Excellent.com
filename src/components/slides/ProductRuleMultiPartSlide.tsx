import { useMemo, useState } from 'react'
import type { ProblemSlide } from '../../types/lesson'
import {
  formatPolynomial,
  polynomialsEqual,
  productRuleDerivative,
} from '../../utils/polynomial'
import { PolynomialBuilder } from '../lesson/PolynomialBuilder'
import { CorrectFlash } from '../lesson/CorrectFlash'
import { FeedbackPopup } from '../lesson/FeedbackPopup'
import './Lesson4.css'

export interface ProductRuleMultiPartConfig {
  u: number[]
  v: number[]
  uDisplay?: string
  vDisplay?: string
}

interface Props {
  slide: ProblemSlide
  onCorrect: () => void
}

export function ProductRuleMultiPartSlide({ slide, onCorrect }: Props) {
  const config = slide.config as unknown as ProductRuleMultiPartConfig
  const { u, v } = config

  const targets = useMemo(() => productRuleDerivative(u, v), [u, v])

  const uDisplay = config.uDisplay ?? formatPolynomial(u)
  const vDisplay = config.vDisplay ?? formatPolynomial(v)

  const [part, setPart] = useState(0)
  const [flash, setFlash] = useState(false)
  const [wrongFeedback, setWrongFeedback] = useState<string | null>(null)

  const [uPrimeInput, setUPrimeInput] = useState<number[]>([])
  const [vPrimeInput, setVPrimeInput] = useState<number[]>([])
  const [uPrimeVInput, setUPrimeVInput] = useState<number[]>([])
  const [uVPrimeInput, setUVPrimeInput] = useState<number[]>([])
  const [totalInput, setTotalInput] = useState<number[]>([])

  // Per-builder "wrong" flags so each calculator can light up red individually.
  const [uPrimeWrong, setUPrimeWrong] = useState(false)
  const [vPrimeWrong, setVPrimeWrong] = useState(false)
  const [uPrimeVWrong, setUPrimeVWrong] = useState(false)
  const [uVPrimeWrong, setUVPrimeWrong] = useState(false)
  const [totalWrong, setTotalWrong] = useState(false)

  const wrongMessage = slide.feedback.wrong || 'Not quite — check your work and try again.'

  function advance() {
    setWrongFeedback(null)
    setFlash(true)
    setPart((p) => p + 1)
  }

  // Editing a builder clears its red flag so the fix is reflected immediately.
  function edit(setValue: (v: number[]) => void, clearWrong: () => void) {
    return (next: number[]) => {
      setValue(next)
      clearWrong()
    }
  }

  function checkPartA() {
    const okU = polynomialsEqual(uPrimeInput, targets.uPrime)
    const okV = polynomialsEqual(vPrimeInput, targets.vPrime)
    setUPrimeWrong(!okU)
    setVPrimeWrong(!okV)
    if (okU && okV) advance()
    else setWrongFeedback(wrongMessage)
  }

  function checkPartB() {
    const okUPV = polynomialsEqual(uPrimeVInput, targets.uPrimeV)
    const okUVP = polynomialsEqual(uVPrimeInput, targets.uVPrime)
    setUPrimeVWrong(!okUPV)
    setUVPrimeWrong(!okUVP)
    if (okUPV && okUVP) advance()
    else setWrongFeedback(wrongMessage)
  }

  function checkPartC() {
    const ok = polynomialsEqual(totalInput, targets.total)
    setTotalWrong(!ok)
    if (ok) advance()
    else setWrongFeedback(wrongMessage)
  }

  const prompts = [
    'Part (a) — differentiate each factor: build u\u2032(x) and v\u2032(x).',
    'Part (b) — build the two product-rule terms separately: u\u2032·v and u·v\u2032.',
    'Part (c) — add them and simplify: build the total derivative of u·v in standard form.',
  ]

  const answers = [
    `u\u2032(x) = ${formatPolynomial(targets.uPrime)},  v\u2032(x) = ${formatPolynomial(targets.vPrime)}`,
    `u\u2032·v = ${formatPolynomial(targets.uPrimeV)},  u·v\u2032 = ${formatPolynomial(targets.uVPrime)}`,
    formatPolynomial(targets.total),
  ]

  const solved = part >= 3

  return (
    <>
      <CorrectFlash active={flash}>
        <div className="slide-copy">
          <h2>{slide.title}</h2>
          <p>{slide.body}</p>
        </div>

        <div className="mvt-given">
          <span>
            u(x) = <strong>{uDisplay}</strong>
          </span>
          <span>
            v(x) = <strong>{vDisplay}</strong>
          </span>
        </div>

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

                {isActive && !solved && i === 0 && (
                  <div className="pp-builders">
                    <PolynomialBuilder
                      value={uPrimeInput}
                      onChange={edit(setUPrimeInput, () => setUPrimeWrong(false))}
                      label="u′(x)"
                      status={uPrimeWrong ? 'wrong' : 'default'}
                    />
                    <PolynomialBuilder
                      value={vPrimeInput}
                      onChange={edit(setVPrimeInput, () => setVPrimeWrong(false))}
                      label="v′(x)"
                      status={vPrimeWrong ? 'wrong' : 'default'}
                    />
                  </div>
                )}

                {isActive && !solved && i === 1 && (
                  <div className="pp-builders">
                    <PolynomialBuilder
                      value={uPrimeVInput}
                      onChange={edit(setUPrimeVInput, () => setUPrimeVWrong(false))}
                      label="u′·v"
                      status={uPrimeVWrong ? 'wrong' : 'default'}
                    />
                    <PolynomialBuilder
                      value={uVPrimeInput}
                      onChange={edit(setUVPrimeInput, () => setUVPrimeWrong(false))}
                      label="u·v′"
                      status={uVPrimeWrong ? 'wrong' : 'default'}
                    />
                  </div>
                )}

                {isActive && !solved && i === 2 && (
                  <PolynomialBuilder
                    value={totalInput}
                    onChange={edit(setTotalInput, () => setTotalWrong(false))}
                    label="(uv)′"
                    status={totalWrong ? 'wrong' : 'default'}
                  />
                )}

                {isActive && !solved && (
                  <button
                    type="button"
                    className="slide-cta"
                    onClick={i === 0 ? checkPartA : i === 1 ? checkPartB : checkPartC}
                  >
                    Check
                  </button>
                )}

                {isDone && <p className="mvt-step-answer">{answers[i]}</p>}
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
