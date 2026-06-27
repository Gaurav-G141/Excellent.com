import { useEffect, useRef, useState } from 'react'
import type { ProblemSlide } from '../../types/lesson'
import { gradeFreeResponse } from '../../lib/aiGrade'
import { formatPolynomial, polynomialsEqual, trimPolynomial } from '../../utils/polynomial'
import { PolynomialBuilder } from '../lesson/PolynomialBuilder'
import { CorrectFlash } from '../lesson/CorrectFlash'
import { FeedbackPopup } from '../lesson/FeedbackPopup'
import { fmt, volumeCoefficients } from './paperBox'
import './PaperBox.css'

export interface BoxVolumeDeriveConfig {
  width: number
  length: number
  unit?: string
}

interface Props {
  slide: ProblemSlide
  onCorrect: () => void
}

const QUESTION =
  'How would you find the corner cut x that makes the box hold the most? Describe your plan in a sentence or two.'
const RUBRIC =
  'A fully correct answer MUST describe BOTH steps of the method: (1) take the derivative of the volume function V(x), AND (2) set that derivative equal to zero (i.e. find where the slope / rate of change is zero) and solve for x to locate the critical point that gives the maximum volume. ' +
  'Mark the answer INCORRECT if it only says to take the derivative without also explaining what to do with it — i.e. that it must be set equal to zero / used to find where the slope is zero / solved for x. ' +
  'Vague answers such as "take the derivative of the volume", "use the derivative", or "differentiate V(x)" are NOT sufficient on their own and must be marked incorrect. Be strict and specific.'

