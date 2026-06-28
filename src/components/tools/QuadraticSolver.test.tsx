import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuadraticSolver } from './QuadraticSolver'
import { solveQuadratic, formatNum } from './quadraticLogic'

describe('solveQuadratic', () => {
  it('D > 0: two distinct real roots', () => {
    const result = solveQuadratic(1, -5, 6)
    expect(result.kind).toBe('real-distinct')
    if (result.kind === 'real-distinct') {
      expect(result.discriminant).toBe(1)
      expect([result.x1, result.x2].sort((a, b) => a - b)).toEqual([2, 3])
    }
  })

  it('D == 0: one repeated real root', () => {
    const result = solveQuadratic(1, -4, 4)
    expect(result.kind).toBe('real-repeated')
    if (result.kind === 'real-repeated') {
      expect(result.discriminant).toBe(0)
      expect(result.x).toBe(2)
    }
  })

  it('D < 0: two complex conjugate roots', () => {
    const result = solveQuadratic(1, 0, 1)
    expect(result.kind).toBe('complex')
    if (result.kind === 'complex') {
      expect(result.discriminant).toBe(-4)
      expect(result.re).toBe(0)
      expect(result.im).toBe(1)
    }
  })

  it('a == 0 with b != 0: linear case x = -c/b', () => {
    const result = solveQuadratic(0, 2, -4)
    expect(result.kind).toBe('linear')
    if (result.kind === 'linear') expect(result.x).toBe(2)
  })

  it('a == 0 and b == 0 with c != 0: no solution', () => {
    expect(solveQuadratic(0, 0, 5).kind).toBe('no-solution')
  })

  it('a == 0, b == 0, c == 0: identity (all reals)', () => {
    expect(solveQuadratic(0, 0, 0).kind).toBe('identity')
  })
})

describe('formatNum', () => {
  it('trims trailing zeros and normalizes -0', () => {
    expect(formatNum(2.5)).toBe('2.5')
    expect(formatNum(3.0)).toBe('3')
    expect(formatNum(-0)).toBe('0')
    expect(formatNum(1 / 3)).toBe('0.3333')
  })
})

describe('QuadraticSolver UI', () => {
  it('renders nothing when closed', () => {
    render(<QuadraticSolver open={false} onClose={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('solves a real-root quadratic from the inputs', async () => {
    const user = userEvent.setup()
    render(<QuadraticSolver open onClose={vi.fn()} />)

    await user.type(screen.getByLabelText('a'), '1')
    await user.type(screen.getByLabelText('b'), '-5')
    await user.type(screen.getByLabelText('c'), '6')
    await user.click(screen.getByRole('button', { name: 'Solve' }))

    expect(screen.getByText('x₁ = 3')).toBeInTheDocument()
    expect(screen.getByText('x₂ = 2')).toBeInTheDocument()
  })

  it('shows a validation error for non-numeric input', async () => {
    const user = userEvent.setup()
    render(<QuadraticSolver open onClose={vi.fn()} />)

    await user.type(screen.getByLabelText('a'), 'abc')
    await user.click(screen.getByRole('button', { name: 'Solve' }))

    expect(screen.getByRole('alert')).toHaveTextContent(/enter a number/i)
  })
})
