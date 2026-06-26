import { describe, it, expect } from 'vitest'
import {
  multiplyPolynomials,
  addPolynomials,
  subtractPolynomials,
  derivativeCoefficients,
  trimPolynomial,
  polynomialsEqual,
  formatPolynomial,
  productRuleDerivative,
} from './polynomial'

describe('multiplyPolynomials', () => {
  it('multiplies (x + 1)(x + 2) = x² + 3x + 2', () => {
    expect(multiplyPolynomials([1, 1], [2, 1])).toEqual([2, 3, 1])
  })

  it('scales by a constant', () => {
    expect(multiplyPolynomials([3], [1, 2, 3])).toEqual([3, 6, 9])
  })

  it('is commutative', () => {
    expect(multiplyPolynomials([1, 0, 2], [0, 1])).toEqual(
      multiplyPolynomials([0, 1], [1, 0, 2]),
    )
  })

  it('returns [] when either factor is empty', () => {
    expect(multiplyPolynomials([], [1, 2])).toEqual([])
    expect(multiplyPolynomials([1, 2], [])).toEqual([])
    expect(multiplyPolynomials([], [])).toEqual([])
  })
})

describe('productRuleDerivative', () => {
  it('computes uPrime, vPrime, sum, and total for u=[1,2], v=[3,0,1]', () => {
    const { uPrime, vPrime, sum, total } = productRuleDerivative([1, 2], [3, 0, 1])
    expect(uPrime).toEqual([2])
    expect(vPrime).toEqual([0, 2])
    expect(sum).toEqual([6, 2, 6])
    expect(total).toEqual([6, 2, 6])
  })

  it('exposes the two simplified product terms u′·v and u·v′', () => {
    const { uPrimeV, uVPrime, sum } = productRuleDerivative([1, 2], [3, 0, 1])
    expect(uPrimeV).toEqual([6, 0, 2]) // 2·(x²+3) = 2x²+6
    expect(uVPrime).toEqual([0, 2, 4]) // (2x+1)·2x = 4x²+2x
    expect(addPolynomials(uPrimeV, uVPrime)).toEqual(sum)
  })

  it('keeps sum and total algebraically equal', () => {
    const { sum, total } = productRuleDerivative([1, 2], [3, 0, 1])
    expect(polynomialsEqual(sum, total)).toBe(true)
  })

  it('handles an empty factor without crashing', () => {
    const { uPrime, vPrime, sum, total } = productRuleDerivative([], [3, 0, 1])
    expect(uPrime).toEqual([])
    expect(vPrime).toEqual([0, 2])
    expect(sum).toEqual([])
    expect(total).toEqual([])
  })
})

describe('addPolynomials', () => {
  it('adds same-length polynomials', () => {
    expect(addPolynomials([1, 2, 3], [4, 5, 6])).toEqual([5, 7, 9])
  })

  it('pads the shorter polynomial', () => {
    expect(addPolynomials([1, 2], [4, 5, 6])).toEqual([5, 7, 6])
  })
})

describe('subtractPolynomials', () => {
  it('subtracts same-length polynomials', () => {
    expect(subtractPolynomials([5, 7, 9], [4, 5, 6])).toEqual([1, 2, 3])
  })

  it('pads the shorter polynomial (a shorter than b)', () => {
    expect(subtractPolynomials([1, 2], [4, 5, 6])).toEqual([-3, -3, -6])
  })

  it('pads the shorter polynomial (b shorter than a)', () => {
    expect(subtractPolynomials([4, 5, 6], [1, 2])).toEqual([3, 3, 6])
  })
})

describe('derivativeCoefficients', () => {
  it('differentiates 2 + 3x + 4x² -> 3 + 8x', () => {
    expect(derivativeCoefficients([2, 3, 4])).toEqual([3, 8])
  })

  it('differentiates a constant to an empty array', () => {
    expect(derivativeCoefficients([7])).toEqual([])
  })
})

describe('trimPolynomial', () => {
  it('drops trailing zeros', () => {
    expect(trimPolynomial([1, 2, 0, 0])).toEqual([1, 2])
  })

  it('keeps interior and leading zeros', () => {
    expect(trimPolynomial([0, 0, 3, 0])).toEqual([0, 0, 3])
  })

  it('returns [0] for an all-zero polynomial', () => {
    expect(trimPolynomial([0, 0, 0])).toEqual([0])
  })

  it('returns [0] for an empty polynomial', () => {
    expect(trimPolynomial([])).toEqual([0])
  })

  it('leaves an already-trimmed polynomial unchanged', () => {
    expect(trimPolynomial([1, 2, 3])).toEqual([1, 2, 3])
  })
})

describe('polynomialsEqual', () => {
  it('treats trailing zeros as equal (different lengths)', () => {
    expect(polynomialsEqual([1, 2], [1, 2, 0, 0])).toBe(true)
  })

  it('returns false for genuinely different polynomials', () => {
    expect(polynomialsEqual([1, 2], [1, 3])).toBe(false)
  })

  it('returns false when degrees differ after trimming', () => {
    expect(polynomialsEqual([1, 2], [1, 2, 3])).toBe(false)
  })

  it('respects the tolerance', () => {
    expect(polynomialsEqual([1, 2], [1, 2 + 1e-10])).toBe(true)
    expect(polynomialsEqual([1, 2], [1, 2 + 1e-6])).toBe(false)
  })

  it('honors a custom tolerance', () => {
    expect(polynomialsEqual([1, 2], [1, 2.0005], 1e-3)).toBe(true)
  })

  it('treats all-zero of any length as equal', () => {
    expect(polynomialsEqual([0, 0, 0], [])).toBe(true)
  })
})

describe('formatPolynomial', () => {
  it('formats highest-power-first with skipped zero terms', () => {
    expect(formatPolynomial([3, 0, 2])).toBe('2x\u00b2 + 3')
  })

  it('drops a coefficient of 1 on powers >= 1', () => {
    expect(formatPolynomial([0, 1])).toBe('x')
  })

  it('formats a leading negative term', () => {
    expect(formatPolynomial([0, 0, -1])).toBe('-x\u00b2')
  })

  it('uses a minus sign between subtracted terms', () => {
    expect(formatPolynomial([-3, 2])).toBe('2x \u2212 3')
  })

  it('renders the zero polynomial as "0"', () => {
    expect(formatPolynomial([0, 0, 0])).toBe('0')
  })

  it('supports a custom variable', () => {
    expect(formatPolynomial([1, 2], 't')).toBe('2t + 1')
  })
})
