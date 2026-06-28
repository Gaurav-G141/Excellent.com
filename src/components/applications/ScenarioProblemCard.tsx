import { useEffect, useMemo, useRef, useState } from 'react'
import type { Outcome } from '../../utils/applications/difficulty'
import {
  resolveStepPrompt,
  visibleSteps,
  type ScenarioProblem,
  type ScenarioStep,
} from '../../utils/applications/scenarioTypes'
import {
  gradeCodeStep,
  heuristicGradeFrq,
  rigorForLevel,
} from '../../utils/applications/scenarioGrade'
import { clarifyQuestion } from '../../utils/applications/scenarioClarify'
import { scenarioAnswerValues } from '../../utils/applications/scenarioRewrite'
import { gradeFreeResponse } from '../../lib/aiGrade'
import { trimPolynomial } from '../../utils/polynomial'
import { PolynomialBuilder } from '../lesson/PolynomialBuilder'
import { CorrectFlash } from '../lesson/CorrectFlash'
import { FeedbackPopup } from '../lesson/FeedbackPopup'
import './ScenarioProblemCard.css'

interface Props {
  problem: ScenarioProblem
  /** Served difficulty level; controls which steps are visible + their wording. */
  level: number
  /** Called once every visible step is answered correctly. */
  onSolved: (outcome: Outcome) => void
  /** Called on each wrong submission (any step), the moment it happens. */
  onWrongAttempt?: () => void
}

interface DoneEntry {
  id: string
  question: string
  answer: string
}

/**
 * Renders one scenario as a sequential stepper: a real-world prompt followed by
 * steps revealed one at a time. The first conceptual step is graded by the AI
 * (with a local keyword fallback); the rest are graded in code. Each step allows
 * unlimited attempts with progressive hints; the worked answer is never shown.
 */
