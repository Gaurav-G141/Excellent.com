import { describe, it, expect } from 'vitest'
import { SCENARIO_LESSONS } from './index'
import { gradeCodeStep } from '../scenarioGrade'
import { resolveStepPrompt, visibleSteps } from '../scenarioTypes'
import type { ScenarioProblem, ScenarioStep } from '../scenarioTypes'

/** Every (lessonId, topic) pair in course order. */
const TOPICS = SCENARIO_LESSONS.flatMap((group) =>
  group.topics.map((topic) => ({ lessonId: group.lessonId, topic })),
)

/** Evaluate a low-to-high coefficient array at x. */
function evalPoly(coeffs: number[], x: number): number {
  return coeffs.reduce((sum, c, power) => sum + c * x ** power, 0)
}

function byId(steps: ScenarioStep[], id: string): ScenarioStep {
  const found = steps.find((s) => s.id === id)
  if (!found) throw new Error(`no step ${id}`)
  return found
}

describe('SCENARIO_LESSONS registry', () => {
  it('covers all four lessons with the expected ids', () => {
    expect(SCENARIO_LESSONS.map((g) => g.lessonId)).toEqual([
      'derivatives-basics',
      'derivative-rules',
      'related-rates',
      'exponents-product-rule',
    ])
  })

  it('every topic id is unique', () => {
    const ids = TOPICS.map(({ topic }) => topic.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('scenario lesson placement (no rule served before it is taught)', () => {
  /** topicId -> the lesson group it currently belongs to. */
  const lessonForTopic = new Map<string, string>(
    SCENARIO_LESSONS.flatMap((group) =>
      group.topics.map((t) => [t.id, group.lessonId] as const),
    ),
  )

  /** Course order: index 0 is taught first. */
  const ORDER = [
    'derivatives-basics',
    'derivative-rules',
    'related-rates',
    'exponents-product-rule',
  ]
  const orderIndex = (lessonId: string) => ORDER.indexOf(lessonId)

  /**
   * The EARLIEST lesson whose rule each scenario actually requires. A scenario
   * must never live in a group earlier than the lesson that teaches its rule.
   *   - s1-equilibrium: basic derivative (read a rate of change)        -> L1
   *   - s2-spread:      power rule on a single polynomial               -> L2
   *   - s3-peak:        motion / setting a rate to zero                 -> L3
   *   - s3-ivt:         intermediate-value reasoning (taught in L3)     -> L3
   *   - s4-growth:      exponential growth (e^x)                        -> L4
   *   - s2-product:     PRODUCT rule (taught in L4)                     -> L4
   */
  const requiredLessonForTopic: Record<string, string> = {
    's1-equilibrium': 'derivatives-basics',
    's2-spread': 'derivative-rules',
    's3-peak': 'related-rates',
    's3-ivt': 'related-rates',
    's4-growth': 'exponents-product-rule',
    's2-product': 'exponents-product-rule',
  }

  it('places the power-rule "spread" scenario in Lesson 2 (derivative-rules)', () => {
    expect(lessonForTopic.get('s2-spread')).toBe('derivative-rules')
  })

  it('places the product-rule scenario in Lesson 4 (exponents-product-rule), NOT Lesson 2', () => {
    expect(lessonForTopic.get('s2-product')).toBe('exponents-product-rule')
    // It must not linger in the Lesson 2 group.
    const l2 = SCENARIO_LESSONS.find((g) => g.lessonId === 'derivative-rules')
    expect(l2?.topics.map((t) => t.id)).not.toContain('s2-product')
    expect(l2?.topics.map((t) => t.id)).toEqual(['s2-spread'])
  })

  it('places the new IVT scenario in Lesson 3 (related-rates)', () => {
    expect(lessonForTopic.get('s3-ivt')).toBe('related-rates')
    const l3 = SCENARIO_LESSONS.find((g) => g.lessonId === 'related-rates')
    expect(l3?.topics.map((t) => t.id)).toContain('s3-ivt')
  })

  it('never gates a scenario before the lesson that teaches its rule', () => {
    for (const { lessonId, topic } of TOPICS) {
      const required = requiredLessonForTopic[topic.id]
      expect(required, `unmapped topic ${topic.id}`).toBeDefined()
      // The group it lives in must be at or after the lesson that teaches the rule.
      expect(orderIndex(lessonId)).toBeGreaterThanOrEqual(orderIndex(required))
    }
  })
})

describe('s3-ivt: endpoints-only intermediate-value scenario', () => {
  const topic = SCENARIO_LESSONS.flatMap((g) => g.topics).find((t) => t.id === 's3-ivt')

  it('exists', () => {
    expect(topic).toBeDefined()
  })

  it('guarantees an interior value and keeps every distractor strictly outside', () => {
    if (!topic) throw new Error('missing s3-ivt')
    for (let i = 0; i < 40; i++) {
      const p = topic.generate()

      // The subject noun must survive into the prompt for the rewrite guard.
      expect(p.subjectTerms?.length).toBeGreaterThan(0)
      for (const term of p.subjectTerms ?? []) {
        expect(p.prompt.toLowerCase()).toContain(term.toLowerCase())
      }
      // No equation/graph: this is pure endpoint reasoning.
      expect(p.given).toBeUndefined()

      // Two endpoint readings appear in the prompt (lo < hi).
      const choice = p.steps.find((s) => s.kind === 'choice')
      if (!choice || choice.kind !== 'choice') throw new Error('no choice step')
      const nums = p.prompt.match(/\d+/g)?.map(Number) ?? []
      const lo = Math.min(...nums)
      const hi = Math.max(...nums)
      expect(hi).toBeGreaterThan(lo)

      // The single guaranteed value lies STRICTLY between the endpoints...
      expect(choice.correct).toBeGreaterThan(lo)
      expect(choice.correct).toBeLessThan(hi)

      // ...and every other option lies strictly OUTSIDE [lo, hi].
      for (const opt of choice.options) {
        if (opt === choice.correct) continue
        expect(opt < lo || opt > hi).toBe(true)
      }
      // Exactly one option is interior (the guaranteed one).
      const interior = choice.options.filter((o) => o > lo && o < hi)
      expect(interior).toEqual([choice.correct])
    }
  })
})

describe('scenario structural invariants (sampled across regenerations)', () => {
  for (const { topic } of TOPICS) {
    it(`${topic.id} produces well-formed problems`, () => {
      for (let i = 0; i < 25; i++) {
        const p = topic.generate()
        expect(p.topicId).toBe(topic.id)
        expect(p.title.length).toBeGreaterThan(0)
        expect(p.prompt.length).toBeGreaterThan(0)

        // Exactly one AI-graded free-response step.
        const frqs = p.steps.filter((s) => s.kind === 'frq')
        expect(frqs.length).toBe(1)

        // Any declared subject terms must actually appear in the prompt, so the
        // AI rewrite's subject-preservation guard can keep prompt + steps aligned.
        for (const term of p.subjectTerms ?? []) {
          expect(p.prompt.toLowerCase()).toContain(term.toLowerCase())
        }

        // Step ids unique; every step prompt resolves to non-empty text.
        const ids = p.steps.map((s) => s.id)
        expect(new Set(ids).size).toBe(ids.length)
        for (const lvl of [1, 9, 15]) {
          for (const s of p.steps) {
            expect(resolveStepPrompt(s.prompt, lvl).length).toBeGreaterThan(0)
          }
        }

        for (const s of p.steps) {
          if (s.kind === 'number') expect(Number.isFinite(s.expected)).toBe(true)
          if (s.kind === 'expression') {
            expect(s.trueCoefficients.length).toBeGreaterThan(0)
            expect(s.trueCoefficients.every(Number.isFinite)).toBe(true)
          }
          if (s.kind === 'choice') {
            expect(s.options).toContain(s.correct)
            expect(new Set(s.options).size).toBe(s.options.length)
          }
        }

        // The hardest (story-band) version keeps the concept + at least one ask.
        const lean = visibleSteps(p.steps, 15)
        expect(lean.some((s) => s.kind === 'frq')).toBe(true)
        expect(lean.length).toBeGreaterThanOrEqual(2)
        // A low level shows at least as many steps as a high one.
        expect(visibleSteps(p.steps, 1).length).toBeGreaterThanOrEqual(lean.length)
      }
    })
  }
})

describe('scenario math correctness', () => {
  function findTopic(id: string) {
    const found = TOPICS.find((t) => t.topic.id === id)
    if (!found) throw new Error(`missing topic ${id}`)
    return found.topic
  }

  /** Find an integer x in [0, 12] whose derivative value matches `target`. */
  function xMatching(deriv: number[], target: number): number {
    for (let x = 0; x <= 12; x++) if (evalPoly(deriv, x) === target) return x
    return -1
  }

  it('s1-equilibrium: evaluate = derivative value, final = ceil(change / per-predator)', () => {
    const topic = findTopic('s1-equilibrium')
    for (let i = 0; i < 25; i++) {
      const p = topic.generate()
      const derive = byId(p.steps, 'derive')
      const evaluate = byId(p.steps, 'evaluate')
      const final = byId(p.steps, 'final')
      if (derive.kind !== 'expression' || evaluate.kind !== 'number' || final.kind !== 'number') {
        throw new Error('unexpected step kinds')
      }
      const x0 = xMatching(derive.trueCoefficients, evaluate.expected)
      expect(x0).toBeGreaterThanOrEqual(0)

      const per = perFromPrompt(final.prompt as string)
      expect(per).toBeGreaterThan(0)
      // A MINIMUM count always rounds UP, and the answer is a whole number.
      const quotient = evaluate.expected / per
      expect(final.expected).toBe(Math.ceil(quotient))
      expect(Number.isInteger(final.expected)).toBe(true)
      // The code grader accepts the canonical whole-number answer...
      expect(gradeCodeStep(final, String(final.expected))).toBe(true)
      // ...but rejects the un-rounded fractional quotient (can't have a
      // fraction of a predator) and rounding the wrong way (down).
      if (!Number.isInteger(quotient)) {
        expect(gradeCodeStep(final, String(quotient))).toBe(false)
        expect(gradeCodeStep(final, String(Math.floor(quotient)))).toBe(false)
      }
    }
  })

  it('s2-spread: final = area-rate (derivative) value at the chosen time', () => {
    const topic = findTopic('s2-spread')
    for (let i = 0; i < 25; i++) {
      const p = topic.generate()
      const derive = byId(p.steps, 'derive')
      const final = byId(p.steps, 'final')
      if (derive.kind !== 'expression' || final.kind !== 'number') throw new Error('bad kinds')
      expect(xMatching(derive.trueCoefficients, final.expected)).toBeGreaterThanOrEqual(0)
    }
  })

  it('s2-product: final = (length × width) area-rate value', () => {
    const topic = findTopic('s2-product')
    for (let i = 0; i < 25; i++) {
      const p = topic.generate()
      const derive = byId(p.steps, 'derive')
      const final = byId(p.steps, 'final')
      if (derive.kind !== 'expression' || final.kind !== 'number') throw new Error('bad kinds')
      expect(xMatching(derive.trueCoefficients, final.expected)).toBeGreaterThanOrEqual(0)
      expect(gradeCodeStep(derive, polyToInput(derive.trueCoefficients))).toBe(true)
    }
  })

  it('s3-peak: velocity is zero at the peak time', () => {
    const topic = findTopic('s3-peak')
    for (let i = 0; i < 25; i++) {
      const p = topic.generate()
      const derive = byId(p.steps, 'derive')
      const final = byId(p.steps, 'final')
      if (derive.kind !== 'expression' || final.kind !== 'number') throw new Error('bad kinds')
      expect(Math.abs(evalPoly(derive.trueCoefficients, final.expected))).toBeLessThan(1e-9)
    }
  })

  it('s4-growth: amount = N0·e^(k·x0) and the rate option = k·amount', () => {
    const topic = findTopic('s4-growth')
    for (let i = 0; i < 25; i++) {
      const p = topic.generate()
      const amount = byId(p.steps, 'amount')
      const final = byId(p.steps, 'final')
      if (amount.kind !== 'number' || final.kind !== 'choice') throw new Error('bad kinds')

      const { n0, k } = growthParams(p.given ?? '')
      const x0 = x0FromPrompt(p.prompt)
      const current = n0 * Math.exp(k * x0)
      expect(amount.expected).toBe(Math.round(current))
      expect(final.correct).toBe(Math.round(k * current))
      expect(final.options).toContain(final.correct)
    }
  })
})

/** Pull the "removes N" predator rate out of the final step prompt. */
function perFromPrompt(prompt: string): number {
  const m = prompt.match(/removes (\d+)/)
  return m ? Number(m[1]) : -1
}

/** Pull N0 and k out of an "N(x) = N0 · e^(k · x)" given string. */
function growthParams(given: string): { n0: number; k: number } {
  const m = given.match(/=\s*([\d.]+)\s*·\s*e\^\(([\d.]+)\s*·\s*x\)/)
  if (!m) throw new Error(`cannot parse given: ${given}`)
  return { n0: Number(m[1]), k: Number(m[2]) }
}

/** Pull the time x0 out of a "...growing at <unit> N?" prompt. */
function x0FromPrompt(prompt: string): number {
  const m = prompt.match(/growing at \w+ (\d+)/)
  if (!m) throw new Error(`cannot parse x0: ${prompt}`)
  return Number(m[1])
}

/** Serialize coefficients to a parser-safe polynomial string for grading. */
function polyToInput(coeffs: number[]): string {
  const parts: string[] = []
  for (let power = coeffs.length - 1; power >= 0; power--) {
    const c = coeffs[power]
    if (c === 0) continue
    parts.push(power === 0 ? `${c}` : power === 1 ? `${c}*x` : `${c}*x^${power}`)
  }
  return parts.length > 0 ? parts.join(' + ') : '0'
}
