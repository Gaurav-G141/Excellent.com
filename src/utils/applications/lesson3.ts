/**
 * Applications — Lesson 3: Related Rates and Motion.
 *
 * Self-contained word problems. Numbers and themes are randomized on every
 * generate() so the learner rarely sees the same scenario twice. Phrasing is
 * deliberately plain (no jargon) per the Applications content guidelines.
 */

import { formatPolynomial, pick, randInt, shuffle, uniqueId } from './helpers'
import type {
  ApplicationLessonGroup,
  ApplicationTopicDef,
  ChoiceField,
  NumberField,
  WordProblem,
} from './types'

/** a3-related — steady-growth shape problems answered with one number (may be π). */
const relatedRates: ApplicationTopicDef = {
  id: 'a3-related',
  label: 'Related rates',
  generate(): WordProblem {
    type ShapeVariant = {
      shape: 'sphere' | 'cube' | 'square'
      theme: { title: string; thing: string }
    }
    const variant = pick<ShapeVariant>([
      { shape: 'sphere', theme: { title: 'Weather balloon', thing: 'a weather balloon' } },
      { shape: 'sphere', theme: { title: 'Inflating bubble', thing: 'a soap bubble' } },
      { shape: 'cube', theme: { title: 'Salt crystal', thing: 'a cubic salt crystal' } },
      { shape: 'cube', theme: { title: 'Ice cube', thing: 'an ice cube' } },
      { shape: 'square', theme: { title: 'Soap film', thing: 'a square soap film' } },
      { shape: 'square', theme: { title: 'Solar panel', thing: 'an expanding square solar panel' } },
    ])

    const measure = randInt(4, 12)
    const rate = pick([0.1, 0.25, 0.5, 1])

    if (variant.shape === 'sphere') {
      const expected = 4 * Math.PI * measure * measure * rate
      const field: NumberField = {
        kind: 'number',
        label: 'How fast the volume is growing right now',
        expected,
        placeholder: 'a number (you may type pi)',
      }
      return {
        id: uniqueId('a3-related'),
        topicId: 'a3-related',
        title: variant.theme.title,
        prompt: `Air is pumped steadily into ${variant.theme.thing}, keeping it a perfect sphere. Right now its radius is ${measure} cm and the radius is creeping outward at a steady ${rate} cm per second. How fast is the volume growing at this instant?`,
        given: `A sphere of radius r has volume V = (4/3)·π·r³. At this moment r = ${measure} cm and r grows by ${rate} cm/s.`,
        fields: [field],
        hint: 'Connect the size to the length that\u2019s changing, then bring in the steady growth you were given.',
      }
    }

    if (variant.shape === 'cube') {
      const expected = 3 * measure * measure * rate
      const field: NumberField = {
        kind: 'number',
        label: 'How fast the volume is growing right now',
        expected,
      }
      return {
        id: uniqueId('a3-related'),
        topicId: 'a3-related',
        title: variant.theme.title,
        prompt: `${variant.theme.thing.charAt(0).toUpperCase() + variant.theme.thing.slice(1)} keeps a perfect cube shape while it grows. Right now each edge is ${measure} mm long and every edge is lengthening at a steady ${rate} mm per second. How fast is the volume growing at this instant?`,
        given: `A cube with edge s has volume V = s³. At this moment s = ${measure} mm and s grows by ${rate} mm/s.`,
        fields: [field],
        hint: 'Connect the size to the length that\u2019s changing, then bring in the steady growth you were given.',
      }
    }

    const expected = 2 * measure * rate
    const field: NumberField = {
      kind: 'number',
      label: 'How fast the area is growing right now',
      expected,
    }
    return {
      id: uniqueId('a3-related'),
      topicId: 'a3-related',
      title: variant.theme.title,
      prompt: `${variant.theme.thing.charAt(0).toUpperCase() + variant.theme.thing.slice(1)} stays a perfect square as it stretches. Right now each side is ${measure} cm long and every side is lengthening at a steady ${rate} cm per second. How fast is the area growing at this instant?`,
      given: `A square with side s has area A = s². At this moment s = ${measure} cm and s grows by ${rate} cm/s.`,
      fields: [field],
      hint: 'Connect the size to the length that\u2019s changing, then bring in the steady growth you were given.',
    }
  },
}

/** a3-accel — read "how hard it's speeding up" (s'') off a cubic position. */
const velocityAcceleration: ApplicationTopicDef = {
  id: 'a3-accel',
  label: 'Velocity and acceleration',
  generate(): WordProblem {
    const theme = pick([
      { title: 'Maglev sled', vehicle: 'a maglev sled' },
      { title: 'Glass elevator', vehicle: 'a glass elevator pod' },
      { title: 'Linear motor stage', vehicle: 'a linear motor stage' },
      { title: 'Rocket sled', vehicle: 'a rocket sled' },
    ])

    const a = pick([1, 2])
    const b = randInt(-5, 5)
    const c = randInt(0, 4)
    const t0 = randInt(1, 3)

    const expected = 6 * a * t0 + 2 * b
    const positionDisplay = formatPolynomial([0, c, b, a], 't')

    const field: NumberField = {
      kind: 'number',
      label: `How hard it\u2019s speeding up at t = ${t0} (m/s\u00b2)`,
      expected,
    }

    return {
      id: uniqueId('a3-accel'),
      topicId: 'a3-accel',
      title: theme.title,
      prompt: `The distance ${theme.vehicle} has travelled after t seconds is s(t) = ${positionDisplay} metres. How hard is it speeding up at t = ${t0} seconds?`,
      given: `s(t) = ${positionDisplay}  (metres, with t in seconds).`,
      fields: [field],
      hint: 'First find how its speed is changing, then read that off at the given moment.',
    }
  },
}

/** a3-ivt — pick the reading guaranteed to occur on a monotonic swept interval. */
const valueThatMustOccur: ApplicationTopicDef = {
  id: 'a3-ivt',
  label: 'A value that must occur',
  generate(): WordProblem {
    const theme = pick([
      { title: 'Room temperature', reading: 'temperature', knob: 'dial', fname: 'T' },
      { title: 'Drone altitude', reading: 'altitude', knob: 'position', fname: 'h' },
      { title: 'Tank pressure', reading: 'pressure', knob: 'valve', fname: 'P' },
      { title: 'Signal level', reading: 'signal level', knob: 'slider', fname: 'S' },
    ])

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

export const lesson3Applications: ApplicationLessonGroup = {
  lessonId: 'related-rates',
  lessonTitle: 'Related Rates and Motion',
  topics: [relatedRates, velocityAcceleration, valueThatMustOccur],
}
