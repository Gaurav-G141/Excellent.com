import { useMemo, useState } from 'react'
import type { DragMatchConfig, ProblemSlide } from '../../types/lesson'
import { CorrectFlash } from '../lesson/CorrectFlash'
import { FeedbackPopup } from '../lesson/FeedbackPopup'
import './Lesson2.css'

interface Props {
  slide: ProblemSlide
  onCorrect: () => void
}

interface AnswerChip {
  id: number
  text: string
}

function shuffle<T>(values: T[]): T[] {
  const copy = [...values]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function DragMatchSlide({ slide, onCorrect }: Props) {
  const config = slide.config as unknown as DragMatchConfig
  const { pairs } = config

  const answerChips = useMemo<AnswerChip[]>(
    () => shuffle(pairs.map((pair, id) => ({ id, text: pair.answer }))),
    [pairs],
  )

  // assignments[promptIndex] = answerChip.id (or undefined)
  const [assignments, setAssignments] = useState<Record<number, number>>({})
  const [selectedPrompt, setSelectedPrompt] = useState<number | null>(null)
  const [solved, setSolved] = useState(false)
  const [flashCorrect, setFlashCorrect] = useState(false)
  const [wrongFeedback, setWrongFeedback] = useState<string | null>(null)
  // Prompt indices whose current match was wrong on the last check.
  const [wrongPrompts, setWrongPrompts] = useState<Set<number>>(new Set())

  const allAssigned = pairs.every((_, i) => assignments[i] !== undefined)
  const usedChipIds = new Set(Object.values(assignments))

  function assignChip(chipId: number) {
    if (solved || selectedPrompt === null) return
    setWrongPrompts(new Set())
    setAssignments((prev) => {
      const next: Record<number, number> = {}
      // remove this chip from any other prompt (each chip used once)
      for (const [k, v] of Object.entries(prev)) {
        if (v !== chipId) next[Number(k)] = v
      }
      next[selectedPrompt] = chipId
      return next
    })
    setSelectedPrompt(null)
  }

  function clearPrompt(promptIndex: number) {
    if (solved) return
    setWrongPrompts(new Set())
    setAssignments((prev) => {
      const next = { ...prev }
      delete next[promptIndex]
      return next
    })
  }

  function handleCheck() {
    if (solved || !allAssigned) return
    const allCorrect = pairs.every((pair, i) => {
      const chip = answerChips.find((c) => c.id === assignments[i])
      return chip?.text === pair.answer
    })
    if (allCorrect) {
      setSolved(true)
      setFlashCorrect(true)
      setWrongFeedback(null)
      setWrongPrompts(new Set())
    } else {
      const wrong = new Set<number>()
      pairs.forEach((pair, i) => {
        const chip = answerChips.find((c) => c.id === assignments[i])
        if (chip?.text !== pair.answer) wrong.add(i)
      })
      setWrongPrompts(wrong)
      setWrongFeedback(
        slide.feedback.wrong || 'Some matches are off. Apply the power rule and try again.',
      )
    }
  }

  const chipText = (chipId: number | undefined) =>
    chipId === undefined ? null : answerChips.find((c) => c.id === chipId)?.text

  return (
    <>
      <CorrectFlash active={flashCorrect}>
        <div className="slide-copy">
          <h2>{slide.title}</h2>
          <p>{slide.body}</p>
        </div>

        <div className="match-grid">
          {pairs.map((pair, i) => {
            const assigned = chipText(assignments[i])
            const isSelected = selectedPrompt === i
            const isWrong = wrongPrompts.has(i)
            return (
              <div key={pair.prompt} className="match-row">
                <button
                  type="button"
                  className={`match-prompt${isSelected ? ' match-prompt--selected' : ''}${isWrong ? ' match-prompt--wrong' : ''}`}
                  disabled={solved}
                  onClick={() => setSelectedPrompt(isSelected ? null : i)}
                >
                  <span className="match-prompt-fn">{pair.prompt}</span>
                  <span className="match-arrow">→</span>
                  <span
                    className={`match-slot${assigned ? ' match-slot--filled' : ''}${isWrong ? ' match-slot--wrong' : ''}`}
                  >
                    {assigned ?? 'tap to fill'}
                  </span>
                </button>
                {assigned && !solved && (
                  <button
                    type="button"
                    className="match-clear"
                    aria-label={`Clear the match for ${pair.prompt}`}
                    onClick={() => clearPrompt(i)}
                  >
                    ✕
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div className="match-bank">
          {answerChips.map((chip) => {
            const used = usedChipIds.has(chip.id)
            return (
              <button
                key={chip.id}
                type="button"
                className={`match-chip${used ? ' match-chip--used' : ''}`}
                disabled={solved || used || selectedPrompt === null}
                onClick={() => assignChip(chip.id)}
              >
                {chip.text}
              </button>
            )
          })}
        </div>

        <p className="slide-hint">
          {selectedPrompt === null
            ? 'Tap a function, then tap its derivative.'
            : 'Now tap the matching derivative.'}
        </p>

        {!solved ? (
          <button
            type="button"
            className="slide-cta"
            disabled={!allAssigned}
            onClick={handleCheck}
          >
            Check
          </button>
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
