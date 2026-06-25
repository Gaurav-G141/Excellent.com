/**
 * Applications — Lesson 2: "Rules of Derivatives".
 *
 * Randomized, self-contained word problems that exercise the differentiation
 * rules through real-world framing. Expression answers are always written in x
 * (the grader samples x only). Phrasing deliberately avoids calculus jargon.
 *
 * Each problem's MATH (numbers, coefficients, fields, expected answers) is
 * computed here and never touched by AI. Only the NARRATIVE is a swappable
 * "theme": built-in static themes ship below and keep behavior identical when
 * AI is off, while a mad-lib spec lets an AI generator supply more themes later.
 */
import {
  formatMonomial,
  formatPolynomial,
  pick,
  randInt,
  superscript,
  uniqueId,
} from './helpers'
import { derivativeCoefficients } from '../polynomial'
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

/** Sum two low-to-high coefficient arrays, padding the shorter one with zeros. */
function addCoeffs(a: number[], b: number[]): number[] {
  const len = Math.max(a.length, b.length)
  return Array.from({ length: len }, (_, i) => (a[i] ?? 0) + (b[i] ?? 0))
}

// ── Topic: Power rule ───────────────────────────────────────────────────────
interface PowerTheme {
  title: string
  fnLetter: string
  symbol: string
  subject: string
  quantityName: string
  inputName: string
  inputUnit: string
  outputUnit: string
}

const powerThemes: PowerTheme[] = [
  {
    title: 'Pizza dough cost',
    fnLetter: 'C',
    symbol: 'r',
    subject: 'A pizzeria',
    quantityName: 'the dough cost',
    inputName: 'radius',
    inputUnit: 'inches',
    outputUnit: 'dollars',
  },
  {
    title: 'Model detail',
    fnLetter: 'P',
    symbol: 'd',
    subject: 'A 3D editor',
    quantityName: 'the polygon count',
    inputName: 'detail level',
    inputUnit: 'levels',
    outputUnit: 'polygons',
  },
  {
    title: 'Panel paint',
    fnLetter: 'V',
    symbol: 's',
    subject: 'A painter',
    quantityName: 'the paint needed',
    inputName: 'side length',
    inputUnit: 'feet',
    outputUnit: 'liters',
  },
  {
    title: 'Kinetic energy',
    fnLetter: 'E',
    symbol: 'v',
    subject: 'A lab cart',
    quantityName: 'the kinetic energy',
    inputName: 'speed',
    inputUnit: 'meters per second',
    outputUnit: 'joules',
  },
]

registerStaticThemes<PowerTheme>('a2-power', powerThemes)

registerMadlibSpec<PowerTheme>({
  topicId: 'a2-power',
  instruction:
    'A single quantity depends on one measurement raised to a power; we ask how fast it grows at a given measurement.',
  slots: [
    { name: 'title', description: 'Short scenario title', example: 'Pizza dough cost' },
    { name: 'fnLetter', description: 'Single capital letter naming the function', example: 'C' },
    { name: 'symbol', description: 'Single letter for the input variable', example: 'r' },
    { name: 'subject', description: 'Who or what the scenario is about', example: 'A pizzeria' },
    { name: 'quantityName', description: 'The output quantity, with a leading article', example: 'the dough cost' },
    { name: 'inputName', description: 'Name of the input measurement', example: 'radius' },
    { name: 'inputUnit', description: 'Unit of the input measurement', example: 'inches' },
    { name: 'outputUnit', description: 'Unit of the output quantity', example: 'dollars' },
  ],
  examples: [
    {
      title: 'Pizza dough cost',
      fnLetter: 'C',
      symbol: 'r',
      subject: 'A pizzeria',
      quantityName: 'the dough cost',
      inputName: 'radius',
      inputUnit: 'inches',
      outputUnit: 'dollars',
    },
    {
      title: 'Kinetic energy',
      fnLetter: 'E',
      symbol: 'v',
      subject: 'A lab cart',
      quantityName: 'the kinetic energy',
      inputName: 'speed',
      inputUnit: 'meters per second',
      outputUnit: 'joules',
    },
  ],
  count: 6,
  validate: (raw): PowerTheme | null => {
    const title = cleanText(raw.title, 40)
    const fnLetter = singleLetter(raw.fnLetter)
    const symbol = singleLetter(raw.symbol)
    const subject = cleanText(raw.subject, 40)
    const quantityName = cleanText(raw.quantityName, 50)
    const inputName = cleanText(raw.inputName, 40)
    const inputUnit = cleanTextNoDigits(raw.inputUnit, 40)
    const outputUnit = cleanTextNoDigits(raw.outputUnit, 40)
    if (
      title === null ||
      fnLetter === null ||
      symbol === null ||
      subject === null ||
      quantityName === null ||
      inputName === null ||
      inputUnit === null ||
      outputUnit === null
    ) {
      return null
    }
    return { title, fnLetter, symbol, subject, quantityName, inputName, inputUnit, outputUnit }
  },
})

