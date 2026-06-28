import { describe, it, expect } from 'vitest'

import {
  LEVEL_PROMPTS,
  SYSTEM_LINE,
  RULES_BLOCK,
  STYLE_BLOCK,
  MAX_LEVEL,
  buildInterestClause,
  buildRewritePrompt,
  numbersIn,
  REWRITE_SCHEMA,
  validateRewrite,
  type RewriteField,
  type RewriteInput,
} from './levelPrompts'
import type { AppField } from './types'

// ── Fixtures ─────────────────────────────────────────────────────────────────

function numberField(label = 'Average speed (mph)'): AppField {
  return { kind: 'number', label, expected: 42, tolerance: 0.1, meaning: 'the speed in mph' }
}

function expressionField(label = 'Growth formula'): AppField {
  return { kind: 'expression', label, trueCoefficients: [5, 8, 3], meaning: 'the growth formula' }
}

function choiceField(label = 'Pick one'): AppField {
  return { kind: 'choice', label, options: [1, 2, 3], correct: 2, meaning: 'the right option' }
}

function baseInput(overrides: Partial<RewriteInput> = {}): RewriteInput {
  const fields: RewriteField[] = [
    { label: 'Average speed (mph)', meaning: 'the speed in mph', kind: 'number', needsX: false },
    { label: 'Growth formula', meaning: 'the growth formula', kind: 'expression', needsX: true },
  ]
  return {
    level: 5,
    baseTitle: 'A Road Trip',
    basePrompt: 'A car drives along a route.',
    given: 'f(t) = 2t^2 + 5t',
    fields,
    ...overrides,
  }
}

// ── LEVEL_PROMPTS ────────────────────────────────────────────────────────────

describe('levelPrompts: LEVEL_PROMPTS table', () => {
  it('has exactly the keys 1..15', () => {
    const keys = Object.keys(LEVEL_PROMPTS)
      .map(Number)
      .sort((a, b) => a - b)
    expect(keys).toEqual(Array.from({ length: MAX_LEVEL }, (_, i) => i + 1))
  })

  it('every level maps to a non-empty trimmed string', () => {
    for (let lvl = 1; lvl <= MAX_LEVEL; lvl++) {
      const frag = LEVEL_PROMPTS[lvl]
      expect(typeof frag).toBe('string')
      expect(frag.trim().length).toBeGreaterThan(0)
    }
  })

  it('SYSTEM_LINE and RULES_BLOCK are non-empty strings', () => {
    expect(typeof SYSTEM_LINE).toBe('string')
    expect(SYSTEM_LINE.trim().length).toBeGreaterThan(0)
    expect(typeof RULES_BLOCK).toBe('string')
    expect(RULES_BLOCK.trim().length).toBeGreaterThan(0)
  })
})

// ── STYLE_BLOCK: narrative-freedom guidance that keeps the math safe ──────────

describe('levelPrompts: STYLE_BLOCK', () => {
  it('is a non-empty string included in the full prompt', () => {
    expect(typeof STYLE_BLOCK).toBe('string')
    expect(STYLE_BLOCK.trim().length).toBeGreaterThan(0)
    expect(buildRewritePrompt(baseInput())).toContain(STYLE_BLOCK)
  })

  it('encourages varied, vivid, non-templated storytelling', () => {
    const lower = STYLE_BLOCK.toLowerCase()
    expect(lower).toContain('vary')
    expect(lower).toContain('vivid')
    expect(lower).toContain('template')
  })

  it('still restates the hard safety constraints (numbers, formula, subject, no answer)', () => {
    const lower = STYLE_BLOCK.toLowerCase()
    expect(lower).toContain('never change the math')
    expect(lower).toContain('every number')
    expect(lower).toContain('given formula')
    expect(lower).toContain('same subject')
    expect(lower).toContain('same quantity')
    expect(lower).toContain('one concrete question')
    // No answer may ever be revealed or hinted.
    expect(lower).toContain('never reveal or hint at any answer')
  })
})

// ── buildInterestClause / personalization ────────────────────────────────────

