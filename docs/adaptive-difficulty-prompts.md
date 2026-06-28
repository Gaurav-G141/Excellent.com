# Adaptive difficulty — per-level rewrite prompts

This is an auto-generated dump of the exact prompts the app sends to the AI to reword an Applications problem at each difficulty level. The math is never sent for rewriting — only the title, the prompt text, and the answer blank labels. Use it to audit whether each level actually escalates the "implied, not stated" phrasing.

> Generated artifact — may lag the source. This file is produced from
> [`src/utils/applications/levelPrompts.ts`](../src/utils/applications/levelPrompts.ts).
> Regenerate it after editing `levelPrompts.ts` by temporarily restoring the
> `__genprompts.test.ts` generator and running it. The live `SYSTEM_LINE`,
> `RULES_BLOCK`, and the added `STYLE_BLOCK` (encouraging narrative variety) are
> the source of truth; the wording captured below may be from an earlier revision.

> Scope note. The dump below is the **single-shot `WordProblem`** rewrite
> (title + prompt + per-blank field labels). The live Applications tab now serves
> multi-step **scenarios**, whose rewrite (`scenarioRewrite.ts`) reuses the same
> `LEVEL_PROMPTS` / `RULES_BLOCK` / `STYLE_BLOCK` but rewrites **only the title and
> prompt** (never the steps/labels) and adds a "keep these subjects" clause. See
> [`specs/08-applications-scenarios.md`](specs/08-applications-scenarios.md).

Every prompt is assembled in this order:

```
SYSTEM_LINE
RULES_BLOCK            (identical at every level)
TARGET DIFFICULTY — <the per-level fragment>
BASE TITLE / BASE PROMPT
GIVEN (read-only)
ANSWER BLANKS (+ meanings, + band guidance)
Return JSON …
```

Difficulty bands: **explicit** (levels 1–6) shows the model the original label and lets it stay direct; **implied** (7–12) hides the label and forbids copying method words; **story** (13–15) additionally rejects any leftover operation giveaway ("how fast", etc.) in the output.

The example problem used below is the same one at every level:

- **Title:** Cyclist ride
- **Prompt:** A cyclist records the total distance ridden (in miles) after t hours. The total after t hours is given below. Consider the window from t = 1 to t = 3.
- **Given:** `f(t) = 2t^2 + 6t`
- **Blank 1:** Average rate over the window (miles per hour)
- **Blank 2:** Rate right at the end, t = 3 (miles per hour)

---

## Shared header (same at every level)

### SYSTEM_LINE

```
You rewrite a real-world math word problem to a target difficulty by changing ONLY the wording. You never change the math, never alter the numbers, never reveal or solve the answer, and never change which quantity is being asked for. You only adjust how the problem is phrased. Output JSON only.
```

### RULES_BLOCK

```
RULES:
- The GIVEN formula is shown to the student exactly as provided. Do not change it, restate it differently, or invent or alter any of its numbers. Likewise, every number already in the BASE PROMPT (measurements, the values a variable may take, rates) is part of the problem: reproduce each one exactly and never drop, round, or reword it.
- Keep the SAME quantity asked for each answer blank (its meaning is provided). Never solve it, never state the numeric answer, and never hint at the value.
- Use plain, everyday English only. NEVER use any math or operation name. Forbidden words include: derivative, rate of change, slope, integral, mean value theorem, intermediate value theorem, acceleration, velocity-as-derivative, critical point, tangent, secant, chain rule, power rule, related rates, polynomial, differentiate, calculus.
- Keep the problem solvable: the GIVEN together with the situation must pin down exactly which number(s) to find. At LOW difficulty, say outright what to find; at HIGH difficulty the question may be implied by the scene rather than asked directly (that is intended) — but a careful reader must still be able to infer precisely what to compute.
- Any distractor number you add must be clearly irrelevant flavor and must NOT equal — or be easily confused with — any answer option, any value the asked variable can take, the operative measurements, or the answer's units (e.g. never use 1, 2, 3, or 4 as flavor when the answer is one of 1–4, and never introduce a stray "thousands of dollars" amount in a thousands-of-dollars problem).
- For any blank that must be answered as an algebraic expression, the label MUST contain the explicit phrase "as an expression in x". Merely mentioning the letter x somewhere in the label is not enough.
```

---

## Per-level fragments (the only part that changes)

**Level 1.** LEVEL 1 (maximally explicit): Restate the goal so it is impossible to miss ("you are looking for ..."), AND briefly gloss the everyday, real-world meaning of every quantity in simple words. Keep it to one or two short sentences. Add ZERO extra or irrelevant details. Keep the GIVEN formula untouched and never hint at the numeric answer.

**Level 2.** LEVEL 2 (very explicit): Gloss the everyday meaning of each quantity and say plainly what to find; restating the goal is optional, not required. Keep it short, one or two sentences, with NO distractions. Keep the GIVEN formula untouched and never hint at the numeric answer.

**Level 3.** LEVEL 3 (explicit): State plainly what to find, with NO goal-restatement and NO gloss of the quantities. Stay short with NO irrelevant details. Keep the GIVEN formula untouched and never hint at the numeric answer.

**Level 4.** LEVEL 4 (direct): Write an ordinary, concrete word problem that asks straight out for what is needed. You may give light everyday context for the quantities. NO distracting details. Keep the GIVEN formula untouched and never hint at the numeric answer.

**Level 5.** LEVEL 5 (direct): A normal, concrete word problem that asks directly for the quantity, with only minimal framing. NO irrelevant details. Keep the GIVEN formula untouched and never hint at the numeric answer.

**Level 6.** LEVEL 6 (direct): A terse, concrete word problem that asks directly for the answer with no extra context. Still NO distractions. Keep the GIVEN formula untouched and never hint at the numeric answer.

**Level 7.** LEVEL 7 (implied operation): Ask for the everyday quantity itself instead of naming any operation (e.g. "bugs produced on day 7" rather than "how fast the bug count grows"). The question is still clearly stated, just in plain real-world terms. Add EXACTLY ONE realistic but irrelevant detail the student must ignore. Keep the GIVEN formula untouched and never hint at the numeric answer.

**Level 8.** LEVEL 8 (implied operation): Phrase the ask as the concrete everyday quantity, never as a method, and a little less directly. Add EXACTLY ONE realistic but irrelevant number to filter out. Keep the GIVEN formula untouched and never hint at the numeric answer.

**Level 9.** LEVEL 9 (implied operation): Point at the real-world quantity only loosely, with no hint of the underlying operation, so the student must recognize what is wanted. Include EXACTLY ONE realistic but irrelevant number to filter out. Keep the GIVEN formula untouched and never hint at the numeric answer.

