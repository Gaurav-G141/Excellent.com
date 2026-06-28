import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Calculator } from './Calculator'
import { evaluate, formatResult } from './calculatorLogic'

describe('evaluate', () => {
  it('adds and subtracts left to right', () => {
    expect(evaluate('2+3')).toBe(5)
    expect(evaluate('10-4-1')).toBe(5)
  })

  it('respects operator precedence', () => {
    expect(evaluate('2+3*4')).toBe(14)
    expect(evaluate('2*3+4')).toBe(10)
    expect(evaluate('20/2+3')).toBe(13)
  })

  it('handles decimals', () => {
    expect(evaluate('0.1+0.2')).toBeCloseTo(0.3, 10)
    expect(evaluate('1.5*2')).toBe(3)
  })

  it('handles a leading negative number', () => {
    expect(evaluate('-5+2')).toBe(-3)
    expect(evaluate('-3*-3')).toBe(9)
  })

  it('returns null for division by zero', () => {
    expect(evaluate('5/0')).toBeNull()
  })

  it('returns null for malformed input', () => {
    expect(evaluate('')).toBeNull()
    expect(evaluate('2+')).toBeNull()
    expect(evaluate('1..2+3')).toBeNull()
  })
})

describe('formatResult', () => {
  it('trims floating point noise', () => {
    expect(formatResult(0.1 + 0.2)).toBe('0.3')
    expect(formatResult(3)).toBe('3')
  })
})

describe('Calculator UI', () => {
  async function press(user: ReturnType<typeof userEvent.setup>, labels: string[]) {
    for (const label of labels) {
      await user.click(screen.getByRole('button', { name: label }))
    }
  }

  it('evaluates a digit + operator sequence', async () => {
    const user = userEvent.setup()
    render(<Calculator open onClose={vi.fn()} />)

    await press(user, ['7', '+', '8', '='])
    expect(screen.getByTestId('calc-display')).toHaveTextContent('15')
  })

  it('honors precedence across on-screen buttons', async () => {
    const user = userEvent.setup()
    render(<Calculator open onClose={vi.fn()} />)

    await press(user, ['2', '+', '3', '×', '4', '='])
    expect(screen.getByTestId('calc-display')).toHaveTextContent('14')
  })

  it('handles decimals', async () => {
    const user = userEvent.setup()
    render(<Calculator open onClose={vi.fn()} />)

    await press(user, ['1', '.', '5', '×', '2', '='])
    expect(screen.getByTestId('calc-display')).toHaveTextContent('3')
  })

  it('shows Error on divide by zero and clears with C', async () => {
    const user = userEvent.setup()
    render(<Calculator open onClose={vi.fn()} />)

    await press(user, ['5', '÷', '0', '='])
    expect(screen.getByTestId('calc-display')).toHaveTextContent('Error')

    await press(user, ['C'])
    expect(screen.getByTestId('calc-display')).toHaveTextContent('0')
  })

  it('backspace removes the last entry', async () => {
    const user = userEvent.setup()
    render(<Calculator open onClose={vi.fn()} />)

    await press(user, ['1', '2', '3', '⌫'])
    expect(screen.getByTestId('calc-display')).toHaveTextContent('12')
  })
})
