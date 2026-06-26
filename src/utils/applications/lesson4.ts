/**
 * Applications — Lesson 4: "Exponents & the Product Rule".
 *
 * Self-contained, randomized word problems that extend the Applications tab to
 * continuous/base-n growth, a c·ln(x) response, and the product rule on two
 * polynomial factors. The grader only understands numeric, multiple-choice
 * numeric, and polynomial-in-x answers, so:
 *   - exponential/log scenarios reduce to a single NUMBER (or a numeric CHOICE),
 *   - product-rule scenarios return a polynomial EXPRESSION in x.
 *
 * As in the other lessons, ALL math (numbers, coefficients, fields, expected
 * answers) is computed here and never touched by AI. Only the NARRATIVE wrapper
 * is a swappable "theme": built-in static themes ship below (keeping behavior
 * identical when AI is off) and a mad-lib spec lets an AI supply more later.
 */
import {
  formatPolynomial,
  pick,
  randInt,
  round,
  shuffle,
  uniqueId,
} from './helpers'
import { evaluatePoly, productRuleDerivative } from '../polynomial'
import type {
  ApplicationLessonGroup,
  ApplicationTopicDef,
  WordProblem,
} from './types'
import { registerStaticThemes, pickTheme } from './themeStore'
import {
  registerMadlibSpec,
  cleanText,
  cleanTextNoDigits,
  singleLetter,
} from './madlib'

/** Build a small integer factor polynomial of degree 1 or 2 (leading coeff ≠ 0). */
function smallFactor(): number[] {
  const degree = pick([1, 2])
  if (degree === 1) return [randInt(0, 5), randInt(1, 5)]
  return [randInt(0, 5), randInt(1, 5), randInt(1, 4)]
}

// ── Topic: Continuous growth (d/dx eˣ = eˣ) — NumberField ────────────────────
interface EGrowthTheme {
  title: string
  fnLetter: string
  subject: string
  quantity: string
  unit: string
  timeUnit: string
}

const eGrowthThemes: EGrowthTheme[] = [
  {
    title: 'Bacteria bloom',
    fnLetter: 'B',
    subject: 'A petri dish',
    quantity: 'the bacteria count',
    unit: 'cells',
    timeUnit: 'hour',
  },
  {
    title: 'Compounding savings',
    fnLetter: 'A',
    subject: 'A savings account',
    quantity: 'the balance',
    unit: 'dollars',
    timeUnit: 'year',
  },
  {
    title: 'Algae spread',
    fnLetter: 'M',
    subject: 'A pond',
    quantity: 'the algae mass',
    unit: 'grams',
    timeUnit: 'day',
  },
  {
    title: 'Rising yeast',
    fnLetter: 'Y',
    subject: 'A baker',
    quantity: 'the yeast amount',
    unit: 'grams',
    timeUnit: 'hour',
  },
]

registerStaticThemes<EGrowthTheme>('a4-egrowth', eGrowthThemes)

registerMadlibSpec<EGrowthTheme>({
  topicId: 'a4-egrowth',
  instruction:
    'Something that grows smoothly and continuously, where the speed of growth stays proportional to how much is there now (bacteria, savings, algae).',
  slots: [
    { name: 'title', description: 'Short scenario title', example: 'Bacteria bloom' },
    { name: 'fnLetter', description: 'Single capital letter naming the function', example: 'B' },
    { name: 'subject', description: 'Who or what the scenario is about', example: 'A petri dish' },
    { name: 'quantity', description: 'The growing quantity, with a leading article', example: 'the bacteria count' },
    { name: 'unit', description: 'Unit of the quantity', example: 'cells' },
    { name: 'timeUnit', description: 'Unit of time (singular)', example: 'hour' },
  ],
  examples: eGrowthThemes.map((t) => ({
    title: t.title,
    fnLetter: t.fnLetter,
    subject: t.subject,
    quantity: t.quantity,
    unit: t.unit,
    timeUnit: t.timeUnit,
  })),
  count: 6,
  validate: (raw): EGrowthTheme | null => {
    const title = cleanText(raw.title, 40)
    const fnLetter = singleLetter(raw.fnLetter)
    const subject = cleanText(raw.subject, 40)
    const quantity = cleanText(raw.quantity, 50)
    const unit = cleanTextNoDigits(raw.unit, 30)
    const timeUnit = cleanTextNoDigits(raw.timeUnit, 25)
    if (
      title === null ||
      fnLetter === null ||
      subject === null ||
      quantity === null ||
      unit === null ||
      timeUnit === null
    ) {
      return null
    }
    return { title, fnLetter, subject, quantity, unit, timeUnit }
  },
})