describe('levelPrompts: personalization', () => {
  it('returns empty for no / blank / non-array interests', () => {
    expect(buildInterestClause()).toBe('')
    expect(buildInterestClause([])).toBe('')
    expect(buildInterestClause(['', '   '])).toBe('')
    expect(buildInterestClause(undefined)).toBe('')
  })

  it('lists cleaned interests and keeps strict, non-forced guardrails', () => {
    const clause = buildInterestClause(['Basketball', '  space  travel '], false)
    expect(clause).toContain('Basketball')
    expect(clause).toContain('space travel')
    // Highly encouraged, but explicitly not forced, and protects the math.
    expect(clause.toLowerCase()).toContain('highly encouraged')
    expect(clause.toLowerCase()).toContain('do not force')
    expect(clause.toLowerCase()).toContain('never the math')
    expect(clause.toLowerCase()).toContain('at most one')
  })

  it('forced mode requires an interest but still protects the math', () => {
    const clause = buildInterestClause(['cooking'], true)
    expect(clause).toContain('REQUIRED')
    expect(clause).toContain('MUST')
    expect(clause.toLowerCase()).toContain('never the math')
    // No "ignore it" escape hatch in forced mode.
    expect(clause.toLowerCase()).not.toContain('worse than none')
  })

  it('de-dupes case-insensitively and caps the count', () => {
    expect(buildInterestClause(['Anime', 'anime', 'ANIME'], false)).toContain('Anime')
    const many = Array.from({ length: 20 }, (_, i) => `hobby${i}`)
    const clause = buildInterestClause(many, false)
    expect(clause).toContain('hobby0')
    expect(clause).toContain('hobby5')
    expect(clause).not.toContain('hobby6') // capped at 6
  })

  it('is included in the full prompt only when interests are present', () => {
    expect(buildRewritePrompt(baseInput())).not.toContain('PERSONALIZATION')
    const out = buildRewritePrompt(baseInput({ interests: ['cooking'] }))
    expect(out).toContain('PERSONALIZATION')
    expect(out).toContain('cooking')
  })
})

// ── buildRewritePrompt ───────────────────────────────────────────────────────

