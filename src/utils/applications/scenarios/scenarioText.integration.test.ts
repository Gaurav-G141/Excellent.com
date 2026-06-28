/**
 * Guards against broken hyphen-joined phrases leaking into displayed scenario
 * text — e.g. a templating slip that renders "how-fast-it-grows" instead of
 * "how fast it grows". Scans every code-authored, learner-facing string across
 * all scenario topics, regenerated many times, at every difficulty band.
 */

import { describe, it, expect } from 'vitest'

import { SCENARIO_LESSONS } from './index'
import { resolveStepPrompt, visibleSteps } from '../scenarioTypes'
import type { ScenarioProblem } from '../scenarioTypes'

const TOPICS = SCENARIO_LESSONS.flatMap((g) => g.topics)

/** All learner-visible strings for a problem, across explicit/implied/story bands. */
function displayedStrings(p: ScenarioProblem): string[] {
  const out: string[] = [p.title, p.prompt]
  if (p.idealAnswer) out.push(p.idealAnswer)
  for (const lvl of [1, 6, 9, 13, 15]) {
    for (const s of visibleSteps(p.steps, lvl)) {
      out.push(resolveStepPrompt(s.prompt, lvl))
      for (const h of s.hints ?? []) out.push(h)
      if (s.kind === 'frq' && s.idealAnswer) out.push(s.idealAnswer)
    }
  }
  return out
}

// Three or more lowercase words joined by hyphens, e.g. "how-fast-it-grows".
// Legitimate copy uses at most a single hyphen ("hot-air", "real-world"), so a
// chain of two-plus hyphens is a strong signal of a broken templated phrase.
const BROKEN_HYPHEN_CHAIN = /[a-z]+-[a-z]+-[a-z]+/i

describe('scenario display text has no broken hyphen-joined phrases', () => {
  it('never contains the specific broken phrase "how-fast-it-grows"', () => {
    for (const topic of TOPICS) {
      for (let i = 0; i < 30; i++) {
        for (const s of displayedStrings(topic.generate())) {
          expect(s.toLowerCase()).not.toContain('how-fast-it-grows')
        }
      }
    }
  })

  it('never joins three or more words with hyphens in any band', () => {
    for (const topic of TOPICS) {
      for (let i = 0; i < 30; i++) {
        const p = topic.generate()
        for (const s of displayedStrings(p)) {
          const match = s.match(BROKEN_HYPHEN_CHAIN)
          expect(
            match,
            `broken hyphen phrase "${match?.[0]}" in ${topic.id}: "${s}"`,
          ).toBeNull()
        }
      }
    }
  })
})
