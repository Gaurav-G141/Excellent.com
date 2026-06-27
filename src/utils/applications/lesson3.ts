/**
 * Applications — Lesson 3: Related Rates and Motion.
 *
 * Self-contained word problems. The MATH (shapes, formulas, expected values,
 * options, hints) is computed entirely in code. Only the NARRATIVE wrapper is a
 * swappable "theme": plain-string slots drawn from a per-topic pool of built-in
 * static themes plus (later) AI-generated mad-lib themes. The static themes keep
 * behavior identical when AI is off.
 */

import { formatPolynomial, pick, randInt, round, shuffle, uniqueId } from './helpers'
import type {
  ApplicationLessonGroup,
  ApplicationTopicDef,
  ChoiceField,
  NumberField,
  WordProblem,
} from './types'
import { registerStaticThemes, pickTheme } from './themeStore'
import {
  registerMadlibSpec,
  cleanText,
  cleanTextNoDigits,
  type MadlibSpec,
} from './madlib'

// ── a3-related — steady-growth shape problems (one number, π allowed) ─────────
// The shape determines the formula and answer, so the THEME carries the shape.

interface RelatedTheme {
  shape: 'sphere' | 'cube' | 'square'
  title: string
  object: string
}

/**
 * Words that contradict a given shape. Used to reject AI objects that don't
 * match their shape (e.g. "a weather balloon" offered as a cube), which would
 * otherwise render a nonsensical sentence. Each list excludes the shape's own
 * vocabulary so legitimate objects pass.
 */
const SHAPE_CONFLICTS: Record<RelatedTheme['shape'], string[]> = {
  sphere: ['cube', 'cubic', 'box', 'square', 'flat', 'panel', 'sheet', 'tile'],
  cube: ['sphere', 'spherical', 'ball', 'balloon', 'bubble', 'round', 'droplet', 'globe', 'orb', 'square', 'panel', 'sheet', 'disc', 'disk'],
  square: ['sphere', 'spherical', 'ball', 'balloon', 'bubble', 'round', 'globe', 'orb', 'cube', 'cubic', 'box'],
}

function objectFitsShape(object: string, shape: RelatedTheme['shape']): boolean {
  const lower = object.toLowerCase()
  return !SHAPE_CONFLICTS[shape].some((word) => lower.includes(word))
}

const sphereThemes: RelatedTheme[] = [
  { shape: 'sphere', title: 'Weather balloon', object: 'a weather balloon' },
  { shape: 'sphere', title: 'Inflating bubble', object: 'a soap bubble' },
]
const cubeThemes: RelatedTheme[] = [
  { shape: 'cube', title: 'Salt crystal', object: 'a cubic salt crystal' },
  { shape: 'cube', title: 'Ice cube', object: 'an ice cube' },
]
const squareThemes: RelatedTheme[] = [
  { shape: 'square', title: 'Soap film', object: 'a square soap film' },
  { shape: 'square', title: 'Solar panel', object: 'an expanding square solar panel' },
]

registerStaticThemes<RelatedTheme>('a3-related', [
  ...sphereThemes,
  ...cubeThemes,
  ...squareThemes,
])

