import { useState } from 'react'
import { Modal } from '../Modal'
import { formatNum, solveQuadratic, type QuadResult } from './quadraticLogic'
import './QuadraticSolver.css'

interface Props {
  open: boolean
  onClose: () => void
}

type Parsed = { ok: true; value: number } | { ok: false }

function parse(raw: string): Parsed {
  const trimmed = raw.trim()
  if (trimmed === '') return { ok: false }
  const value = Number(trimmed)
  return Number.isFinite(value) ? { ok: true, value } : { ok: false }
}

function describe(result: QuadResult): { roots: string[]; note: string } {
  switch (result.kind) {
    case 'identity':
      return { roots: ['All real numbers'], note: 'Every x satisfies 0 = 0.' }
    case 'no-solution':
      return { roots: ['No solution'], note: 'With a = 0 and b = 0 there is no x.' }
    case 'linear':
      return {
        roots: [`x = ${formatNum(result.x)}`],
        note: 'a = 0, so this is linear: x = -c / b.',
      }
    case 'real-distinct':
      return {
        roots: [`x₁ = ${formatNum(result.x1)}`, `x₂ = ${formatNum(result.x2)}`],
        note: `Discriminant D = ${formatNum(result.discriminant)} > 0 → two real roots.`,
      }
    case 'real-repeated':
      return {
        roots: [`x = ${formatNum(result.x)}`],
        note: `Discriminant D = 0 → one repeated real root.`,
      }
    case 'complex': {
      const im = formatNum(Math.abs(result.im))
      const re = formatNum(result.re)
      return {
        roots: [`x = ${re} + ${im}i`, `x = ${re} − ${im}i`],
        note: `Discriminant D = ${formatNum(result.discriminant)} < 0 → two complex roots.`,
      }
    }
  }
}

/**
 * The quadratic-solver UI without a modal wrapper, so it can be embedded inside
 * the combined math-tools modal (or used standalone via {@link QuadraticSolver}).
 */
export function QuadraticBody() {
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [c, setC] = useState('')
  const [output, setOutput] = useState<{ roots: string[]; note: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleSolve() {
    const pa = parse(a)
    const pb = parse(b)
    const pc = parse(c)
    if (!pa.ok || !pb.ok || !pc.ok) {
      setOutput(null)
      setError('Enter a number for a, b, and c.')
      return
    }
    setError(null)
    setOutput(describe(solveQuadratic(pa.value, pb.value, pc.value)))
  }

  function field(
    label: string,
    value: string,
    onChange: (v: string) => void,
  ) {
    return (
      <label className="quad-field">
        <span className="quad-field-label">{label}</span>
        <input
          className="quad-input"
          type="text"
          inputMode="decimal"
          value={value}
          aria-label={label}
          placeholder="0"
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSolve()
          }}
        />
      </label>
    )
  }

  return (
    <>
      <p className="quad-eq">
        a·x² + b·x + c = 0
      </p>
      <div className="quad-fields">
        {field('a', a, setA)}
        {field('b', b, setB)}
        {field('c', c, setC)}
      </div>
      <button type="button" className="quad-solve" onClick={handleSolve}>
        Solve
      </button>

      {error && (
        <p className="quad-error" role="alert">
          {error}
        </p>
      )}

      {output && (
        <div className="quad-result" role="status">
          <ul className="quad-roots">
            {output.roots.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <p className="quad-note">{output.note}</p>
        </div>
      )}
    </>
  )
}

/** Standalone quadratic-solver modal (kept for direct use and unit tests). */
export function QuadraticSolver({ open, onClose }: Props) {
  return (
    <Modal open={open} title="Quadratic solver" onClose={onClose}>
      <QuadraticBody />
    </Modal>
  )
}
