import { describe, it, expect } from 'vitest'

import { APPLICATION_LESSONS } from './index'
import { allMadlibSpecs } from './madlib'
import { addAiThemes, aiThemeCount } from './themeStore'
import { gradeProblem } from './grade'
import { prefetchThemes } from './aiThemes'
import type { AppField, WordProblem, ApplicationTopicDef } from './types'

// Importing lesson modules (transitively via ./index and ./aiThemes) registers
// every static theme + MadlibSpec at module load. The invariant under test: the
// AI may ONLY swap narrative text — never a problem's math, answer, or grading.

// ── Canonical-answer helpers (mirrors applications.test.ts) ──────────────────

/** Build a guaranteed-correct, parseable expression STRING from low→high coeffs. */
function coeffsToExpr(coeffs: number[]): string {
  const terms = coeffs.map((c, p) => `(${c})*x^${p}`)
  return terms.length ? terms.join('+') : '0'
}

/** Canonical correct answer string for a single field. */
function canonicalAnswer(field: AppField): string {
  switch (field.kind) {
    case 'number':
      return String(field.expected)
    case 'expression':
      return coeffsToExpr(field.trueCoefficients)
    case 'choice':
      return String(field.correct)
  }
}

/** Lowercased text the learner actually reads (for jargon-leak checks). */
function learnerVisibleText(problem: WordProblem): string {
  const labels = problem.fields.map((f) => f.label).join(' ')
  return `${problem.prompt} ${problem.given ?? ''} ${labels}`.toLowerCase()
}

/** Calculus jargon that must never leak into a learner-facing scenario. */
const FORBIDDEN_PHRASES = [
  'derivative',
  'mean value theorem',
  'intermediate value theorem',
  'second derivative',
  'critical point',
  'secant',
  'tangent',
  'power rule',
  'chain rule',
  'sum rule',
  'related rates',
  'calculus',
]

/** Slot names validated with `cleanTextNoDigits` across every lesson module. */
const DIGIT_FREE_SLOTS = new Set([
  'unit',
  'rateUnit',
  'inputUnit',
  'outputUnit',
  'object',
  'vehicle',
  'reading',
  'knob',
])

/** Slot names validated with `singleLetter`. */
const SINGLE_LETTER_SLOTS = new Set(['fnLetter', 'symbol'])

const GENERATE_ITERATIONS = 100

/** Flat list of every topic across all lessons, in course order. */
const ALL_TOPICS: ApplicationTopicDef[] = APPLICATION_LESSONS.flatMap((g) => g.topics)
const ALL_TOPIC_IDS = ALL_TOPICS.map((t) => t.id)

// ── 1. Specs registered for every topic ─────────────────────────────────────

describe('madlib: spec registry', () => {
  it('registers at least one spec, and one per topic id', () => {
    const specs = allMadlibSpecs()
    expect(specs.length).toBeGreaterThan(0)

    for (const topicId of ALL_TOPIC_IDS) {
      const forTopic = specs.filter((s) => s.topicId === topicId)
      expect(forTopic.length, `topic "${topicId}" should have >= 1 spec`).toBeGreaterThanOrEqual(1)
    }
  })

  it('registers exactly 3 specs for a3-related (one per shape)', () => {
    const related = allMadlibSpecs().filter((s) => s.topicId === 'a3-related')
    expect(related.length).toBe(3)
  })

  it('only registers specs for known topic ids', () => {
    const known = new Set(ALL_TOPIC_IDS)
    for (const spec of allMadlibSpecs()) {
      expect(known.has(spec.topicId), `unknown topic id "${spec.topicId}"`).toBe(true)
    }
  })
})

// ── 2. validate accepts the few-shot examples ───────────────────────────────

describe('madlib: validate accepts good input', () => {
  for (const spec of allMadlibSpecs()) {
    it(`${spec.topicId}: every example validates to a non-null theme`, () => {
      expect(spec.examples.length, `${spec.topicId}: examples non-empty`).toBeGreaterThan(0)
      spec.examples.forEach((example, i) => {
        const theme = spec.validate(example)
        expect(
          theme,
          `${spec.topicId} example#${i} should validate: ${JSON.stringify(example)}`,
        ).not.toBeNull()
      })
    })
  }
})

// ── 3. validate rejects bad input ───────────────────────────────────────────