const relatedRates: ApplicationTopicDef = {
  id: 'a3-related',
  label: 'Related rates',
  generate(): WordProblem {
    const theme = pickTheme<RelatedTheme>('a3-related')
    const measure = randInt(4, 12)
    const rate = pick([0.1, 0.25, 0.5, 1])

    let expected: number
    let dimension: string
    let unit: string
    let quantity: string
    let formulaText: string
    let placeholder: string | undefined
    let growthUnit: string

    if (theme.shape === 'sphere') {
      expected = round(4 * Math.PI * measure * measure * rate, 4)
      dimension = 'radius'
      unit = 'cm'
      quantity = 'volume'
      formulaText = 'A sphere of radius r has volume V = (4/3)·π·r³.'
      placeholder = 'a number (you may type pi)'
      growthUnit = 'cubic cm per second'
    } else if (theme.shape === 'cube') {
      expected = round(3 * measure * measure * rate, 4)
      dimension = 'edge'
      unit = 'mm'
      quantity = 'volume'
      formulaText = 'A cube with edge s has volume V = s³.'
      growthUnit = 'cubic mm per second'
    } else {
      expected = round(2 * measure * rate, 4)
      dimension = 'side'
      unit = 'cm'
      quantity = 'area'
      formulaText = 'A square with side s has area A = s².'
      growthUnit = 'square cm per second'
    }

    const Obj = theme.object.charAt(0).toUpperCase() + theme.object.slice(1)

    const field: NumberField = {
      kind: 'number',
      label: `How fast the ${quantity} is growing right now`,
      expected,
      ...(placeholder !== undefined ? { placeholder } : {}),
      meaning: `how fast the ${quantity} of ${theme.object} is growing at this instant, in ${growthUnit}`,
    }

    return {
      id: uniqueId('a3-related'),
      topicId: 'a3-related',
      title: theme.title,
      prompt: `${Obj} keeps a perfect ${theme.shape} shape as it grows. Right now its ${dimension} is ${measure} ${unit} and that ${dimension} grows at a steady ${rate} ${unit} per second. How fast is its ${quantity} growing at this instant?`,
      given: `${formulaText} At this moment the ${dimension} = ${measure} ${unit} and grows by ${rate} ${unit}/s.`,
      fields: [field],
      hint: 'Connect the size to the length that\u2019s changing, then bring in the steady growth you were given.',
    }
  },
}

// One spec per shape so the AI can supply shape-appropriate objects. Each spec
// injects its fixed shape in validate(); the math is chosen from that shape.
const relatedSphereSpec: MadlibSpec<RelatedTheme> = {
  topicId: 'a3-related',
  instruction:
    "Everyday objects that stay round/spherical while growing (balloons, bubbles, droplets). The object is a short noun phrase like 'a weather balloon'.",
  slots: [
    {
      name: 'title',
      description: 'A short, catchy title for the scenario.',
      example: 'Weather balloon',
    },
    {
      name: 'object',
      description:
        "A short noun phrase for an object that stays round/spherical while growing, like 'a weather balloon' or 'a soap bubble'.",
      example: 'a weather balloon',
    },
  ],
  examples: sphereThemes.map((t) => ({ title: t.title, object: t.object })),
  count: 4,
  validate: (raw) => {
    const title = cleanText(raw.title, 40)
    const object = cleanTextNoDigits(raw.object, 50)
    if (title === null || object === null || !objectFitsShape(object, 'sphere')) return null
    return { shape: 'sphere', title, object }
  },
}

const relatedCubeSpec: MadlibSpec<RelatedTheme> = {
  topicId: 'a3-related',
  instruction:
    'Everyday objects that keep a cube shape while growing (ice cubes, crystals, sponge cubes). Short noun phrase.',
  slots: [
    {
      name: 'title',
      description: 'A short, catchy title for the scenario.',
      example: 'Ice cube',
    },
    {
      name: 'object',
      description:
        "A short noun phrase for an object that keeps a cube shape while growing, like 'an ice cube' or 'a cubic salt crystal'.",
      example: 'an ice cube',
    },
  ],
  examples: cubeThemes.map((t) => ({ title: t.title, object: t.object })),
  count: 4,
  validate: (raw) => {
    const title = cleanText(raw.title, 40)
    const object = cleanTextNoDigits(raw.object, 50)
    if (title === null || object === null || !objectFitsShape(object, 'cube')) return null
    return { shape: 'cube', title, object }
  },
}