**Level 10.** LEVEL 10 (embedded scenario): Embed the ask inside a short real-world scenario and phrase it indirectly rather than asking outright. Include EXACTLY TWO realistic but irrelevant numbers the student must recognize and ignore. Keep the GIVEN formula untouched and never hint at the numeric answer.

**Level 11.** LEVEL 11 (embedded scenario): Wrap the question in a brief scenario and ask only indirectly, so the student has to piece together what to compute. Weave in EXACTLY TWO realistic but irrelevant numbers to be ignored. Keep the GIVEN formula untouched and never hint at the numeric answer.

**Level 12.** LEVEL 12 (embedded scenario): Set the ask inside a situation and barely point at it, making the student infer what to compute. Include EXACTLY TWO realistic but irrelevant numbers as distractors. Keep the GIVEN formula untouched and never hint at the numeric answer.

**Level 13.** LEVEL 13 (implied story): Tell a short, vivid real-world story. Do NOT state the question outright — imply it so the student must realize what to compute. Weave in EXACTLY THREE plausible but irrelevant numbers in the flavor text. No signposting of any method. Keep each field label minimal — just the everyday quantity and its units — so the label does not restate the question the story is hiding. If the problem has more than one blank, keep each label short but still clearly distinct from the others (e.g. an "over the whole stretch" value versus an "at the final moment" value) so the blanks can never be confused. Keep the GIVEN formula untouched and never hint at the numeric answer.

**Level 14.** LEVEL 14 (implied story): A short, vivid story where the question is implied, never asked directly, and pointed at even more faintly than level 13. Slip in EXACTLY THREE plausible but irrelevant numbers among the details. No method signposting at all. Keep each field label minimal — just the everyday quantity and its units — so the label does not restate the question the story is hiding. If the problem has more than one blank, keep each label short but still clearly distinct from the others (e.g. an "over the whole stretch" value versus an "at the final moment" value) so the blanks can never be confused. Keep the GIVEN formula untouched and never hint at the numeric answer.

**Level 15.** LEVEL 15 (most implicit): Tell a short, vivid real-world story and never state the question outright — the student must infer entirely what to compute from the situation. Weave in EXACTLY THREE plausible but irrelevant numbers. No signposting whatsoever of the method. Keep each field label minimal — just the everyday quantity and its units — so the label does not restate the question the story is hiding. If the problem has more than one blank, keep each label short but still clearly distinct from the others (e.g. an "over the whole stretch" value versus an "at the final moment" value) so the blanks can never be confused. This is the most implicit level. Keep the GIVEN formula untouched and never hint at the numeric answer.

---

## Full assembled prompts (exactly what the model receives)

### Level 1

```
You rewrite a real-world math word problem to a target difficulty by changing ONLY the wording. You never change the math, never alter the numbers, never reveal or solve the answer, and never change which quantity is being asked for. You only adjust how the problem is phrased. Output JSON only.

RULES:
- The GIVEN formula is shown to the student exactly as provided. Do not change it, restate it differently, or invent or alter any of its numbers. Likewise, every number already in the BASE PROMPT (measurements, the values a variable may take, rates) is part of the problem: reproduce each one exactly and never drop, round, or reword it.
- Keep the SAME quantity asked for each answer blank (its meaning is provided). Never solve it, never state the numeric answer, and never hint at the value.
- Use plain, everyday English only. NEVER use any math or operation name. Forbidden words include: derivative, rate of change, slope, integral, mean value theorem, intermediate value theorem, acceleration, velocity-as-derivative, critical point, tangent, secant, chain rule, power rule, related rates, polynomial, differentiate, calculus.
- Keep the problem solvable: the GIVEN together with the situation must pin down exactly which number(s) to find. At LOW difficulty, say outright what to find; at HIGH difficulty the question may be implied by the scene rather than asked directly (that is intended) — but a careful reader must still be able to infer precisely what to compute.
- Any distractor number you add must be clearly irrelevant flavor and must NOT equal — or be easily confused with — any answer option, any value the asked variable can take, the operative measurements, or the answer's units (e.g. never use 1, 2, 3, or 4 as flavor when the answer is one of 1–4, and never introduce a stray "thousands of dollars" amount in a thousands-of-dollars problem).
- For any blank that must be answered as an algebraic expression, the label MUST contain the explicit phrase "as an expression in x". Merely mentioning the letter x somewhere in the label is not enough.

TARGET DIFFICULTY — LEVEL 1 (maximally explicit): Restate the goal so it is impossible to miss ("you are looking for ..."), AND briefly gloss the everyday, real-world meaning of every quantity in simple words. Keep it to one or two short sentences. Add ZERO extra or irrelevant details. Keep the GIVEN formula untouched and never hint at the numeric answer.

BASE TITLE: Cyclist ride
BASE PROMPT: A cyclist records the total distance ridden (in miles) after t hours. The total after t hours is given below. Consider the window from t = 1 to t = 3.

GIVEN (READ-ONLY — show exactly, do not change): f(t) = 2t^2 + 6t

ANSWER BLANKS (2, keep the same quantity and order):
1. how fast the total distance ridden changed on average between t = 1 and t = 3, in miles per hour (current label: "Average rate over the window (miles per hour)").
2. how fast the total distance ridden is changing right at t = 3, in miles per hour (current label: "Rate right at the end, t = 3 (miles per hour)").

Return JSON: {"title": string, "prompt": string, "fieldLabels": string[]} with EXACTLY 2 entries in fieldLabels, one per blank, in the same order.
```

### Level 2