// Continuous-rate constants paired with a multiplier that keeps k·V an integer.
const E_RATES: { k: number; factor: number }[] = [
  { k: 0.05, factor: 20 },
  { k: 0.1, factor: 10 },
  { k: 0.2, factor: 5 },
  { k: 0.25, factor: 4 },
]

function generateEGrowth(): WordProblem {
  const theme = pickTheme<EGrowthTheme>('a4-egrowth')
  const { k, factor } = pick(E_RATES)
  // growth IS the instantaneous growth k·V (V = growth·factor makes k·V = growth).
  const growth = randInt(2, 12)
  const V = growth * factor
  const expected = growth

  return {
    id: uniqueId('a4-egrowth'),
    topicId: 'a4-egrowth',
    title: theme.title,
    prompt: `${theme.subject}: ${theme.quantity} (in ${theme.unit}) follows the rule below, with t in ${theme.timeUnit}s, and its instantaneous growth stays proportional to the current amount. Right now ${theme.quantity} is ${V} ${theme.unit}. How fast is ${theme.quantity} growing at this very moment?`,
    given: `${theme.fnLetter}(t) = ${V}\u00b7e^(${k}t)`,
    fields: [
      {
        kind: 'number',
        label: `Instantaneous growth right now (${theme.unit} per ${theme.timeUnit})`,
        expected,
        meaning: `how fast ${theme.quantity} is growing at this instant, in ${theme.unit} per ${theme.timeUnit}`,
      },
    ],
    hint: 'The instantaneous growth equals the continuous-rate constant times the current amount.',
  }
}

// ── Topic: Doubling / tripling (d/dx nˣ = ln(n)·nˣ) — ChoiceField ────────────
interface BaseTheme {
  title: string
  fnLetter: string
  subject: string
  quantity: string
  unit: string
  timeUnit: string
}

const baseThemes: BaseTheme[] = [
  {
    title: 'Multiplying rabbits',
    fnLetter: 'P',
    subject: 'A meadow',
    quantity: 'the rabbit population',
    unit: 'rabbits',
    timeUnit: 'year',
  },
  {
    title: 'Going viral',
    fnLetter: 'V',
    subject: 'A video',
    quantity: 'the view count',
    unit: 'views',
    timeUnit: 'day',
  },
  {
    title: 'Spreading bamboo',
    fnLetter: 'S',
    subject: 'A grove',
    quantity: 'the bamboo stalk count',
    unit: 'stalks',
    timeUnit: 'week',
  },
  {
    title: 'Shared posts',
    fnLetter: 'N',
    subject: 'A network',
    quantity: 'the share count',
    unit: 'shares',
    timeUnit: 'hour',
  },
]

registerStaticThemes<BaseTheme>('a4-base', baseThemes)