export function ScenarioProblemCard({ problem, level, onSolved, onWrongAttempt }: Props) {
  const steps = useMemo(() => visibleSteps(problem.steps, level), [problem.steps, level])
  // Grade FRQs harder as difficulty rises (lenient → standard → strict).
  const rigor = rigorForLevel(level)

  const [stepIndex, setStepIndex] = useState(0)
  const [done, setDone] = useState<DoneEntry[]>([])
  const [stepAttempts, setStepAttempts] = useState(0)
  const [grading, setGrading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [solved, setSolved] = useState(false)
  const [flash, setFlash] = useState(false)

  // A clearer AI rewording of the current FRQ question, when the learner asks
  // for one. Resets each step. The original `currentQuestion` is always the
  // source we reword from, so "reword again" never compounds drift.
  const [clarified, setClarified] = useState<string | null>(null)
  const [clarifying, setClarifying] = useState(false)

  // Current working answer: `text` for typed/choice/FRQ, `coeffs` for the builder.
  const [text, setText] = useState('')
  const [coeffs, setCoeffs] = useState<number[]>([])

  // Refs for counts read synchronously inside async handlers / timers.
  const wrongRef = useRef(0)
  const stepAttemptRef = useRef(0)
  const mountedRef = useRef(true)
  const solveTimer = useRef<number | null>(null)
  const flashTimer = useRef<number | null>(null)
  // Bumped on every step change so a late clarify result can't land on the
  // wrong step.
  const clarifyToken = useRef(0)

  // Concrete answer values that an AI reword must never surface.
  const forbiddenNumbers = useMemo(
    () => scenarioAnswerValues(problem.steps),
    [problem.steps],
  )

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (solveTimer.current !== null) window.clearTimeout(solveTimer.current)
      if (flashTimer.current !== null) window.clearTimeout(flashTimer.current)
    }
  }, [])

  const current: ScenarioStep | undefined = steps[stepIndex]
  const currentQuestion = current ? resolveStepPrompt(current.prompt, level) : ''
  // What the learner actually reads (and is graded against): the clarified
  // wording when they asked for one, otherwise the original.
  const displayedQuestion = clarified ?? currentQuestion

  const rawValue =
    current && current.kind === 'expression' && current.builder
      ? coeffsToInput(coeffs)
      : text
  const hasValue = rawValue.trim() !== ''

  function advance(entry: DoneEntry) {
    setDone((d) => [...d, entry])
    setFlash(true)
    flashTimer.current = window.setTimeout(() => setFlash(false), 700)

    const nextIndex = stepIndex + 1
    if (nextIndex >= steps.length) {
      setSolved(true)
      solveTimer.current = window.setTimeout(
        () => onSolved({ solved: true, wrongAttempts: wrongRef.current, skipped: false }),
        700,
      )
      return
    }
    setStepIndex(nextIndex)
    setStepAttempts(0)
    stepAttemptRef.current = 0
    setText('')
    setCoeffs([])
    setFeedback(null)
    // New step: drop any clarified wording and ignore an in-flight clarify.
    clarifyToken.current += 1
    setClarified(null)
    setClarifying(false)
  }

  async function clarify() {
    if (clarifying || !current || current.kind !== 'frq') return
    const token = clarifyToken.current
    setClarifying(true)
    let reworded: string | null = null
    try {
      reworded = await clarifyQuestion({
        // Always reword from the original wording so repeats don't drift.
        question: currentQuestion,
        scenarioTitle: problem.title,
        scenarioPrompt: problem.prompt,
        forbiddenNumbers,
        level,
      })
    } catch {
      reworded = null
    }
    if (!mountedRef.current || clarifyToken.current !== token) return
    setClarifying(false)
    if (reworded) setClarified(reworded)
    else setFeedback('Sorry, that one could not be reworded right now. Here is the original question.')
  }

  function registerWrong(step: ScenarioStep, aiFeedback?: string) {
    wrongRef.current += 1
    onWrongAttempt?.()
    const hint = hintFor(step, stepAttemptRef.current)
    setFeedback(aiFeedback || hint || 'Not quite — give it another look.')
  }

  function bumpStepAttempt() {
    stepAttemptRef.current += 1
    setStepAttempts(stepAttemptRef.current)
  }

  function checkCodeStep() {
    if (solved || grading || !current || current.kind === 'frq' || !hasValue) return
    bumpStepAttempt()
    if (gradeCodeStep(current, rawValue)) {
      advance({ id: current.id, question: currentQuestion, answer: displayAnswer(current, rawValue, coeffs) })
    } else {
      registerWrong(current)
    }
  }

  async function submitFrq() {
    if (solved || grading || !current || current.kind !== 'frq') return
    const answer = text.trim()
    if (answer.length === 0) return
    const step = current
    setGrading(true)
    let correct = false
    let aiFeedback = ''
    try {
      const verdict = await gradeFreeResponse({
        question: displayedQuestion,
        rubric: step.rubric,
        answer,
        rigor,
      })
      if (verdict) {
        correct = verdict.correct
        aiFeedback = verdict.feedback
      } else {
        correct = heuristicGradeFrq(step, answer, rigor)
      }
    } catch {
      correct = heuristicGradeFrq(step, answer, rigor)
    }
    if (!mountedRef.current) return
    setGrading(false)
    bumpStepAttempt()
    if (correct) {
      advance({ id: step.id, question: displayedQuestion, answer: step.idealAnswer ?? 'Answered.' })
    } else {
      registerWrong(step, aiFeedback)
    }
  }

  return (
    <CorrectFlash active={flash}>
      <div className="sc-card">
        <h3 className="sc-title">{problem.title}</h3>
        <p className="sc-prompt">{problem.prompt}</p>
        {problem.given ? <p className="sc-given">{problem.given}</p> : null}

        <ol className="sc-steps">
          {done.map((entry, i) => (
            <li key={entry.id} className="sc-step sc-step--done">
              <div className="sc-step-head">
                <span className="sc-step-num">Step {i + 1}</span>
                <span className="sc-step-check" aria-hidden="true">
                  ✓
                </span>
              </div>
              <p className="sc-step-q">{entry.question}</p>
              <p className="sc-step-a">{entry.answer}</p>
            </li>
          ))}

          {current && !solved ? (
            <li className="sc-step sc-step--active">
              <div className="sc-step-head">
                <span className="sc-step-num">
                  Step {done.length + 1} of {steps.length}
                </span>
              </div>
              <p className="sc-step-q" aria-live="polite">
                {displayedQuestion}
              </p>

              {current.kind === 'frq' ? (
                <>
                  <div className="sc-clarify-row">
                    <button
                      type="button"
                      className="sc-clarify"
                      disabled={clarifying || grading}
                      onClick={clarify}
                    >
                      {clarifying
                        ? 'Rewording…'
                        : clarified
                          ? 'Reword again'
                          : 'Clarify question'}
                    </button>
                    {clarified ? (
                      <span className="sc-clarify-note" aria-live="polite">
                        Reworded for clarity.
                      </span>
                    ) : null}
                  </div>
                  <FrqInput
                    value={text}
                    disabled={grading}
                    onChange={setText}
                    onSubmit={submitFrq}
                    grading={grading}
                  />
                </>
              ) : (
                <form
                  className="sc-step-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                    checkCodeStep()
                  }}
                >
                  <StepInput
                    step={current}
                    text={text}
                    coeffs={coeffs}
                    onText={setText}
                    onCoeffs={setCoeffs}
                  />
                  <button type="submit" className="sc-check" disabled={!hasValue}>
                    Check answer
                  </button>
                </form>
              )}

              {stepAttempts > 0 ? (
                <p className="sc-attempts" aria-live="polite">
                  {stepAttempts === 1 ? '1 attempt' : `${stepAttempts} attempts`} on this step,
                  keep going.
                </p>
              ) : null}
            </li>
          ) : null}
        </ol>

        {solved ? (
          <p className="sc-solved" aria-live="polite">
            {problem.idealAnswer ?? 'Nice work — every step checks out!'}
          </p>
        ) : null}
      </div>

      {feedback !== null ? (
        <FeedbackPopup message={feedback} correct={false} onDismiss={() => setFeedback(null)} />
      ) : null}
    </CorrectFlash>
  )
}

