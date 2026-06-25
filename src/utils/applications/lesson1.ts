/**
 * Applications word problems for Lesson 1 — Derivatives Basics.
 *
 * Each topic computes its MATH in code (numbers, coefficients, fields, expected
 * answers) and wraps it in a swappable narrative "theme". Theme fields are plain
 * strings only, so an AI mad-lib generator can supply extra themes later. The
 * built-in (static) themes are always registered at module load, which keeps
 * behavior identical when no AI themes are present.
 */

import { formatPolynomial, pick, randInt, round, shuffle, uniqueId } from './helpers'
import type {
  ApplicationLessonGroup,
  ApplicationTopicDef,
  WordProblem,
} from './types'
import { registerStaticThemes, pickTheme } from './themeStore'
import {
  registerMadlibSpec,
  cleanTextNoDigits,
  oneOf,
  type MadlibSpec,
} from './madlib'

// ── Topic: a1-fastest ───────────────────────────────────────────────────────
interface FastestTheme {
  title: string
  subject: string
  quantityNoun: string
  unit: string
  timeUnit: string
}

const fastestStaticThemes: FastestTheme[] = [
  {
    title: 'Concert ticket sales',
    subject: 'A venue',
    quantityNoun: 'the total number of concert tickets sold',
    unit: 'thousands of tickets',
    timeUnit: 'day',
  },
  {
    title: 'App downloads',
    subject: 'A studio',
    quantityNoun: 'the cumulative number of app downloads',
    unit: 'thousands of downloads',
    timeUnit: 'day',
  },
  {
    title: 'River height',
    subject: 'A monitoring station',
    quantityNoun: 'the total rise in river height after a dam release',
    unit: 'cm',
    timeUnit: 'second',
  },
  {
    title: 'Reservoir inflow',
    subject: 'A reservoir',
    quantityNoun: 'the total inflow',
    unit: 'thousands of litres',
    timeUnit: 'second',
  },
  {
    title: 'Museum visitors',
    subject: 'A museum',
    quantityNoun: 'the cumulative number of visitors',
    unit: 'hundreds of visitors',
    timeUnit: 'day',
  },
]

registerStaticThemes('a1-fastest', fastestStaticThemes)

function renderFastest(theme: FastestTheme): WordProblem {
  const m = pick([2, 3])
  const k0 = randInt(3, 12)
  // Q(t) = -t³ + 3m·t² + k0·t, coeffs low-to-high.
  const quantityCoeffs = [0, k0, 3 * m, -1]
  const options = shuffle([1, 2, 3, 4])
  const { subject, quantityNoun, unit, timeUnit } = theme
  return {
    id: uniqueId('a1-fastest'),
    topicId: 'a1-fastest',
    title: theme.title,
    prompt: `${subject} tracks ${quantityNoun} (in ${unit}) by the end of each ${timeUnit}. The running total after t ${timeUnit}s is given below. At which value of t (1, 2, 3, or 4) was the total climbing the fastest?`,
    given: `Q(t) = ${formatPolynomial(quantityCoeffs, 't')}`,
    fields: [
      {
        kind: 'choice',
        label: `Value of t when it rose fastest (in ${timeUnit}s)`,
        options,
        correct: m,
        meaning: `the value of t (1, 2, 3, or 4) when ${quantityNoun} was climbing fastest, measured in ${timeUnit}s`,
      },
    ],
    hint: "Work out how fast it's moving at each listed moment, then compare them.",
  }
}

const fastestSpec: MadlibSpec<FastestTheme> = {
  topicId: 'a1-fastest',
  instruction:
    'Each scenario tracks a running cumulative total of something that grows fast then levels off, recorded at the end of each time period.',
  slots: [
    { name: 'title', description: 'Short scenario title.', example: 'Concert ticket sales' },
    { name: 'subject', description: 'Who or what is tracking the total.', example: 'A venue' },
    {
      name: 'quantityNoun',
      description: 'The running cumulative total being tracked.',
      example: 'the total number of concert tickets sold',
    },
    {
      name: 'unit',
      description: 'The unit the running total is measured in.',
      example: 'thousands of tickets',
    },
    { name: 'timeUnit', description: 'The repeating time period.', example: 'day' },
  ],
  examples: [
    {
      title: 'Concert ticket sales',
      subject: 'A venue',
      quantityNoun: 'the total number of concert tickets sold',
      unit: 'thousands of tickets',
      timeUnit: 'day',
    },
    {
      title: 'Museum visitors',
      subject: 'A museum',
      quantityNoun: 'the cumulative number of visitors',
      unit: 'hundreds of visitors',
      timeUnit: 'day',
    },
  ],
  count: 6,
  validate: (raw) => {
    const title = cleanTextNoDigits(raw.title, 40)
    const subject = cleanTextNoDigits(raw.subject, 40)
    const quantityNoun = cleanTextNoDigits(raw.quantityNoun, 70)
    const unit = cleanTextNoDigits(raw.unit, 40)
    const timeUnit = oneOf(raw.timeUnit, [
      'day',
      'second',
      'week',
      'hour',
      'minute',
      'month',
      'lap',
      'round',
      'shift',
    ])
    if (!title || !subject || !quantityNoun || !unit || !timeUnit) return null
    return { title, subject, quantityNoun, unit, timeUnit }
  },
}