```
You rewrite a real-world math word problem to a target difficulty by changing ONLY the wording. You never change the math, never alter the numbers, never reveal or solve the answer, and never change which quantity is being asked for. You only adjust how the problem is phrased. Output JSON only.

RULES:
- The GIVEN formula is shown to the student exactly as provided. Do not change it, restate it differently, or invent or alter any of its numbers. Likewise, every number already in the BASE PROMPT (measurements, the values a variable may take, rates) is part of the problem: reproduce each one exactly and never drop, round, or reword it.
- Keep the SAME quantity asked for each answer blank (its meaning is provided). Never solve it, never state the numeric answer, and never hint at the value.
- Use plain, everyday English only. NEVER use any math or operation name. Forbidden words include: derivative, rate of change, slope, integral, mean value theorem, intermediate value theorem, acceleration, velocity-as-derivative, critical point, tangent, secant, chain rule, power rule, related rates, polynomial, differentiate, calculus.
- Keep the problem solvable: the GIVEN together with the situation must pin down exactly which number(s) to find. At LOW difficulty, say outright what to find; at HIGH difficulty the question may be implied by the scene rather than asked directly (that is intended) — but a careful reader must still be able to infer precisely what to compute.
- Any distractor number you add must be clearly irrelevant flavor and must NOT equal — or be easily confused with — any answer option, any value the asked variable can take, the operative measurements, or the answer's units (e.g. never use 1, 2, 3, or 4 as flavor when the answer is one of 1–4, and never introduce a stray "thousands of dollars" amount in a thousands-of-dollars problem).
- For any blank that must be answered as an algebraic expression, the label MUST contain the explicit phrase "as an expression in x". Merely mentioning the letter x somewhere in the label is not enough.

TARGET DIFFICULTY — LEVEL 2 (very explicit): Gloss the everyday meaning of each quantity and say plainly what to find; restating the goal is optional, not required. Keep it short, one or two sentences, with NO distractions. Keep the GIVEN formula untouched and never hint at the numeric answer.

BASE TITLE: Cyclist ride
BASE PROMPT: A cyclist records the total distance ridden (in miles) after t hours. The total after t hours is given below. Consider the window from t = 1 to t = 3.

GIVEN (READ-ONLY — show exactly, do not change): f(t) = 2t^2 + 6t

ANSWER BLANKS (2, keep the same quantity and order):
1. how fast the total distance ridden changed on average between t = 1 and t = 3, in miles per hour (current label: "Average rate over the window (miles per hour)").
2. how fast the total distance ridden is changing right at t = 3, in miles per hour (current label: "Rate right at the end, t = 3 (miles per hour)").

Return JSON: {"title": string, "prompt": string, "fieldLabels": string[]} with EXACTLY 2 entries in fieldLabels, one per blank, in the same order.
```

### Level 3

```
You rewrite a real-world math word problem to a target difficulty by changing ONLY the wording. You never change the math, never alter the numbers, never reveal or solve the answer, and never change which quantity is being asked for. You only adjust how the problem is phrased. Output JSON only.

RULES:
- The GIVEN formula is shown to the student exactly as provided. Do not change it, restate it differently, or invent or alter any of its numbers. Likewise, every number already in the BASE PROMPT (measurements, the values a variable may take, rates) is part of the problem: reproduce each one exactly and never drop, round, or reword it.
- Keep the SAME quantity asked for each answer blank (its meaning is provided). Never solve it, never state the numeric answer, and never hint at the value.
- Use plain, everyday English only. NEVER use any math or operation name. Forbidden words include: derivative, rate of change, slope, integral, mean value theorem, intermediate value theorem, acceleration, velocity-as-derivative, critical point, tangent, secant, chain rule, power rule, related rates, polynomial, differentiate, calculus.
- Keep the problem solvable: the GIVEN together with the situation must pin down exactly which number(s) to find. At LOW difficulty, say outright what to find; at HIGH difficulty the question may be implied by the scene rather than asked directly (that is intended) — but a careful reader must still be able to infer precisely what to compute.
- Any distractor number you add must be clearly irrelevant flavor and must NOT equal — or be easily confused with — any answer option, any value the asked variable can take, the operative measurements, or the answer's units (e.g. never use 1, 2, 3, or 4 as flavor when the answer is one of 1–4, and never introduce a stray "thousands of dollars" amount in a thousands-of-dollars problem).
- For any blank that must be answered as an algebraic expression, the label MUST contain the explicit phrase "as an expression in x". Merely mentioning the letter x somewhere in the label is not enough.

TARGET DIFFICULTY — LEVEL 3 (explicit): State plainly what to find, with NO goal-restatement and NO gloss of the quantities. Stay short with NO irrelevant details. Keep the GIVEN formula untouched and never hint at the numeric answer.

BASE TITLE: Cyclist ride
BASE PROMPT: A cyclist records the total distance ridden (in miles) after t hours. The total after t hours is given below. Consider the window from t = 1 to t = 3.

GIVEN (READ-ONLY — show exactly, do not change): f(t) = 2t^2 + 6t

ANSWER BLANKS (2, keep the same quantity and order):
1. how fast the total distance ridden changed on average between t = 1 and t = 3, in miles per hour (current label: "Average rate over the window (miles per hour)").
2. how fast the total distance ridden is changing right at t = 3, in miles per hour (current label: "Rate right at the end, t = 3 (miles per hour)").

Return JSON: {"title": string, "prompt": string, "fieldLabels": string[]} with EXACTLY 2 entries in fieldLabels, one per blank, in the same order.
```

### Level 4

```
You rewrite a real-world math word problem to a target difficulty by changing ONLY the wording. You never change the math, never alter the numbers, never reveal or solve the answer, and never change which quantity is being asked for. You only adjust how the problem is phrased. Output JSON only.

RULES:
- The GIVEN formula is shown to the student exactly as provided. Do not change it, restate it differently, or invent or alter any of its numbers. Likewise, every number already in the BASE PROMPT (measurements, the values a variable may take, rates) is part of the problem: reproduce each one exactly and never drop, round, or reword it.
- Keep the SAME quantity asked for each answer blank (its meaning is provided). Never solve it, never state the numeric answer, and never hint at the value.
- Use plain, everyday English only. NEVER use any math or operation name. Forbidden words include: derivative, rate of change, slope, integral, mean value theorem, intermediate value theorem, acceleration, velocity-as-derivative, critical point, tangent, secant, chain rule, power rule, related rates, polynomial, differentiate, calculus.
- Keep the problem solvable: the GIVEN together with the situation must pin down exactly which number(s) to find. At LOW difficulty, say outright what to find; at HIGH difficulty the question may be implied by the scene rather than asked directly (that is intended) — but a careful reader must still be able to infer precisely what to compute.
- Any distractor number you add must be clearly irrelevant flavor and must NOT equal — or be easily confused with — any answer option, any value the asked variable can take, the operative measurements, or the answer's units (e.g. never use 1, 2, 3, or 4 as flavor when the answer is one of 1–4, and never introduce a stray "thousands of dollars" amount in a thousands-of-dollars problem).
- For any blank that must be answered as an algebraic expression, the label MUST contain the explicit phrase "as an expression in x". Merely mentioning the letter x somewhere in the label is not enough.

TARGET DIFFICULTY — LEVEL 4 (direct): Write an ordinary, concrete word problem that asks straight out for what is needed. You may give light everyday context for the quantities. NO distracting details. Keep the GIVEN formula untouched and never hint at the numeric answer.

BASE TITLE: Cyclist ride
BASE PROMPT: A cyclist records the total distance ridden (in miles) after t hours. The total after t hours is given below. Consider the window from t = 1 to t = 3.

GIVEN (READ-ONLY — show exactly, do not change): f(t) = 2t^2 + 6t

ANSWER BLANKS (2, keep the same quantity and order):
1. how fast the total distance ridden changed on average between t = 1 and t = 3, in miles per hour (current label: "Average rate over the window (miles per hour)").
2. how fast the total distance ridden is changing right at t = 3, in miles per hour (current label: "Rate right at the end, t = 3 (miles per hour)").

Return JSON: {"title": string, "prompt": string, "fieldLabels": string[]} with EXACTLY 2 entries in fieldLabels, one per blank, in the same order.
```