/** Hint for the nth attempt (1-based), clamped to the last available hint. */
function hintFor(step: ScenarioStep, attempt: number): string | undefined {
  if (!step.hints || step.hints.length === 0) return undefined
  return step.hints[Math.min(Math.max(attempt - 1, 0), step.hints.length - 1)]
}

/** A short, readable echo of the learner's accepted answer for a done step. */
function displayAnswer(step: ScenarioStep, raw: string, coeffs: number[]): string {
  if (step.kind === 'expression' && step.builder) {
    const trimmed = trimPolynomial(coeffs)
    return trimmed.length === 0 ? raw : formatBuilderDisplay(coeffs)
  }
  return raw.trim()
}

interface StepInputProps {
  step: Exclude<ScenarioStep, { kind: 'frq' }>
  text: string
  coeffs: number[]
  onText: (value: string) => void
  onCoeffs: (coeffs: number[]) => void
}

function StepInput({ step, text, coeffs, onText, onCoeffs }: StepInputProps) {
  if (step.kind === 'choice') {
    return (
      <div className="sc-choices" role="group">
        {step.options.map((option) => {
          const optionValue = String(option)
          const selected = text === optionValue
          return (
            <button
              key={optionValue}
              type="button"
              className={`sc-choice${selected ? ' sc-choice--selected' : ''}`}
              aria-pressed={selected}
              onClick={() => onText(optionValue)}
            >
              {option}
            </button>
          )
        })}
      </div>
    )
  }

  if (step.kind === 'expression' && step.builder) {
    return (
      <PolynomialBuilder
        value={coeffs}
        onChange={onCoeffs}
        maxDegree={8}
        maxCoefficient={999}
        ariaLabel="Polynomial answer builder"
      />
    )
  }

  return (
    <input
      type="text"
      inputMode={step.kind === 'number' ? 'decimal' : 'text'}
      className="sc-input"
      value={text}
      placeholder={
        step.placeholder ?? (step.kind === 'number' ? 'enter a number' : 'type your answer')
      }
      onChange={(e) => onText(e.target.value)}
      autoComplete="off"
      spellCheck={false}
    />
  )
}

function FrqInput({
  value,
  disabled,
  grading,
  onChange,
  onSubmit,
}: {
  value: string
  disabled: boolean
  grading: boolean
  onChange: (value: string) => void
  onSubmit: () => void
}) {
  return (
    <div className="sc-frq">
      <textarea
        className="sc-textarea"
        value={value}
        disabled={disabled}
        rows={3}
        placeholder="Explain your thinking in a sentence or two."
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        className="sc-check"
        disabled={grading || value.trim() === ''}
        onClick={onSubmit}
      >
        {grading ? 'Checking…' : 'Submit'}
      </button>
    </div>
  )
}

/**
 * Serialize playground coefficients to a parser-safe string (uses `^`, never the
 * display-only unicode superscripts) so the polynomial grader accepts it.
 */
function coeffsToInput(coeffs: number[]): string {
  const trimmed = trimPolynomial(coeffs)
  if (trimmed.length === 0) return ''
  let out = ''
  for (let power = trimmed.length - 1; power >= 0; power--) {
    const c = trimmed[power]
    if (c === 0) continue
    const abs = Number(Math.abs(c).toFixed(2))
    const term = power === 0 ? `${abs}` : power === 1 ? `${abs}*x` : `${abs}*x^${power}`
    if (out === '') out = c < 0 ? `-${term}` : term
    else out += c < 0 ? ` - ${term}` : ` + ${term}`
  }
  return out
}

/** Human-readable echo of a built polynomial (unicode superscripts). */
function formatBuilderDisplay(coeffs: number[]): string {
  const trimmed = trimPolynomial(coeffs)
  if (trimmed.length === 0) return '0'
  const sup = '⁰¹²³⁴⁵⁶⁷⁸⁹'
  const power = (p: number) =>
    p === 0 ? '' : p === 1 ? 'x' : `x${String(p).split('').map((d) => sup[Number(d)]).join('')}`
  let out = ''
  for (let p = trimmed.length - 1; p >= 0; p--) {
    const c = trimmed[p]
    if (c === 0) continue
    const abs = Number(Math.abs(c).toFixed(2))
    const coeff = abs === 1 && p > 0 ? '' : `${abs}`
    const term = `${coeff}${power(p)}`
    if (out === '') out = c < 0 ? `-${term}` : term
    else out += c < 0 ? ` − ${term}` : ` + ${term}`
  }
  return out
}