describe('levelPrompts: buildRewritePrompt', () => {
  it('includes the base title and base prompt', () => {
    const out = buildRewritePrompt(baseInput())
    expect(out).toContain('A Road Trip')
    expect(out).toContain('A car drives along a route.')
  })

  it('includes the system line and rules block', () => {
    const out = buildRewritePrompt(baseInput())
    expect(out).toContain(SYSTEM_LINE)
    expect(out).toContain(RULES_BLOCK)
  })

  it('includes the level fragment for an in-range level', () => {
    const out = buildRewritePrompt(baseInput({ level: 5 }))
    expect(out).toContain(LEVEL_PROMPTS[5])
  })

  it('clamps a too-low level to 1', () => {
    const out = buildRewritePrompt(baseInput({ level: 0 }))
    expect(out).toContain(LEVEL_PROMPTS[1])
    expect(out).not.toContain(LEVEL_PROMPTS[5])
  })

  it('clamps a too-high level to MAX_LEVEL', () => {
    const out = buildRewritePrompt(baseInput({ level: 99 }))
    expect(out).toContain(LEVEL_PROMPTS[MAX_LEVEL])
  })

  it('rounds a fractional level before lookup', () => {
    const out = buildRewritePrompt(baseInput({ level: 7.6 }))
    expect(out).toContain(LEVEL_PROMPTS[8])
  })

  it('clamps any non-finite level (NaN / Infinity) to 1 as a defensive default', () => {
    expect(buildRewritePrompt(baseInput({ level: NaN }))).toContain(LEVEL_PROMPTS[1])
    expect(buildRewritePrompt(baseInput({ level: Infinity }))).toContain(LEVEL_PROMPTS[1])
    expect(buildRewritePrompt(baseInput({ level: -Infinity }))).toContain(LEVEL_PROMPTS[1])
  })

  it('shows the given block verbatim when present', () => {
    const out = buildRewritePrompt(baseInput({ given: 'f(t) = 2t^2 + 5t' }))
    expect(out).toContain('GIVEN (READ-ONLY')
    expect(out).toContain('f(t) = 2t^2 + 5t')
    expect(out).not.toContain('(none)')
  })

  it('shows "(none)" when there is no given block', () => {
    const out = buildRewritePrompt(baseInput({ given: undefined }))
    expect(out).toContain('(none)')
  })

  it('treats a whitespace-only given as absent', () => {
    const out = buildRewritePrompt(baseInput({ given: '   ' }))
    expect(out).toContain('(none)')
  })

  it('emits one entry per field, with current label and meaning', () => {
    const out = buildRewritePrompt(baseInput())
    expect(out).toContain('1. the speed in mph (current label: "Average speed (mph)").')
    expect(out).toContain('2. the growth formula (current label: "Growth formula").')
    expect(out).toContain('ANSWER BLANKS (2,')
  })

  it('falls back to the label when a field has no meaning', () => {
    const fields: RewriteField[] = [
      { label: 'Total cost ($)', kind: 'number', needsX: false },
    ]
    const out = buildRewritePrompt(baseInput({ fields }))
    expect(out).toContain('1. Total cost ($) (current label: "Total cost ($)").')
  })

  it('adds an expression-in-x note only for needsX fields', () => {
    const fields: RewriteField[] = [
      { label: 'Speed', meaning: 'the speed', kind: 'number', needsX: false },
      { label: 'Formula', meaning: 'the formula', kind: 'expression', needsX: true },
    ]
    const out = buildRewritePrompt(baseInput({ fields }))
    const lines = out.split('\n')
    const numberLine = lines.find((l) => l.startsWith('1.'))!
    const exprLine = lines.find((l) => l.startsWith('2.'))!
    expect(numberLine).not.toContain('expression in x')
    expect(exprLine).toContain('expression in x')
  })

  it('reports the field count in the JSON instruction', () => {
    const out = buildRewritePrompt(baseInput())
    expect(out).toContain('EXACTLY 2 entries in fieldLabels')
  })

  it('anchors on the current label only in the explicit band (levels 1-6)', () => {
    expect(buildRewritePrompt(baseInput({ level: 3 }))).toContain('current label:')
    // Past the explicit band the original label is hidden so the model is not
    // pulled back toward the (method-flavored) original phrasing.
    expect(buildRewritePrompt(baseInput({ level: 9 }))).not.toContain('current label:')
    expect(buildRewritePrompt(baseInput({ level: 14 }))).not.toContain('current label:')
  })

  it('adds "do not echo the description" guidance only above the explicit band', () => {
    expect(buildRewritePrompt(baseInput({ level: 3 }))).not.toContain('NOT learner-facing')
    expect(buildRewritePrompt(baseInput({ level: 9 }))).toContain('NOT learner-facing')
    expect(buildRewritePrompt(baseInput({ level: 14 }))).toContain(
      'for YOUR understanding only',
    )
  })
})

// ── REWRITE_SCHEMA ───────────────────────────────────────────────────────────

describe('levelPrompts: REWRITE_SCHEMA', () => {
  it('is defined (an object schema)', () => {
    expect(REWRITE_SCHEMA).toBeTruthy()
    expect(typeof REWRITE_SCHEMA).toBe('object')
  })
})

// ── validateRewrite ──────────────────────────────────────────────────────────

