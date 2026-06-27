import { useEffect, useMemo, useRef, useState } from 'react'
import type { AppField, WordProblem } from '../../utils/applications/types'
import type { Outcome } from '../../utils/applications/difficulty'
import { gradeField } from '../../utils/applications/grade'
import { trimPolynomial } from '../../utils/polynomial'
import { PolynomialBuilder } from '../lesson/PolynomialBuilder'
import { CorrectFlash } from '../lesson/CorrectFlash'
import { FeedbackPopup } from '../lesson/FeedbackPopup'
import './WordProblemCard.css'

interface Props {
  problem: WordProblem
  /** Called once the learner answers every field correctly. */
  onSolved: (outcome: Outcome) => void
  /** Called on each wrong submission, the moment it happens. */
  onWrongAttempt?: () => void
}

/**
 * Renders one word problem with its answer field(s). On submit it grades every
 * field; a correct submission flashes and advances, a wrong one reveals a hint
 * (never the worked solution or the numeric answer).
 */
export function WordProblemCard({ problem, onSolved, onWrongAttempt }: Props) {
  const [answers, setAnswers] = useState<string[]>(() => problem.fields.map(() => ''))
  const [hint, setHint] = useState<string | null>(null)
  const [solved, setSolved] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [wrongAttempts, setWrongAttempts] = useState(0)

  // Holds the post-correct flash timer so we can cancel it if this card unmounts
  // (e.g. the learner hits Skip during the 700ms flash); otherwise a stale timer
  // would fire onSolved on an already-replaced problem and double-count it.
  const solveTimer = useRef<number | null>(null)
  useEffect(
    () => () => {
      if (solveTimer.current !== null) window.clearTimeout(solveTimer.current)
    },
    [],
  )

  const allFilled = useMemo(
    () => problem.fields.every((field, i) => fieldHasValue(field, answers[i])),
    [problem.fields, answers],
  )

  function setAnswer(index: number, value: string) {
    setAnswers((current) => {
      const next = [...current]
      next[index] = value
      return next
    })
  }

  function check() {
    if (solved) return
    const correct = problem.fields.every((field, i) => gradeField(field, answers[i] ?? ''))
    setAttempts((n) => n + 1)
    if (correct) {
      setSolved(true)
      setHint(null)
      solveTimer.current = window.setTimeout(
        () => onSolved({ solved: true, wrongAttempts, skipped: false }),
        700,
      )
    } else {
      setWrongAttempts((n) => n + 1)
      setHint(problem.hint)
      onWrongAttempt?.()
    }
  }

  return (
    <CorrectFlash active={solved}>
      <div className="wp-card">
        <h3 className="wp-title">{problem.title}</h3>
        <p className="wp-prompt">{problem.prompt}</p>
        {problem.given ? <p className="wp-given">{problem.given}</p> : null}

        <form
          className="wp-fields"
          onSubmit={(e) => {
            e.preventDefault()
            check()
          }}
        >
          {problem.fields.map((field, index) => (
            <FieldInput
              key={index}
              field={field}
              value={answers[index]}
              disabled={solved}
              onChange={(value) => setAnswer(index, value)}
            />
          ))}

          <button
            type="submit"
            className="wp-check"
            disabled={solved || !allFilled}
          >
            {solved ? 'Correct!' : 'Check answer'}
          </button>
        </form>

        {attempts > 0 && !solved ? (
          <p className="wp-attempts" aria-live="polite">
            {attempts === 1 ? '1 attempt' : `${attempts} attempts`} so far, keep going.
          </p>
        ) : null}
      </div>

      {hint !== null ? (
        <FeedbackPopup message={hint} correct={false} onDismiss={() => setHint(null)} />
      ) : null}
    </CorrectFlash>
  )
}

function fieldHasValue(field: AppField, value: string | undefined): boolean {
  if (field.kind === 'choice') return value !== undefined && value !== ''
  return (value ?? '').trim() !== ''
}

interface FieldInputProps {
  field: AppField
  value: string | undefined
  disabled: boolean
  onChange: (value: string) => void
}

function FieldInput({ field, value, disabled, onChange }: FieldInputProps) {
  if (field.kind === 'choice') {
    return (
      <fieldset className="wp-field wp-field--choice" disabled={disabled}>
        <legend className="wp-label">{field.label}</legend>
        <div className="wp-choices">
          {field.options.map((option) => {
            const optionValue = String(option)
            const selected = value === optionValue
            return (
              <button
                key={optionValue}
                type="button"
                className={`wp-choice${selected ? ' wp-choice--selected' : ''}`}
                aria-pressed={selected}
                onClick={() => onChange(optionValue)}
              >
                {option}
              </button>
            )
          })}
        </div>
      </fieldset>
    )
  }

  if (field.kind === 'expression' && field.builder) {
    return (
      <fieldset className="wp-field wp-field--builder" disabled={disabled}>
        <legend className="wp-label">{field.label}</legend>
        <BuilderField value={value} onChange={onChange} />
      </fieldset>
    )
  }

  return (
    <label className="wp-field">
      <span className="wp-label">{field.label}</span>
      <input
        type="text"
        inputMode={field.kind === 'number' ? 'decimal' : 'text'}
        className="wp-input"
        value={value ?? ''}
        disabled={disabled}
        placeholder={field.placeholder ?? (field.kind === 'number' ? 'enter a number' : 'type your answer')}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        spellCheck={false}
      />
    </label>
  )
}

/**
 * Serialize playground coefficients to a parser-safe string (uses `^`, never the
 * display-only unicode superscripts) so the existing polynomial grader accepts
 * it. Returns '' when empty so the field reads as unanswered.
 */
function coeffsToInput(coeffs: number[]): string {
  const trimmed = trimPolynomial(coeffs)
  if (trimmed.length === 0) return ''
  let out = ''
  for (let power = trimmed.length - 1; power >= 0; power--) {
    const c = trimmed[power]
    if (c === 0) continue
    const abs = Math.abs(c)
    const term = power === 0 ? `${abs}` : power === 1 ? `${abs}*x` : `${abs}*x^${power}`
    if (out === '') out = c < 0 ? `-${term}` : term
    else out += c < 0 ? ` - ${term}` : ` + ${term}`
  }
  return out
}

/**
 * Polynomial playground input for an expression field. Holds the assembled
 * coefficients locally and reports them upward as a graded string. Remounts with
 * the card (keyed per problem), so state resets between problems.
 */
function BuilderField({
  value,
  onChange,
}: {
  value: string | undefined
  onChange: (value: string) => void
}) {
  const [coeffs, setCoeffs] = useState<number[]>([])

  // If the parent cleared the answer (e.g. fresh problem in the same mount),
  // mirror that back into the builder.
  useEffect(() => {
    if ((value ?? '') === '' && trimPolynomial(coeffs).length > 0) setCoeffs([])
  }, [value, coeffs])

  return (
    <PolynomialBuilder
      value={coeffs}
      onChange={(next) => {
        setCoeffs(next)
        onChange(coeffsToInput(next))
      }}
      maxDegree={8}
      maxCoefficient={999}
      ariaLabel="Polynomial answer builder"
    />
  )
}
