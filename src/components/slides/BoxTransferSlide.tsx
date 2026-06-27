import { useState } from 'react'
import type { ProblemSlide } from '../../types/lesson'
import { matchesNumber } from '../../utils/expression'
import { fmt, maxVolume, optimalCut, volumeCriticalCuts } from './paperBox'
import { IsoBox } from './IsoBox'
import { CorrectFlash } from '../lesson/CorrectFlash'
import { FeedbackPopup } from '../lesson/FeedbackPopup'
import './PaperBox.css'

export interface BoxTransferConfig {
  width: number
  length: number
  unit?: string
}

interface Props {
  slide: ProblemSlide
  onCorrect: () => void
}

export function BoxTransferSlide({ slide, onCorrect }: Props) {
  const config = slide.config as unknown as BoxTransferConfig
  const { width: W, length: L, unit = 'in' } = config

  const best = optimalCut(W, L)
  const [, degenerateCut] = volumeCriticalCuts(W, L)
  const vMax = maxVolume(W, L)
  const halfShort = Math.min(W, L) / 2

  const [step, setStep] = useState(0)
  const [xInput, setXInput] = useState('')
  const [volInput, setVolInput] = useState('')
  const [flash, setFlash] = useState(false)
  const [wrong, setWrong] = useState<string | null>(null)

  function advance() {
    setWrong(null)
    setFlash(true)
    setStep((s) => s + 1)
  }

  function checkX() {
    const v = xInput.trim()
    if (v === '') return
    if (matchesNumber(v, degenerateCut, 0.06)) {
      setWrong(`x = ${fmt(degenerateCut)} ${unit} leaves no base. Use the smaller root.`)
      return
    }
    if (!matchesNumber(v, best, 0.06)) {
      setWrong(
        `Differentiate V(x), set it to zero, and factor. Keep the root between 0 and ${fmt(halfShort)}.`,
      )
      return
    }
    advance()
  }

  function checkVol() {
    const v = volInput.trim()
    if (v === '') return
    if (!matchesNumber(v, vMax, 1)) {
      setWrong(`Put your cut back into V(x): x · (${fmt(W)} − 2x) · (${fmt(L)} − 2x).`)
      return
    }
    advance()
  }

  const solved = step >= 2

  return (
    <>
      <CorrectFlash active={flash}>
        <div className="slide-copy">
          <h2>{slide.title}</h2>
          <p>{slide.body}</p>
        </div>

        <div className="pb-stage">
          <IsoBox
            baseW={W - 2 * best}
            baseL={L - 2 * best}
            height={best}
            unit={unit}
            ariaLabel="A box folded from a new, different-sized sheet"
          />
        </div>

        <div className="pb-given">
          <span>
            New sheet: {fmt(W)} × {fmt(L)} {unit}
          </span>
        </div>

        <div className="pb-steps">
          <div
            className={`pb-step${step === 0 ? ' pb-step--active' : ''}${step > 0 ? ' pb-step--done' : ''}`}
          >
            <p className="pb-step-prompt">
              {step > 0 && <span className="pb-check">✓</span>}
              Step 1. What corner cut x gives the biggest box?
            </p>
            {step === 0 ? (
              <div className="slide-slope-input">
                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder={`x = …  ${unit}`}
                  value={xInput}
                  onChange={(e) => {
                    setXInput(e.target.value)
                    if (wrong) setWrong(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') checkX()
                  }}
                />
                <button
                  type="button"
                  className="slide-cta"
                  disabled={xInput.trim() === ''}
                  onClick={checkX}
                >
                  Check
                </button>
              </div>
            ) : (
              <p className="pb-step-answer">x = {xInput}</p>
            )}
          </div>

          {step >= 1 && (
            <div className={`pb-step${step === 1 ? ' pb-step--active' : ''}`}>
              <p className="pb-step-prompt">Step 2. What is the maximum volume?</p>
              {step === 1 && (
                <div className="slide-slope-input">
                  <input
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder={`volume = …  ${unit}³`}
                    value={volInput}
                    onChange={(e) => {
                      setVolInput(e.target.value)
                      if (wrong) setWrong(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') checkVol()
                    }}
                  />
                  <button
                    type="button"
                    className="slide-cta"
                    disabled={volInput.trim() === ''}
                    onClick={checkVol}
                  >
                    Check
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {solved && (
          <div className="pb-readout">
            <span className="pb-readout-volume">
              Max volume {fmt(vMax)} {unit}³
            </span>
            <span className="pb-readout-sub">
              with a {fmt(best)} {unit} cut — a {fmt(W - 2 * best)} × {fmt(L - 2 * best)} ×{' '}
              {fmt(best)} box
            </span>
          </div>
        )}

        {solved && (
          <button type="button" className="slide-cta" onClick={onCorrect}>
            Finish
          </button>
        )}
      </CorrectFlash>

      {wrong && (
        <FeedbackPopup message={wrong} correct={false} onDismiss={() => setWrong(null)} />
      )}
    </>
  )
}