### Level 5

```
You rewrite a real-world math word problem to a target difficulty by changing ONLY the wording. You never change the math, never alter the numbers, never reveal or solve the answer, and never change which quantity is being asked for. You only adjust how the problem is phrased. Output JSON only.

RULES:
- The GIVEN formula is shown to the student exactly as provided. Do not change it, restate it differently, or invent or alter any of its numbers. Likewise, every number already in the BASE PROMPT (measurements, the values a variable may take, rates) is part of the problem: reproduce each one exactly and never drop, round, or reword it.
- Keep the SAME quantity asked for each answer blank (its meaning is provided). Never solve it, never state the numeric answer, and never hint at the value.
- Use plain, everyday English only. NEVER use any math or operation name. Forbidden words include: derivative, rate of change, slope, integral, mean value theorem, intermediate value theorem, acceleration, velocity-as-derivative, critical point, tangent, secant, chain rule, power rule, related rates, polynomial, differentiate, calculus.
- Keep the problem solvable: the GIVEN together with the situation must pin down exactly which number(s) to find. At LOW difficulty, say outright what to find; at HIGH difficulty the question may be implied by the scene rather than asked directly (that is intended) — but a careful reader must still be able to infer precisely what to compute.
- Any distractor number you add must be clearly irrelevant flavor and must NOT equal — or be easily confused with — any answer option, any value the asked variable can take, the operative measurements, or the answer's units (e.g. never use 1, 2, 3, or 4 as flavor when the answer is one of 1–4, and never introduce a stray "thousands of dollars" amount in a thousands-of-dollars problem).
- For any blank that must be answered as an algebraic expression, the label MUST contain the explicit phrase "as an expression in x". Merely mentioning the letter x somewhere in the label is not enough.

TARGET DIFFICULTY — LEVEL 5 (direct): A normal, concrete word problem that asks directly for the quantity, with only minimal framing. NO irrelevant details. Keep the GIVEN formula untouched and never hint at the numeric answer.

BASE TITLE: Cyclist ride
BASE PROMPT: A cyclist records the total distance ridden (in miles) after t hours. The total after t hours is given below. Consider the window from t = 1 to t = 3.

GIVEN (READ-ONLY — show exactly, do not change): f(t) = 2t^2 + 6t

ANSWER BLANKS (2, keep the same quantity and order):
1. how fast the total distance ridden changed on average between t = 1 and t = 3, in miles per hour (current label: "Average rate over the window (miles per hour)").
2. how fast the total distance ridden is changing right at t = 3, in miles per hour (current label: "Rate right at the end, t = 3 (miles per hour)").

Return JSON: {"title": string, "prompt": string, "fieldLabels": string[]} with EXACTLY 2 entries in fieldLabels, one per blank, in the same order.
```

### Level 6

```
You rewrite a real-world math word problem to a target difficulty by changing ONLY the wording. You never change the math, never alter the numbers, never reveal or solve the answer, and never change which quantity is being asked for. You only adjust how the problem is phrased. Output JSON only.

RULES:
- The GIVEN formula is shown to the student exactly as provided. Do not change it, restate it differently, or invent or alter any of its numbers. Likewise, every number already in the BASE PROMPT (measurements, the values a variable may take, rates) is part of the problem: reproduce each one exactly and never drop, round, or reword it.
- Keep the SAME quantity asked for each answer blank (its meaning is provided). Never solve it, never state the numeric answer, and never hint at the value.
- Use plain, everyday English only. NEVER use any math or operation name. Forbidden words include: derivative, rate of change, slope, integral, mean value theorem, intermediate value theorem, acceleration, velocity-as-derivative, critical point, tangent, secant, chain rule, power rule, related rates, polynomial, differentiate, calculus.
- Keep the problem solvable: the GIVEN together with the situation must pin down exactly which number(s) to find. At LOW difficulty, say outright what to find; at HIGH difficulty the question may be implied by the scene rather than asked directly (that is intended) — but a careful reader must still be able to infer precisely what to compute.
- Any distractor number you add must be clearly irrelevant flavor and must NOT equal — or be easily confused with — any answer option, any value the asked variable can take, the operative measurements, or the answer's units (e.g. never use 1, 2, 3, or 4 as flavor when the answer is one of 1–4, and never introduce a stray "thousands of dollars" amount in a thousands-of-dollars problem).
- For any blank that must be answered as an algebraic expression, the label MUST contain the explicit phrase "as an expression in x". Merely mentioning the letter x somewhere in the label is not enough.

TARGET DIFFICULTY — LEVEL 6 (direct): A terse, concrete word problem that asks directly for the answer with no extra context. Still NO distractions. Keep the GIVEN formula untouched and never hint at the numeric answer.

BASE TITLE: Cyclist ride
BASE PROMPT: A cyclist records the total distance ridden (in miles) after t hours. The total after t hours is given below. Consider the window from t = 1 to t = 3.

GIVEN (READ-ONLY — show exactly, do not change): f(t) = 2t^2 + 6t

ANSWER BLANKS (2, keep the same quantity and order):
1. how fast the total distance ridden changed on average between t = 1 and t = 3, in miles per hour (current label: "Average rate over the window (miles per hour)").
2. how fast the total distance ridden is changing right at t = 3, in miles per hour (current label: "Rate right at the end, t = 3 (miles per hour)").

Return JSON: {"title": string, "prompt": string, "fieldLabels": string[]} with EXACTLY 2 entries in fieldLabels, one per blank, in the same order.
```

### Level 7

