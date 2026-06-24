import { describe, it, expect } from 'vitest'
import { formatFeedback } from './feedback'

describe('formatFeedback', () => {
  it('falls back when the template is missing or blank (no throw)', () => {
    expect(formatFeedback(undefined)).toBe('Not quite — check your work and try again.')
    expect(formatFeedback(null)).toBe('Not quite — check your work and try again.')
    expect(formatFeedback('   ')).toBe('Not quite — check your work and try again.')
    expect(formatFeedback('', {}, 'custom fallback')).toBe('custom fallback')
  })

  it('substitutes single and repeated tokens', () => {
    expect(
      formatFeedback('The answer is {correct answer}, not {correct answer}-ish.', {
        'correct answer': 'C',
      }),
    ).toBe('The answer is C, not C-ish.')
  })

  it('substitutes multiple distinct tokens', () => {
    expect(
      formatFeedback('At {correct answer} it beats {answer}.', {
        'correct answer': 'D',
        answer: 'A',
      }),
    ).toBe('At D it beats A.')
  })

  it('inserts replacement values literally (no regex interpretation)', () => {
    expect(formatFeedback('value: {v}', { v: '$1.50 (a+b)' })).toBe('value: $1.50 (a+b)')
  })

  it('leaves unknown tokens untouched', () => {
    expect(formatFeedback('keep {x value to find derivative at}', {})).toBe(
      'keep {x value to find derivative at}',
    )
  })
})