registerMadlibSpec(fastestSpec)

const fastest: ApplicationTopicDef = {
  id: 'a1-fastest',
  label: 'Fastest rate',
  generate: (): WordProblem => renderFastest(pickTheme<FastestTheme>('a1-fastest')),
}

// ── Topic: a1-avg-inst ──────────────────────────────────────────────────────
interface AvgInstTheme {
  title: string
  subject: string
  quantityNoun: string
  unit: string
  timeUnit: string
}

const avgInstStaticThemes: AvgInstTheme[] = [
  {
    title: 'Cyclist ride',
    subject: 'A cyclist',
    quantityNoun: 'the total distance ridden',
    unit: 'miles',
    timeUnit: 'hour',
  },
  {
    title: 'Fish hatchery',
    subject: 'A hatchery',
    quantityNoun: 'its fish population',
    unit: 'hundreds of fish',
    timeUnit: 'week',
  },
  {
    title: 'Savings balance',
    subject: 'A saver',
    quantityNoun: 'their balance',
    unit: 'thousands of dollars',
    timeUnit: 'month',
  },
  {
    title: 'Channel subscribers',
    subject: 'A channel',
    quantityNoun: 'its subscriber count',
    unit: 'thousands of subscribers',
    timeUnit: 'week',
  },
]

registerStaticThemes('a1-avg-inst', avgInstStaticThemes)

function renderAvgInst(theme: AvgInstTheme): WordProblem {
  const a = pick([1, 2])
  const b = randInt(4, 12)
  const p = randInt(0, 2)
  const q = p + randInt(2, 3)
  // f(t) = a·t² + b·t
  const coeffs = [0, b, a]
  const averageRate = a * (p + q) + b
  const endRate = 2 * a * q + b
  const { subject, quantityNoun, unit, timeUnit } = theme
  // Derive the rate unit from the quantity unit + time unit so it is always
  // dimensionally consistent (no AI slot can introduce a mismatch).
  const rateUnit = `${unit} per ${timeUnit}`
  return {
    id: uniqueId('a1-avg-inst'),
    topicId: 'a1-avg-inst',
    title: theme.title,
    prompt: `${subject} records ${quantityNoun} (in ${unit}) after t ${timeUnit}s. The total after t ${timeUnit}s is given below. Consider the window from t = ${p} to t = ${q}.`,
    given: `f(t) = ${formatPolynomial(coeffs, 't')}`,
    fields: [
      {
        kind: 'number',
        label: `Average rate over the window (${rateUnit})`,
        expected: averageRate,
        meaning: `how fast ${quantityNoun} changed on average between t = ${p} and t = ${q}, in ${rateUnit}`,
      },
      {
        kind: 'number',
        label: `Rate right at the end, t = ${q} (${rateUnit})`,
        expected: endRate,
        meaning: `how fast ${quantityNoun} is changing right at t = ${q}, in ${rateUnit}`,
      },
    ],
    hint: "One number compares the two endpoints; the other is how fast it's moving at that single instant.",
  }
}

const avgInstSpec: MadlibSpec<AvgInstTheme> = {
  topicId: 'a1-avg-inst',
  instruction:
    'Each scenario accumulates a total over time; we compare the average pace over a window with the pace at one instant.',
  slots: [
    { name: 'title', description: 'Short scenario title.', example: 'Cyclist ride' },
    { name: 'subject', description: 'Who or what records the total.', example: 'A cyclist' },
    {
      name: 'quantityNoun',
      description: 'The accumulating total being recorded.',
      example: 'the total distance ridden',
    },
    { name: 'unit', description: 'The unit the total is measured in.', example: 'miles' },
    { name: 'timeUnit', description: 'The time unit t is counted in.', example: 'hour' },
  ],
  examples: [
    {
      title: 'Cyclist ride',
      subject: 'A cyclist',
      quantityNoun: 'the total distance ridden',
      unit: 'miles',
      timeUnit: 'hour',
    },
    {
      title: 'Savings balance',
      subject: 'A saver',
      quantityNoun: 'their balance',
      unit: 'thousands of dollars',
      timeUnit: 'month',
    },
  ],
  count: 6,
  validate: (raw) => {
    const title = cleanTextNoDigits(raw.title, 40)
    const subject = cleanTextNoDigits(raw.subject, 40)
    const quantityNoun = cleanTextNoDigits(raw.quantityNoun, 60)
    const unit = cleanTextNoDigits(raw.unit, 40)
    const timeUnit = oneOf(raw.timeUnit, [
      'hour',
      'week',
      'month',
      'second',
      'day',
      'minute',
      'lap',
      'year',
    ])
    if (!title || !subject || !quantityNoun || !unit || !timeUnit) return null
    return { title, subject, quantityNoun, unit, timeUnit }
  },
}

