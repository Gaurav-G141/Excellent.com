import { describe, it, expect } from 'vitest'

import type { WordProblem } from '../../utils/applications/types'
import { resolveSubject, type StickerableProblem } from './catalog'

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

describe('resolveSubject: curated subjectTerms beat title keywords', () => {
  it('draws the real subject (mice/owl), NOT a keyword-triggered box', () => {
    // The reworded title says "conveyor" (which used to map to a cardboard box),
    // but the problem is really about mice and owls — the subjectTerms must win.
    const problem: StickerableProblem = {
      topicId: 's1-equilibrium',
      title: 'Conveyor belt population study',
      prompt: 'On a freight farm, mice and owls reach a balance.',
      subjectTerms: ['mice', 'owl'],
    }
    for (let i = 0; i < 50; i++) {
      const subject = resolveSubject(problem)
      expect(['mice', 'owl']).toContain(subject)
      expect(subject).not.toBe('cardboard box')
    }
  })

  it('singularizes a plural subject term via asDrawableSubject', () => {
    const problem: StickerableProblem = {
      topicId: 'unknown-topic',
      title: 'A study',
      prompt: 'Counting things.',
      subjectTerms: ['ladybugs'],
    }
    expect(resolveSubject(problem)).toBe('ladybug')
  })

  it('stickerSubject still wins over subjectTerms', () => {
    const problem: StickerableProblem = {
      topicId: 's1-equilibrium',
      title: 'Conveyor belt population study',
      prompt: 'mice and owls reach a balance.',
      stickerSubject: 'rainbow',
      subjectTerms: ['mice', 'owl'],
    }
    expect(resolveSubject(problem)).toBe('rainbow')
  })

  it('ignores empty/blank subjectTerms and falls through to keywords', () => {
    const problem: StickerableProblem = {
      topicId: 'a2-power',
      title: 'Pizza dough cost',
      prompt: 'A scenario.',
      subjectTerms: ['', '   '],
    }
    expect(resolveSubject(problem)).toBe('pizza')
  })
})

describe('resolveSubject: keyword rules scan title + prompt', () => {
  it('matches a depictive keyword found only in the prompt body', () => {
    const subject = resolveSubject({
      topicId: 'unknown-topic',
      title: 'A quiet study',
      prompt: 'A rocket climbs into the sky.',
    })
    expect(subject).toBe('rocket')
  })

  it('no longer maps conveyor/freight to a cardboard box', () => {
    const subject = resolveSubject({
      topicId: 'no-such-topic',
      title: 'Conveyor and freight logistics',
      prompt: 'A scenario.',
    })
    expect(subject).not.toBe('cardboard box')
    // With no subjectTerm/interest/keyword and an unknown topic, falls to generic.
    expect(GENERIC_SUBJECTS).toContain(subject)
  })
})

describe('resolveSubject: matched interest wins over the catalog', () => {
  it('draws a learner interest that appears in the themed problem', () => {
    const subject = resolveSubject(
      makeProblem({ title: 'A ladybug on a leaf', topicId: 'a2-power' }),
      ['ladybugs', 'chess'],
    )
    // Singularized from "ladybugs", and beats both the keyword and topic pool.
    expect(subject).toBe('ladybug')
  })

  it('matches an interest found only in the prompt body', () => {
    const subject = resolveSubject(
      makeProblem({ title: 'A quiet afternoon', prompt: 'Mia plays the violin.', topicId: 'a2-sum' }),
      ['violin'],
    )
    expect(subject).toBe('violin')
  })

  it('keeps "ss" words intact when singularizing', () => {
    expect(
      resolveSubject(makeProblem({ title: 'A game of chess' }), ['chess']),
    ).toBe('chess')
  })

  it('ignores interests that do not appear, falling back to the catalog', () => {
    const subject = resolveSubject(
      makeProblem({ title: 'Giant pizza party', topicId: 'a2-power' }),
      ['ladybugs'],
    )
    expect(subject).toBe('pizza')
  })

  it('ignores too-short interests to avoid spurious substring hits', () => {
    // "go" (2 chars) appears inside "dragon" but must be ignored.
    const subject = resolveSubject(
      makeProblem({ title: 'A dragon hoard', topicId: 'a2-power' }),
      ['go'],
    )
    expect(TOPIC_POOLS['a2-power']).toContain(subject)
  })
})

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