describe('levelPrompts: validateRewrite', () => {
  const fields: AppField[] = [numberField(), choiceField()]

  const validRaw = {
    title: 'Weekend Drive',
    prompt: 'A family heads out on the open road for the afternoon.',
    fieldLabels: ['Distance covered each hour', 'Which total is right'],
  }

  it('accepts a well-formed payload and returns cleaned text', () => {
    const out = validateRewrite(validRaw, fields)
    expect(out).not.toBeNull()
    expect(out).toEqual({
      title: 'Weekend Drive',
      prompt: 'A family heads out on the open road for the afternoon.',
      fieldLabels: ['Distance covered each hour', 'Which total is right'],
    })
  })

  it('normalizes internal whitespace via cleanText', () => {
    const out = validateRewrite(
      { ...validRaw, title: '  Weekend   Drive  ' },
      fields,
    )
    expect(out?.title).toBe('Weekend Drive')
  })

  it('rejects non-object inputs', () => {
    expect(validateRewrite(null, fields)).toBeNull()
    expect(validateRewrite(undefined, fields)).toBeNull()
    expect(validateRewrite('a string', fields)).toBeNull()
    expect(validateRewrite(42, fields)).toBeNull()
  })

  it('rejects when fieldLabels is missing or not an array', () => {
    expect(validateRewrite({ title: 'T', prompt: 'P' }, fields)).toBeNull()
    expect(
      validateRewrite({ title: 'T', prompt: 'P', fieldLabels: 'nope' }, fields),
    ).toBeNull()
  })

  it('rejects when fieldLabels length != fields.length', () => {
    expect(
      validateRewrite({ ...validRaw, fieldLabels: ['only one'] }, fields),
    ).toBeNull()
    expect(
      validateRewrite(
        { ...validRaw, fieldLabels: ['a', 'b', 'c'] },
        fields,
      ),
    ).toBeNull()
  })

  it('rejects banned jargon in a field label', () => {
    expect(
      validateRewrite(
        { ...validRaw, fieldLabels: ['the derivative of distance', 'Which total is right'] },
        fields,
      ),
    ).toBeNull()
  })

  it('rejects banned jargon in the title or prompt', () => {
    expect(validateRewrite({ ...validRaw, title: 'Find the integral' }, fields)).toBeNull()
    expect(
      validateRewrite({ ...validRaw, prompt: 'Use calculus to figure it out.' }, fields),
    ).toBeNull()
  })

  it('rejects over-long title, prompt, and labels', () => {
    expect(validateRewrite({ ...validRaw, title: 'a'.repeat(101) }, fields)).toBeNull()
    expect(validateRewrite({ ...validRaw, prompt: 'a'.repeat(901) }, fields)).toBeNull()
    expect(
      validateRewrite(
        { ...validRaw, fieldLabels: ['a'.repeat(101), 'Which total is right'] },
        fields,
      ),
    ).toBeNull()
  })

  it('rejects empty title / prompt / label', () => {
    expect(validateRewrite({ ...validRaw, title: '' }, fields)).toBeNull()
    expect(validateRewrite({ ...validRaw, prompt: '   ' }, fields)).toBeNull()
    expect(
      validateRewrite({ ...validRaw, fieldLabels: ['', 'Which total is right'] }, fields),
    ).toBeNull()
  })

  it('rejects non-string label entries', () => {
    expect(
      validateRewrite({ ...validRaw, fieldLabels: [123, 'Which total is right'] }, fields),
    ).toBeNull()
  })

  it('appends an "expression in x" hint when an expression label lacks a standalone x', () => {
    const exprFields: AppField[] = [expressionField()]
    const out = validateRewrite(
      { title: 'Pattern', prompt: 'Describe the pattern.', fieldLabels: ['Daily growth amount'] },
      exprFields,
    )
    expect(out).not.toBeNull()
    expect(out?.fieldLabels[0]).toBe(
      'Daily growth amount (write your answer as an expression in x)',
    )
  })

  it('does NOT append the hint when the expression label already says "expression in x"', () => {
    const exprFields: AppField[] = [expressionField()]
    const out = validateRewrite(
      {
        title: 'Pattern',
        prompt: 'Describe the pattern.',
        fieldLabels: ['Growth as an expression in x'],
      },
      exprFields,
    )
    expect(out?.fieldLabels[0]).toBe('Growth as an expression in x')
  })

  it('DOES append the hint when an expression label only mentions a stray x', () => {
    const exprFields: AppField[] = [expressionField()]
    const out = validateRewrite(
      {
        title: 'Pattern',
        prompt: 'Describe the pattern.',
        fieldLabels: ['Growth written in terms of x'],
      },
      exprFields,
    )
    expect(out?.fieldLabels[0]).toBe(
      'Growth written in terms of x (write your answer as an expression in x)',
    )
  })

  it('does NOT append the hint for non-expression fields that lack an x', () => {
    const out = validateRewrite(validRaw, fields)
    expect(out?.fieldLabels[0]).toBe('Distance covered each hour')
    expect(out?.fieldLabels.some((l) => l.includes('expression in x'))).toBe(false)
  })

  it('never throws on hostile input', () => {
    const weird: unknown[] = [
      [],
      { fieldLabels: [{}, {}] },
      { title: {}, prompt: [], fieldLabels: [null, null] },
      Symbol('x') as unknown,
    ]
    for (const w of weird) {
      expect(() => validateRewrite(w, fields)).not.toThrow()
    }
  })
})

