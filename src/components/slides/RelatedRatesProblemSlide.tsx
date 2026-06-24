import { useState } from 'react'
import type { ProblemSlide } from '../../types/lesson'
import { matchesNumber } from '../../utils/expression'
import { CorrectFlash } from '../lesson/CorrectFlash'
import { FeedbackPopup } from '../lesson/FeedbackPopup'
import './Lesson3.css'

interface Props {
  slide: ProblemSlide
  onCorrect: () => void
}

type Shape = 'sphere' | 'square' | 'cube'

interface Problem {
  shape: Shape
  prompt: string
  scaffold: string
  exact: number
  measureUnit: string
  hint: string
}

function randInt(lo: number, hi: number): number {
  return lo + Math.floor(Math.random() * (hi - lo + 1))
}

function pick<T>(values: T[]): T {
  return values[Math.floor(Math.random() * values.length)]
}

function makeProblem(): Problem {
  const shape = pick<Shape>(['sphere', 'square', 'cube'])
  const size = randInt(2, 5)
  const rate = randInt(1, 4)

  if (shape === 'sphere') {
    return {
      shape,
      prompt: `A sphere's radius grows at dr/dt = ${rate} cm/s. At r = ${size} cm, how fast is its volume changing?`,
      scaffold: 'dV/dt = (dV/dr)(dr/dt),  with  dV/dr = 4πr²',
      exact: 4 * Math.PI * size * size * rate,
      measureUnit: 'cm³/s',
      hint: `dV/dr = 4πr² = 4π·${size}². Multiply by dr/dt = ${rate}. You can answer with π.`,
    }
  }

  if (shape === 'square') {
    return {
      shape,
      prompt: `A square's side grows at ds/dt = ${rate} cm/s. At s = ${size} cm, how fast is its area changing?`,
      scaffold: 'dA/dt = (dA/ds)(ds/dt),  with  dA/ds = 2s',
      exact: 2 * size * rate,
      measureUnit: 'cm²/s',
      hint: `dA/ds = 2s = 2·${size}. Multiply by ds/dt = ${rate}.`,
    }
  }

  return {
    shape,
    prompt: `A cube's edge grows at ds/dt = ${rate} cm/s. At s = ${size} cm, how fast is its volume changing?`,
    scaffold: 'dV/dt = (dV/ds)(ds/dt),  with  dV/ds = 3s²',
    exact: 3 * size * size * rate,
    measureUnit: 'cm³/s',
    hint: `dV/ds = 3s² = 3·${size}². Multiply by ds/dt = ${rate}.`,
  }
}

function ShapeGlyph({ shape }: { shape: Shape }) {
  if (shape === 'sphere') {
    return (
      <svg className="rr-shape" viewBox="0 0 80 80" aria-hidden>
        <circle cx="40" cy="40" r="26" className="rr-shape-fill" />
        <ellipse cx="40" cy="40" rx="26" ry="9" className="rr-shape-line" />
      </svg>
    )
  }
  if (shape === 'square') {
    return (
      <svg className="rr-shape" viewBox="0 0 80 80" aria-hidden>
        <rect x="16" y="16" width="48" height="48" rx="3" className="rr-shape-fill" />
      </svg>
    )
  }
  return (
    <svg className="rr-shape" viewBox="0 0 80 80" aria-hidden>
      <rect x="14" y="26" width="38" height="38" rx="2" className="rr-shape-fill" />
      <path d="M14 26 L28 14 L66 14 L52 26" className="rr-shape-line" />
      <path d="M52 26 L66 14 L66 52 L52 64" className="rr-shape-line" />
    </svg>
  )
}

export function RelatedRatesProblemSlide({ slide, onCorrect }: Props) {
  const [problem] = useState(makeProblem)
  const [answer, setAnswer] = useState('')
  const [solved, setSolved] = useState(false)
  const [flashCorrect, setFlashCorrect] = useState(false)
  const [wrongFeedback, setWrongFeedback] = useState<string | null>(null)

  function handleCheck() {
    if (solved || answer.trim() === '') return
    if (matchesNumber(answer, problem.exact)) {
      setSolved(true)
      setFlashCorrect(true)
      setWrongFeedback(null)
    } else {
      setWrongFeedback(slide.feedback.wrong || problem.hint)
    }
  }

  return (
    <>
      <CorrectFlash active={flashCorrect}>
        <div className="slide-copy">
          <h2>{slide.title}</h2>
          <p>{slide.body}</p>
        </div>

        <div className="rr-problem">
          <ShapeGlyph shape={problem.shape} />
          <p className="rr-prompt">{problem.prompt}</p>
        </div>

        <p className="rr-scaffold">{problem.scaffold}</p>

        {!solved ? (
          <div className="slide-slope-input">
            <label htmlFor="rr-answer">Rate of change ({problem.measureUnit})</label>
            <input
              id="rr-answer"
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="enter a number — π is allowed"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCheck()
              }}
            />
            <button
              type="button"
              className="slide-cta"
              disabled={answer.trim() === ''}
              onClick={handleCheck}
            >
              Check
            </button>
          </div>
        ) : (
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