```
You rewrite a real-world math word problem to a target difficulty by changing ONLY the wording. You never change the math, never alter the numbers, never reveal or solve the answer, and never change which quantity is being asked for. You only adjust how the problem is phrased. Output JSON only.

RULES:
- The GIVEN formula is shown to the student exactly as provided. Do not change it, restate it differently, or invent or alter any of its numbers. Likewise, every number already in the BASE PROMPT (measurements, the values a variable may take, rates) is part of the problem: reproduce each one exactly and never drop, round, or reword it.
- Keep the SAME quantity asked for each answer blank (its meaning is provided). Never solve it, never state the numeric answer, and never hint at the value.
- Use plain, everyday English only. NEVER use any math or operation name. Forbidden words include: derivative, rate of change, slope, integral, mean value theorem, intermediate value theorem, acceleration, velocity-as-derivative, critical point, tangent, secant, chain rule, power rule, related rates, polynomial, differentiate, calculus.
- Keep the problem solvable: the GIVEN together with the situation must pin down exactly which number(s) to find. At LOW difficulty, say outright what to find; at HIGH difficulty the question may be implied by the scene rather than asked directly (that is intended) — but a careful reader must still be able to infer precisely what to compute.
- Any distractor number you add must be clearly irrelevant flavor and must NOT equal — or be easily confused with — any answer option, any value the asked variable can take, the operative measurements, or the answer's units (e.g. never use 1, 2, 3, or 4 as flavor when the answer is one of 1–4, and never introduce a stray "thousands of dollars" amount in a thousands-of-dollars problem).
- For any blank that must be answered as an algebraic expression, the label MUST contain the explicit phrase "as an expression in x". Merely mentioning the letter x somewhere in the label is not enough.

TARGET DIFFICULTY — LEVEL 7 (implied operation): Ask for the everyday quantity itself instead of naming any operation (e.g. "bugs produced on day 7" rather than "how fast the bug count grows"). The question is still clearly stated, just in plain real-world terms. Add EXACTLY ONE realistic but irrelevant detail the student must ignore. Keep the GIVEN formula untouched and never hint at the numeric answer.

BASE TITLE: Cyclist ride
BASE PROMPT: A cyclist records the total distance ridden (in miles) after t hours. The total after t hours is given below. Consider the window from t = 1 to t = 3.

GIVEN (READ-ONLY — show exactly, do not change): f(t) = 2t^2 + 6t

ANSWER BLANKS (2, keep the same quantity and order):
1. how fast the total distance ridden changed on average between t = 1 and t = 3, in miles per hour.
2. how fast the total distance ridden is changing right at t = 3, in miles per hour.

The blank descriptions above exist ONLY so you know which value each blank wants and keep the math correct — they are NOT learner-facing. Write a fresh, plain label for each blank that names the everyday quantity and its units. Do NOT copy method-flavored wording from the descriptions (e.g. "how fast", "rate", "average", "exact", "at the end"), and never phrase a label as a command to compute.

Return JSON: {"title": string, "prompt": string, "fieldLabels": string[]} with EXACTLY 2 entries in fieldLabels, one per blank, in the same order.
```

### Level 8

```
You rewrite a real-world math word problem to a target difficulty by changing ONLY the wording. You never change the math, never alter the numbers, never reveal or solve the answer, and never change which quantity is being asked for. You only adjust how the problem is phrased. Output JSON only.

RULES:
- The GIVEN formula is shown to the student exactly as provided. Do not change it, restate it differently, or invent or alter any of its numbers. Likewise, every number already in the BASE PROMPT (measurements, the values a variable may take, rates) is part of the problem: reproduce each one exactly and never drop, round, or reword it.
- Keep the SAME quantity asked for each answer blank (its meaning is provided). Never solve it, never state the numeric answer, and never hint at the value.
- Use plain, everyday English only. NEVER use any math or operation name. Forbidden words include: derivative, rate of change, slope, integral, mean value theorem, intermediate value theorem, acceleration, velocity-as-derivative, critical point, tangent, secant, chain rule, power rule, related rates, polynomial, differentiate, calculus.
- Keep the problem solvable: the GIVEN together with the situation must pin down exactly which number(s) to find. At LOW difficulty, say outright what to find; at HIGH difficulty the question may be implied by the scene rather than asked directly (that is intended) — but a careful reader must still be able to infer precisely what to compute.
- Any distractor number you add must be clearly irrelevant flavor and must NOT equal — or be easily confused with — any answer option, any value the asked variable can take, the operative measurements, or the answer's units (e.g. never use 1, 2, 3, or 4 as flavor when the answer is one of 1–4, and never introduce a stray "thousands of dollars" amount in a thousands-of-dollars problem).
- For any blank that must be answered as an algebraic expression, the label MUST contain the explicit phrase "as an expression in x". Merely mentioning the letter x somewhere in the label is not enough.

TARGET DIFFICULTY — LEVEL 8 (implied operation): Phrase the ask as the concrete everyday quantity, never as a method, and a little less directly. Add EXACTLY ONE realistic but irrelevant number to filter out. Keep the GIVEN formula untouched and never hint at the numeric answer.

BASE TITLE: Cyclist ride
BASE PROMPT: A cyclist records the total distance ridden (in miles) after t hours. The total after t hours is given below. Consider the window from t = 1 to t = 3.

GIVEN (READ-ONLY — show exactly, do not change): f(t) = 2t^2 + 6t

ANSWER BLANKS (2, keep the same quantity and order):
1. how fast the total distance ridden changed on average between t = 1 and t = 3, in miles per hour.
2. how fast the total distance ridden is changing right at t = 3, in miles per hour.

The blank descriptions above exist ONLY so you know which value each blank wants and keep the math correct — they are NOT learner-facing. Write a fresh, plain label for each blank that names the everyday quantity and its units. Do NOT copy method-flavored wording from the descriptions (e.g. "how fast", "rate", "average", "exact", "at the end"), and never phrase a label as a command to compute.

Return JSON: {"title": string, "prompt": string, "fieldLabels": string[]} with EXACTLY 2 entries in fieldLabels, one per blank, in the same order.
```

### Level 9

```
You rewrite a real-world math word problem to a target difficulty by changing ONLY the wording. You never change the math, never alter the numbers, never reveal or solve the answer, and never change which quantity is being asked for. You only adjust how the problem is phrased. Output JSON only.

RULES:
- The GIVEN formula is shown to the student exactly as provided. Do not change it, restate it differently, or invent or alter any of its numbers. Likewise, every number already in the BASE PROMPT (measurements, the values a variable may take, rates) is part of the problem: reproduce each one exactly and never drop, round, or reword it.
- Keep the SAME quantity asked for each answer blank (its meaning is provided). Never solve it, never state the numeric answer, and never hint at the value.
- Use plain, everyday English only. NEVER use any math or operation name. Forbidden words include: derivative, rate of change, slope, integral, mean value theorem, intermediate value theorem, acceleration, velocity-as-derivative, critical point, tangent, secant, chain rule, power rule, related rates, polynomial, differentiate, calculus.
- Keep the problem solvable: the GIVEN together with the situation must pin down exactly which number(s) to find. At LOW difficulty, say outright what to find; at HIGH difficulty the question may be implied by the scene rather than asked directly (that is intended) — but a careful reader must still be able to infer precisely what to compute.
- Any distractor number you add must be clearly irrelevant flavor and must NOT equal — or be easily confused with — any answer option, any value the asked variable can take, the operative measurements, or the answer's units (e.g. never use 1, 2, 3, or 4 as flavor when the answer is one of 1–4, and never introduce a stray "thousands of dollars" amount in a thousands-of-dollars problem).
- For any blank that must be answered as an algebraic expression, the label MUST contain the explicit phrase "as an expression in x". Merely mentioning the letter x somewhere in the label is not enough.

TARGET DIFFICULTY — LEVEL 9 (implied operation): Point at the real-world quantity only loosely, with no hint of the underlying operation, so the student must recognize what is wanted. Include EXACTLY ONE realistic but irrelevant number to filter out. Keep the GIVEN formula untouched and never hint at the numeric answer.

BASE TITLE: Cyclist ride
BASE PROMPT: A cyclist records the total distance ridden (in miles) after t hours. The total after t hours is given below. Consider the window from t = 1 to t = 3.

GIVEN (READ-ONLY — show exactly, do not change): f(t) = 2t^2 + 6t

ANSWER BLANKS (2, keep the same quantity and order):
1. how fast the total distance ridden changed on average between t = 1 and t = 3, in miles per hour.
2. how fast the total distance ridden is changing right at t = 3, in miles per hour.

The blank descriptions above exist ONLY so you know which value each blank wants and keep the math correct — they are NOT learner-facing. Write a fresh, plain label for each blank that names the everyday quantity and its units. Do NOT copy method-flavored wording from the descriptions (e.g. "how fast", "rate", "average", "exact", "at the end"), and never phrase a label as a command to compute.

Return JSON: {"title": string, "prompt": string, "fieldLabels": string[]} with EXACTLY 2 entries in fieldLabels, one per blank, in the same order.
```