// ── validateRewrite: expression-in-x phrase gate (stray "x" insufficient) ─────

describe('levelPrompts: validateRewrite expression-in-x phrase', () => {
  const exprFields: AppField[] = [expressionField()]

  function labelOut(label: string): string | undefined {
    const out = validateRewrite(
      { title: 'Pattern', prompt: 'Describe the pattern.', fieldLabels: [label] },
      exprFields,
    )
    return out?.fieldLabels[0]
  }

  it('appends the phrase when the label has only a stray standalone "x"', () => {
    // A lone "x" is no longer sufficient — the explicit phrase must be added.
    expect(labelOut('Solve for x')).toBe(
      'Solve for x (write your answer as an expression in x)',
    )
  })

  it('appends the phrase when "x" appears but not the required phrase', () => {
    expect(labelOut('Daily growth amount')).toBe(
      'Daily growth amount (write your answer as an expression in x)',
    )
  })

  it('does NOT append when the exact phrase "expression in x" is present', () => {
    expect(labelOut('Growth as an expression in x')).toBe('Growth as an expression in x')
  })

  it('matches the phrase case-insensitively and across extra internal spaces', () => {
    // cleanText collapses runs of whitespace to single spaces, so "expression   in
    // x" becomes "expression in x" before the /expression\s+in\s+x/i test runs.
    expect(labelOut('Answer as an Expression In X')).toBe('Answer as an Expression In X')
    expect(labelOut('the expression   in   x form')).toBe('the expression in x form')
  })
})

// ── validateRewrite: answer-leakage rejection via allowedNumbers context ──────

describe('levelPrompts: validateRewrite answer-leakage guard', () => {
  // numberField.expected = 42, choiceField.correct = 2 are the concrete answers.
  const fields: AppField[] = [numberField(), choiceField()]

  // A leak: the numeric answer 42 appears verbatim in the rewritten prompt.
  const leaking = {
    title: 'Weekend Drive',
    prompt: 'The route is exactly 42 miles long this afternoon.',
    fieldLabels: ['Distance covered each hour', 'Which total is right'],
  }

  it('rejects when an answer value leaks and is NOT in allowedNumbers', () => {
    expect(validateRewrite(leaking, fields, { allowedNumbers: [] })).toBeNull()
    // Whitelisting an unrelated number does not rescue the leak.
    expect(validateRewrite(leaking, fields, { allowedNumbers: [7, 99] })).toBeNull()
  })

  it('allows the same number when it is whitelisted in allowedNumbers', () => {
    const out = validateRewrite(leaking, fields, { allowedNumbers: [42] })
    expect(out).not.toBeNull()
    expect(out?.prompt).toBe('The route is exactly 42 miles long this afternoon.')
  })

  it('rejects a leak that appears in a field label, not just the prompt', () => {
    const labelLeak = {
      title: 'Weekend Drive',
      prompt: 'A family heads out on the open road.',
      fieldLabels: ['Distance of 42 each hour', 'Which total is right'],
    }
    expect(validateRewrite(labelLeak, fields, { allowedNumbers: [] })).toBeNull()
  })

  it('rejects a leak that appears in the title', () => {
    const titleLeak = {
      title: 'The 42 Mile Drive',
      prompt: 'A family heads out on the open road.',
      fieldLabels: ['Distance covered each hour', 'Which total is right'],
    }
    expect(validateRewrite(titleLeak, fields, { allowedNumbers: [] })).toBeNull()
  })

  it('accepts when no answer values appear, regardless of allowedNumbers', () => {
    const clean = {
      title: 'Weekend Drive',
      prompt: 'A family heads out for a relaxed afternoon on the open road.',
      fieldLabels: ['Distance covered each hour', 'Which total is right'],
    }
    expect(validateRewrite(clean, fields, { allowedNumbers: [] })).not.toBeNull()
  })

  it('without a context arg, performs NO leakage check (back-compat)', () => {
    // Exactly the same leaking payload is accepted when context is omitted.
    const out = validateRewrite(leaking, fields)
    expect(out).not.toBeNull()
    expect(out?.prompt).toBe('The route is exactly 42 miles long this afternoon.')
  })

  it('rejects when a decimal answer leaks (decimal literals are compared)', () => {
    const decimalFields: AppField[] = [
      { kind: 'number', label: 'Rate', expected: 3.5, meaning: 'the rate' },
    ]
    const leak = {
      title: 'Flow',
      prompt: 'The tank fills to 3.5 of its mark by noon.',
      fieldLabels: ['How much each hour'],
    }
    expect(validateRewrite(leak, decimalFields, { allowedNumbers: [] })).toBeNull()
    expect(validateRewrite(leak, decimalFields, { allowedNumbers: [3.5] })).not.toBeNull()
  })
})

