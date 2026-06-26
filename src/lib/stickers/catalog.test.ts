import { describe, it, expect } from 'vitest'

import type { WordProblem } from '../../utils/applications/types'
import { resolveSubject } from './catalog'

// Minimal WordProblem builder — resolveSubject only reads `title` and `topicId`,
// so the other fields are filler to satisfy the type.
function makeProblem(partial: Partial<WordProblem>): WordProblem {
  return {
    id: 'p1',
    topicId: 'unknown-topic',
    title: '',
    prompt: 'A scenario.',
    hint: 'A nudge.',
    fields: [],
    ...partial,
  }
}

// Mirrors TOPIC_POOLS in catalog.ts (kept private there). If the source pools
// change, update this map. Used to assert the topicId fallback stays in-pool.
const TOPIC_POOLS: Record<string, readonly string[]> = {
  'a1-fastest': ['electric guitar', 'smartphone', 'river', 'lake', 'dinosaur'],
  'a1-avg-inst': ['bicycle', 'fish', 'piggy bank', 'television'],
  'a1-instant-limit': ['drone', 'roller coaster', 'elevator', 'water tank'],
  'a1-turning': ['piggy bank', 'drone', 'stock chart', 'thermometer'],
  'a2-power': ['pizza', 'cube', 'paint bucket', 'wagon'],
  'a2-sum': ['shopping bag', 'factory', 'smartphone', 'car'],
  'a2-chain': ['race car', 'tent', 'antenna', 'camera'],
  'a2-mvt': ['car', 'elevator', 'cardboard box', 'drone'],
  'a2-combine': ['rocket ship', 'robot', 'computer', 'car'],
  'a3-related': ['hot air balloon', 'soap bubble', 'ice cube', 'smiling sun'],
  'a3-accel': ['train', 'elevator', 'gear', 'rocket'],
  'a3-ivt': ['thermometer', 'drone', 'pressure gauge', 'antenna'],
  'a4-egrowth': ['bacteria', 'sprouting plant', 'piggy bank'],
  'a4-base': ['rabbits', 'coins', 'balloons'],
  'a4-log': ['speaker', 'mountain', 'volume knob'],
  'a4-product': ['shopping cart', 'price tag', 'garden plot'],
  'a4-product-point': ['cash register', 'stopwatch', 'shopping bag'],
}

// Mirrors GENERIC_SUBJECTS in catalog.ts.
const GENERIC_SUBJECTS = ['gold star', 'trophy', 'hot air balloon', 'smiling sun']

describe('resolveSubject: title-keyword mapping wins', () => {
  // Representative *real* titles drawn from the lesson topic files. Each maps to
  // a deterministic subject via the first matching keyword rule (order matters).
  it.each([
    // a1 (lesson 1)
    ['Concert ticket sales', 'a1-fastest', 'electric guitar'],
    ['App downloads', 'a1-fastest', 'smartphone'],
    ['River height', 'a1-fastest', 'river'],
    ['Reservoir inflow', 'a1-fastest', 'lake'],
    // a2 (lesson 2)
    ['Pizza dough cost', 'a2-power', 'pizza'],
    ['Kinetic energy', 'a2-power', 'wagon'],
    ['Boutique revenue', 'a2-sum', 'shopping bag'],
    ['Speed camera zone', 'a2-mvt', 'camera'],
    ['Spaceship power', 'a2-combine', 'rocket ship'],
    // a3 (lesson 3)
    ['Ice cube', 'a3-related', 'ice cube'],
    ['Salt crystal', 'a3-related', 'salt crystal'],
    ['Rocket sled', 'a3-accel', 'rocket'],
    ['Room temperature', 'a3-ivt', 'thermometer'],
    ['Tank pressure', 'a3-ivt', 'pressure gauge'],
  ])('title %j resolves to %j (ignoring topicId %j)', (title, topicId, expected) => {
    const subject = resolveSubject(makeProblem({ title, topicId }))
    expect(subject).toBe(expected)
  })

  it('matches keywords case-insensitively', () => {
    expect(resolveSubject(makeProblem({ title: 'GIANT PIZZA PARTY' }))).toBe('pizza')
  })
})

describe('resolveSubject: topicId fallback when title is unrecognized', () => {
  const UNRECOGNIZED = 'qzx blorptastic widget' // contains no keyword

  it.each(Object.keys(TOPIC_POOLS))(
    'topicId %j yields a subject from its pool',
    (topicId) => {
      // Run several times since the pool pick is random.
      for (let i = 0; i < 50; i++) {
        const subject = resolveSubject(makeProblem({ title: UNRECOGNIZED, topicId }))
        expect(TOPIC_POOLS[topicId]).toContain(subject)
      }
    },
  )

  it('uses the topic pool even when the title is empty/undefined', () => {
    const subject = resolveSubject(makeProblem({ title: '', topicId: 'a2-chain' }))
    expect(TOPIC_POOLS['a2-chain']).toContain(subject)
  })
})

describe('resolveSubject: generic fallback', () => {
  it('falls back to a generic subject when title and topicId both miss', () => {
    for (let i = 0; i < 50; i++) {
      const subject = resolveSubject(
        makeProblem({ title: 'qzx blorptastic widget', topicId: 'no-such-topic' }),
      )
      expect(GENERIC_SUBJECTS).toContain(subject)
    }
  })

  it('never returns an empty subject across many random/edge inputs', () => {
    const inputs: Partial<WordProblem>[] = [
      { title: '', topicId: '' },
      { title: 'qzx', topicId: 'nope' },
      { title: 'pizza', topicId: 'a1-fastest' },
      { title: undefined as unknown as string, topicId: 'a3-related' },
    ]
    for (const partial of inputs) {
      const subject = resolveSubject(makeProblem(partial))
      expect(typeof subject).toBe('string')
      expect(subject.length).toBeGreaterThan(0)
    }
  })
})
