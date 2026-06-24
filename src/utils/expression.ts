/**
 * Small, dependency-free math expression evaluator for grading type-in answers.
 *
 * Supports: + - * / ^, parentheses, decimals, the variable `x`, unary minus,
 * and implicit multiplication (e.g. `2x`, `6(2x+1)`, `(x+1)(x-1)`).
 *
 * Answers are graded by numeric sampling, so any algebraically-equivalent form
 * (factored or expanded) evaluates the same and is accepted.
 */

type Token =
  | { type: 'num'; value: number }
  | { type: 'var' }
  | { type: 'op'; value: '+' | '-' | '*' | '/' | '^' }
  | { type: 'lparen' }
  | { type: 'rparen' }

function tokenize(input: string): Token[] | null {
  const tokens: Token[] = []
  let i = 0
  const src = input.replace(/\s+/g, '')

  while (i < src.length) {
    const ch = src[i]

    if (ch >= '0' && ch <= '9') {
      let num = ''
      while (i < src.length && ((src[i] >= '0' && src[i] <= '9') || src[i] === '.')) {
        num += src[i]
        i++
      }
      const value = Number(num)
      if (Number.isNaN(value)) return null
      tokens.push({ type: 'num', value })
      continue
    }

    if (ch === '\u03c0') {
      tokens.push({ type: 'num', value: Math.PI })
      i++
      continue
    }

    if ((ch === 'p' || ch === 'P') && (src[i + 1] === 'i' || src[i + 1] === 'I')) {
      tokens.push({ type: 'num', value: Math.PI })
      i += 2
      continue
    }

    if (ch === 'x' || ch === 'X') {
      tokens.push({ type: 'var' })
      i++
      continue
    }

    if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '^') {
      tokens.push({ type: 'op', value: ch })
      i++
      continue
    }

    if (ch === '(' || ch === '[') {
      tokens.push({ type: 'lparen' })
      i++
      continue
    }

    if (ch === ')' || ch === ']') {
      tokens.push({ type: 'rparen' })
      i++
      continue
    }

    return null
  }

  return insertImplicitMultiplication(tokens)
}

function endsValue(token: Token): boolean {
  return token.type === 'num' || token.type === 'var' || token.type === 'rparen'
}

function startsValue(token: Token): boolean {
  return token.type === 'num' || token.type === 'var' || token.type === 'lparen'
}

function insertImplicitMultiplication(tokens: Token[]): Token[] {
  const result: Token[] = []
  for (let i = 0; i < tokens.length; i++) {
    const current = tokens[i]
    result.push(current)
    const next = tokens[i + 1]
    if (next && endsValue(current) && startsValue(next)) {
      result.push({ type: 'op', value: '*' })
    }
  }
  return result
}

const PRECEDENCE: Record<string, number> = { '+': 2, '-': 2, '*': 3, '/': 3, '^': 4 }

type BinOp = '+' | '-' | '*' | '/' | '^'

type RpnItem =
  | { kind: 'num'; value: number }
  | { kind: 'var' }
  | { kind: 'op'; value: BinOp }
  | { kind: 'unary' }

type StackItem = { kind: 'op'; value: BinOp } | { kind: 'unary' } | { kind: 'lparen' }