function generatePower(): WordProblem {
  const theme = pickTheme<PowerTheme>('a2-power')
  const n = pick([2, 3])
  const k = n === 3 ? pick([1, 2]) : pick([0.5, 1, 2])
  const u0 = randInt(3, 8)
  const expected = k * n * u0 ** (n - 1)

  return {
    id: uniqueId('a2-power'),
    topicId: 'a2-power',
    title: theme.title,
    prompt: `${theme.subject}: ${theme.quantityName} (in ${theme.outputUnit}) depends on the ${theme.inputName} ${theme.symbol} (in ${theme.inputUnit}) by the rule below. How fast is ${theme.quantityName} rising right when ${theme.symbol} = ${u0}?`,
    given: `${theme.fnLetter}(${theme.symbol}) = ${formatMonomial(k, n, theme.symbol)}`,
    fields: [
      {
        kind: 'number',
        label: `Extra ${theme.outputUnit} per unit increase in ${theme.inputName} (at ${theme.symbol} = ${u0})`,
        expected,
      },
    ],
    hint: 'How fast is this single term growing right at that input?',
  }
}

// ── Topic: Sum rule ─────────────────────────────────────────────────────────
interface SumTheme {
  title: string
  fnLetter: string
  subject: string
  quantity: string
  unit: string
  xNoun: string
  perXNoun: string
}

const sumThemes: SumTheme[] = [
  {
    title: 'Boutique revenue',
    fnLetter: 'R',
    subject: 'A boutique',
    quantity: 'its weekly revenue',
    unit: 'dollars',
    xNoun: 'featured items it stocks',
    perXNoun: 'item',
  },
  {
    title: 'Factory output',
    fnLetter: 'Q',
    subject: 'A factory',
    quantity: 'its daily output',
    unit: 'units',
    xNoun: 'extra machines it runs',
    perXNoun: 'machine',
  },
  {
    title: 'App revenue',
    fnLetter: 'A',
    subject: 'A studio',
    quantity: 'its monthly revenue',
    unit: 'dollars',
    xNoun: 'thousand installs',
    perXNoun: 'thousand installs',
  },
  {
    title: 'Toll income',
    fnLetter: 'T',
    subject: 'A toll road',
    quantity: 'its hourly income',
    unit: 'dollars',
    xNoun: 'hundred cars that pass',
    perXNoun: 'hundred cars',
  },
]

registerStaticThemes<SumTheme>('a2-sum', sumThemes)