registerMadlibSpec(avgInstSpec)

const avgInst: ApplicationTopicDef = {
  id: 'a1-avg-inst',
  label: 'Average vs. instantaneous',
  generate: (): WordProblem => renderAvgInst(pickTheme<AvgInstTheme>('a1-avg-inst')),
}

// ── Topic: a1-instant-limit ─────────────────────────────────────────────────
interface LimitTheme {
  title: string
  subject: string
  quantityNoun: string
  unit: string
  timeUnit: string
}

const limitStaticThemes: LimitTheme[] = [
  {
    title: 'Drone altitude',
    subject: 'A drone',
    quantityNoun: 'its altitude',
    unit: 'metres',
    timeUnit: 'second',
  },
  {
    title: 'Coaster drop',
    subject: 'A roller coaster car',
    quantityNoun: 'its drop distance',
    unit: 'metres',
    timeUnit: 'second',
  },
  {
    title: 'Elevator climb',
    subject: 'An elevator',
    quantityNoun: 'its height above the lobby',
    unit: 'metres',
    timeUnit: 'second',
  },
  {
    title: 'Water tank level',
    subject: 'A tank',
    quantityNoun: 'its water level',
    unit: 'centimetres',
    timeUnit: 'minute',
  },
]

registerStaticThemes('a1-instant-limit', limitStaticThemes)

function renderLimit(theme: LimitTheme): WordProblem {
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
  const { subject, quantityNoun, unit, timeUnit } = theme
  // Derive the rate unit so it always matches the quantity + time units.
  const rateUnit = `${unit} per ${timeUnit}`
  return {
    id: uniqueId('a1-instant-limit'),
    topicId: 'a1-instant-limit',
    title: theme.title,
    prompt: `${subject} tracks ${quantityNoun} (in ${unit}) after t ${timeUnit}s. The average rate over shrinking windows starting at t = ${t0} is listed below. What exact rate is it settling on at t = ${t0}?`,
    given: `f(t) = ${formatPolynomial(coeffs, 't')}\n${windowLine}`,
    fields: [
      {
        kind: 'number',
        label: `The exact rate at t = ${t0} (${rateUnit})`,
        expected,
        meaning: `how fast ${quantityNoun} is changing exactly at t = ${t0}, in ${rateUnit}`,
      },
    ],
    hint: 'Notice the value the shrinking-window averages are closing in on.',
  }
}

const limitSpec: MadlibSpec<LimitTheme> = {
  topicId: 'a1-instant-limit',
  instruction:
    'Each scenario measures a smoothly-changing reading; we zoom in on shrinking time windows to find the exact rate at one instant.',
  slots: [
    { name: 'title', description: 'Short scenario title.', example: 'Drone altitude' },
    { name: 'subject', description: 'Who or what is being tracked.', example: 'A drone' },
    {
      name: 'quantityNoun',
      description: 'The smoothly-changing reading being tracked.',
      example: 'its altitude',
    },
    { name: 'unit', description: 'The unit the reading is measured in.', example: 'metres' },
    { name: 'timeUnit', description: 'The time unit t is counted in.', example: 'second' },
  ],
  examples: [
    {
      title: 'Drone altitude',
      subject: 'A drone',
      quantityNoun: 'its altitude',
      unit: 'metres',
      timeUnit: 'second',
    },
    {
      title: 'Water tank level',
      subject: 'A tank',
      quantityNoun: 'its water level',
      unit: 'centimetres',
      timeUnit: 'minute',
    },
  ],
  count: 6,
  validate: (raw) => {
    const title = cleanTextNoDigits(raw.title, 40)
    const subject = cleanTextNoDigits(raw.subject, 40)
    const quantityNoun = cleanTextNoDigits(raw.quantityNoun, 60)
    const unit = cleanTextNoDigits(raw.unit, 30)
    const timeUnit = oneOf(raw.timeUnit, ['second', 'minute', 'hour'])
    if (!title || !subject || !quantityNoun || !unit || !timeUnit) return null
    return { title, subject, quantityNoun, unit, timeUnit }
  },
}