function toRpn(tokens: Token[]): RpnItem[] | null {
  const output: RpnItem[] = []
  const stack: StackItem[] = []
  let prev: Token | null = null

  for (const token of tokens) {
    if (token.type === 'num') {
      output.push({ kind: 'num', value: token.value })
    } else if (token.type === 'var') {
      output.push({ kind: 'var' })
    } else if (token.type === 'op') {
      const isUnary =
        token.value === '-' &&
        (prev === null || prev.type === 'op' || prev.type === 'lparen')

      if (isUnary) {
        stack.push({ kind: 'unary' })
      } else {
        const rightAssoc = token.value === '^'
        const curPrec = PRECEDENCE[token.value]
        while (stack.length > 0) {
          const top = stack[stack.length - 1]
          if (top.kind === 'lparen') break
          const topPrec = top.kind === 'unary' ? 5 : PRECEDENCE[top.value]
          if (topPrec > curPrec || (topPrec === curPrec && !rightAssoc)) {
            output.push(stack.pop() as RpnItem)
          } else break
        }
        stack.push({ kind: 'op', value: token.value })
      }
    } else if (token.type === 'lparen') {
      stack.push({ kind: 'lparen' })
    } else if (token.type === 'rparen') {
      let matched = false
      while (stack.length > 0) {
        const top = stack.pop()!
        if (top.kind === 'lparen') {
          matched = true
          break
        }
        output.push(top as RpnItem)
      }
      if (!matched) return null
    }
    prev = token
  }

  while (stack.length > 0) {
    const top = stack.pop()!
    if (top.kind === 'lparen') return null
    output.push(top as RpnItem)
  }

  return output
}

function evalRpn(rpn: RpnItem[], x: number): number | null {
  const stack: number[] = []

  for (const item of rpn) {
    if (item.kind === 'num') {
      stack.push(item.value)
    } else if (item.kind === 'var') {
      stack.push(x)
    } else if (item.kind === 'unary') {
      if (stack.length < 1) return null
      stack.push(-(stack.pop() as number))
    } else {
      if (stack.length < 2) return null
      const b = stack.pop() as number
      const a = stack.pop() as number
      switch (item.value) {
        case '+':
          stack.push(a + b)
          break
        case '-':
          stack.push(a - b)
          break
        case '*':
          stack.push(a * b)
          break
        case '/':
          stack.push(a / b)
          break
        case '^':
          stack.push(a ** b)
          break
      }
    }
  }

  if (stack.length !== 1) return null
  const result = stack[0]
  return Number.isFinite(result) ? result : null
}

/** Parse an expression once into a reusable evaluator. Returns null if invalid. */
export function parseExpression(input: string): ((x: number) => number | null) | null {
  if (!input.trim()) return null
  const tokens = tokenize(input)
  if (!tokens || tokens.length === 0) return null
  const rpn = toRpn(tokens)
  if (!rpn) return null
  return (x: number) => evalRpn(rpn, x)
}

/**
 * Evaluate a constant expression (no variable) to a number. Accepts π via the
 * `pi`/`π` tokens, so "72pi", "72*pi", and "226.19" all resolve. Returns null
 * if the input can't be parsed.
 */
export function evaluateNumericExpression(input: string): number | null {
  const evaluator = parseExpression(input)
  if (!evaluator) return null
  return evaluator(0)
}

/**
 * Grade a typed numeric answer against an expected value within a tolerance.
 * Tolerance is relative to the magnitude so big π-multiples stay forgiving.
 */
export function matchesNumber(
  input: string,
  expected: number,
  tolerance?: number,
): boolean {
  const got = evaluateNumericExpression(input)
  if (got === null) return false
  const tol = tolerance ?? Math.max(0.05, Math.abs(expected) * 0.01)
  return Math.abs(got - expected) <= tol
}

/**
 * Grade a typed derivative answer against the true derivative coefficients by
 * sampling several x-values. Accepts any equivalent form.
 */
export function matchesPolynomial(
  input: string,
  trueCoefficients: number[],
  options: { sampleXs?: number[]; tolerance?: number } = {},
): boolean {
  const evaluator = parseExpression(input)
  if (!evaluator) return false

  const sampleXs = options.sampleXs ?? [-1.3, -0.4, 0.6, 1.2, 2.1, 3.3]
  const tolerance = options.tolerance ?? 0.02

  const evaluateTrue = (x: number) =>
    trueCoefficients.reduce((sum, c, power) => sum + c * x ** power, 0)

  for (const x of sampleXs) {
    const got = evaluator(x)
    if (got === null) return false
    const expected = evaluateTrue(x)
    if (Math.abs(got - expected) > tolerance * (1 + Math.abs(expected))) {
      return false
    }
  }
  return true
}
