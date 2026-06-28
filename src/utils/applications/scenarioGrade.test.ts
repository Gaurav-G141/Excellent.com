import { describe, it, expect } from 'vitest'
import { gradeCodeStep, heuristicGradeFrq, rigorForLevel } from './scenarioGrade'
import type { ChoiceStep, ExpressionStep, FrqStep, NumberStep } from './scenarioTypes'

const numberStep: NumberStep = { id: 'n', tier: 'core', kind: 'number', prompt: 'n', expected: 12 }
const exprStep: ExpressionStep = {
  id: 'e',
  tier: 'core',
  kind: 'expression',
  prompt: 'e',
  trueCoefficients: [5, 8, 3], // 3x² + 8x + 5
}
const choiceStep: ChoiceStep = {
  id: 'c',
  tier: 'core',
  kind: 'choice',
  prompt: 'c',
  options: [1, 2, 3, 4],
  correct: 3,
}
const frqStep: FrqStep = {
  id: 'f',
  tier: 'core',
  kind: 'frq',
  prompt: 'f',
  rubric: 'the rate equals the growth',
  fallbackKeywords: [['grow', 'rate'], ['equal', 'same', 'match']],
}

describe('gradeCodeStep', () => {
  it('grades a number within tolerance', () => {
    expect(gradeCodeStep(numberStep, '12')).toBe(true)
    expect(gradeCodeStep(numberStep, '12.0')).toBe(true)
    expect(gradeCodeStep(numberStep, '13')).toBe(false)
  })

  it('rejects an empty answer', () => {
    expect(gradeCodeStep(numberStep, '   ')).toBe(false)
  })

  it('grades a polynomial in any equivalent form', () => {
    expect(gradeCodeStep(exprStep, '3*x^2 + 8*x + 5')).toBe(true)
    expect(gradeCodeStep(exprStep, '5 + 8x + 3x^2')).toBe(true)
    expect(gradeCodeStep(exprStep, '3x^2 + 8x + 6')).toBe(false)
  })

  it('grades a multiple-choice answer by exact value', () => {
    expect(gradeCodeStep(choiceStep, '3')).toBe(true)
    expect(gradeCodeStep(choiceStep, '2')).toBe(false)
  })

  it('never grades an FRQ step (AI owns that)', () => {
    expect(gradeCodeStep(frqStep, 'anything at all here')).toBe(false)
  })
})

describe('heuristicGradeFrq', () => {
  it('rejects very short answers', () => {
    expect(heuristicGradeFrq(frqStep, 'no')).toBe(false)
  })

  it('accepts when every keyword group is hit', () => {
    expect(
      heuristicGradeFrq(frqStep, 'the growth rate must equal how fast it changes'),
    ).toBe(true)
  })

  it('rejects when a keyword group is missing', () => {
    // Mentions growth/rate but never an "equal/same/match" word.
    expect(heuristicGradeFrq(frqStep, 'it has to do with the growth rate of things')).toBe(false)
  })

  it('falls back to a length check when no keywords are configured', () => {
    const noKw: FrqStep = { ...frqStep, fallbackKeywords: undefined }
    expect(heuristicGradeFrq(noKw, 'short')).toBe(false)
    expect(heuristicGradeFrq(noKw, 'this is a sufficiently long explanation')).toBe(true)
  })

  describe('strict rigor (high difficulty)', () => {
    // The "ball at its peak" example: informal gist vs. a rate-of-change answer.
    const peak: FrqStep = {
      id: 'peak',
      tier: 'core',
      kind: 'frq',
      prompt: 'p',
      rubric: 'its vertical rate of change is zero',
      fallbackKeywords: [['height', 'ball', 'it'], ['zero', 'not changing', 'unchanging', 'stop']],
    }

    it('accepts informal phrasing at standard rigor', () => {
      expect(heuristicGradeFrq(peak, "the ball's height is unchanging", 'standard')).toBe(true)
    })

    it('rejects the same informal answer at strict rigor', () => {
      // No rate-of-change language, so strict grading should not pass it.
      expect(heuristicGradeFrq(peak, "the ball's height is unchanging", 'strict')).toBe(false)
    })

    it('accepts a rate-of-change answer at strict rigor', () => {
      expect(
        heuristicGradeFrq(
          peak,
          "the ball's height has a rate of change of zero relative to time",
          'strict',
        ),
      ).toBe(true)
    })
  })
})

describe('rigorForLevel', () => {
  it('is lenient in the explicit band, standard mid, strict at the top', () => {
    expect(rigorForLevel(1)).toBe('lenient')
    expect(rigorForLevel(9)).toBe('standard')
    expect(rigorForLevel(15)).toBe('strict')
  })
})
