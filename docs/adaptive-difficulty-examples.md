# Adaptive Difficulty — One Problem Across All 15 Levels

Purpose: see, side by side, how the *same* Applications problem reads at every
difficulty level (1–15), and how quickly a learner actually climbs through those
levels. This separates the two things that affect "how hard it feels":

1. **Wording range** — how different level 1 is from level 8 from level 15
   (driven by the saved fragments in
   [src/utils/applications/levelPrompts.ts](../src/utils/applications/levelPrompts.ts)).
2. **Progression speed** — how fast your rating moves you up the levels
   (driven by [src/utils/applications/difficulty.ts](../src/utils/applications/difficulty.ts)).

> These rewrites are **emulated** faithfully from the saved per-level prompts +
> `RULES_BLOCK` (live Gemini isn't callable from the build env). Real output
> varies in flavor but follows the same gradient, distractor budget, and rules.

---

## The base problem (fixed)

One concrete draw of the `a1-avg-inst` topic ("Savings balance" theme) from
[src/utils/applications/lesson1.ts](../src/utils/applications/lesson1.ts). The
math is **identical at every level** — only the wording changes:

- **Given (shown verbatim at every level):** `f(t) = 2t² + 6t`
- **Window:** `t = 1` to `t = 4`
- **Answer 1 (hidden):** average rate over the window = **16** thousands of dollars/month
- **Answer 2 (hidden):** rate right at `t = 4` = **22** thousands of dollars/month

The numbers `16` and `22` never appear in any prose below — the leakage guard
would reject a rewrite that printed them, and so would any distractor that
collides with the answers, the month values `1–4`, or the formula numbers.

For reference, the app's **raw generator output** (what shows if the AI rewrite
is off or fails) reads roughly like level 4–5 below:

> **Savings balance.** A saver records their balance (in thousands of dollars)
> after t months. The total after t months is given below. Consider the window
> from t = 1 to t = 4.
> `f(t) = 2t² + 6t`
> Blanks: *Average rate over the window (thousands of dollars per month)* ·
> *Rate right at the end, t = 4 (thousands of dollars per month)*

---

## Levels 1–15

Each level shows the rewritten **title**, **prompt**, the unchanged **given**,
and the two **answer blanks**, plus the distractor budget and what changed from
the level before.

### Level 1 — maximally explicit · 0 distractors

- **Title:** Two kinds of monthly growth in a savings balance
- **Prompt:** You are looking for two things. First, how fast the balance grew **on average** across the whole stretch from month 1 to month 4 — the average monthly growth over that window. Second, how fast it was growing at the **single instant** month 4 arrives. The balance is in thousands of dollars, and the formula below gives the balance after t months.
- **Given:** `f(t) = 2t² + 6t`
- **Blanks:** (1) Average monthly growth from month 1 to month 4 (thousands of dollars per month) · (2) Growth right at the moment month 4 arrives (thousands of dollars per month)
- *What changed:* baseline — goal spelled out twice, each quantity glossed in plain words.

### Level 2 — very explicit · 0 distractors

- **Title:** Average and final-moment growth
- **Prompt:** A saver's balance (in thousands of dollars) after t months follows the formula below. Across the window from month 1 to month 4, find the average monthly growth, and also find how fast the balance is growing right at month 4.
- **Given:** `f(t) = 2t² + 6t`
- **Blanks:** (1) Average monthly growth, months 1 to 4 (thousands of dollars per month) · (2) Growth at month 4 (thousands of dollars per month)
- *What changed:* still glosses the quantities, but drops the "you are looking for…" restatement.

### Level 3 — explicit · 0 distractors

- **Title:** Savings growth, two ways
- **Prompt:** A saver's balance (in thousands of dollars) after t months is given below, over the window from month 1 to month 4. Find the average monthly growth across the window and the growth rate right at month 4.
- **Given:** `f(t) = 2t² + 6t`
- **Blanks:** (1) Average monthly growth, months 1–4 (thousands of dollars per month) · (2) Growth at month 4 (thousands of dollars per month)
- *What changed:* no goal restatement and no gloss — just the plain ask.

