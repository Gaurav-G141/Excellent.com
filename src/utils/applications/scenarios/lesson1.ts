/**
 * Starter scenario for Lesson 1 (Derivatives Basics): an equilibrium /
 * "keep it steady" problem in the paper-box multi-step style.
 *
 * All math is owned here in code. The AI only restates the surface wording of the
 * title/prompt at a difficulty level (scenarioRewrite.ts); the steps below — their
 * questions, answers, rubrics, and hints — are fixed. Calculus is never named: the
 * learner has to recognize that "staying steady" means the predators must remove
 * exactly as fast as the colony grows (the derivative).
 */

import { formatPolynomial, pick, randInt, uniqueId, wholeCount } from '../helpers'
import type { ScenarioLessonGroup, ScenarioProblem, ScenarioTopicDef } from '../scenarioTypes'

interface EquilibriumTheme {
  title: string
  place: string
  creature: string
  predators: string
  predatorSingular: string
}

const EQUILIBRIUM_THEMES: EquilibriumTheme[] = [
  {
    title: 'Bugs in the meadow',
    place: 'a meadow',
    creature: 'bugs',
    predators: 'birds',
    predatorSingular: 'bird',
  },
  {
    title: 'Weeds in the garden',
    place: 'a community garden',
    creature: 'weeds',
    predators: 'goats',
    predatorSingular: 'goat',
  },
  {
    title: 'Algae in the pond',
    place: 'a koi pond',
    creature: 'algae patches',
    predators: 'snails',
    predatorSingular: 'snail',
  },
  {
    title: 'Mice in the barn',
    place: 'an old barn',
    creature: 'mice',
    predators: 'owls',
    predatorSingular: 'owl',
  },
  {
    title: 'Aphids on the roses',
    place: 'a rose garden',
    creature: 'aphids',
    predators: 'ladybugs',
    predatorSingular: 'ladybug',
  },
  {
    title: 'Larvae in the rain barrel',
    place: 'a rain barrel',
    creature: 'mosquito larvae',
    predators: 'minnows',
    predatorSingular: 'minnow',
  },
  {
    title: 'Slugs in the patch',
    place: 'a vegetable patch',
    creature: 'slugs',
    predators: 'ducks',
    predatorSingular: 'duck',
  },
  {
    title: 'Rabbits in the field',
    place: 'a clover field',
    creature: 'rabbits',
    predators: 'foxes',
    predatorSingular: 'fox',
  },
  {
    title: 'Crickets in the greenhouse',
    place: 'a greenhouse',
    creature: 'crickets',
    predators: 'frogs',
    predatorSingular: 'frog',
  },
]

function genEquilibrium(): ScenarioProblem {
  const theme = pick(EQUILIBRIUM_THEMES)
  const a = pick([2, 3, 4])
  const b = randInt(5, 12)
  const c = randInt(20, 60)
  const x0 = randInt(3, 6)
  const perPredator = pick([6, 8, 9, 12])

  // P(x) = a·x² + b·x + c  (population after x days); coeffs low-to-high.
  const coeffs = [c, b, a]
  const popAtX0 = a * x0 * x0 + b * x0 + c
  // P'(x) = 2a·x + b — the colony's daily change.
  const derivCoeffs = [b, 2 * a]
  const growth = 2 * a * x0 + b
  // A MINIMUM count: you need enough predators to remove at least the whole
  // daily gain, so a fractional result always rounds UP (3.2 snails → 4).
  const predators = wholeCount(growth / perPredator, 'up')

  const { place, creature, predators: pred, predatorSingular } = theme

  return {
    id: uniqueId('s1-equilibrium'),
    topicId: 's1-equilibrium',
    title: theme.title,
    // The steps name the creature and the predator, so the rewrite must keep both.
    subjectTerms: [creature.split(' ')[0], predatorSingular],
    prompt: `In ${place}, the number of ${creature} after x days is given by the formula below. A single ${predatorSingular} removes ${perPredator} ${creature} each day. How many ${pred} are needed to hold the ${creature} steady on day ${x0}?`,
    given: `P(x) = ${formatPolynomial(coeffs, 'x')}`,
    idealAnswer: `Holding steady means the ${pred} remove exactly as many ${creature} as the colony gains each day — its daily change. Divide that change by how many one ${predatorSingular} eats, then round up to a whole ${predatorSingular}.`,
    steps: [
      {
        id: 'warmup',
        tier: 'guide',
        kind: 'number',
        prompt: `Warm up: how many ${creature} are there on day ${x0}?`,
        expected: popAtX0,
        hints: [`Put x = ${x0} into the formula and work it out.`],
      },
      {
        id: 'concept',
        tier: 'core',
        kind: 'frq',
        prompt: {
          base: `For the number of ${creature} to hold steady, what has to be true about how the ${pred} eat compared with how the colony is changing? Explain in your own words.`,
          story: `What would have to be true for the ${creature} to neither grow nor shrink from one day to the next?`,
        },
        rubric: `The total amount the predators remove each day must equal how fast the colony is growing at that moment (its rate of change / derivative): the growth is exactly cancelled out so the count stays the same.`,
        fallbackKeywords: [
          ['grow', 'growth', 'increas', 'gain', 'chang', 'rate', 'fast', 'add', 'rise'],
          ['eat', 'eaten', 'remov', 'consum', 'cancel', 'balanc', 'equal', 'match', 'offset', 'same'],
        ],
        idealAnswer: `Exactly right: the ${pred} have to remove ${creature} just as fast as the colony adds them.`,
        hints: [
          `Think about what "staying the same" means for a number that would otherwise be climbing.`,
          `If the colony would gain some ${creature} each day, the ${pred} have to take that same amount away.`,
        ],
      },
      {
        id: 'derive',
        tier: 'scaffold',
        kind: 'expression',
        builder: true,
        prompt: `Build a formula for how fast the number of ${creature} changes as the days go by (as an expression in x).`,
        trueCoefficients: derivCoeffs,
        hints: [
          `Bring each power down in front and lower the power by one.`,
          `The x² term becomes a 2x-style term, the x term becomes a constant, and the lone constant drops out.`,
        ],
      },
      {
        id: 'evaluate',
        tier: 'scaffold',
        kind: 'number',
        prompt: {
          base: `Using that, how fast is the number of ${creature} changing on day ${x0}? (${creature} per day)`,
          story: `On day ${x0}, by how many ${creature} does the colony shift in a single day?`,
        },
        expected: growth,
        hints: [`Put x = ${x0} into the formula you just built.`],
      },
      {
        id: 'final',
        tier: 'core',
        kind: 'number',
        prompt: `Each ${predatorSingular} removes ${perPredator} ${creature} a day. How many ${pred} keep the count steady? (whole ${pred})`,
        expected: predators,
        // Require the rounded-up whole number: the raw fractional quotient (e.g.
        // 3.2) must NOT pass — you can't have a fraction of a predator. Kept
        // below the coarsest possible gap to a whole number (1/12 ≈ 0.083).
        tolerance: 0.05,
        hints: [
          `Divide the colony's daily change by how many one ${predatorSingular} eats.`,
          `You can't have a fraction of a ${predatorSingular} — round up to the next whole one.`,
        ],
      },
    ],
  }
}

const equilibrium: ScenarioTopicDef = {
  id: 's1-equilibrium',
  label: 'Keeping it steady',
  generate: genEquilibrium,
}

export const lesson1Scenarios: ScenarioLessonGroup = {
  lessonId: 'derivatives-basics',
  lessonTitle: 'Derivatives Basics',
  topics: [equilibrium],
}
