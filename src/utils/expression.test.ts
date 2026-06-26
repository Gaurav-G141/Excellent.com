import { describe, it, expect } from 'vitest'
import {
  parseExpression,
  evaluateNumericExpression,
  matchesNumber,
  matchesPolynomial,
} from './expression'

const evalAt = (input: string, x: number): number | null => {
  const fn = parseExpression(input)
  return fn ? fn(x) : null
}

describe('operator precedence', () => {
  it('treats -x^2 as -(x^2), not (-x)^2 [regression]', () => {
    // -(3^2) = -9, NOT (-3)^2 = 9
    expect(evalAt('-x^2', 3)).toBeCloseTo(-9, 10)
    expect(evalAt('-x^2', -2)).toBeCloseTo(-4, 10)
  })

  it('handles a leading-negative unit power term via matchesPolynomial', () => {
    // true derivative term: -x^2  => coefficients [0, 0, -1]
    expect(matchesPolynomial('-x^2', [0, 0, -1])).toBe(true)
    // the wrong reading (x^2) must NOT be accepted
    expect(matchesPolynomial('x^2', [0, 0, -1])).toBe(false)
  })

  it('still grades coefficient-prefixed negative terms', () => {
    // -3x^2 + 2x  => [0, 2, -3]
    expect(matchesPolynomial('-3x^2+2x', [0, 2, -3])).toBe(true)
    expect(matchesPolynomial('2x-3x^2', [0, 2, -3])).toBe(true)
  })

  it('evaluates -(x+1)^2 as -((x+1)^2)', () => {
    expect(evalAt('-(x+1)^2', 2)).toBeCloseTo(-9, 10)
  })

  it('keeps exponent right-associativity and negative exponents', () => {
    expect(evalAt('2^-1', 0)).toBeCloseTo(0.5, 10)
    expect(evalAt('2^3^2', 0)).toBeCloseTo(512, 10) // 2^(3^2) = 2^9
  })

  it('handles nested unary minus and binary subtraction', () => {
    expect(evalAt('--2', 0)).toBeCloseTo(2, 10)
    expect(evalAt('5-x^2', 3)).toBeCloseTo(-4, 10) // 5 - 9
    expect(evalAt('-2*-3', 0)).toBeCloseTo(6, 10)
    expect(evalAt('-2^2*3', 0)).toBeCloseTo(-12, 10) // -(2^2)*3
  })
})

describe('matchesPolynomial equivalence', () => {
  it('accepts factored and expanded forms', () => {
    // d/dx of (x-1)(x-1)... use 2x - 2 vs 2(x-1)
    expect(matchesPolynomial('2(x-1)', [-2, 2])).toBe(true)
    expect(matchesPolynomial('2x-2', [-2, 2])).toBe(true)
  })

  it('accepts (x+1)^2 == x^2 + 2x + 1', () => {
    expect(matchesPolynomial('(x+1)^2', [1, 2, 1])).toBe(true)
  })

  it('accepts implicit multiplication 2x(x-1) == 2x^2 - 2x', () => {
    expect(matchesPolynomial('2x(x-1)', [0, -2, 2])).toBe(true)
  })

  it('rejects malformed and structurally invalid input', () => {
    expect(matchesPolynomial('x+', [0, 1])).toBe(false)
    expect(matchesPolynomial('', [0, 1])).toBe(false)
    expect(matchesPolynomial('(x+1', [1, 1])).toBe(false)
    expect(matchesPolynomial('@#$', [1, 1])).toBe(false)
  })
})

describe('parseExpression edge cases', () => {
  it('returns null for division by zero (non-finite)', () => {
    expect(evalAt('1/0', 0)).toBeNull()
  })

  it('returns null for unbalanced parentheses', () => {
    expect(parseExpression('(x+1')).toBeNull()
    expect(parseExpression('x+1)')).toBeNull()
  })

  it('returns null for empty / whitespace input', () => {
    expect(parseExpression('   ')).toBeNull()
  })
})

describe('numeric grading with pi', () => {
  const expected = 72 * Math.PI

  it('accepts pi spellings and decimal approximations', () => {
    expect(matchesNumber('72pi', expected)).toBe(true)
    expect(matchesNumber('72*pi', expected)).toBe(true)
    expect(matchesNumber('72\u03c0', expected)).toBe(true)
    expect(matchesNumber('226.19', expected)).toBe(true)
  })

  it('rejects empty and non-numeric input', () => {
    expect(matchesNumber('', expected)).toBe(false)
    expect(matchesNumber('abc', expected)).toBe(false)
  })

  it('evaluates a constant expression to a number', () => {
    expect(evaluateNumericExpression('72*pi')).toBeCloseTo(expected, 6)
    expect(evaluateNumericExpression('abc')).toBeNull()
  })
})

describe('leading decimal point numbers', () => {
  it('parses ".5" as 0.5 [regression]', () => {
    expect(evaluateNumericExpression('.5')).toBeCloseTo(0.5, 9)
    expect(matchesNumber('.5', 0.5)).toBe(true)
    expect(matchesNumber('.25', 0.25)).toBe(true)
    expect(matchesNumber('-.5', -0.5)).toBe(true)
  })

  it('still treats a lone dot as invalid', () => {
    expect(evaluateNumericExpression('.')).toBeNull()
  })
})