registerMadlibSpec<BaseTheme>({
  topicId: 'a4-base',
  instruction:
    'Something that multiplies by a whole-number factor over each period of time as it grows smoothly (rabbits, views, bamboo).',
  slots: [
    { name: 'title', description: 'Short scenario title', example: 'Multiplying rabbits' },
    { name: 'fnLetter', description: 'Single capital letter naming the function', example: 'P' },
    { name: 'subject', description: 'Who or what the scenario is about', example: 'A meadow' },
    { name: 'quantity', description: 'The growing quantity, with a leading article', example: 'the rabbit population' },
    { name: 'unit', description: 'Unit of the quantity', example: 'rabbits' },
    { name: 'timeUnit', description: 'Unit of time (singular)', example: 'year' },
  ],
  examples: baseThemes.map((t) => ({
    title: t.title,
    fnLetter: t.fnLetter,
    subject: t.subject,
    quantity: t.quantity,
    unit: t.unit,
    timeUnit: t.timeUnit,
  })),
  count: 6,
  validate: (raw): BaseTheme | null => {
    const title = cleanText(raw.title, 40)
    const fnLetter = singleLetter(raw.fnLetter)
    const subject = cleanText(raw.subject, 40)
    const quantity = cleanText(raw.quantity, 50)
    const unit = cleanTextNoDigits(raw.unit, 30)
    const timeUnit = cleanTextNoDigits(raw.timeUnit, 25)
    if (
      title === null ||
      fnLetter === null ||
      subject === null ||
      quantity === null ||
      unit === null ||
      timeUnit === null
    ) {
      return null
    }
    return { title, fnLetter, subject, quantity, unit, timeUnit }
  },
})

function generateBase(): WordProblem {
  const theme = pickTheme<BaseTheme>('a4-base')
  const n = pick([2, 3])
  const A = randInt(2, 15)
  // Smooth base-n growth f(x) = A·nˣ ⇒ instantaneous growth at x=0 is A·ln(n).
  const correct = round(Math.log(n) * A, 1)
  // Distractors: forgot the ln(n) factor (A); used discrete growth ((n-1)·A).
  const candidates = [correct, round(A, 1), round((n - 1) * A, 1)]
  const unique: number[] = []
  for (const value of candidates) {
    if (!unique.includes(value)) unique.push(value)
  }
  const options = shuffle(unique)

  return {
    id: uniqueId('a4-base'),
    topicId: 'a4-base',
    title: theme.title,
    prompt: `${theme.subject}: ${theme.quantity} grows smoothly, multiplying by ${n} over each ${theme.timeUnit}. Right now ${theme.quantity} is ${A} ${theme.unit}. Which value below is closest to how fast ${theme.quantity} is growing at this instant?`,
    given: `Growth factor ${n} per ${theme.timeUnit}; current amount ${A} ${theme.unit}.`,
    fields: [
      {
        kind: 'choice',
        label: `Closest instantaneous growth (${theme.unit} per ${theme.timeUnit})`,
        options,
        correct,
        meaning: `how fast ${theme.quantity} is growing at this instant, in ${theme.unit} per ${theme.timeUnit}`,
      },
    ],
    hint: 'A smooth multiply-by-n growth grows at the natural log of n times the current amount.',
  }
}

// ── Topic: Natural-log response (d/dx [c·ln(x)] = c/x) — NumberField ─────────
interface LogTheme {
  title: string
  fnLetter: string
  subject: string
  quantity: string
  unit: string
  inputName: string
}

const logThemes: LogTheme[] = [
  {
    title: 'Perceived loudness',
    fnLetter: 'L',
    subject: 'A speaker system',
    quantity: 'the perceived loudness',
    unit: 'decibels',
    inputName: 'power input',
  },
  {
    title: 'Star brightness',
    fnLetter: 'B',
    subject: 'A telescope',
    quantity: 'the perceived brightness',
    unit: 'units',
    inputName: 'light input',
  },
  {
    title: 'Perceived value',
    fnLetter: 'V',
    subject: 'A shopper',
    quantity: 'the perceived value',
    unit: 'points',
    inputName: 'spending level',
  },
  {
    title: 'Felt intensity',
    fnLetter: 'I',
    subject: 'A sensor',
    quantity: 'the felt intensity',
    unit: 'units',
    inputName: 'energy level',
  },
]

registerStaticThemes<LogTheme>('a4-log', logThemes)