registerMadlibSpec<SumTheme>({
  topicId: 'a2-sum',
  instruction:
    'A total depends on a count x via a sum of terms; we ask for how much each additional unit adds at level x.',
  slots: [
    { name: 'title', description: 'Short scenario title', example: 'Boutique revenue' },
    { name: 'fnLetter', description: 'Single capital letter naming the function', example: 'R' },
    { name: 'subject', description: 'Who or what the scenario is about', example: 'A boutique' },
    { name: 'quantity', description: 'The total quantity, with a leading article', example: 'its weekly revenue' },
    { name: 'unit', description: 'Unit of the total quantity', example: 'dollars' },
    { name: 'xNoun', description: 'What x counts', example: 'featured items it stocks' },
    { name: 'perXNoun', description: 'A single unit of x', example: 'item' },
  ],
  examples: [
    {
      title: 'Boutique revenue',
      fnLetter: 'R',
      subject: 'A boutique',
      quantity: 'its weekly revenue',
      unit: 'dollars',
      xNoun: 'featured items it stocks',
      perXNoun: 'item',
    },
    {
      title: 'Factory output',
      fnLetter: 'Q',
      subject: 'A factory',
      quantity: 'its daily output',
      unit: 'units',
      xNoun: 'extra machines it runs',
      perXNoun: 'machine',
    },
  ],
  count: 6,
  validate: (raw): SumTheme | null => {
    const fnLetter = singleLetter(raw.fnLetter)
    const title = cleanText(raw.title, 40)
    const subject = cleanText(raw.subject, 40)
    const quantity = cleanText(raw.quantity, 50)
    const unit = cleanTextNoDigits(raw.unit, 30)
    const xNoun = cleanText(raw.xNoun, 50)
    const perXNoun = cleanText(raw.perXNoun, 40)
    if (
      fnLetter === null ||
      title === null ||
      subject === null ||
      quantity === null ||
      unit === null ||
      xNoun === null ||
      perXNoun === null
    ) {
      return null
    }
    return { title, fnLetter, subject, quantity, unit, xNoun, perXNoun }
  },
})

function generateSum(): WordProblem {
  const theme = pickTheme<SumTheme>('a2-sum')
  const c1 = randInt(1, 6)
  const c2 = randInt(1, 6)
  const c3 = randInt(1, 6)
  const c0 = randInt(0, 9)
  const coeffs = [c0, c1, c2, c3]
  const trueCoefficients = derivativeCoefficients(coeffs)

  return {
    id: uniqueId('a2-sum'),
    topicId: 'a2-sum',
    title: theme.title,
    prompt: `${theme.subject} models ${theme.quantity} (in ${theme.unit}) for x ${theme.xNoun} by the rule below. Write how much each extra ${theme.perXNoun} adds at level x.`,
    given: `${theme.fnLetter}(x) = ${formatPolynomial(coeffs)}`,
    fields: [
      {
        kind: 'expression',
        label: 'Amount each extra unit adds at level x (expression in x)',
        trueCoefficients,
        placeholder: 'polynomial in x',
      },
    ],
    hint: 'Handle each term on its own, then add the pieces.',
  }
}

// ── Topic: Chain rule ───────────────────────────────────────────────────────
interface ChainTheme {
  title: string
  fnLetter: string
  subject: string
  quantity: string
  xNoun: string
}

const chainThemes: ChainTheme[] = [
  {
    title: 'Nitro meter',
    fnLetter: 'N',
    subject: 'A racing game',
    quantity: 'the stored nitro energy',
    xNoun: 'boost dial x',
  },
  {
    title: 'Packed tent volume',
    fnLetter: 'V',
    subject: 'A camping gear maker',
    quantity: 'the packed volume',
    xNoun: 'frame setting x',
  },
  {
    title: 'Signal strength',
    fnLetter: 'S',
    subject: 'A receiver',
    quantity: 'the signal strength',
    xNoun: 'gain level x',
  },
  {
    title: 'Lens zoom area',
    fnLetter: 'A',
    subject: 'A camera lens',
    quantity: 'the focus area',
    xNoun: 'zoom ring position x',
  },
]

registerStaticThemes<ChainTheme>('a2-chain', chainThemes)