### Level 4 — direct · 0 distractors

- **Title:** The saver's two numbers
- **Prompt:** A saver tracks their balance, in thousands of dollars, month by month; after t months it is given by the formula below. Over months 1 through 4, what is the average monthly growth, and how fast is the balance growing just as month 4 ends?
- **Given:** `f(t) = 2t² + 6t`
- **Blanks:** (1) Average monthly growth, months 1–4 (thousands of dollars/month) · (2) Growth as month 4 ends (thousands of dollars/month)
- *What changed:* ordinary word-problem framing; light everyday context, still asks straight out.

### Level 5 — direct · 0 distractors

- **Title:** Savings: average vs. final pace
- **Prompt:** A saver's balance (thousands of dollars) after t months follows the formula below. For months 1 to 4, give the average monthly growth and the growth right at month 4.
- **Given:** `f(t) = 2t² + 6t`
- **Blanks:** (1) Avg monthly growth, months 1–4 (thousands of dollars/month) · (2) Growth at month 4 (thousands of dollars/month)
- *What changed:* framing trimmed to the minimum.

### Level 6 — direct (terse) · 0 distractors

- **Title:** Two growth figures
- **Prompt:** Balance (thousands of dollars) after t months is below. Over months 1–4, give the average monthly growth and the growth at month 4.
- **Given:** `f(t) = 2t² + 6t`
- **Blanks:** (1) Average growth, months 1–4 (thousands of dollars/month) · (2) Growth at month 4 (thousands of dollars/month)
- *What changed:* no context at all — bare statement of what to find.

### Level 7 — implied operation · 1 distractor

- **Title:** Filling the savings cushion
- **Prompt:** A saver, who keeps the account at a credit union across town, watches their balance (in thousands of dollars) build up over the months; after t months it is given below. From month 1 to month 4, how many thousands of dollars did the cushion add per month on average, and how briskly was it still building right as month 4 closed?
- **Given:** `f(t) = 2t² + 6t`
- **Blanks:** (1) Average monthly build-up, months 1–4 (thousands of dollars per month) · (2) Build-up right as month 4 closes (thousands of dollars per month)
- *What changed:* asks for the everyday quantity ("how much it adds per month") instead of a "rate"; one irrelevant detail (the credit union).

### Level 8 — implied operation · 1 distractor

- **Title:** The growing cushion
- **Prompt:** A saver set up the account 9 months ago and has watched the balance (in thousands of dollars) climb; after t months it follows the formula below. Looking from month 1 to month 4, how much did the balance put on per month on average, and how fast was it still climbing as month 4 wrapped up?
- **Given:** `f(t) = 2t² + 6t`
- **Blanks:** (1) Average monthly gain, months 1–4 (thousands of dollars per month) · (2) Gain as month 4 wraps up (thousands of dollars per month)
- *What changed:* slightly less direct; the lone distractor is now a number ("9 months ago") to filter out.

### Level 9 — implied operation · 1 distractor

- **Title:** Watching the balance
- **Prompt:** After switching to a bank that pays out on the 15th of each month, a saver tracked the balance (in thousands of dollars), which after t months is given below. Between month 1 and month 4, how much did it tend to add per month, and how quickly was it adding right at month 4?
- **Given:** `f(t) = 2t² + 6t`
- **Blanks:** (1) Typical monthly addition, months 1–4 (thousands of dollars per month) · (2) Addition right at month 4 (thousands of dollars per month)
- *What changed:* the ask is only loosely pointed at ("how much it tends to add"); distractor "the 15th".

### Level 10 — embedded scenario · 2 distractors

- **Title:** Saving for the move
- **Prompt:** After landing a job 30 miles away, a graduate started banking part of each paycheck. Their balance (in thousands of dollars) after t months follows the formula below, and they reviewed it between calls from 5 prospective landlords. They want to know how the cushion filled per month on average from month 1 to month 4, and how fast it was still filling as the fourth month ended.
- **Given:** `f(t) = 2t² + 6t`
- **Blanks:** (1) Average monthly fill, months 1–4 (thousands of dollars per month) · (2) Fill rate as month 4 ends (thousands of dollars per month)
- *What changed:* the question lives inside a little scenario; two irrelevant numbers (30 miles, 5 landlords).