registerMadlibSpec<LogTheme>({
  topicId: 'a4-log',
  instruction:
    'A perceived response that rises with diminishing returns as some input grows (loudness vs power, brightness vs light, value vs spending).',
  slots: [
    { name: 'title', description: 'Short scenario title', example: 'Perceived loudness' },
    { name: 'fnLetter', description: 'Single capital letter naming the function', example: 'L' },
    { name: 'subject', description: 'Who or what the scenario is about', example: 'A speaker system' },
    { name: 'quantity', description: 'The response quantity, with a leading article', example: 'the perceived loudness' },
    { name: 'unit', description: 'Unit of the response quantity', example: 'decibels' },
    { name: 'inputName', description: 'Name of the input being increased', example: 'power input' },
  ],
  examples: logThemes.map((t) => ({
    title: t.title,
    fnLetter: t.fnLetter,
    subject: t.subject,
    quantity: t.quantity,
    unit: t.unit,
    inputName: t.inputName,
  })),
  count: 6,
  validate: (raw): LogTheme | null => {
    const title = cleanText(raw.title, 40)
    const fnLetter = singleLetter(raw.fnLetter)
    const subject = cleanText(raw.subject, 40)
    const quantity = cleanText(raw.quantity, 50)
    const unit = cleanTextNoDigits(raw.unit, 30)
    const inputName = cleanText(raw.inputName, 40)
    if (
      title === null ||
      fnLetter === null ||
      subject === null ||
      quantity === null ||
      unit === null ||
      inputName === null
    ) {
      return null
    }
    return { title, fnLetter, subject, quantity, unit, inputName }
  },
})

function generateLog(): WordProblem {
  const theme = pickTheme<LogTheme>('a4-log')
  const x0 = randInt(2, 8)
  let mult = randInt(2, 9)
  // Keep the answer distinct from the evaluation point shown in the prompt.
  while (mult === x0) mult = randInt(2, 9)
  const c = x0 * mult
  const expected = c / x0 // = mult, always an integer

  return {
    id: uniqueId('a4-log'),
    topicId: 'a4-log',
    title: theme.title,
    prompt: `${theme.subject}: ${theme.quantity} (in ${theme.unit}) follows the rule below, where x is the ${theme.inputName}. How fast is ${theme.quantity} changing when x = ${x0}?`,
    given: `${theme.fnLetter}(x) = ${c}\u00b7ln(x)`,
    fields: [
      {
        kind: 'number',
        label: `Change per unit of ${theme.inputName} at x = ${x0} (${theme.unit})`,
        expected,
        meaning: `how fast ${theme.quantity} is changing when x = ${x0}, in ${theme.unit} per unit of ${theme.inputName}`,
      },
    ],
    hint: 'For c·ln(x), the instantaneous change at x is c divided by x.',
  }
}

// ── Topic: Two factors multiplied (product rule) — ExpressionField ───────────
interface ProductTheme {
  title: string
  fnLetter: string
  subject: string
  quantity: string
  unit: string
  factorOne: string
  factorTwo: string
}

const productThemes: ProductTheme[] = [
  {
    title: 'Revenue stream',
    fnLetter: 'R',
    subject: 'A shop',
    quantity: 'its revenue',
    unit: 'dollars',
    factorOne: 'the price',
    factorTwo: 'the number sold',
  },
  {
    title: 'Garden plot',
    fnLetter: 'A',
    subject: 'A garden',
    quantity: 'its area',
    unit: 'square meters',
    factorOne: 'the width',
    factorTwo: 'the length',
  },
  {
    title: 'Circuit power',
    fnLetter: 'P',
    subject: 'A circuit',
    quantity: 'its power',
    unit: 'watts',
    factorOne: 'the voltage',
    factorTwo: 'the current',
  },
  {
    title: 'Total cost',
    fnLetter: 'C',
    subject: 'A supplier',
    quantity: 'its total cost',
    unit: 'dollars',
    factorOne: 'the unit cost',
    factorTwo: 'the order size',
  },
]

registerStaticThemes<ProductTheme>('a4-product', productThemes)