describe('madlib: validate rejects bad input', () => {
  for (const spec of allMadlibSpecs()) {
    const base = spec.examples[0]

    it(`${spec.topicId}: rejects calculus jargon in a text slot`, () => {
      const bad = { ...base, title: 'the derivative of revenue' }
      expect(spec.validate(bad)).toBeNull()
    })

    it(`${spec.topicId}: rejects an over-long slot`, () => {
      const bad = { ...base, title: 'a'.repeat(200) }
      expect(spec.validate(bad)).toBeNull()
    })

    it(`${spec.topicId}: rejects an empty slot`, () => {
      const bad = { ...base, title: '' }
      expect(spec.validate(bad)).toBeNull()
    })

    const digitFreeSlots = spec.slots.filter((s) => DIGIT_FREE_SLOTS.has(s.name))
    if (digitFreeSlots.length > 0) {
      it(`${spec.topicId}: rejects a digit in a digit-free slot`, () => {
        for (const slot of digitFreeSlots) {
          const bad = { ...base, [slot.name]: '5 tickets' }
          expect(
            spec.validate(bad),
            `${spec.topicId}: slot "${slot.name}" should reject a digit`,
          ).toBeNull()
        }
      })
    }

    const letterSlots = spec.slots.filter((s) => SINGLE_LETTER_SLOTS.has(s.name))
    if (letterSlots.length > 0) {
      it(`${spec.topicId}: rejects a multi-char value in a single-letter slot`, () => {
        for (const slot of letterSlots) {
          const bad = { ...base, [slot.name]: 'Cost' }
          expect(
            spec.validate(bad),
            `${spec.topicId}: slot "${slot.name}" should reject multi-char`,
          ).toBeNull()
        }
      })
    }
  }
})

// ── 6. a3-related shape integrity ───────────────────────────────────────────

describe('madlib: a3-related shape integrity', () => {
  it('each of the 3 specs yields its own distinct shape', () => {
    const related = allMadlibSpecs().filter((s) => s.topicId === 'a3-related')
    expect(related.length).toBe(3)

    const shapes = related.map((spec) => {
      const theme = spec.validate(spec.examples[0]) as { shape?: string } | null
      expect(theme, `${spec.topicId} example should validate`).not.toBeNull()
      return theme?.shape
    })

    expect(new Set(shapes)).toEqual(new Set(['sphere', 'cube', 'square']))
  })
})

// ── 4 & 5. Injected AI themes preserve math and never leak jargon ────────────

describe('madlib: injected AI themes preserve math + no jargon leak', () => {
  for (const topic of ALL_TOPICS) {
    it(`${topic.id}: AI-themed problems stay self-consistent and jargon-free`, () => {
      const specs = allMadlibSpecs().filter((s) => s.topicId === topic.id)
      expect(specs.length, `${topic.id}: has a spec`).toBeGreaterThanOrEqual(1)

      // Inject one validated AI theme from every spec for this topic. For
      // a3-related that injects all three shapes (covers requirement #6's
      // generate phase too).
      for (const spec of specs) {
        const theme = spec.validate(spec.examples[0])
        expect(theme, `${topic.id}: example must validate before injection`).not.toBeNull()
        if (theme !== null) addAiThemes(topic.id, [theme])
      }

      for (let i = 0; i < GENERATE_ITERATIONS; i++) {
        const problem = topic.generate()
        const where = `${topic.id} iter#${i}`

        // #4 self-consistency: canonical answers grade correct.
        const canonical = problem.fields.map(canonicalAnswer)
        expect(
          gradeProblem(problem.fields, canonical),
          `${where}: canonical answers should grade correct (fields=${JSON.stringify(
            problem.fields,
          )}, answers=${JSON.stringify(canonical)})`,
        ).toBe(true)

        // #5 no jargon in rendered, learner-visible text.
        const text = learnerVisibleText(problem)
        for (const phrase of FORBIDDEN_PHRASES) {
          expect(
            text.includes(phrase),
            `${where}: leaked forbidden phrase "${phrase}" -> ${text}`,
          ).toBe(false)
        }
      }
    })
  }
})

// ── 8. a2-chain: xNoun must reference x (round-2 fix) ────────────────────────

describe('madlib: a2-chain xNoun must mention x', () => {
  const chainSpec = allMadlibSpecs().find((s) => s.topicId === 'a2-chain')
  it('a spec is registered', () => {
    expect(chainSpec, 'a2-chain spec must exist').toBeTruthy()
  })

  it('rejects an xNoun that omits x (e.g. "gain level")', () => {
    const bad = { ...chainSpec!.examples[0], xNoun: 'gain level' }
    expect(chainSpec!.validate(bad)).toBeNull()
  })

  it('accepts an xNoun that contains x (e.g. "gain level x")', () => {
    const good = { ...chainSpec!.examples[0], xNoun: 'gain level x' }
    expect(chainSpec!.validate(good)).not.toBeNull()
  })
})

