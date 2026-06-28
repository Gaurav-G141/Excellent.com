/**
 * A small, safe arithmetic evaluator (no eval). Supports + - * / over decimal
 * numbers with standard operator precedence and a leading unary minus. Returns
 * null for malformed input or division by zero.
 */

type Token = { type: 'num'; value: number } | { type: 'op'; value: '+' | '-' | '*' | '/' }

function tokenize(expr: string): Token[] | null {
  const tokens: Token[] = []
  let i = 0
  while (i < expr.length) {
    const ch = expr[i]
    if (ch === ' ') {
      i++
      continue
    }
    if (ch === '+' || ch === '-' || ch === '*' || ch === '/') {
      const prev = tokens[tokens.length - 1]
      const unaryPosition = !prev || prev.type === 'op'
      // A leading +/- (at the start or right after another operator) is a sign
      // on the next number, e.g. "2*-3" → 2 * (-3). Fold consecutive signs in.
      if (unaryPosition && (ch === '+' || ch === '-')) {
        let sign = 1
        while (i < expr.length && (expr[i] === '+' || expr[i] === '-')) {
          if (expr[i] === '-') sign = -sign
          i++
        }
        const parsed = readNumber(expr, i)
        if (!parsed) return null
        tokens.push({ type: 'num', value: sign * parsed.value })
        i = parsed.next
        continue
      }
      // A binary operator must follow an operand.
      if (unaryPosition) return null
      tokens.push({ type: 'op', value: ch })
      i++
      continue
    }
    if ((ch >= '0' && ch <= '9') || ch === '.') {
      const parsed = readNumber(expr, i)
      if (!parsed) return null
      tokens.push({ type: 'num', value: parsed.value })
      i = parsed.next
      continue
    }
    return null
  }
  return tokens
}

/** Reads a decimal number starting at `start`; returns null if malformed. */
function readNumber(expr: string, start: number): { value: number; next: number } | null {
  let num = ''
  let dots = 0
  let i = start
  while (i < expr.length && ((expr[i] >= '0' && expr[i] <= '9') || expr[i] === '.')) {
    if (expr[i] === '.') dots++
    if (dots > 1) return null
    num += expr[i]
    i++
  }
  if (num === '' || num === '.') return null
  return { value: Number(num), next: i }
}

const PRECEDENCE: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2 }

export function evaluate(expr: string): number | null {
  const tokens = tokenize(expr)
  if (!tokens || tokens.length === 0) return null
  if (tokens[tokens.length - 1].type === 'op') return null

  // Shunting-yard into RPN, then evaluate.
  const output: Token[] = []
  const ops: Extract<Token, { type: 'op' }>[] = []
  for (const token of tokens) {
    if (token.type === 'num') {
      output.push(token)
    } else {
      while (
        ops.length > 0 &&
        PRECEDENCE[ops[ops.length - 1].value] >= PRECEDENCE[token.value]
      ) {
        output.push(ops.pop()!)
      }
      ops.push(token)
    }
  }
  while (ops.length > 0) output.push(ops.pop()!)

  const stack: number[] = []
  for (const token of output) {
    if (token.type === 'num') {
      stack.push(token.value)
      continue
    }
    const b = stack.pop()
    const a = stack.pop()
    if (a === undefined || b === undefined) return null
    switch (token.value) {
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
        if (b === 0) return null
        stack.push(a / b)
        break
    }
  }
  if (stack.length !== 1) return null
  const result = stack[0]
  return Number.isFinite(result) ? result : null
}

/** Rounds to a readable precision and trims trailing zeros. */
export function formatResult(n: number): string {
  const rounded = Number(n.toPrecision(12))
  const normalized = Object.is(rounded, -0) ? 0 : rounded
  return String(normalized)
}