registerMadlibSpec<ProductTheme>({
  topicId: 'a4-product',
  instruction:
    'A quantity that is the product of two things, each of which depends on x (revenue = price × number sold, area = width × length, power = voltage × current).',
  slots: [
    { name: 'title', description: 'Short scenario title', example: 'Revenue stream' },
    { name: 'fnLetter', description: 'Single capital letter naming the function', example: 'R' },
    { name: 'subject', description: 'Who or what the scenario is about', example: 'A shop' },
    { name: 'quantity', description: 'The product quantity, with a leading article', example: 'its revenue' },
    { name: 'unit', description: 'Unit of the product quantity', example: 'dollars' },
    { name: 'factorOne', description: 'First factor, with a leading article', example: 'the price' },
    { name: 'factorTwo', description: 'Second factor, with a leading article', example: 'the number sold' },
  ],
  examples: productThemes.map((t) => ({
    title: t.title,
    fnLetter: t.fnLetter,
    subject: t.subject,
    quantity: t.quantity,
    unit: t.unit,
    factorOne: t.factorOne,
    factorTwo: t.factorTwo,
  })),
  count: 6,
  validate: (raw): ProductTheme | null => {
    const title = cleanText(raw.title, 40)
    const fnLetter = singleLetter(raw.fnLetter)
    const subject = cleanText(raw.subject, 40)
    const quantity = cleanText(raw.quantity, 45)
    const unit = cleanTextNoDigits(raw.unit, 30)
    const factorOne = cleanText(raw.factorOne, 40)
    const factorTwo = cleanText(raw.factorTwo, 40)
    if (
      title === null ||
      fnLetter === null ||
      subject === null ||
      quantity === null ||
      unit === null ||
      factorOne === null ||
      factorTwo === null
    ) {
      return null
    }
    return { title, fnLetter, subject, quantity, unit, factorOne, factorTwo }
  },
})

function generateProduct(): WordProblem {
  const theme = pickTheme<ProductTheme>('a4-product')
  const u = smallFactor()
  const v = smallFactor()
  const trueCoefficients = productRuleDerivative(u, v).sum

  return {
    id: uniqueId('a4-product'),
    topicId: 'a4-product',
    title: theme.title,
    prompt: `${theme.subject}: ${theme.quantity} (in ${theme.unit}) is ${theme.factorOne} times ${theme.factorTwo}, shown below as a function of x. Write how fast ${theme.quantity} changes as x grows.`,
    given: `${theme.fnLetter}(x) = (${formatPolynomial(u)})(${formatPolynomial(v)})`,
    fields: [
      {
        kind: 'expression',
        label: 'How fast it changes as x grows (expression in x)',
        trueCoefficients,
        placeholder: 'polynomial in x',
        meaning: `how fast ${theme.quantity} changes as x changes, written as an expression in x`,
      },
    ],
    hint: 'Change one factor at a time while holding the other fixed, then add the two pieces.',
  }
}

// ── Topic: Combined value at an instant (product rule, evaluated) — Number ───
interface ProductPointTheme {
  title: string
  fnLetter: string
  subject: string
  quantity: string
  unit: string
  factorOne: string
  factorTwo: string
}

const productPointThemes: ProductPointTheme[] = [
  {
    title: 'Register revenue',
    fnLetter: 'R',
    subject: 'A register',
    quantity: 'the revenue',
    unit: 'dollars',
    factorOne: 'the price',
    factorTwo: 'the number sold',
  },
  {
    title: 'Field area',
    fnLetter: 'A',
    subject: 'A field',
    quantity: 'the area',
    unit: 'square meters',
    factorOne: 'the width',
    factorTwo: 'the length',
  },
  {
    title: 'Tank volume',
    fnLetter: 'V',
    subject: 'A tank',
    quantity: 'the volume',
    unit: 'liters',
    factorOne: 'the depth',
    factorTwo: 'the base size',
  },
  {
    title: 'Cargo load',
    fnLetter: 'L',
    subject: 'A courier',
    quantity: 'the load',
    unit: 'kilograms',
    factorOne: 'the box count',
    factorTwo: 'the box weight',
  },
]

registerStaticThemes<ProductPointTheme>('a4-product-point', productPointThemes)

