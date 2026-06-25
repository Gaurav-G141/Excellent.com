/**
 * Applications word problems for Lesson 1 — Derivatives Basics.
 *
 * Each topic builds a fresh, self-contained scenario with randomized numbers
 * and themes. Wording stays plain on purpose (no calculus jargon); hints nudge
 * toward the approach without revealing the answer.
 */

import type {
  ApplicationLessonGroup,
  ApplicationTopicDef,
  WordProblem,
} from './types'
import { formatPolynomial, pick, randInt, round, shuffle, uniqueId } from './helpers'

interface FastestTheme {
  title: string
  scenario: (k0: number) => string
  unit: string
  axis: 'day' | 'second'
}

const fastestThemes: FastestTheme[] = [
  {
    title: 'Concert ticket sales',
    axis: 'day',
    unit: 'thousands of tickets',
    scenario: () =>
      'A venue tracks the total number of concert tickets sold (in thousands) by the end of each day.',
  },
  {
    title: 'App downloads',
    axis: 'day',
    unit: 'thousands of downloads',
    scenario: () =>
      'A studio tracks the cumulative number of app downloads (in thousands) by the end of each day after launch.',
  },
  {
    title: 'River height',
    axis: 'second',
    unit: 'cm',
    scenario: () =>
      'After a dam release, sensors record the total rise in river height (in cm) by the end of each second.',
  },
  {
    title: 'Reservoir inflow',
    axis: 'second',
    unit: 'thousands of litres',
    scenario: () =>
      'A reservoir logs the total inflow (in thousands of litres) by the end of each second.',
  },
  {
    title: 'Museum visitors',
    axis: 'day',
    unit: 'hundreds of visitors',
    scenario: () =>
      'A museum records the cumulative number of visitors (in hundreds) by the end of each day this week.',
  },
]

const fastest: ApplicationTopicDef = {
  id: 'a1-fastest',
  label: 'Fastest rate',
  generate: (): WordProblem => {
    const theme = pick(fastestThemes)
    const m = pick([2, 3])
    const k0 = randInt(3, 12)
    // Q(t) = -t³ + 3m·t² + k0·t, coeffs low-to-high.
    const quantityCoeffs = [0, k0, 3 * m, -1]
    const noun = theme.axis === 'day' ? 'day' : 'second'
    return {
      id: uniqueId('a1-fastest'),
      topicId: 'a1-fastest',
      title: theme.title,
      prompt: `${theme.scenario(k0)} The running total after t ${noun}s is given by the function below (measured in ${theme.unit}). On which ${noun} (t = 1, 2, 3, or 4) was the total climbing the fastest?`,
      given: `Q(t) = ${formatPolynomial(quantityCoeffs, 't')}`,
      fields: [
        {
          kind: 'choice',
          label: `The ${noun} it was rising fastest`,
          options: shuffle([1, 2, 3, 4]),
          correct: m,
        },
      ],
      hint: "Work out how fast it's moving at each listed moment, then compare them.",
    }
  },
}

interface AvgInstTheme {
  title: string
  scenario: string
  unit: string
  rateUnit: string
}

const avgInstThemes: AvgInstTheme[] = [
  {
    title: 'Cyclist ride',
    scenario: 'A cyclist records the total distance ridden after t hours.',
    unit: 'miles',
    rateUnit: 'mph',
  },
  {
    title: 'Fish hatchery',
    scenario: 'A hatchery counts its fish population (in hundreds) after t weeks.',
    unit: 'hundreds of fish',
    rateUnit: 'hundreds of fish per week',
  },
  {
    title: 'Savings balance',
    scenario: 'A saver tracks their balance (in thousands of dollars) after t months.',
    unit: 'thousands of dollars',
    rateUnit: 'thousands of dollars per month',
  },
  {
    title: 'Channel subscribers',
    scenario: 'A channel logs its subscriber count (in thousands) after t weeks.',
    unit: 'thousands of subscribers',
    rateUnit: 'thousands of subscribers per week',
  },
]

const avgInst: ApplicationTopicDef = {
  id: 'a1-avg-inst',
  label: 'Average vs. instantaneous',
  generate: (): WordProblem => {
    const theme = pick(avgInstThemes)
    const a = pick([1, 2])
    const b = randInt(4, 12)
    const p = randInt(0, 2)
    const q = p + randInt(2, 3)
    // f(t) = a·t² + b·t
    const coeffs = [0, b, a]
    const averageRate = a * (p + q) + b
    const endRate = 2 * a * q + b
    return {
      id: uniqueId('a1-avg-inst'),
      topicId: 'a1-avg-inst',
      title: theme.title,
      prompt: `${theme.scenario} The total after t units of time is given below (measured in ${theme.unit}). Consider the window from t = ${p} to t = ${q}.`,
      given: `f(t) = ${formatPolynomial(coeffs, 't')}`,
      fields: [
        {
          kind: 'number',
          label: `Average rate over the window (${theme.rateUnit})`,
          expected: averageRate,
        },
        {
          kind: 'number',
          label: `Rate right at the end, t = ${q} (${theme.rateUnit})`,
          expected: endRate,
        },
      ],
      hint: "One number compares the two endpoints; the other is how fast it's moving at that single instant.",
    }
  },
}