### Level 10

```
You rewrite a real-world math word problem to a target difficulty by changing ONLY the wording. You never change the math, never alter the numbers, never reveal or solve the answer, and never change which quantity is being asked for. You only adjust how the problem is phrased. Output JSON only.

RULES:
- The GIVEN formula is shown to the student exactly as provided. Do not change it, restate it differently, or invent or alter any of its numbers. Likewise, every number already in the BASE PROMPT (measurements, the values a variable may take, rates) is part of the problem: reproduce each one exactly and never drop, round, or reword it.
- Keep the SAME quantity asked for each answer blank (its meaning is provided). Never solve it, never state the numeric answer, and never hint at the value.
- Use plain, everyday English only. NEVER use any math or operation name. Forbidden words include: derivative, rate of change, slope, integral, mean value theorem, intermediate value theorem, acceleration, velocity-as-derivative, critical point, tangent, secant, chain rule, power rule, related rates, polynomial, differentiate, calculus.
- Keep the problem solvable: the GIVEN together with the situation must pin down exactly which number(s) to find. At LOW difficulty, say outright what to find; at HIGH difficulty the question may be implied by the scene rather than asked directly (that is intended) — but a careful reader must still be able to infer precisely what to compute.
- Any distractor number you add must be clearly irrelevant flavor and must NOT equal — or be easily confused with — any answer option, any value the asked variable can take, the operative measurements, or the answer's units (e.g. never use 1, 2, 3, or 4 as flavor when the answer is one of 1–4, and never introduce a stray "thousands of dollars" amount in a thousands-of-dollars problem).
- For any blank that must be answered as an algebraic expression, the label MUST contain the explicit phrase "as an expression in x". Merely mentioning the letter x somewhere in the label is not enough.

TARGET DIFFICULTY — LEVEL 10 (embedded scenario): Embed the ask inside a short real-world scenario and phrase it indirectly rather than asking outright. Include EXACTLY TWO realistic but irrelevant numbers the student must recognize and ignore. Keep the GIVEN formula untouched and never hint at the numeric answer.

BASE TITLE: Cyclist ride
BASE PROMPT: A cyclist records the total distance ridden (in miles) after t hours. The total after t hours is given below. Consider the window from t = 1 to t = 3.

GIVEN (READ-ONLY — show exactly, do not change): f(t) = 2t^2 + 6t

ANSWER BLANKS (2, keep the same quantity and order):
1. how fast the total distance ridden changed on average between t = 1 and t = 3, in miles per hour.
2. how fast the total distance ridden is changing right at t = 3, in miles per hour.

The blank descriptions above exist ONLY so you know which value each blank wants and keep the math correct — they are NOT learner-facing. Write a fresh, plain label for each blank that names the everyday quantity and its units. Do NOT copy method-flavored wording from the descriptions (e.g. "how fast", "rate", "average", "exact", "at the end"), and never phrase a label as a command to compute.

Return JSON: {"title": string, "prompt": string, "fieldLabels": string[]} with EXACTLY 2 entries in fieldLabels, one per blank, in the same order.
```

### Level 11

```
You rewrite a real-world math word problem to a target difficulty by changing ONLY the wording. You never change the math, never alter the numbers, never reveal or solve the answer, and never change which quantity is being asked for. You only adjust how the problem is phrased. Output JSON only.

RULES:
- The GIVEN formula is shown to the student exactly as provided. Do not change it, restate it differently, or invent or alter any of its numbers. Likewise, every number already in the BASE PROMPT (measurements, the values a variable may take, rates) is part of the problem: reproduce each one exactly and never drop, round, or reword it.
- Keep the SAME quantity asked for each answer blank (its meaning is provided). Never solve it, never state the numeric answer, and never hint at the value.
- Use plain, everyday English only. NEVER use any math or operation name. Forbidden words include: derivative, rate of change, slope, integral, mean value theorem, intermediate value theorem, acceleration, velocity-as-derivative, critical point, tangent, secant, chain rule, power rule, related rates, polynomial, differentiate, calculus.
- Keep the problem solvable: the GIVEN together with the situation must pin down exactly which number(s) to find. At LOW difficulty, say outright what to find; at HIGH difficulty the question may be implied by the scene rather than asked directly (that is intended) — but a careful reader must still be able to infer precisely what to compute.
- Any distractor number you add must be clearly irrelevant flavor and must NOT equal — or be easily confused with — any answer option, any value the asked variable can take, the operative measurements, or the answer's units (e.g. never use 1, 2, 3, or 4 as flavor when the answer is one of 1–4, and never introduce a stray "thousands of dollars" amount in a thousands-of-dollars problem).
- For any blank that must be answered as an algebraic expression, the label MUST contain the explicit phrase "as an expression in x". Merely mentioning the letter x somewhere in the label is not enough.

TARGET DIFFICULTY — LEVEL 11 (embedded scenario): Wrap the question in a brief scenario and ask only indirectly, so the student has to piece together what to compute. Weave in EXACTLY TWO realistic but irrelevant numbers to be ignored. Keep the GIVEN formula untouched and never hint at the numeric answer.

BASE TITLE: Cyclist ride
BASE PROMPT: A cyclist records the total distance ridden (in miles) after t hours. The total after t hours is given below. Consider the window from t = 1 to t = 3.

GIVEN (READ-ONLY — show exactly, do not change): f(t) = 2t^2 + 6t

ANSWER BLANKS (2, keep the same quantity and order):
1. how fast the total distance ridden changed on average between t = 1 and t = 3, in miles per hour.
2. how fast the total distance ridden is changing right at t = 3, in miles per hour.

The blank descriptions above exist ONLY so you know which value each blank wants and keep the math correct — they are NOT learner-facing. Write a fresh, plain label for each blank that names the everyday quantity and its units. Do NOT copy method-flavored wording from the descriptions (e.g. "how fast", "rate", "average", "exact", "at the end"), and never phrase a label as a command to compute.

Return JSON: {"title": string, "prompt": string, "fieldLabels": string[]} with EXACTLY 2 entries in fieldLabels, one per blank, in the same order.
```

