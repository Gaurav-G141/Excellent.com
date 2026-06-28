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

describe('decimal-coefficient robustness (no float artifacts)', () => {
  it('multiplies 2-decimal coefficients to clean values', () => {
    // 0.1 * 0.2 is 0.020000000000000004 in raw IEEE-754; we expect a clean 0.02.
    expect(multiplyPolynomials([0.1], [0.2])).toEqual([0.02])
    // 1.1*3.3 = 3.63 (raw 3.6300000000000003), 2.2*3.3 = 7.26 (raw 7.260000000000001)
    expect(multiplyPolynomials([1.1, 2.2], [3.3])).toEqual([3.63, 7.26])
  })

  it('adds 2-decimal coefficients to clean values', () => {
    // 0.1 + 0.2 is the canonical float trap (0.30000000000000004).
    expect(addPolynomials([0.1], [0.2])).toEqual([0.3])
    expect(subtractPolynomials([0.3], [0.1])).toEqual([0.2])
  })

  it('differentiates 2-decimal coefficients cleanly', () => {
    // d/dx[0.1x + 0.2x²] = 0.1 + 0.4x
    expect(derivativeCoefficients([0, 0.1, 0.2])).toEqual([0.1, 0.4])
  })

  it('keeps productRuleDerivative.sum exactly equal to .total for decimals', () => {
    // u = 1.5x + 2.5, v = x² + 0.5
    const { sum, total } = productRuleDerivative([2.5, 1.5], [0.5, 0, 1])
    expect(polynomialsEqual(sum, total)).toBe(true)
  })

  it('grades mathematically-equal decimal results as equal at the default (strict) tolerance', () => {
    // A learner who built 0.3x would match a computed 0.1+0.2 coefficient.
    expect(polynomialsEqual([0, 0.3], addPolynomials([0, 0.1], [0, 0.2]))).toBe(true)
  })

  it('stress test: random 2-decimal factors in [-100,100] never mismatch in grading', () => {
    const rnd2 = () => Math.round((Math.random() * 200 - 100) * 100) / 100
    const randomPoly = () => {
      const degree = Math.floor(Math.random() * 5) // 0..4
      return Array.from({ length: degree + 1 }, rnd2)
    }

    for (let trial = 0; trial < 3000; trial++) {
      const u = randomPoly()
      const v = randomPoly()
      const { sum, total } = productRuleDerivative(u, v)

      // The two pedagogically-distinct derivations must agree under the strict
      // grading tolerance — a float tail would otherwise reject a correct answer.
      expect(polynomialsEqual(sum, total)).toBe(true)

      // Every emitted coefficient is artifact-free: an exact product of two
      // 2-decimal numbers has at most 4 decimal places, so c·10⁴ is an integer.
      for (const c of sum) {
        expect(Math.abs(c * 1e4 - Math.round(c * 1e4))).toBeLessThan(1e-3)
      }
    }
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

  it('emits decimal coefficients cleanly (no long float tails)', () => {
    // A float-tail constant collapses to a clean integer; a genuine decimal
    // keeps up to two places.
    expect(formatPolynomial([2.0000000001, 0, 1.5])).toBe('1.5x\u00b2 + 2')
    // Rounds to two decimals when emitting.
    expect(formatPolynomial([0, 3.456])).toBe('3.46x')
    expect(formatPolynomial([12.34])).toBe('12.34')
  })
})
