import { describe, it, expect } from 'vitest'
import {
  GUIDE_MAX_LEVEL,
  SCAFFOLD_MAX_LEVEL,
  resolveStepPrompt,
  visibleSteps,
  type ScenarioStep,
} from './scenarioTypes'

function step(id: string, tier: ScenarioStep['tier']): ScenarioStep {
  return { id, tier, kind: 'number', prompt: id, expected: 1 }
}

const STEPS: ScenarioStep[] = [
  step('guide', 'guide'),
  step('concept', 'core'),
  step('derive', 'scaffold'),
  step('final', 'core'),
]

describe('visibleSteps', () => {
  it('shows guide + scaffold + core in the explicit band (low levels)', () => {
    const ids = visibleSteps(STEPS, 1).map((s) => s.id)
    expect(ids).toEqual(['guide', 'concept', 'derive', 'final'])
  })

  it('drops guide steps just above the guide band', () => {
    const ids = visibleSteps(STEPS, GUIDE_MAX_LEVEL + 1).map((s) => s.id)
    expect(ids).toEqual(['concept', 'derive', 'final'])
  })

  it('keeps scaffold steps up to the scaffold ceiling', () => {
    const ids = visibleSteps(STEPS, SCAFFOLD_MAX_LEVEL).map((s) => s.id)
    expect(ids).toEqual(['concept', 'derive', 'final'])
  })

  it('drops scaffold steps in the story band, leaving only core', () => {
    const ids = visibleSteps(STEPS, SCAFFOLD_MAX_LEVEL + 1).map((s) => s.id)
    expect(ids).toEqual(['concept', 'final'])
    expect(visibleSteps(STEPS, 15).map((s) => s.id)).toEqual(['concept', 'final'])
  })

  it('never drops a core step at any level', () => {
    for (let lvl = 1; lvl <= 15; lvl++) {
      const ids = visibleSteps(STEPS, lvl).map((s) => s.id)
      expect(ids).toContain('concept')
      expect(ids).toContain('final')
    }
  })

  it('is monotonic: higher levels never show more steps', () => {
    let prev = Infinity
    for (let lvl = 1; lvl <= 15; lvl++) {
      const count = visibleSteps(STEPS, lvl).length
      expect(count).toBeLessThanOrEqual(prev)
      prev = count
    }
  })
})

describe('resolveStepPrompt', () => {
  it('returns a plain string prompt unchanged at every band', () => {
    expect(resolveStepPrompt('plain', 1)).toBe('plain')
    expect(resolveStepPrompt('plain', 9)).toBe('plain')
    expect(resolveStepPrompt('plain', 15)).toBe('plain')
  })

  it('uses the explicit variant in the explicit band, else base', () => {
    const p = { base: 'B', explicit: 'E', story: 'S' }
    expect(resolveStepPrompt(p, 1)).toBe('E')
    expect(resolveStepPrompt(p, 6)).toBe('E')
    expect(resolveStepPrompt(p, 9)).toBe('B') // implied band → base
  })

  it('uses the story variant in the story band', () => {
    const p = { base: 'B', story: 'S' }
    expect(resolveStepPrompt(p, 13)).toBe('S')
    expect(resolveStepPrompt(p, 15)).toBe('S')
    expect(resolveStepPrompt(p, 9)).toBe('B')
    expect(resolveStepPrompt(p, 1)).toBe('B') // no explicit variant → base
  })
})