registerMadlibSpec<ChainTheme>({
  topicId: 'a2-chain',
  instruction:
    'A quantity is a single bracket raised to a power, set by a dial x; we ask how fast it changes with x.',
  slots: [
    { name: 'title', description: 'Short scenario title', example: 'Nitro meter' },
    { name: 'fnLetter', description: 'Single capital letter naming the function', example: 'N' },
    { name: 'subject', description: 'Who or what the scenario is about', example: 'A racing game' },
    { name: 'quantity', description: 'The quantity, with a leading article', example: 'the stored nitro energy' },
    { name: 'xNoun', description: 'The dial set by x; should mention x', example: 'boost dial x' },
  ],
  examples: [
    {
      title: 'Nitro meter',
      fnLetter: 'N',
      subject: 'A racing game',
      quantity: 'the stored nitro energy',
      xNoun: 'boost dial x',
    },
    {
      title: 'Signal strength',
      fnLetter: 'S',
      subject: 'A receiver',
      quantity: 'the signal strength',
      xNoun: 'gain level x',
    },
  ],
  count: 6,
  validate: (raw): ChainTheme | null => {
    const fnLetter = singleLetter(raw.fnLetter)
    const title = cleanText(raw.title, 40)
    const subject = cleanText(raw.subject, 40)
    const quantity = cleanText(raw.quantity, 50)
    const xNoun = cleanText(raw.xNoun, 40)
    if (
      fnLetter === null ||
      title === null ||
      subject === null ||
      quantity === null ||
      xNoun === null ||
      // The dial phrase must reference x so the sentence stays grammatical.
      !/\bx\b/i.test(xNoun)
    ) {
      return null
    }
    return { title, fnLetter, subject, quantity, xNoun }
  },
})

function generateChain(): WordProblem {
  const theme = pickTheme<ChainTheme>('a2-chain')
  const a = randInt(1, 4)
  const b = randInt(1, 4)
  const n = pick([2, 3])
  const trueCoefficients =
    n === 2 ? [2 * a * b, 2 * a * a] : [3 * a * b * b, 6 * a * a * b, 3 * a * a * a]

  return {
    id: uniqueId('a2-chain'),
    topicId: 'a2-chain',
    title: theme.title,
    prompt: `${theme.subject}: ${theme.quantity} follows the rule below at ${theme.xNoun}. Write how fast it changes as x changes.`,
    given: `${theme.fnLetter}(x) = (${formatMonomial(a, 1)} + ${b})${superscript(n)}`,
    fields: [
      {
        kind: 'expression',
        label: 'How fast it changes (expression in x)',
        trueCoefficients,
        placeholder: 'polynomial in x',
      },
    ],
    hint: 'Differentiate the outer power, then multiply by how fast the inside changes.',
  }
}

// ── Topic: Matching the average ─────────────────────────────────────────────
interface MvtTheme {
  title: string
  fnLetter: string
  subject: string
  quantity: string
  unit: string
}

const mvtThemes: MvtTheme[] = [
  {
    title: 'Speed camera zone',
    fnLetter: 'd',
    subject: 'A monitored highway',
    quantity: 'the distance a car has covered',
    unit: 'meters',
  },
  {
    title: 'Freight elevator',
    fnLetter: 'h',
    subject: 'A freight elevator',
    quantity: 'its height',
    unit: 'meters',
  },
  {
    title: 'Conveyor travel',
    fnLetter: 's',
    subject: 'A conveyor',
    quantity: 'the distance a box has traveled',
    unit: 'meters',
  },
  {
    title: 'Drone travel',
    fnLetter: 'x',
    subject: 'A drone',
    quantity: 'its horizontal travel',
    unit: 'meters',
  },
]

registerStaticThemes<MvtTheme>('a2-mvt', mvtThemes)

