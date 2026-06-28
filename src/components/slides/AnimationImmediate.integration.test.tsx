import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { NPowerXAnimationSlide } from './NPowerXAnimationSlide'
import { PolynomialPlaygroundSlide } from './PolynomialPlaygroundSlide'
import type { DemoSlide } from '../../types/lesson'

beforeEach(() => {
  vi.useFakeTimers()
})
afterEach(() => {
  vi.runOnlyPendingTimers()
  vi.useRealTimers()
})

/** Advance the fake clock one beat at a time so each setState commits and the
 *  next interval timer re-arms (a single big jump only fires the first timer). */
function beat(times: number, ms: number) {
  for (let i = 0; i < times; i++) {
    act(() => {
      vi.advanceTimersByTime(ms + 20)
    })
  }
}

const npxSlide: DemoSlide = {
  id: 'npx',
  type: 'demo',
  component: 'nPowerXAnimation',
  title: 'n^x',
  body: 'body',
  config: { base: 2 },
  ctaLabel: 'Continue',
}

describe('NPowerXAnimationSlide — first step is immediate, replay resets', () => {
  it('shows step 1 the instant Play is pressed, with no timer advance', () => {
    const { container } = render(<NPowerXAnimationSlide slide={npxSlide} onContinue={() => {}} />)
    // The "rewrite via e" note only renders at step >= 1.
    expect(container.querySelector('.npx-note')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /play/i }))
    expect(container.querySelector('.npx-note')).not.toBeNull()
  })

  it('replays from step 1 instantly after the animation has finished', () => {
    const { container } = render(<NPowerXAnimationSlide slide={npxSlide} onContinue={() => {}} />)

    fireEvent.click(screen.getByRole('button', { name: /play/i }))
    beat(2, 1400) // reach the punchline (step 3)
    expect(container.querySelector('.npx-result')).not.toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /play/i }))
    // Reset is synchronous: punchline gone, step-1 note shown again immediately.
    expect(container.querySelector('.npx-result')).toBeNull()
    expect(container.querySelector('.npx-note')).not.toBeNull()
  })
})

const playgroundSlide: DemoSlide = {
  id: 'pp',
  type: 'demo',
  component: 'polynomialPlayground',
  title: 'Playground',
  body: 'body',
  config: { maxDegree: 4, maxCoefficient: 100 },
  ctaLabel: 'Continue',
}

const RULE_LINE = /u′·v \+ u·v′/

function buildConstant(group: HTMLElement) {
  const q = within(group)
  fireEvent.click(q.getByRole('button', { name: 'digit 1' }))
  fireEvent.click(q.getByRole('button', { name: /add term/i }))
}

/** Number of revealed stage lines (1 at step 0, +1 per advanced step). */
function stageLines(container: HTMLElement) {
  return container.querySelectorAll('.cr-stage .cr-line').length
}

describe('PolynomialPlaygroundSlide — first step is immediate, replay resets', () => {
  it('shows the rule (step 1) the instant Play is pressed', () => {
    const { container } = render(
      <PolynomialPlaygroundSlide slide={playgroundSlide} onContinue={() => {}} />,
    )

    buildConstant(screen.getByRole('group', { name: 'u(x)' }))
    buildConstant(screen.getByRole('group', { name: 'v(x)' }))

    // Step 0: only the u(x)/v(x) line is in the stage.
    expect(stageLines(container)).toBe(1)
    fireEvent.click(screen.getByRole('button', { name: /play/i }))

    // The rule line is revealed immediately (no timer advance).
    expect(stageLines(container)).toBe(2)
    const stage = container.querySelector('.cr-stage') as HTMLElement
    expect(within(stage).getByText(RULE_LINE)).toBeInTheDocument()
  })

  it('replays from step 1 instantly after reaching the last step', () => {
    const { container } = render(
      <PolynomialPlaygroundSlide slide={playgroundSlide} onContinue={() => {}} />,
    )

    buildConstant(screen.getByRole('group', { name: 'u(x)' }))
    buildConstant(screen.getByRole('group', { name: 'v(x)' }))

    fireEvent.click(screen.getByRole('button', { name: /play/i }))
    beat(5, 1500) // advance through steps 2..5
    expect(container.querySelector('.cr-result')).not.toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /play/i }))
    // Reset is synchronous: result line gone, only the rule line visible again.
    expect(container.querySelector('.cr-result')).toBeNull()
    expect(stageLines(container)).toBe(2)
    const stage = container.querySelector('.cr-stage') as HTMLElement
    expect(within(stage).getByText(RULE_LINE)).toBeInTheDocument()
  })
})
