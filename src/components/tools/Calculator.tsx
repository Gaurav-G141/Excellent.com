import { useCallback, useEffect, useState } from 'react'
import { Modal } from '../Modal'
import { evaluate, formatResult } from './calculatorLogic'
import './Calculator.css'

interface Props {
  open: boolean
  onClose: () => void
}

const ERROR = 'Error'
const OPERATORS = new Set(['+', '-', '*', '/'])

/** Pretty-prints the internal expression for the display. */
function pretty(expr: string): string {
  return expr.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−')
}

export function Calculator({ open, onClose }: Props) {
  const [expr, setExpr] = useState('')

  const reset = useCallback(() => setExpr(''), [])

  const input = useCallback((key: string) => {
    setExpr((prev) => {
      const current = prev === ERROR ? '' : prev
      if (key === 'C') return ''
      if (key === '=') {
        if (current === '') return ''
        const result = evaluate(current)
        return result === null ? ERROR : formatResult(result)
      }
      if (key === '⌫') return current.slice(0, -1)

      if (OPERATORS.has(key)) {
        if (current === '') return key === '-' ? '-' : current
        // Replace a trailing operator so two never stack up.
        if (OPERATORS.has(current[current.length - 1])) {
          return current.slice(0, -1) + key
        }
        return current + key
      }

      if (key === '.') {
        // Only one decimal point per number segment.
        const lastSegment = current.split(/[+\-*/]/).pop() ?? ''
        if (lastSegment.includes('.')) return current
        return current === '' ? '0.' : current + '.'
      }

      // Digit.
      return current + key
    })
  }, [])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      const { key } = e
      if (key >= '0' && key <= '9') input(key)
      else if (key === '.') input('.')
      else if (OPERATORS.has(key)) input(key)
      else if (key === 'Enter' || key === '=') {
        e.preventDefault()
        input('=')
      } else if (key === 'Backspace') input('⌫')
      else if (key === 'Escape') {
        // Let the Modal handle closing; do nothing here.
      } else if (key.toLowerCase() === 'c') input('C')
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, input])

  // Clear the slate whenever the modal is freshly opened.
  useEffect(() => {
    if (open) reset()
  }, [open, reset])

  const keys: { label: string; value: string; variant?: string }[] = [
    { label: 'C', value: 'C', variant: 'fn' },
    { label: '⌫', value: '⌫', variant: 'fn' },
    { label: '÷', value: '/', variant: 'op' },
    { label: '×', value: '*', variant: 'op' },
    { label: '7', value: '7' },
    { label: '8', value: '8' },
    { label: '9', value: '9' },
    { label: '−', value: '-', variant: 'op' },
    { label: '4', value: '4' },
    { label: '5', value: '5' },
    { label: '6', value: '6' },
    { label: '+', value: '+', variant: 'op' },
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '=', value: '=', variant: 'eq' },
    { label: '0', value: '0', variant: 'zero' },
    { label: '.', value: '.' },
  ]

  return (
    <Modal open={open} title="Calculator" onClose={onClose}>
      <div className="calc-display" data-testid="calc-display" aria-live="polite">
        {expr === '' ? '0' : pretty(expr)}
      </div>
      <div className="calc-grid">
        {keys.map((k) => (
          <button
            key={k.label}
            type="button"
            className={`calc-key${k.variant ? ` calc-key--${k.variant}` : ''}`}
            onClick={() => input(k.value)}
          >
            {k.label}
          </button>
        ))}
      </div>
    </Modal>
  )
}