registerMadlibSpec<MvtTheme>({
  topicId: 'a2-mvt',
  instruction:
    'Something travels/moves and we compare its average pace over a stretch with the instant it actually hits that pace; uses x as seconds.',
  slots: [
    { name: 'title', description: 'Short scenario title', example: 'Speed camera zone' },
    { name: 'fnLetter', description: 'Single letter naming the function', example: 'd' },
    { name: 'subject', description: 'Who or what the scenario is about', example: 'A monitored highway' },
    { name: 'quantity', description: 'The moving quantity, with a leading article', example: 'the distance a car has covered' },
    { name: 'unit', description: 'Unit of the quantity', example: 'meters' },
  ],
  examples: [
    {
      title: 'Speed camera zone',
      fnLetter: 'd',
      subject: 'A monitored highway',
      quantity: 'the distance a car has covered',
      unit: 'meters',
    },
    {
      title: 'Freight elevator',
      fnLetter: 'h',
      subject: 'A freight elevator',
      quantity: 'its height',
      unit: 'meters',
    },
  ],
  count: 6,
  validate: (raw): MvtTheme | null => {
    const fnLetter = singleLetter(raw.fnLetter)
    const title = cleanText(raw.title, 40)
    const subject = cleanText(raw.subject, 40)
    const quantity = cleanText(raw.quantity, 55)
    const unit = cleanTextNoDigits(raw.unit, 25)
    if (
      fnLetter === null ||
      title === null ||
      subject === null ||
      quantity === null ||
      unit === null
    ) {
      return null
    }
    return { title, fnLetter, subject, quantity, unit }
  },
})

function generateMvt(): WordProblem {
  const theme = pickTheme<MvtTheme>('a2-mvt')
  const a = pick([1, 2, 3])
  const p = randInt(0, 2)
  const q = p + pick([2, 4])
  const average = a * (p + q)
  const moment = (p + q) / 2

  return {
    id: uniqueId('a2-mvt'),
    topicId: 'a2-mvt',
    title: theme.title,
    prompt: `${theme.subject}: ${theme.quantity} (in ${theme.unit}) after x seconds follows the rule below, tracked between x = ${p} and x = ${q} seconds.`,
    given: `${theme.fnLetter}(x) = ${formatMonomial(a, 2)}   on   [${p}, ${q}]`,
    fields: [
      {
        kind: 'number',
        label: 'Average rate across the zone',
        expected: average,
      },
      {
        kind: 'number',
        label: 'The single moment it equals that (x = ?)',
        expected: moment,
      },
    ],
    hint: 'Find the overall average first, then find where the instantaneous speed equals that average.',
  }
}

// ── Topic: Combining the rules ──────────────────────────────────────────────
interface CombineTheme {
  title: string
  fnLetter: string
  subject: string
  quantity: string
  unit: string
  stageOne: string
  stageTwo: string
}

const combineThemes: CombineTheme[] = [
  {
    title: 'Spaceship power',
    fnLetter: 'P',
    subject: 'A spaceship',
    quantity: 'its total power',
    unit: 'kilowatts',
    stageOne: 'a charge cell',
    stageTwo: 'a reactor',
  },
  {
    title: 'Robot energy',
    fnLetter: 'E',
    subject: 'A factory robot',
    quantity: 'its total energy',
    unit: 'joules',
    stageOne: 'a drive stage',
    stageTwo: 'a booster stage',
  },
  {
    title: 'Data center load',
    fnLetter: 'L',
    subject: 'A data center',
    quantity: 'its total load',
    unit: 'units',
    stageOne: 'a base stage',
    stageTwo: 'a burst stage',
  },
  {
    title: 'Hybrid car power',
    fnLetter: 'P',
    subject: 'A hybrid car',
    quantity: 'its total power',
    unit: 'kilowatts',
    stageOne: 'a motor stage',
    stageTwo: 'an engine stage',
  },
]

registerStaticThemes<CombineTheme>('a2-combine', combineThemes)