/** Local fallback used only when the AI grader is unavailable. */
function heuristicGrade(answer: string): boolean {
  const a = answer.toLowerCase()
  const mentionsMethod = /(deriv|slope|rate of change|d\/dx|v')/.test(a)
  const mentionsZero = /(zero|= 0|equal 0|equals 0|flat|maximum|max|top|peak)/.test(a)
  return answer.trim().length >= 12 && mentionsMethod && mentionsZero
}

/** Static flat-sheet schematic with the corner cut labeled (no center label). */
function SheetSchematic({
  width,
  length,
  unit,
}: {
  width: number
  length: number
  unit: string
}) {
  const VIEW = 200
  const H = 150
  const s = H / length
  const w = width * s
  const ox = (VIEW - w) / 2
  const oy = 12
  const c = Math.min(w, H) * 0.2
  return (
    <svg
      className="pb-svg"
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      role="img"
      aria-label="A rectangular sheet with a square of side x removed from each corner"
    >
      <rect className="pb-paper" x={ox} y={oy} width={w} height={H} rx={2} />
      {[
        [ox, oy],
        [ox + w - c, oy],
        [ox + w - c, oy + H - c],
        [ox, oy + H - c],
      ].map(([x, y], i) => (
        <rect key={i} className="pb-corner-preview" x={x} y={y} width={c} height={c} />
      ))}
      <text className="pb-dim-text" x={ox + c / 2} y={oy + c / 2 + 4}>
        x
      </text>
      <text className="pb-dim-text" x={ox + w / 2} y={oy + H + 14}>
        {fmt(width)} {unit}
      </text>
      <text
        className="pb-dim-text"
        x={ox - 8}
        y={oy + H / 2}
        transform={`rotate(-90 ${ox - 8} ${oy + H / 2})`}
      >
        {fmt(length)} {unit}
      </text>
    </svg>
  )
}

export function BoxVolumeDeriveSlide({ slide, onCorrect }: Props) {
  const config = slide.config as unknown as BoxVolumeDeriveConfig
  const { width: W, length: L, unit = 'in' } = config
  const target = volumeCoefficients(W, L)

  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [poly, setPoly] = useState<number[]>([])
  const [polyWrong, setPolyWrong] = useState(false)
  const [polyAttempts, setPolyAttempts] = useState(0)
  const [response, setResponse] = useState('')
  const [grading, setGrading] = useState(false)
  const [flash, setFlash] = useState(false)
  const [wrong, setWrong] = useState<string | null>(null)

  const flashTimer = useRef<number | null>(null)
  useEffect(
    () => () => {
      if (flashTimer.current !== null) window.clearTimeout(flashTimer.current)
    },
    [],
  )

  // Momentary green flash that re-triggers on every correct answer (a sticky
  // `true` would never re-fire CorrectFlash for the second correct step).
  function flashCorrect() {
    setFlash(true)
    if (flashTimer.current !== null) window.clearTimeout(flashTimer.current)
    flashTimer.current = window.setTimeout(() => setFlash(false), 750)
  }

  const hasPoly = trimPolynomial(poly).some((c) => c !== 0)

  // Progressively more revealing hints the more times the build is wrong.
  function polyHint(attempt: number): string {
    switch (attempt) {
      case 1:
        return 'Not quite. How might you find the volume of the box? Recall that the box is a rectangular prism.'
      case 2:
        return 'The volume of a rectangular prism is the length times the width times the height.'
      case 3:
        return `The length of the prism is ${fmt(L)} − 2x, as x inches is removed from each side of the paper.`
      case 4:
        return `The length of the prism is ${fmt(L)} − 2x, as x inches is removed from each side of the paper. Similarly, the width is ${fmt(W)} − 2x.`
      default:
        return `The length of the prism is ${fmt(L)} − 2x, as x inches is removed from each side of the paper. Similarly, the width is ${fmt(W)} − 2x. Finally, the height of the paper is x. Multiply these terms to get the volume as a formula of x.`
    }
  }

  function checkPoly() {
    if (!hasPoly) return
    if (polynomialsEqual(poly, target)) {
      setPolyWrong(false)
      setWrong(null)
      flashCorrect()
      setStep(1)
    } else {
      const attempt = polyAttempts + 1
      setPolyAttempts(attempt)
      setPolyWrong(true)
      setWrong(polyHint(attempt))
    }
  }

  async function submitResponse() {
    if (response.trim().length < 3 || grading) return
    setGrading(true)
    try {
      const verdict = await gradeFreeResponse({
        question: QUESTION,
        rubric: RUBRIC,
        answer: response,
      })
      const correct = verdict ? verdict.correct : heuristicGrade(response)
      if (correct) {
        setWrong(null)
        flashCorrect()
        setStep(2)
      } else {
        setWrong(
          verdict?.feedback ||
            'Think about the explorer: the volume rose, peaked, then fell. What is the slope of V(x) doing right at the peak?',
        )
      }
    } finally {
      setGrading(false)
    }
  }

  return (
    <>
      <CorrectFlash active={flash}>
        <div className="slide-copy">
          <h2>{slide.title}</h2>
          <p>{slide.body}</p>
        </div>

        <div className="pb-stage">
          <SheetSchematic width={W} length={L} unit={unit} />
        </div>

        <div className="pb-steps">
          <div
            className={`pb-step${step === 0 ? ' pb-step--active' : ''}${step > 0 ? ' pb-step--done' : ''}`}
          >
            <p className="pb-step-prompt">
              {step > 0 && <span className="pb-check">✓</span>}
              Build the box volume V(x) with the calculator.
            </p>
            {step === 0 ? (
              <>
                <PolynomialBuilder
                  value={poly}
                  onChange={(next) => {
                    setPoly(next)
                    if (polyWrong) setPolyWrong(false)
                  }}
                  maxDegree={3}
                  maxCoefficient={200}
                  allowDecimal
                  label="V(x) ="
                  status={polyWrong ? 'wrong' : 'default'}
                />
                <button
                  type="button"
                  className="slide-cta"
                  disabled={!hasPoly}
                  onClick={checkPoly}
                >
                  Check
                </button>
              </>
            ) : (
              <p className="pb-step-answer">V(x) = {formatPolynomial(trimPolynomial(poly))}</p>
            )}
          </div>

          {step >= 1 && (
            <div
              className={`pb-step${step === 1 ? ' pb-step--active' : ''}${step > 1 ? ' pb-step--done' : ''}`}
            >
              <p className="pb-step-prompt">
                {step > 1 && <span className="pb-check">✓</span>}
                {QUESTION}
              </p>
              {step === 1 ? (
                <>
                  <textarea
                    className="pb-textarea"
                    rows={3}
                    placeholder="Type your plan in your own words…"
                    value={response}
                    onChange={(e) => {
                      setResponse(e.target.value)
                      if (wrong) setWrong(null)
                    }}
                    disabled={grading}
                  />
                  <button
                    type="button"
                    className="slide-cta"
                    disabled={response.trim().length < 3 || grading}
                    onClick={submitResponse}
                  >
                    {grading ? 'Checking…' : 'Submit answer'}
                  </button>
                </>
              ) : (
                <div className="pb-ideal">
                  <p className="pb-ideal-title">That's right!</p>
                  <p>
                    By taking the derivative of the volume and setting it to zero, we can look
                    for critical points — and the maximum will be one of those critical points
                    (see Lesson 1).
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {step === 2 && (
          <button type="button" className="slide-cta" onClick={onCorrect}>
            Continue
          </button>
        )}
      </CorrectFlash>

      {wrong && (
        <FeedbackPopup message={wrong} correct={false} onDismiss={() => setWrong(null)} />
      )}
    </>
  )
}