// ── validateRewrite: EXTRA_BANNED method phrases ─────────────────────────────

describe('levelPrompts: validateRewrite extra banned method phrases', () => {
  const fields: AppField[] = [numberField(), choiceField()]
  const base = {
    title: 'Weekend Drive',
    prompt: 'A family heads out on the open road for the afternoon.',
    fieldLabels: ['Distance covered each hour', 'Which total is right'],
  }

  it('rejects "rate of change" in the title', () => {
    expect(validateRewrite({ ...base, title: 'Find the rate of change' }, fields)).toBeNull()
  })

  it('rejects "rate of change" in the prompt (case-insensitive)', () => {
    expect(
      validateRewrite({ ...base, prompt: 'Compute the RATE OF CHANGE here.' }, fields),
    ).toBeNull()
  })

  it('rejects "rate of change" in a field label', () => {
    expect(
      validateRewrite(
        { ...base, fieldLabels: ['the rate of change each hour', 'Which total is right'] },
        fields,
      ),
    ).toBeNull()
  })

  it('rejects "instantaneous" in the title, prompt, and labels', () => {
    expect(validateRewrite({ ...base, title: 'Instantaneous speed' }, fields)).toBeNull()
    expect(
      validateRewrite({ ...base, prompt: 'Find the instantaneous value.' }, fields),
    ).toBeNull()
    expect(
      validateRewrite(
        { ...base, fieldLabels: ['instantaneous distance', 'Which total is right'] },
        fields,
      ),
    ).toBeNull()
  })
})

// ── validateRewrite: leading-command label cleanup ───────────────────────────

describe('levelPrompts: validateRewrite strips imperative labels', () => {
  const oneNumber: AppField[] = [numberField('Average speed (mph)')]

  it('drops a leading "Write the …" command and recapitalizes', () => {
    const out = validateRewrite(
      { title: 'A Ride', prompt: 'A short trip unfolds.', fieldLabels: ['Write the exact amount at the finish'] },
      oneNumber,
    )
    expect(out?.fieldLabels[0]).toBe('The exact amount at the finish')
  })

  it('drops a leading "Find …" command', () => {
    const out = validateRewrite(
      { title: 'A Ride', prompt: 'A short trip unfolds.', fieldLabels: ['Find the distance each hour'] },
      oneNumber,
    )
    expect(out?.fieldLabels[0]).toBe('The distance each hour')
  })

  it('leaves a non-command label untouched (no false positives)', () => {
    const out = validateRewrite(
      { title: 'A Ride', prompt: 'A short trip unfolds.', fieldLabels: ['Distance each hour'] },
      oneNumber,
    )
    expect(out?.fieldLabels[0]).toBe('Distance each hour')
  })
})

// ── validateRewrite: story-band operation giveaway gate ──────────────────────

describe('levelPrompts: validateRewrite story-band giveaway gate', () => {
  const fields: AppField[] = [numberField(), choiceField()]
  const giveaway = {
    title: 'A Quiet Ride',
    prompt: 'The rider wonders how fast things felt near the end of the loop.',
    fieldLabels: ['Pace across the ride', 'Which figure fits'],
  }
  const clean = {
    title: 'A Quiet Ride',
    prompt: 'The rider drifts home as the afternoon light fades over the loop.',
    fieldLabels: ['Pace across the ride', 'Which figure fits'],
  }

  it('rejects "how fast" in the story band (level >= 13)', () => {
    expect(validateRewrite(giveaway, fields, { allowedNumbers: [], level: 15 })).toBeNull()
  })

  it('allows the same wording below the story band', () => {
    expect(validateRewrite(giveaway, fields, { allowedNumbers: [], level: 9 })).not.toBeNull()
  })

  it('does not gate giveaways when no level is supplied', () => {
    expect(validateRewrite(giveaway, fields, { allowedNumbers: [] })).not.toBeNull()
  })

  it('accepts clean story-band prose at level 15', () => {
    expect(validateRewrite(clean, fields, { allowedNumbers: [], level: 15 })).not.toBeNull()
  })
})

