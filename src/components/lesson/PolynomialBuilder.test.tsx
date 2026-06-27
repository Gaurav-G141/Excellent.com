import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PolynomialBuilder, addTermToCoeffs } from './PolynomialBuilder'

describe('addTermToCoeffs', () => {
  it('adds a term at the requested power, growing the array', () => {
    expect(addTermToCoeffs([], 3, 2)).toEqual([0, 0, 3])
  })

  it('combines like terms at the same power', () => {
    expect(addTermToCoeffs([1, 0, 2], 5, 2)).toEqual([1, 0, 7])
  })

  it('supports negative coefficients (subtraction)', () => {
    expect(addTermToCoeffs([0, 0, 2], -2, 2)).toEqual([0, 0, 0])
  })

  it('adds a constant at power 0', () => {
    expect(addTermToCoeffs([1, 1], 4, 0)).toEqual([5, 1])
  })

  it('ignores invalid power and non-finite coefficients (returns a copy)', () => {
    const input = [1, 2]
    expect(addTermToCoeffs(input, 3, -1)).toEqual([1, 2])
    expect(addTermToCoeffs(input, Number.NaN, 1)).toEqual([1, 2])
    expect(addTermToCoeffs(input, 3, -1)).not.toBe(input)
  })
})

describe('PolynomialBuilder (controlled)', () => {
  it('builds 3x² via digit + power + add and reports it through onChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PolynomialBuilder value={[]} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'digit 3' }))
    await user.click(screen.getByRole('button', { name: 'increase power' }))
    await user.click(screen.getByRole('button', { name: 'increase power' }))
    await user.click(screen.getByRole('button', { name: /add term/i }))

    expect(onChange).toHaveBeenCalledWith([0, 0, 3])
  })

  it('toggles a negative sign for the next term', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PolynomialBuilder value={[]} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: /toggle negative sign/i }))
    await user.click(screen.getByRole('button', { name: 'digit 5' }))
    await user.click(screen.getByRole('button', { name: /add term/i }))

    expect(onChange).toHaveBeenCalledWith([-5])
  })

  it('has no decimal key unless allowDecimal is set', () => {
    const { rerender } = render(<PolynomialBuilder value={[]} onChange={vi.fn()} />)
    expect(screen.queryByRole('button', { name: 'decimal point' })).toBeNull()
    rerender(<PolynomialBuilder value={[]} onChange={vi.fn()} allowDecimal />)
    expect(screen.getByRole('button', { name: 'decimal point' })).toBeTruthy()
  })

  it('builds a decimal coefficient like 93.5·x when allowDecimal is set', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PolynomialBuilder value={[]} onChange={onChange} allowDecimal maxCoefficient={200} />)

    await user.click(screen.getByRole('button', { name: 'digit 9' }))
    await user.click(screen.getByRole('button', { name: 'digit 3' }))
    await user.click(screen.getByRole('button', { name: 'decimal point' }))
    await user.click(screen.getByRole('button', { name: 'digit 5' }))
    await user.click(screen.getByRole('button', { name: 'increase power' }))
    await user.click(screen.getByRole('button', { name: /add term/i }))

    expect(onChange).toHaveBeenCalledWith([0, 93.5])
  })

  it('clears the polynomial', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PolynomialBuilder value={[1, 2, 3]} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: /clear polynomial/i }))
    expect(onChange).toHaveBeenCalledWith([])
  })
})