registerMadlibSpec<ProductPointTheme>({
  topicId: 'a4-product-point',
  instruction:
    'A quantity that is the product of two things depending on x, where we ask for the combined change at one specific instant (revenue, area, volume).',
  slots: [
    { name: 'title', description: 'Short scenario title', example: 'Register revenue' },
    { name: 'fnLetter', description: 'Single capital letter naming the function', example: 'R' },
    { name: 'subject', description: 'Who or what the scenario is about', example: 'A register' },
    { name: 'quantity', description: 'The product quantity, with a leading article', example: 'the revenue' },
    { name: 'unit', description: 'Unit of the product quantity', example: 'dollars' },
    { name: 'factorOne', description: 'First factor, with a leading article', example: 'the price' },
    { name: 'factorTwo', description: 'Second factor, with a leading article', example: 'the number sold' },
  ],
  examples: productPointThemes.map((t) => ({
    title: t.title,
    fnLetter: t.fnLetter,
    subject: t.subject,
    quantity: t.quantity,
    unit: t.unit,
    factorOne: t.factorOne,
    factorTwo: t.factorTwo,
  })),
  count: 6,
  validate: (raw): ProductPointTheme | null => {
    const title = cleanText(raw.title, 40)
    const fnLetter = singleLetter(raw.fnLetter)
    const subject = cleanText(raw.subject, 40)
    const quantity = cleanText(raw.quantity, 45)
    const unit = cleanTextNoDigits(raw.unit, 30)
    const factorOne = cleanText(raw.factorOne, 40)
    const factorTwo = cleanText(raw.factorTwo, 40)
    if (
      title === null ||
      fnLetter === null ||
      subject === null ||
      quantity === null ||
      unit === null ||
      factorOne === null ||
      factorTwo === null
    ) {
      return null
    }
    return { title, fnLetter, subject, quantity, unit, factorOne, factorTwo }
  },
})

function generateProductPoint(): WordProblem {
  const theme = pickTheme<ProductPointTheme>('a4-product-point')

  let u = smallFactor()
  let v = smallFactor()
  let x0 = randInt(1, 3)
  let expected = evaluatePoly(productRuleDerivative(u, v).sum, x0)
  // Keep the value clean and bounded, and distinct from the shown instant x0.
  let guard = 0
  while ((Math.abs(expected) > 2000 || expected === x0) && guard < 50) {
    u = smallFactor()
    v = smallFactor()
    x0 = randInt(1, 3)
    expected = evaluatePoly(productRuleDerivative(u, v).sum, x0)
    guard += 1
  }

  return {
    id: uniqueId('a4-product-point'),
    topicId: 'a4-product-point',
    title: theme.title,
    prompt: `${theme.subject}: ${theme.quantity} (in ${theme.unit}) is ${theme.factorOne} times ${theme.factorTwo}, shown below. How fast is ${theme.quantity} changing right when x = ${x0}?`,
    given: `${theme.fnLetter}(x) = (${formatPolynomial(u)})(${formatPolynomial(v)})`,
    fields: [
      {
        kind: 'number',
        label: `How fast it is changing at x = ${x0} (${theme.unit} per unit of x)`,
        expected,
        meaning: `how fast ${theme.quantity} is changing when x = ${x0}, in ${theme.unit} per unit of x`,
      },
    ],
    hint: 'Combine the two factors first, then read off how fast the combination changes at that instant.',
  }
}

const topics: ApplicationTopicDef[] = [
  { id: 'a4-egrowth', label: 'Continuous growth', generate: generateEGrowth },
  { id: 'a4-base', label: 'Doubling / tripling', generate: generateBase },
  { id: 'a4-log', label: 'Natural-log response', generate: generateLog },
  { id: 'a4-product', label: 'Two factors multiplied', generate: generateProduct },
  { id: 'a4-product-point', label: 'Combined value at an instant', generate: generateProductPoint },
]

export const lesson4Applications: ApplicationLessonGroup = {
  lessonId: 'exponents-product-rule',
  lessonTitle: 'Exponents & the Product Rule',
  topics,
}
