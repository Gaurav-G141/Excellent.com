import { useState } from 'react'
import { formatPolynomial, superscript, trimPolynomial } from '../../utils/polynomial'
import './PolynomialBuilder.css'

/**
 * Add `coeff·x^power` into a low-to-high coefficient array, combining like
 * terms. Pure and side-effect free so it can be unit-tested without rendering.
 * Negative or non-finite inputs are ignored; trailing zeros are preserved here
 * (callers trim for display / compare with the polynomial helpers).
 */
export function addTermToCoeffs(coeffs: number[], coeff: number, power: number): number[] {
  if (!Number.isFinite(coeff) || !Number.isInteger(power) || power < 0) return coeffs.slice()
  const result = coeffs.slice()
  while (result.length <= power) result.push(0)
  result[power] += coeff
  return result
}

export interface PolynomialBuilderProps {
  /** Controlled coefficient array (low-to-high, index = power). */
  value: number[]
  onChange: (coeffs: number[]) => void
  maxDegree?: number
  maxCoefficient?: number
  label?: string
  /** Accessible name for the builder group (defaults to label or generic). */
  ariaLabel?: string
  /** Visual status — 'wrong' lights the builder red to flag an incorrect answer. */
  status?: 'default' | 'wrong'
  /** Allow a decimal point in coefficients (e.g. 93.5). Off by default. */
  allowDecimal?: boolean
}

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] as const

export function PolynomialBuilder({
  value,
  onChange,
  maxDegree = 8,
  maxCoefficient = 99,
  label,
  ariaLabel,
  status = 'default',
  allowDecimal = false,
}: PolynomialBuilderProps) {
  const [coeffStr, setCoeffStr] = useState('')
  const [sign, setSign] = useState<1 | -1>(1)
  const [power, setPower] = useState(0)

  const liveDisplay = formatPolynomial(trimPolynomial(value))

  const magnitude = coeffStr === '' || coeffStr === '.' ? 0 : Number.parseFloat(coeffStr)
  const enteredCoeff = sign * (Number.isFinite(magnitude) ? magnitude : 0)
  const hasTerm = coeffStr !== '' && coeffStr !== '.'
  // Preview from the raw typed string so an in-progress decimal (e.g. "93.")
  // shows its trailing point instead of being dropped by numeric formatting.
  const previewVar = power === 0 ? '' : power === 1 ? 'x' : `x${superscript(power)}`
  const previewCoeff = coeffStr === '1' && power > 0 ? '' : coeffStr
  const previewDisplay = hasTerm ? `${sign === -1 ? '-' : ''}${previewCoeff}${previewVar}` : null

  function appendDigit(digit: string) {
    const next = coeffStr === '0' && digit === '0' ? '0' : `${coeffStr}${digit}`
    if (Number.parseFloat(next) > maxCoefficient) return
    setCoeffStr(next)
  }

  function appendDot() {
    if (!allowDecimal || coeffStr.includes('.')) return
    setCoeffStr((prev) => (prev === '' ? '0.' : `${prev}.`))
  }

  function backspaceDigit() {
    setCoeffStr((prev) => prev.slice(0, -1))
  }

  function toggleSign() {
    setSign((prev) => (prev === 1 ? -1 : 1))
  }

  function decPower() {
    setPower((p) => Math.max(0, p - 1))
  }

  function incPower() {
    setPower((p) => Math.min(maxDegree, p + 1))
  }

  function resetTerm() {
    setCoeffStr('')
    setSign(1)
    setPower(0)
  }

  function addTerm() {
    if (!hasTerm || enteredCoeff === 0) return
    onChange(addTermToCoeffs(value, enteredCoeff, power))
    resetTerm()
  }

  function clearAll() {
    onChange([])
    resetTerm()
  }

  const groupLabel = ariaLabel ?? label ?? 'Polynomial builder'

  return (
    <div
      className={`pb${status === 'wrong' ? ' pb--wrong' : ''}`}
      role="group"
      aria-label={groupLabel}
      aria-invalid={status === 'wrong' || undefined}
    >
      {label && <span className="pb-label">{label}</span>}

      <output className="pb-live" aria-label={`${groupLabel} current value`}>
        {liveDisplay}
      </output>

      <div className="pb-term">
        <span className="pb-term-label">Next term</span>
        <span className="pb-term-preview" aria-live="polite">
          {previewDisplay ?? 'enter a coefficient'}
        </span>
      </div>

      <div className="pb-keys" aria-label="coefficient digits">
        {DIGITS.map((digit) => (
          <button
            key={digit}
            type="button"
            className="pb-key"
            aria-label={`digit ${digit}`}
            onClick={() => appendDigit(digit)}
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          className={`pb-key pb-key--sign${sign === -1 ? ' pb-key--active' : ''}`}
          aria-label="toggle negative sign"
          aria-pressed={sign === -1}
          onClick={toggleSign}
        >
          ±
        </button>
        {allowDecimal && (
          <button
            type="button"
            className="pb-key"
            aria-label="decimal point"
            onClick={appendDot}
            disabled={coeffStr.includes('.')}
          >
            .
          </button>
        )}
        <button
          type="button"
          className="pb-key"
          aria-label="backspace coefficient digit"
          onClick={backspaceDigit}
          disabled={coeffStr === ''}
        >
          ⌫
        </button>
      </div>

      <div className="pb-power">
        <span className="pb-power-label">power of x</span>
        <div className="pb-power-controls">
          <button
            type="button"
            className="pb-key"
            aria-label="decrease power"
            onClick={decPower}
            disabled={power === 0}
          >
            −
          </button>
          <span className="pb-power-value" aria-label={`current power ${power}`}>
            x<sup>{power}</sup>
          </span>
          <button
            type="button"
            className="pb-key"
            aria-label="increase power"
            onClick={incPower}
            disabled={power === maxDegree}
          >
            +
          </button>
        </div>
      </div>

      <div className="pb-actions">
        <button
          type="button"
          className="pb-add"
          onClick={addTerm}
          disabled={!hasTerm || enteredCoeff === 0}
        >
          Add term
        </button>
        <button type="button" className="pb-clear" onClick={clearAll} aria-label="clear polynomial">
          Clear
        </button>
      </div>
    </div>
  )
}