### Level 12

```
You rewrite a real-world math word problem to a target difficulty by changing ONLY the wording. You never change the math, never alter the numbers, never reveal or solve the answer, and never change which quantity is being asked for. You only adjust how the problem is phrased. Output JSON only.

RULES:
- The GIVEN formula is shown to the student exactly as provided. Do not change it, restate it differently, or invent or alter any of its numbers. Likewise, every number already in the BASE PROMPT (measurements, the values a variable may take, rates) is part of the problem: reproduce each one exactly and never drop, round, or reword it.
- Keep the SAME quantity asked for each answer blank (its meaning is provided). Never solve it, never state the numeric answer, and never hint at the value.
- Use plain, everyday English only. NEVER use any math or operation name. Forbidden words include: derivative, rate of change, slope, integral, mean value theorem, intermediate value theorem, acceleration, velocity-as-derivative, critical point, tangent, secant, chain rule, power rule, related rates, polynomial, differentiate, calculus.
- Keep the problem solvable: the GIVEN together with the situation must pin down exactly which number(s) to find. At LOW difficulty, say outright what to find; at HIGH difficulty the question may be implied by the scene rather than asked directly (that is intended) — but a careful reader must still be able to infer precisely what to compute.
- Any distractor number you add must be clearly irrelevant flavor and must NOT equal — or be easily confused with — any answer option, any value the asked variable can take, the operative measurements, or the answer's units (e.g. never use 1, 2, 3, or 4 as flavor when the answer is one of 1–4, and never introduce a stray "thousands of dollars" amount in a thousands-of-dollars problem).
- For any blank that must be answered as an algebraic expression, the label MUST contain the explicit phrase "as an expression in x". Merely mentioning the letter x somewhere in the label is not enough.

TARGET DIFFICULTY — LEVEL 12 (embedded scenario): Set the ask inside a situation and barely point at it, making the student infer what to compute. Include EXACTLY TWO realistic but irrelevant numbers as distractors. Keep the GIVEN formula untouched and never hint at the numeric answer.

BASE TITLE: Cyclist ride
BASE PROMPT: A cyclist records the total distance ridden (in miles) after t hours. The total after t hours is given below. Consider the window from t = 1 to t = 3.

GIVEN (READ-ONLY — show exactly, do not change): f(t) = 2t^2 + 6t

ANSWER BLANKS (2, keep the same quantity and order):
1. how fast the total distance ridden changed on average between t = 1 and t = 3, in miles per hour.
2. how fast the total distance ridden is changing right at t = 3, in miles per hour.

The blank descriptions above exist ONLY so you know which value each blank wants and keep the math correct — they are NOT learner-facing. Write a fresh, plain label for each blank that names the everyday quantity and its units. Do NOT copy method-flavored wording from the descriptions (e.g. "how fast", "rate", "average", "exact", "at the end"), and never phrase a label as a command to compute.

Return JSON: {"title": string, "prompt": string, "fieldLabels": string[]} with EXACTLY 2 entries in fieldLabels, one per blank, in the same order.
```

### Level 13

```
You rewrite a real-world math word problem to a target difficulty by changing ONLY the wording. You never change the math, never alter the numbers, never reveal or solve the answer, and never change which quantity is being asked for. You only adjust how the problem is phrased. Output JSON only.

RULES:
- The GIVEN formula is shown to the student exactly as provided. Do not change it, restate it differently, or invent or alter any of its numbers. Likewise, every number already in the BASE PROMPT (measurements, the values a variable may take, rates) is part of the problem: reproduce each one exactly and never drop, round, or reword it.
- Keep the SAME quantity asked for each answer blank (its meaning is provided). Never solve it, never state the numeric answer, and never hint at the value.
- Use plain, everyday English only. NEVER use any math or operation name. Forbidden words include: derivative, rate of change, slope, integral, mean value theorem, intermediate value theorem, acceleration, velocity-as-derivative, critical point, tangent, secant, chain rule, power rule, related rates, polynomial, differentiate, calculus.
- Keep the problem solvable: the GIVEN together with the situation must pin down exactly which number(s) to find. At LOW difficulty, say outright what to find; at HIGH difficulty the question may be implied by the scene rather than asked directly (that is intended) — but a careful reader must still be able to infer precisely what to compute.
- Any distractor number you add must be clearly irrelevant flavor and must NOT equal — or be easily confused with — any answer option, any value the asked variable can take, the operative measurements, or the answer's units (e.g. never use 1, 2, 3, or 4 as flavor when the answer is one of 1–4, and never introduce a stray "thousands of dollars" amount in a thousands-of-dollars problem).
- For any blank that must be answered as an algebraic expression, the label MUST contain the explicit phrase "as an expression in x". Merely mentioning the letter x somewhere in the label is not enough.

TARGET DIFFICULTY — LEVEL 13 (implied story): Tell a short, vivid real-world story. Do NOT state the question outright — imply it so the student must realize what to compute. Weave in EXACTLY THREE plausible but irrelevant numbers in the flavor text. No signposting of any method. Keep each field label minimal — just the everyday quantity and its units — so the label does not restate the question the story is hiding. If the problem has more than one blank, keep each label short but still clearly distinct from the others (e.g. an "over the whole stretch" value versus an "at the final moment" value) so the blanks can never be confused. Keep the GIVEN formula untouched and never hint at the numeric answer.

BASE TITLE: Cyclist ride
BASE PROMPT: A cyclist records the total distance ridden (in miles) after t hours. The total after t hours is given below. Consider the window from t = 1 to t = 3.

GIVEN (READ-ONLY — show exactly, do not change): f(t) = 2t^2 + 6t

ANSWER BLANKS (2, keep the same quantity and order):
1. how fast the total distance ridden changed on average between t = 1 and t = 3, in miles per hour.
2. how fast the total distance ridden is changing right at t = 3, in miles per hour.

The blank descriptions above are for YOUR understanding only — never echo their wording. Give each blank the shortest plain label you can: the everyday quantity and its units, tied to the scene (e.g. "mph across the whole ride" vs "mph right at the finish"). Never name an operation ("how fast", "rate", and the like) and never write a label as an instruction ("write…", "find…"). Keep multiple labels clearly distinct from one another.

Return JSON: {"title": string, "prompt": string, "fieldLabels": string[]} with EXACTLY 2 entries in fieldLabels, one per blank, in the same order.
```

