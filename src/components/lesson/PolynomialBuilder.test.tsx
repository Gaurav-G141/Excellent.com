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

  it('shows a decimal key by default and hides it when allowDecimal is off', () => {
    const { rerender } = render(<PolynomialBuilder value={[]} onChange={vi.fn()} />)
    // Decimals are on by default now.
    expect(screen.getByRole('button', { name: 'decimal point' })).toBeTruthy()
    rerender(<PolynomialBuilder value={[]} onChange={vi.fn()} allowDecimal={false} />)
    expect(screen.queryByRole('button', { name: 'decimal point' })).toBeNull()
  })

  it('allows entering exactly the 100 cap (inclusive)', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PolynomialBuilder value={[]} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'digit 1' }))
    await user.click(screen.getByRole('button', { name: 'digit 0' }))
    await user.click(screen.getByRole('button', { name: 'digit 0' }))
    await user.click(screen.getByRole('button', { name: /add term/i }))

    expect(onChange).toHaveBeenCalledWith([100])
  })

  it('blocks the keystroke that would push a coefficient past 100', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PolynomialBuilder value={[]} onChange={onChange} />)

    // Typing 1, 0, 1 would make "101" (> 100); the trailing 1 is rejected, so
    // the coefficient stays at 10.
    await user.click(screen.getByRole('button', { name: 'digit 1' }))
    await user.click(screen.getByRole('button', { name: 'digit 0' }))
    await user.click(screen.getByRole('button', { name: 'digit 1' }))
    await user.click(screen.getByRole('button', { name: /add term/i }))

    expect(onChange).toHaveBeenCalledWith([10])
  })

  it('accepts a two-decimal coefficient by default (no allowDecimal prop needed)', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PolynomialBuilder value={[]} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'digit 1' }))
    await user.click(screen.getByRole('button', { name: 'digit 2' }))
    await user.click(screen.getByRole('button', { name: 'decimal point' }))
    await user.click(screen.getByRole('button', { name: 'digit 3' }))
    await user.click(screen.getByRole('button', { name: 'digit 4' }))
    await user.click(screen.getByRole('button', { name: /add term/i }))

    expect(onChange).toHaveBeenCalledWith([12.34])
  })

  it('caps fractional entry at two decimal places (rejects a 3rd decimal)', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PolynomialBuilder value={[]} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'digit 1' }))
    await user.click(screen.getByRole('button', { name: 'digit 2' }))
    await user.click(screen.getByRole('button', { name: 'decimal point' }))
    await user.click(screen.getByRole('button', { name: 'digit 3' }))
    await user.click(screen.getByRole('button', { name: 'digit 4' }))
    // The third decimal (5) is refused — value stays 12.34.
    await user.click(screen.getByRole('button', { name: 'digit 5' }))
    await user.click(screen.getByRole('button', { name: /add term/i }))

    expect(onChange).toHaveBeenCalledWith([12.34])
  })

  it('produces an exact integer coefficient for integer entry', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PolynomialBuilder value={[]} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'digit 3' }))
    await user.click(screen.getByRole('button', { name: /add term/i }))

    expect(onChange).toHaveBeenCalledWith([3])
    expect(Number.isInteger(onChange.mock.calls[0][0][0])).toBe(true)
  })

  it('honors a custom maxDecimals cap (1 place)', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PolynomialBuilder value={[]} onChange={onChange} maxDecimals={1} />)

    await user.click(screen.getByRole('button', { name: 'digit 9' }))
    await user.click(screen.getByRole('button', { name: 'decimal point' }))
    await user.click(screen.getByRole('button', { name: 'digit 5' }))
    // A second decimal is rejected when maxDecimals is 1.
    await user.click(screen.getByRole('button', { name: 'digit 7' }))
    await user.click(screen.getByRole('button', { name: /add term/i }))

    expect(onChange).toHaveBeenCalledWith([9.5])
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

  it('reveals and hides the step-by-step help on demand', async () => {
    const user = userEvent.setup()
    render(<PolynomialBuilder value={[]} onChange={vi.fn()} />)

    // Hidden by default.
    expect(screen.queryByRole('region', { name: /how to enter a polynomial/i })).toBeNull()

    const toggle = screen.getByRole('button', { name: /how do i enter a polynomial/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await user.click(toggle)
    expect(screen.getByRole('region', { name: /how to enter a polynomial/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /hide help/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    await user.click(screen.getByRole('button', { name: /hide help/i }))
    expect(screen.queryByRole('region', { name: /how to enter a polynomial/i })).toBeNull()
  })

  it('clears the polynomial', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PolynomialBuilder value={[1, 2, 3]} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: /clear polynomial/i }))
    expect(onChange).toHaveBeenCalledWith([])
  })
})