// ── numbersIn ────────────────────────────────────────────────────────────────

describe('levelPrompts: numbersIn', () => {
  it('extracts integer literals', () => {
    expect(numbersIn('There are 3 cats and 12 dogs.')).toEqual([3, 12])
  })

  it('extracts decimal literals', () => {
    expect(numbersIn('It costs 4.5 and weighs 0.25 kg.')).toEqual([4.5, 0.25])
  })

  it('extracts negative literals', () => {
    expect(numbersIn('The balance is -7 today.')).toEqual([-7])
  })

  it('returns an empty array when there are no numbers', () => {
    expect(numbersIn('no digits at all here')).toEqual([])
    expect(numbersIn('')).toEqual([])
  })

  it('pulls every literal out of a formula-like string in order', () => {
    expect(numbersIn('f(t) = 2t^2 + 5t')).toEqual([2, 2, 5])
  })

  it('handles a mix of integers, decimals, and negatives together', () => {
    expect(numbersIn('a 3 b 4.5 c -2 d 10')).toEqual([3, 4.5, -2, 10])
  })
})

// ── numbersIn ────────────────────────────────────────────────────────────────

describe('levelPrompts: numbersIn', () => {
  it('returns an empty array when there are no digits', () => {
    expect(numbersIn('')).toEqual([])
    expect(numbersIn('no numbers anywhere here')).toEqual([])
  })

  it('extracts every integer literal in order', () => {
    expect(numbersIn('there were 3 cats and 12 dogs in 2020')).toEqual([3, 12, 2020])
  })

  it('extracts decimals as whole values (not split on the dot)', () => {
    expect(numbersIn('it weighed 4.5 kg and cost 0.75 dollars')).toEqual([4.5, 0.75])
  })

  it('extracts negative numbers', () => {
    expect(numbersIn('the low was -2 and the change was -10.5')).toEqual([-2, -10.5])
  })

  it('keeps repeated values (does not dedupe)', () => {
    expect(numbersIn('5t plus 5 again')).toEqual([5, 5])
  })
})

// ── validateRewrite: EXTRA_BANNED jargon ─────────────────────────────────────

describe('levelPrompts: validateRewrite rejects EXTRA_BANNED jargon', () => {
  const fields: AppField[] = [numberField(), choiceField()]
  const validRaw = {
    title: 'Weekend Drive',
    prompt: 'A family heads out on the open road for the afternoon.',
    fieldLabels: ['Distance covered each hour', 'Which total is right'],
  }

  it('rejects "rate of change" in the title', () => {
    expect(
      validateRewrite({ ...validRaw, title: 'The rate of change of the trip' }, fields),
    ).toBeNull()
  })

  it('rejects "instantaneous" in the prompt', () => {
    expect(
      validateRewrite(
        { ...validRaw, prompt: 'Find the instantaneous reading on the gauge.' },
        fields,
      ),
    ).toBeNull()
  })

  it('rejects "rate of change" in a field label', () => {
    expect(
      validateRewrite(
        { ...validRaw, fieldLabels: ['The rate of change each hour', 'Which total is right'] },
        fields,
      ),
    ).toBeNull()
  })

  it('is case-insensitive for the extra-banned phrases', () => {
    expect(
      validateRewrite({ ...validRaw, title: 'The Rate Of Change today' }, fields),
    ).toBeNull()
    expect(
      validateRewrite({ ...validRaw, prompt: 'An INSTANTANEOUS snapshot.' }, fields),
    ).toBeNull()
  })

  it('still accepts everyday wording that contains none of the extra-banned phrases', () => {
    expect(validateRewrite(validRaw, fields)).not.toBeNull()
  })
})

// ── validateRewrite: context answer-leakage / distractor-collision guard ──────