### Level 14

```
You rewrite a real-world math word problem to a target difficulty by changing ONLY the wording. You never change the math, never alter the numbers, never reveal or solve the answer, and never change which quantity is being asked for. You only adjust how the problem is phrased. Output JSON only.

RULES:
- The GIVEN formula is shown to the student exactly as provided. Do not change it, restate it differently, or invent or alter any of its numbers. Likewise, every number already in the BASE PROMPT (measurements, the values a variable may take, rates) is part of the problem: reproduce each one exactly and never drop, round, or reword it.
- Keep the SAME quantity asked for each answer blank (its meaning is provided). Never solve it, never state the numeric answer, and never hint at the value.
- Use plain, everyday English only. NEVER use any math or operation name. Forbidden words include: derivative, rate of change, slope, integral, mean value theorem, intermediate value theorem, acceleration, velocity-as-derivative, critical point, tangent, secant, chain rule, power rule, related rates, polynomial, differentiate, calculus.
- Keep the problem solvable: the GIVEN together with the situation must pin down exactly which number(s) to find. At LOW difficulty, say outright what to find; at HIGH difficulty the question may be implied by the scene rather than asked directly (that is intended) — but a careful reader must still be able to infer precisely what to compute.
- Any distractor number you add must be clearly irrelevant flavor and must NOT equal — or be easily confused with — any answer option, any value the asked variable can take, the operative measurements, or the answer's units (e.g. never use 1, 2, 3, or 4 as flavor when the answer is one of 1–4, and never introduce a stray "thousands of dollars" amount in a thousands-of-dollars problem).
- For any blank that must be answered as an algebraic expression, the label MUST contain the explicit phrase "as an expression in x". Merely mentioning the letter x somewhere in the label is not enough.

TARGET DIFFICULTY — LEVEL 14 (implied story): A short, vivid story where the question is implied, never asked directly, and pointed at even more faintly than level 13. Slip in EXACTLY THREE plausible but irrelevant numbers among the details. No method signposting at all. Keep each field label minimal — just the everyday quantity and its units — so the label does not restate the question the story is hiding. If the problem has more than one blank, keep each label short but still clearly distinct from the others (e.g. an "over the whole stretch" value versus an "at the final moment" value) so the blanks can never be confused. Keep the GIVEN formula untouched and never hint at the numeric answer.

BASE TITLE: Cyclist ride
BASE PROMPT: A cyclist records the total distance ridden (in miles) after t hours. The total after t hours is given below. Consider the window from t = 1 to t = 3.

GIVEN (READ-ONLY — show exactly, do not change): f(t) = 2t^2 + 6t

ANSWER BLANKS (2, keep the same quantity and order):
1. how fast the total distance ridden changed on average between t = 1 and t = 3, in miles per hour.
2. how fast the total distance ridden is changing right at t = 3, in miles per hour.

The blank descriptions above are for YOUR understanding only — never echo their wording. Give each blank the shortest plain label you can: the everyday quantity and its units, tied to the scene (e.g. "mph across the whole ride" vs "mph right at the finish"). Never name an operation ("how fast", "rate", and the like) and never write a label as an instruction ("write…", "find…"). Keep multiple labels clearly distinct from one another.

Return JSON: {"title": string, "prompt": string, "fieldLabels": string[]} with EXACTLY 2 entries in fieldLabels, one per blank, in the same order.
```

### Level 15

```
You rewrite a real-world math word problem to a target difficulty by changing ONLY the wording. You never change the math, never alter the numbers, never reveal or solve the answer, and never change which quantity is being asked for. You only adjust how the problem is phrased. Output JSON only.

RULES:
- The GIVEN formula is shown to the student exactly as provided. Do not change it, restate it differently, or invent or alter any of its numbers. Likewise, every number already in the BASE PROMPT (measurements, the values a variable may take, rates) is part of the problem: reproduce each one exactly and never drop, round, or reword it.
- Keep the SAME quantity asked for each answer blank (its meaning is provided). Never solve it, never state the numeric answer, and never hint at the value.
- Use plain, everyday English only. NEVER use any math or operation name. Forbidden words include: derivative, rate of change, slope, integral, mean value theorem, intermediate value theorem, acceleration, velocity-as-derivative, critical point, tangent, secant, chain rule, power rule, related rates, polynomial, differentiate, calculus.
- Keep the problem solvable: the GIVEN together with the situation must pin down exactly which number(s) to find. At LOW difficulty, say outright what to find; at HIGH difficulty the question may be implied by the scene rather than asked directly (that is intended) — but a careful reader must still be able to infer precisely what to compute.
- Any distractor number you add must be clearly irrelevant flavor and must NOT equal — or be easily confused with — any answer option, any value the asked variable can take, the operative measurements, or the answer's units (e.g. never use 1, 2, 3, or 4 as flavor when the answer is one of 1–4, and never introduce a stray "thousands of dollars" amount in a thousands-of-dollars problem).
- For any blank that must be answered as an algebraic expression, the label MUST contain the explicit phrase "as an expression in x". Merely mentioning the letter x somewhere in the label is not enough.

TARGET DIFFICULTY — LEVEL 15 (most implicit): Tell a short, vivid real-world story and never state the question outright — the student must infer entirely what to compute from the situation. Weave in EXACTLY THREE plausible but irrelevant numbers. No signposting whatsoever of the method. Keep each field label minimal — just the everyday quantity and its units — so the label does not restate the question the story is hiding. If the problem has more than one blank, keep each label short but still clearly distinct from the others (e.g. an "over the whole stretch" value versus an "at the final moment" value) so the blanks can never be confused. This is the most implicit level. Keep the GIVEN formula untouched and never hint at the numeric answer.

BASE TITLE: Cyclist ride
BASE PROMPT: A cyclist records the total distance ridden (in miles) after t hours. The total after t hours is given below. Consider the window from t = 1 to t = 3.

GIVEN (READ-ONLY — show exactly, do not change): f(t) = 2t^2 + 6t

ANSWER BLANKS (2, keep the same quantity and order):
1. how fast the total distance ridden changed on average between t = 1 and t = 3, in miles per hour.
2. how fast the total distance ridden is changing right at t = 3, in miles per hour.

The blank descriptions above are for YOUR understanding only — never echo their wording. Give each blank the shortest plain label you can: the everyday quantity and its units, tied to the scene (e.g. "mph across the whole ride" vs "mph right at the finish"). Never name an operation ("how fast", "rate", and the like) and never write a label as an instruction ("write…", "find…"). Keep multiple labels clearly distinct from one another.

Return JSON: {"title": string, "prompt": string, "fieldLabels": string[]} with EXACTLY 2 entries in fieldLabels, one per blank, in the same order.
```