const relatedSquareSpec: MadlibSpec<RelatedTheme> = {
  topicId: 'a3-related',
  instruction:
    'Everyday flat things that stay square while expanding (solar panels, soap films, tiles). Short noun phrase.',
  slots: [
    {
      name: 'title',
      description: 'A short, catchy title for the scenario.',
      example: 'Solar panel',
    },
    {
      name: 'object',
      description:
        "A short noun phrase for a flat thing that stays square while expanding, like 'a square soap film' or 'an expanding square solar panel'.",
      example: 'a square soap film',
    },
  ],
  examples: squareThemes.map((t) => ({ title: t.title, object: t.object })),
  count: 4,
  validate: (raw) => {
    const title = cleanText(raw.title, 40)
    const object = cleanTextNoDigits(raw.object, 50)
    if (title === null || object === null || !objectFitsShape(object, 'square')) return null
    return { shape: 'square', title, object }
  },
}

registerMadlibSpec<RelatedTheme>(relatedSphereSpec)
registerMadlibSpec<RelatedTheme>(relatedCubeSpec)
registerMadlibSpec<RelatedTheme>(relatedSquareSpec)

// ── a3-accel — read "how hard it's speeding up" (s'') off a cubic position ────

interface AccelTheme {
  title: string
  vehicle: string
}

const accelThemes: AccelTheme[] = [
  { title: 'Maglev sled', vehicle: 'a maglev sled' },
  { title: 'Glass elevator', vehicle: 'a glass elevator pod' },
  { title: 'Linear motor stage', vehicle: 'a linear motor stage' },
  { title: 'Rocket sled', vehicle: 'a rocket sled' },
]

registerStaticThemes<AccelTheme>('a3-accel', accelThemes)

const velocityAcceleration: ApplicationTopicDef = {
  id: 'a3-accel',
  label: 'Velocity and acceleration',
  generate(): WordProblem {
    const theme = pickTheme<AccelTheme>('a3-accel')

    // Keep every coefficient non-negative so the position s(t) is non-negative
    // and increasing for t > 0 (a sensible "distance travelled"), and so the
    // object is genuinely gaining speed at t0 (acceleration 6·a·t0 + 2·b > 0).
    const a = pick([1, 2])
    const b = randInt(0, 5)
    const c = randInt(0, 4)
    const t0 = randInt(1, 3)

    const expected = 6 * a * t0 + 2 * b
    const positionDisplay = formatPolynomial([0, c, b, a], 't')

    const field: NumberField = {
      kind: 'number',
      label: `Rate its speed is increasing at t = ${t0} (m/s\u00b2)`,
      expected,
      meaning: `how quickly ${theme.vehicle} is gaining speed at t = ${t0} seconds, in metres per second each second`,
    }

    return {
      id: uniqueId('a3-accel'),
      topicId: 'a3-accel',
      title: theme.title,
      prompt: `The distance ${theme.vehicle} has travelled after t seconds is s(t) = ${positionDisplay} metres. How quickly is it gaining speed at t = ${t0} seconds?`,
      given: `s(t) = ${positionDisplay}  (metres, with t in seconds).`,
      fields: [field],
      hint: 'First find how its speed is changing, then read that off at the given moment.',
    }
  },
}

const accelSpec: MadlibSpec<AccelTheme> = {
  topicId: 'a3-accel',
  instruction:
    "A vehicle/object moving in a straight line along a track; 'vehicle' is a short noun phrase like 'a maglev sled'.",
  slots: [
    {
      name: 'title',
      description: 'A short, catchy title for the scenario.',
      example: 'Maglev sled',
    },
    {
      name: 'vehicle',
      description:
        "A short noun phrase for a vehicle/object moving in a straight line, like 'a maglev sled' or 'a glass elevator pod'.",
      example: 'a maglev sled',
    },
  ],
  examples: accelThemes.map((t) => ({ title: t.title, vehicle: t.vehicle })),
  count: 6,
  validate: (raw) => {
    const title = cleanText(raw.title, 40)
    const vehicle = cleanTextNoDigits(raw.vehicle, 45)
    if (title === null || vehicle === null) return null
    return { title, vehicle }
  },
}

registerMadlibSpec<AccelTheme>(accelSpec)