// ── 9. a3-related: per-shape validate rejects shape-conflicting objects ──────

describe('madlib: a3-related rejects shape-mismatched objects', () => {
  const relatedSpecs = allMadlibSpecs().filter((s) => s.topicId === 'a3-related')

  /** Find the spec whose validated example carries the given shape. */
  function specForShape(shape: string) {
    const spec = relatedSpecs.find((s) => {
      const theme = s.validate(s.examples[0]) as { shape?: string } | null
      return theme?.shape === shape
    })
    expect(spec, `a spec for shape "${shape}" must exist`).toBeTruthy()
    return spec!
  }

  it('sphere spec rejects a cube/flat object', () => {
    const sphere = specForShape('sphere')
    expect(sphere.validate({ ...sphere.examples[0], object: 'an ice cube' })).toBeNull()
    expect(sphere.validate({ ...sphere.examples[0], object: 'a solar panel' })).toBeNull()
  })

  it('cube spec rejects a weather balloon', () => {
    const cube = specForShape('cube')
    expect(cube.validate({ ...cube.examples[0], object: 'a weather balloon' })).toBeNull()
  })

  it('square spec rejects a soap bubble', () => {
    const square = specForShape('square')
    expect(square.validate({ ...square.examples[0], object: 'a soap bubble' })).toBeNull()
  })

  it('each spec still accepts its own examples', () => {
    for (const spec of relatedSpecs) {
      expect(spec.examples.length, `${spec.topicId}: examples non-empty`).toBeGreaterThan(0)
      spec.examples.forEach((example, i) => {
        expect(
          spec.validate(example),
          `a3-related example#${i} should validate: ${JSON.stringify(example)}`,
        ).not.toBeNull()
      })
    }
  })
})

// ── 10. a1 rate unit is DERIVED in code, not an AI-controllable slot ─────────

describe('madlib: a1 rate-unit is derived, not a slot', () => {
  for (const topicId of ['a1-avg-inst', 'a1-instant-limit']) {
    it(`${topicId}: spec exposes no rateUnit slot`, () => {
      const spec = allMadlibSpecs().find((s) => s.topicId === topicId)
      expect(spec, `${topicId} spec must exist`).toBeTruthy()
      expect(
        spec!.slots.some((s) => s.name === 'rateUnit'),
        `${topicId} must not expose a rateUnit slot`,
      ).toBe(false)
    })
  }

  it('a1-avg-inst: derived rate unit reads "<unit> per <timeUnit>" in a field label', () => {
    const topic = ALL_TOPICS.find((t) => t.id === 'a1-avg-inst')
    const spec = allMadlibSpecs().find((s) => s.topicId === 'a1-avg-inst')
    expect(topic, 'a1-avg-inst topic must exist').toBeTruthy()
    expect(spec, 'a1-avg-inst spec must exist').toBeTruthy()

    // Inject a known theme (miles / hour) with a unique title so we can find the
    // exact generated problem and confirm the rate unit is "miles per hour".
    const uniqueTitle = 'QA derived rate ride'
    const theme = spec!.validate({
      title: uniqueTitle,
      subject: 'A tester',
      quantityNoun: 'the total distance ridden',
      unit: 'miles',
      timeUnit: 'hour',
    })
    expect(theme, 'injected miles/hour theme should validate').not.toBeNull()
    if (theme !== null) addAiThemes('a1-avg-inst', [theme])

    let found: WordProblem | null = null
    for (let i = 0; i < 3000 && found === null; i++) {
      const p = topic!.generate()
      if (p.title === uniqueTitle) found = p
    }
    expect(found, 'should eventually generate the injected theme').not.toBeNull()
    const labels = found!.fields.map((f) => f.label).join(' | ')
    expect(labels, `field labels: ${labels}`).toContain('miles per hour')
  })
})

// ── 7. prefetch is a safe no-op when AI is unconfigured ─────────────────────

describe('madlib: prefetch no-op safety', () => {
  it('resolves without throwing and adds no AI themes', async () => {
    const before = new Map(ALL_TOPIC_IDS.map((id) => [id, aiThemeCount(id)]))

    await expect(prefetchThemes()).resolves.toBeUndefined()

    for (const id of ALL_TOPIC_IDS) {
      expect(
        aiThemeCount(id),
        `${id}: prefetch must not increase AI theme count`,
      ).toBe(before.get(id))
    }
  })
})
