import { useState } from 'react'
import type { ProblemSlide } from '../../types/lesson'
import { matchesNumber } from '../../utils/expression'
import { formatPolynomial, polynomialsEqual, trimPolynomial } from '../../utils/polynomial'
import { PolynomialBuilder } from '../lesson/PolynomialBuilder'
import { CorrectFlash } from '../lesson/CorrectFlash'
import { FeedbackPopup } from '../lesson/FeedbackPopup'
import {
  fmt,
  maxVolume,
  optimalCut,
  volumeCoefficients,
  volumeCriticalCuts,
  volumeDerivativeCoefficients,
} from './paperBox'
import { IsoBox } from './IsoBox'
import './PaperBox.css'

export interface BoxOptimizeConfig {
  width: number
  length: number
  unit?: string
}

interface Props {
  slide: ProblemSlide
  onCorrect: () => void
}

export function BoxOptimizeSlide({ slide, onCorrect }: Props) {
  const config = slide.config as unknown as BoxOptimizeConfig
  const { width: W, length: L, unit = 'in' } = config

  const vCoeffs = volumeCoefficients(W, L)
  const vPrimeCoeffs = volumeDerivativeCoefficients(W, L)
  const [, degenerateCut] = volumeCriticalCuts(W, L)
  const best = optimalCut(W, L)
  const vMax = maxVolume(W, L)
  const halfShort = Math.min(W, L) / 2

  const vDisplay = formatPolynomial(vCoeffs)
  const vPrimeDisplay = formatPolynomial(vPrimeCoeffs)

  const [step, setStep] = useState(0)
  const [poly, setPoly] = useState<number[]>([])
  const [polyWrong, setPolyWrong] = useState(false)
  const [xInput, setXInput] = useState('')
  const [volInput, setVolInput] = useState('')
  const [flash, setFlash] = useState(false)
  const [wrong, setWrong] = useState<string | null>(null)

  const hasPoly = trimPolynomial(poly).some((c) => c !== 0)

  function advance() {
    setWrong(null)
    setFlash(true)
    setStep((s) => s + 1)
  }

  function checkPoly() {
    if (!hasPoly) return
    if (polynomialsEqual(poly, vPrimeCoeffs)) {
      setPolyWrong(false)
      advance()
    } else {
      setPolyWrong(true)
      setWrong(
        slide.feedback.wrong ||
          'Not yet — differentiate each term of V(x) with the power rule (bring the power down, drop it by one).',
      )
    }
  }

  function checkX() {
    const v = xInput.trim()
    if (v === '') return
    if (matchesNumber(v, degenerateCut, 0.06)) {
      setWrong(
        `x ≈ ${fmt(degenerateCut)} ${unit} is bigger than half the short side (${fmt(halfShort)} ${unit}), so it leaves no base — no box. Use the smaller root.`,
      )
      return
    }
    if (!matchesNumber(v, best, 0.06)) {
      setWrong(
        `Use the quadratic formula on ${vPrimeDisplay}. Keep the root between 0 and ${fmt(halfShort)}.`,
      )
      return
    }
    advance()
  }

  function checkVol() {
    const v = volInput.trim()
    if (v === '') return
    if (!matchesNumber(v, vMax, 1.5)) {
      setWrong(`Put your cut back into V(x): x · (${fmt(W)} − 2x) · (${fmt(L)} − 2x).`)
      return
    }
    advance()
  }

  const solved = step >= 3

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
            showLabels
            widthLabel={`${fmt(W)} − 2x`}
            lengthLabel={`${fmt(L)} − 2x`}
            heightLabel="x"
            ariaLabel="An open box with base width minus twice the cut and height x"
          />
        </div>

        <div className="pb-given">
          <span>V(x) = {vDisplay}</span>
          {step > 0 && <span className="pb-given-sub">V′(x) = {vPrimeDisplay}</span>}
        </div>

        <div className="pb-steps">
          <div
            className={`pb-step${step === 0 ? ' pb-step--active' : ''}${step > 0 ? ' pb-step--done' : ''}`}
          >
            <p className="pb-step-prompt">
              {step > 0 && <span className="pb-check">✓</span>}
              Step 1. Build the derivative V′(x) with the calculator.
            </p>
            {step === 0 && (
              <>
                <PolynomialBuilder
                  value={poly}
                  onChange={(next) => {
                    setPoly(next)
                    if (polyWrong) setPolyWrong(false)
                  }}
                  maxDegree={2}
                  maxCoefficient={200}
                  allowDecimal
                  label="V′(x) ="
                  status={polyWrong ? 'wrong' : 'default'}
                />
                <button type="button" className="slide-cta" disabled={!hasPoly} onClick={checkPoly}>
                  Check
                </button>
              </>
            )}
          </div>

          {step >= 1 && (
            <div
              className={`pb-step${step === 1 ? ' pb-step--active' : ''}${step > 1 ? ' pb-step--done' : ''}`}
            >
              <p className="pb-step-prompt">
                {step > 1 && <span className="pb-check">✓</span>}
                Step 2. Solve V′(x) = 0 for the cut that fits a real box (0 &lt; x &lt;{' '}
                {fmt(halfShort)}).
              </p>
              {step === 1 && (
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
              )}
              {step > 1 && <p className="pb-step-answer">x = {xInput}</p>}
            </div>
          )}

          {step >= 2 && (
            <div className={`pb-step${step === 2 ? ' pb-step--active' : ''}`}>
              <p className="pb-step-prompt">
                Step 3. Put that cut back into V(x): what is the largest possible volume?
              </p>
              {step === 2 && (
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
              Max volume ≈ {fmt(vMax)} {unit}³
            </span>
            <span className="pb-readout-sub">
              at a {fmt(best)} {unit} corner cut
            </span>
          </div>
        )}

        {solved && (
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