// ── a3-ivt — pick the reading guaranteed to occur on a monotonic swept range ──

interface IvtTheme {
  title: string
  reading: string
  knob: string
}

const ivtThemes: IvtTheme[] = [
  { title: 'Room temperature', reading: 'temperature', knob: 'dial' },
  { title: 'Drone altitude', reading: 'altitude', knob: 'position' },
  { title: 'Tank pressure', reading: 'pressure', knob: 'valve' },
  { title: 'Signal level', reading: 'signal level', knob: 'slider' },
]

registerStaticThemes<IvtTheme>('a3-ivt', ivtThemes)

const valueThatMustOccur: ApplicationTopicDef = {
  id: 'a3-ivt',
  label: 'A value that must occur',
  generate(): WordProblem {
    const theme = pickTheme<IvtTheme>('a3-ivt')

    let display: string
    let lo: number
    let hi: number

    if (pick([true, false])) {
      // Option A: f(x) = x² + k, increasing on [0, b].
      const k = randInt(0, 3)
      const b = randInt(2, 4)
      lo = k
      hi = b * b + k
      const kTerm = k === 0 ? '' : ` + ${k}`
      display = `f(x) = x\u00b2${kTerm}, swept from x = 0 to x = ${b}.`
    } else {
      // Option B: f(x) = -x² + m·x, with peak m/2 > b so it's increasing on [0, b].
      const b = randInt(2, 3)
      const m = 2 * b + randInt(2, 4)
      lo = 0
      hi = -b * b + m * b
      display = `f(x) = -x\u00b2 + ${m}x, swept from x = 0 to x = ${b}.`
    }

    const correct = randInt(lo + 1, hi - 1)
    const lowDistractor = lo - randInt(1, 3)
    const highDistractor = hi + randInt(1, 3)
    const options = shuffle([correct, lowDistractor, highDistractor])

    const field: ChoiceField = {
      kind: 'choice',
      label: 'Which reading must have occurred?',
      options,
      correct,
      meaning: `which ${theme.reading} value the system is guaranteed to have passed through at some point during the sweep`,
    }

    return {
      id: uniqueId('a3-ivt'),
      topicId: 'a3-ivt',
      title: theme.title,
      prompt: `As the ${theme.knob} turns smoothly from one setting to the next, the ${theme.reading} f(x) changes without any jumps. Over the sweep below, which reading is the system guaranteed to have hit at some point?`,
      given: display,
      fields: [field],
      hint: 'Only values that fall between the starting and ending readings are guaranteed.',
    }
  },
}

const ivtSpec: MadlibSpec<IvtTheme> = {
  topicId: 'a3-ivt',
  instruction:
    "A smoothly-varying reading controlled by a knob/slider/dial; 'reading' is what is measured (temperature, altitude...), 'knob' is the control (dial, valve, slider).",
  slots: [
    {
      name: 'title',
      description: 'A short, catchy title for the scenario.',
      example: 'Room temperature',
    },
    {
      name: 'reading',
      description:
        "What is being measured as it varies smoothly, like 'temperature' or 'altitude'.",
      example: 'temperature',
    },
    {
      name: 'knob',
      description: "The control that is turned/moved, like 'dial', 'valve', or 'slider'.",
      example: 'dial',
    },
  ],
  examples: ivtThemes.map((t) => ({ title: t.title, reading: t.reading, knob: t.knob })),
  count: 6,
  validate: (raw) => {
    const title = cleanText(raw.title, 40)
    const reading = cleanTextNoDigits(raw.reading, 30)
    const knob = cleanTextNoDigits(raw.knob, 20)
    if (title === null || reading === null || knob === null) return null
    return { title, reading, knob }
  },
}

registerMadlibSpec<IvtTheme>(ivtSpec)

export const lesson3Applications: ApplicationLessonGroup = {
  lessonId: 'related-rates',
  lessonTitle: 'Related Rates and Motion',
  topics: [relatedRates, velocityAcceleration, valueThatMustOccur],
}