registerMadlibSpec(limitSpec)

const instantLimit: ApplicationTopicDef = {
  id: 'a1-instant-limit',
  label: 'Pinning down a rate',
  generate: (): WordProblem => renderLimit(pickTheme<LimitTheme>('a1-instant-limit')),
}

// ── Topic: a1-turning ───────────────────────────────────────────────────────
interface TurningTheme {
  title: string
  subject: string
  unit: string
  timeUnit: string
}

const turningStaticThemes: TurningTheme[] = [
  {
    title: 'Startup cash balance',
    subject: "A startup's cash balance",
    unit: 'thousands of dollars',
    timeUnit: 'month',
  },
  {
    title: 'Test drone height',
    subject: "A test drone's height",
    unit: 'metres',
    timeUnit: 'second',
  },
  {
    title: 'Stock price',
    subject: "A stock's price",
    unit: 'dollars',
    timeUnit: 'trading day',
  },
  {
    title: 'Temperature swing',
    subject: 'A room temperature swing',
    unit: 'degrees',
    timeUnit: 'hour',
  },
]

registerStaticThemes('a1-turning', turningStaticThemes)

function renderTurning(theme: TurningTheme): WordProblem {
  const [p, q] = shuffle([1, 2, 3, 4]).slice(0, 2).sort((x, y) => x - y)
  // f(t) = 2t³ − 3(p+q)t² + 6pq·t, coeffs low-to-high.
  const coeffs = [0, 6 * p * q, -3 * (p + q), 2]
  const { subject, unit, timeUnit } = theme
  return {
    id: uniqueId('a1-turning'),
    topicId: 'a1-turning',
    title: theme.title,
    prompt: `${subject} (in ${unit}) is tracked over t ${timeUnit}s. The value after t ${timeUnit}s is given below. It rises, then falls, then rises again. Find when it briefly stops at its high point and when it briefly stops at its low point.`,
    given: `f(t) = ${formatPolynomial(coeffs, 't')}`,
    fields: [
      {
        kind: 'number',
        label: `Time it stops rising — high point (t in ${timeUnit}s)`,
        expected: p,
        meaning: `the value of t where it stops rising and reaches its high point, in ${timeUnit}s`,
      },
      {
        kind: 'number',
        label: `Time it stops falling — low point (t in ${timeUnit}s)`,
        expected: q,
        meaning: `the value of t where it stops falling and reaches its low point, in ${timeUnit}s`,
      },
    ],
    hint: 'Find the moments it briefly stops moving, then decide which is a high point and which is a low point.',
  }
}

const turningSpec: MadlibSpec<TurningTheme> = {
  topicId: 'a1-turning',
  instruction:
    'Each scenario is a quantity that rises, dips, then rises again over time — we find the high and low turning moments.',
  slots: [
    { name: 'title', description: 'Short scenario title.', example: 'Startup cash balance' },
    {
      name: 'subject',
      description: 'The quantity that rises, dips, then rises again.',
      example: "A startup's cash balance",
    },
    { name: 'unit', description: 'The unit the quantity is measured in.', example: 'thousands of dollars' },
    { name: 'timeUnit', description: 'The time unit t is counted in.', example: 'month' },
  ],
  examples: [
    {
      title: 'Startup cash balance',
      subject: "A startup's cash balance",
      unit: 'thousands of dollars',
      timeUnit: 'month',
    },
    {
      title: 'Stock price',
      subject: "A stock's price",
      unit: 'dollars',
      timeUnit: 'trading day',
    },
  ],
  count: 6,
  validate: (raw) => {
    const title = cleanTextNoDigits(raw.title, 40)
    const subject = cleanTextNoDigits(raw.subject, 45)
    const unit = cleanTextNoDigits(raw.unit, 40)
    const timeUnit = oneOf(raw.timeUnit, [
      'month',
      'second',
      'hour',
      'day',
      'trading day',
      'week',
      'minute',
    ])
    if (!title || !subject || !unit || !timeUnit) return null
    return { title, subject, unit, timeUnit }
  },
}

registerMadlibSpec(turningSpec)

const turning: ApplicationTopicDef = {
  id: 'a1-turning',
  label: 'Turning points',
  generate: (): WordProblem => renderTurning(pickTheme<TurningTheme>('a1-turning')),
}

export const lesson1Applications: ApplicationLessonGroup = {
  lessonId: 'derivatives-basics',
  lessonTitle: 'Derivatives Basics',
  topics: [fastest, avgInst, instantLimit, turning],
}