describe('levelPrompts: validateRewrite answer-leakage guard (context)', () => {
  // number answer = 42, choice answer = 2 (see fixtures above).
  const fields: AppField[] = [numberField(), choiceField()]
  const cleanRaw = {
    title: 'Weekend Drive',
    prompt: 'A family heads out on the open road for the afternoon.',
    fieldLabels: ['Distance covered each hour', 'Which total is right'],
  }

  it('rejects when a concrete answer value (42) is leaked in the prose and not whitelisted', () => {
    const leaked = { ...cleanRaw, prompt: 'After the drive the total worked out to 42 miles.' }
    expect(validateRewrite(leaked, fields, { allowedNumbers: [] })).toBeNull()
  })

  it('rejects when an answer value is leaked in the title or a field label', () => {
    expect(
      validateRewrite({ ...cleanRaw, title: 'The 42 Mile Journey' }, fields, {
        allowedNumbers: [],
      }),
    ).toBeNull()
    expect(
      validateRewrite(
        { ...cleanRaw, fieldLabels: ['Distance after 42 minutes', 'Which total is right'] },
        fields,
        { allowedNumbers: [] },
      ),
    ).toBeNull()
  })

  it('ALLOWS the same number when it was already present in the base (whitelisted)', () => {
    const leaked = { ...cleanRaw, prompt: 'After the drive the total worked out to 42 miles.' }
    const out = validateRewrite(leaked, fields, { allowedNumbers: [42] })
    expect(out).not.toBeNull()
    expect(out?.prompt).toBe('After the drive the total worked out to 42 miles.')
  })

  it('rejects a distractor that collides with the choice answer (2) when not whitelisted', () => {
    const collide = { ...cleanRaw, prompt: 'There were 2 stray dogs near the road.' }
    expect(validateRewrite(collide, fields, { allowedNumbers: [] })).toBeNull()
    // ...but allowed once that value is whitelisted by the base problem.
    expect(validateRewrite(collide, fields, { allowedNumbers: [2] })).not.toBeNull()
  })

  it('does NOT enforce the leakage guard when no context is supplied', () => {
    const leaked = { ...cleanRaw, prompt: 'After the drive the total worked out to 42 miles.' }
    expect(validateRewrite(leaked, fields)).not.toBeNull()
  })

  it('accepts clean prose (no answer values) under an empty whitelist', () => {
    expect(validateRewrite(cleanRaw, fields, { allowedNumbers: [] })).not.toBeNull()
  })
})

// ── validateRewrite: every choice OPTION (not just the correct one) collides ──

describe('levelPrompts: validateRewrite guards all choice options', () => {
  // options [10, 20, 30] with correct 20 — every option is a collision target.
  const optionFields: AppField[] = [
    { kind: 'choice', label: 'Which total is right', options: [10, 20, 30], correct: 20, meaning: 'the total' },
  ]
  const cleanRaw = {
    title: 'Weekend Drive',
    prompt: 'A family heads out on the open road for a calm afternoon.',
    fieldLabels: ['Which total is right'],
  }

  it('rejects prose mentioning a NON-correct option (30) when nothing is whitelisted', () => {
    const collide = { ...cleanRaw, prompt: 'They spotted 30 something birds near the road.' }
    expect(validateRewrite(collide, optionFields, { allowedNumbers: [] })).toBeNull()
  })

  it('also rejects a non-correct option (10) leaked in the title', () => {
    expect(
      validateRewrite({ ...cleanRaw, title: 'The 10 Hour Drive' }, optionFields, {
        allowedNumbers: [],
      }),
    ).toBeNull()
  })

  it('still rejects the correct option (20) when not whitelisted', () => {
    const collide = { ...cleanRaw, prompt: 'There were 20 stray dogs near the road.' }
    expect(validateRewrite(collide, optionFields, { allowedNumbers: [] })).toBeNull()
  })

  it('ACCEPTS a non-correct option (30) once it is whitelisted by the base', () => {
    const reuse = { ...cleanRaw, prompt: 'The drive passes 30 little markers along the way.' }
    const out = validateRewrite(reuse, optionFields, { allowedNumbers: [30] })
    expect(out).not.toBeNull()
    expect(out?.prompt).toBe('The drive passes 30 little markers along the way.')
  })
})