### Level 11 — embedded scenario · 2 distractors

- **Title:** The paycheck plan
- **Prompt:** A new hire, commuting 25 minutes each way, promised to set aside part of all 26 paychecks a year. Their balance in thousands of dollars after t months is given below. Thinking back over months 1 to 4, they wonder about the average monthly progress of the cushion and how strong that progress was just as month 4 finished.
- **Given:** `f(t) = 2t² + 6t`
- **Blanks:** (1) Average monthly progress, months 1–4 (thousands of dollars per month) · (2) Progress as month 4 finishes (thousands of dollars per month)
- *What changed:* more indirect ("they wonder about…"); distractors 25 minutes, 26 paychecks.

### Level 12 — embedded scenario · 2 distractors

- **Title:** Four months in
- **Prompt:** Some roommates split a flat while one of them, fresh into a job 40 minutes from home, quietly funneled money into savings. After selling 8 boxes of old textbooks, they kept watching the balance — in thousands of dollars after t months, laid out below. Four months in, they thought about how the savings had typically grown each month, and how that growth looked right at the end of the fourth month.
- **Given:** `f(t) = 2t² + 6t`
- **Blanks:** (1) Typical monthly growth, months 1–4 (thousands of dollars per month) · (2) Growth at the end of month 4 (thousands of dollars per month)
- *What changed:* you must infer what to compute from the situation; distractors 40 minutes, 8 boxes.

### Level 13 — implied story · 3 distractors

- **Title:** The first four months
- **Prompt:** Fresh out of school and splitting a flat with roommates, Priya finally started saving. Even after the 15-minute bus ride to work and clearing 40 promo emails from her bank app, she tucked money away from each paycheck, and her balance — in thousands of dollars after t months, as the formula below shows — kept climbing. By the close of the fourth month she sat down to take stock of how it had grown across those first four months, and of how strongly it was still growing at that final moment.
- **Given:** `f(t) = 2t² + 6t`
- **Blanks:** (1) Average over the four months (thousands of dollars per month) · (2) At the end of month 4 (thousands of dollars per month)
- *What changed:* a real story; the question is implied, not asked outright. Labels go minimal but stay distinct ("average over the stretch" vs "at the end"). Distractors 15, 40, 7 a.m.

### Level 14 — implied story · 3 distractors

- **Title:** Priya's ledger
- **Prompt:** Priya's flat was 5 floors up, a 20-minute walk from the office, and she still hadn't silenced the 9 reminder texts from her old bank. Each month a little more of her pay slid into savings, and the balance in thousands of dollars after t months ran exactly as the formula below. Closing out the fourth month, she pulled up the little ledger she'd kept since the very first one.
- **Given:** `f(t) = 2t² + 6t`
- **Blanks:** (1) Across months 1 to 4 (thousands of dollars per month) · (2) Right at month 4 (thousands of dollars per month)
- *What changed:* the question is never stated — only the ledger context and the two blanks imply it. Distractors 5 floors, 20 minutes, 9 texts.

### Level 15 — most implicit · 3 distractors

- **Title:** Four months of small deposits
- **Prompt:** By the time the fourth month rolled around, Priya's tiny apartment — 9 floors up, a 10-minute walk from the train, with 7 plants crowding the sill — had become the place where she finally kept a promise to herself. A slice of every paycheck disappeared into savings, and month after month the balance in thousands of dollars after t months traced the formula below. She thought back over the stretch since the very first month, and to where things stood at the latest one.
- **Given:** `f(t) = 2t² + 6t`
- **Blanks:** (1) Over the whole stretch (thousands of dollars per month) · (2) At the latest month (thousands of dollars per month)
- *What changed:* the student must infer *entirely* what to compute; no signposting at all. Labels are as minimal as possible while staying distinguishable. Distractors 9 floors, 10 minutes, 7 plants.