interface LimitTheme {
  title: string
  scenario: string
  unit: string
  rateUnit: string
}

const limitThemes: LimitTheme[] = [
  {
    title: 'Drone altitude',
    scenario: "A drone's altitude is tracked after t seconds.",
    unit: 'metres',
    rateUnit: 'metres per second',
  },
  {
    title: 'Coaster drop',
    scenario: 'A roller coaster car records its drop distance after t seconds.',
    unit: 'metres',
    rateUnit: 'metres per second',
  },
  {
    title: 'Elevator climb',
    scenario: "An elevator's height above the lobby is tracked after t seconds.",
    unit: 'metres',
    rateUnit: 'metres per second',
  },
  {
    title: 'Water tank level',
    scenario: 'A tank logs its water level after t minutes.',
    unit: 'centimetres',
    rateUnit: 'centimetres per minute',
  },
]

const instantLimit: ApplicationTopicDef = {
  id: 'a1-instant-limit',
  label: 'Pinning down a rate',
  generate: (): WordProblem => {
    const theme = pick(limitThemes)
    const a = pick([0.25, 0.5, 1])
    const b = randInt(0, 4)
    let t0 = randInt(1, 3)
    if (a === 0.25 && t0 % 2 !== 0) t0 = 2
    // f(t) = a·t² + b·t
    const coeffs = [0, b, a]
    const expected = 2 * a * t0 + b
    const avgOver = (h: number) => round(a * (2 * t0 + h) + b)
    const win = (h: number) => {
      const end = round(t0 + h)
      return `over [${t0}, ${end}] = ${avgOver(h)}`
    }
    const windowLine = `Average ${win(1)} · ${win(0.5)} · ${win(0.1)}`
    return {
      id: uniqueId('a1-instant-limit'),
      topicId: 'a1-instant-limit',
      title: theme.title,
      prompt: `${theme.scenario} The reading after t units of time is given below (measured in ${theme.unit}). The average rate over shrinking windows starting at t = ${t0} is listed. What exact rate is it settling on at t = ${t0}?`,
      given: `f(t) = ${formatPolynomial(coeffs, 't')}\n${windowLine}`,
      fields: [
        {
          kind: 'number',
          label: `The exact rate at t = ${t0} (${theme.rateUnit})`,
          expected,
        },
      ],
      hint: 'Notice the value the shrinking-window averages are closing in on.',
    }
  },
}

interface TurningTheme {
  title: string
  scenario: string
  unit: string
}

const turningThemes: TurningTheme[] = [
  {
    title: 'Startup cash balance',
    scenario: "A startup's cash balance (in thousands of dollars) changes over t months.",
    unit: 'thousands of dollars',
  },
  {
    title: 'Test drone height',
    scenario: "A test drone's height (in metres) changes over t seconds.",
    unit: 'metres',
  },
  {
    title: 'Stock price',
    scenario: "A stock's price (in dollars) moves over t trading days.",
    unit: 'dollars',
  },
  {
    title: 'Temperature swing',
    scenario: 'A room temperature swing (in degrees) is tracked over t hours.',
    unit: 'degrees',
  },
]

const turning: ApplicationTopicDef = {
  id: 'a1-turning',
  label: 'Turning points',
  generate: (): WordProblem => {
    const theme = pick(turningThemes)
    const [p, q] = shuffle([1, 2, 3, 4]).slice(0, 2).sort((x, y) => x - y)
    // f(t) = 2t³ − 3(p+q)t² + 6pq·t, coeffs low-to-high.
    const coeffs = [0, 6 * p * q, -3 * (p + q), 2]
    return {
      id: uniqueId('a1-turning'),
      topicId: 'a1-turning',
      title: theme.title,
      prompt: `${theme.scenario} The value after t units of time is given below (measured in ${theme.unit}). It rises, then falls, then rises again. Find when it briefly stops at its high point and when it briefly stops at its low point.`,
      given: `f(t) = ${formatPolynomial(coeffs, 't')}`,
      fields: [
        {
          kind: 'number',
          label: 'Time it stops rising (high point)',
          expected: p,
        },
        {
          kind: 'number',
          label: 'Time it stops falling (low point)',
          expected: q,
        },
      ],
      hint: 'Find the moments it briefly stops moving, then decide which is a high point and which is a low point.',
    }
  },
}

export const lesson1Applications: ApplicationLessonGroup = {
  lessonId: 'derivatives-basics',
  lessonTitle: 'Derivatives Basics',
  topics: [fastest, avgInst, instantLimit, turning],
}