registerMadlibSpec<CombineTheme>({
  topicId: 'a2-combine',
  instruction:
    'A total output at throttle x is the sum of two stages; we ask how fast the total changes with x.',
  slots: [
    { name: 'title', description: 'Short scenario title', example: 'Spaceship power' },
    { name: 'fnLetter', description: 'Single capital letter naming the function', example: 'P' },
    { name: 'subject', description: 'Who or what the scenario is about', example: 'A spaceship' },
    { name: 'quantity', description: 'The total quantity, with a leading article', example: 'its total power' },
    { name: 'unit', description: 'Unit of the total quantity', example: 'kilowatts' },
    { name: 'stageOne', description: 'First contributing stage', example: 'a charge cell' },
    { name: 'stageTwo', description: 'Second contributing stage', example: 'a reactor' },
  ],
  examples: [
    {
      title: 'Spaceship power',
      fnLetter: 'P',
      subject: 'A spaceship',
      quantity: 'its total power',
      unit: 'kilowatts',
      stageOne: 'a charge cell',
      stageTwo: 'a reactor',
    },
    {
      title: 'Robot energy',
      fnLetter: 'E',
      subject: 'A factory robot',
      quantity: 'its total energy',
      unit: 'joules',
      stageOne: 'a drive stage',
      stageTwo: 'a booster stage',
    },
  ],
  count: 6,
  validate: (raw): CombineTheme | null => {
    const fnLetter = singleLetter(raw.fnLetter)
    const title = cleanText(raw.title, 40)
    const subject = cleanText(raw.subject, 40)
    const quantity = cleanText(raw.quantity, 45)
    const unit = cleanTextNoDigits(raw.unit, 25)
    const stageOne = cleanText(raw.stageOne, 40)
    const stageTwo = cleanText(raw.stageTwo, 40)
    if (
      fnLetter === null ||
      title === null ||
      subject === null ||
      quantity === null ||
      unit === null ||
      stageOne === null ||
      stageTwo === null
    ) {
      return null
    }
    return { title, fnLetter, subject, quantity, unit, stageOne, stageTwo }
  },
})

function generateCombine(): WordProblem {
  const theme = pickTheme<CombineTheme>('a2-combine')
  const a = randInt(1, 3)
  const b = randInt(1, 3)
  const n = pick([2, 3])
  const c = randInt(1, 3)
  const m = pick([2, 3])

  const chainDeriv =
    n === 2 ? [2 * a * b, 2 * a * a] : [3 * a * b * b, 6 * a * a * b, 3 * a * a * a]
  const powerDeriv = m === 2 ? [0, 2 * c] : [0, 0, 3 * c]
  const trueCoefficients = addCoeffs(chainDeriv, powerDeriv)

  return {
    id: uniqueId('a2-combine'),
    topicId: 'a2-combine',
    title: theme.title,
    prompt: `${theme.subject}: ${theme.quantity} (in ${theme.unit}) at throttle x comes from ${theme.stageOne} plus ${theme.stageTwo}, shown below. Write how fast the total changes as x changes.`,
    given: `${theme.fnLetter}(x) = (${formatMonomial(a, 1)} + ${b})${superscript(n)} + ${formatMonomial(c, m)}`,
    fields: [
      {
        kind: 'expression',
        label: 'How fast the total changes (expression in x)',
        trueCoefficients,
        placeholder: 'polynomial in x',
      },
    ],
    hint: 'Break it into two pieces, find how fast each changes, then add.',
  }
}

const topics: ApplicationTopicDef[] = [
  { id: 'a2-power', label: 'Power rule', generate: generatePower },
  { id: 'a2-sum', label: 'Sum rule', generate: generateSum },
  { id: 'a2-chain', label: 'Chain rule', generate: generateChain },
  { id: 'a2-mvt', label: 'Matching the average', generate: generateMvt },
  { id: 'a2-combine', label: 'Combining the rules', generate: generateCombine },
]

export const lesson2Applications: ApplicationLessonGroup = {
  lessonId: 'derivative-rules',
  lessonTitle: 'Rules of Derivatives',
  topics,
}