---

## Progression curve

> **⚠️ Temporary testing override active.** `difficulty.ts` currently sets
> `TEST_FIXED_STEPS = { up: 0.5, down: 0.4 }`, so every answer moves the rating by
> a flat **+0.5 on a correct answer / −0.4 on a wrong one** regardless of games
> played. The steps are deliberately asymmetric so the rating drifts toward the
> harder end of the learner's ability. The Applications tab also shows manual
> **Test level** buttons (1–15). The curve below describes the *real* Elo
> progression and applies again once `TEST_FIXED_STEPS` is set back to `null`
> (and the test controls are removed).

How fast does a learner move through those levels? Everyone starts at
`rating = 4` (level 4), and after each problem the rating moves by
`kFactor(games) · (score − 0.5)`, where:

- `kFactor(games) = 0.75 + 4.25 · e^(−games/8)` (big early, gentle later)
- score = `1.0` first-try solve · `0.6` solved after one wrong · `0.3` two+ wrong · `0.0` skipped/given up

### Best case — every problem solved on the first try (score 1.0)

| Problems solved | rating | level shown |
|---|---|---|
| start | 4.00 | 4 |
| 1 | 6.50 | 7 |
| 2 | 8.75 | 9 |
| 3 | 10.78 | 11 |
| 4 | 12.62 | 13 |
| 5 | 14.28 | 14 |
| 6 | 15.00 (capped) | 15 |

A flawless streak reaches the most implicit level in **6 problems** — that's the
fast end of the range.

### Realistic case — solved, but with one wrong attempt each time (score 0.6)

| Problems solved | rating | level shown |
|---|---|---|
| start | 4.00 | 4 |
| 1 | 4.50 | 5 |
| 2 | 4.95 | 5 |
| 3 | 5.36 | 5 |
| 4 | 5.72 | 6 |
| 5 | 6.06 | 6 |
| 7 | 6.63 | 7 |

When you're not nailing problems first try, you **stay in the plain 4–7 band**,
whose wording differs only subtly (levels 4–6 above are all "direct, no
distractions"). This is the most likely reason it "doesn't feel too noticeable."

### A miss or skip (score 0.0) pulls you back

- Early (games ≈ 0): about **−2.5** rating (e.g. 6.5 → 4.0) — one slip nearly resets the climb.
- Mid (games ≈ 8): about **−1.2**.
- Late (games ≈ 24+): about **−0.4** — barely a nudge once you've settled.

### Two timing details

- **One-problem display lag.** The app builds the next problem *ahead of time*
  (a one-ahead buffer), so a level change you earn now shows up on the problem
  *after* next, not immediately.
- **Levels 1–7 are intentionally plain.** The distinctive "story / implied"
  feel only starts around level 10. If your rating hovers in the single digits,
  you rarely see it.

---

## How to read this — diagnosis

- If **level 1 vs level 8 vs level 15 already look very different** to you (they
  should — compare the three prompts directly), then the subtle feel is a
  **progression** issue: with mixed results you linger in the plain 4–7 band and
  rarely reach the distinctive 10–15 wording. Levers: raise `INITIAL_RATING`,
  raise `K_MAX`/lengthen `TAU` so wins move you faster, or reward partial
  success more (the score table) in
  [src/utils/applications/difficulty.ts](../src/utils/applications/difficulty.ts).
- If **level 1 vs level 15 look too similar**, it's a **range** issue: widen the
  contrast between bands (more distractors / more implicit phrasing earlier) in
  `LEVEL_PROMPTS` in
  [src/utils/applications/levelPrompts.ts](../src/utils/applications/levelPrompts.ts).
- Most likely it's a bit of both: the low band is deliberately gentle *and* you
  spend most of your time there unless you string first-try wins together.

> Reminder: these are emulated examples. The shipped app sends the same saved
> prompts to Gemini, so live problems will vary in surface flavor but obey the
> same per-level rules, distractor budgets, and answer-protection guards shown
> here.
