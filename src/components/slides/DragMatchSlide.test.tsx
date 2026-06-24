import { describe, it, expect } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { DragMatchSlide } from './DragMatchSlide'
import { lessons } from '../../lessons'
import type { DragMatchConfig, ProblemSlide } from '../../types/lesson'

const matchSlide = lessons['derivative-rules'].slides.find(
  (s) => s.component === 'dragMatch',
) as ProblemSlide
const { pairs } = matchSlide.config as unknown as DragMatchConfig

function chipByText(container: HTMLElement, text: string): HTMLButtonElement {
  const bank = container.querySelector('.match-bank') as HTMLElement
  const chip = Array.from(bank.querySelectorAll('button')).find((b) => b.textContent === text)
  if (!chip) throw new Error(`chip not found: ${text}`)
  return chip as HTMLButtonElement
}

describe('DragMatchSlide (L2S2)', () => {
  it('lights up the incorrect boxes in red after a wrong check', () => {
    const { container } = render(<DragMatchSlide slide={matchSlide} onCorrect={() => {}} />)
    const n = pairs.length

    // Assign every prompt a deliberately wrong chip (rotate answers by one).
    for (let i = 0; i < n; i++) {
      const prompt = container.querySelectorAll('.match-prompt')[i] as HTMLButtonElement
      fireEvent.click(prompt)
      fireEvent.click(chipByText(container, pairs[(i + 1) % n].answer))
    }

    fireEvent.click(screen.getByRole('button', { name: /check/i }))

    // Every prompt was wrong, so every slot should be flagged red.
    expect(container.querySelectorAll('.match-slot--wrong').length).toBe(n)
    expect(container.querySelectorAll('.match-prompt--wrong').length).toBe(n)
  })

  it('clears the red flags once a match is changed', () => {
    const { container } = render(<DragMatchSlide slide={matchSlide} onCorrect={() => {}} />)
    const n = pairs.length

    for (let i = 0; i < n; i++) {
      const prompt = container.querySelectorAll('.match-prompt')[i] as HTMLButtonElement
      fireEvent.click(prompt)
      fireEvent.click(chipByText(container, pairs[(i + 1) % n].answer))
    }
    fireEvent.click(screen.getByRole('button', { name: /check/i }))
    expect(container.querySelectorAll('.match-slot--wrong').length).toBe(n)

    // Re-selecting a prompt and reassigning clears the wrong styling.
    const firstPrompt = container.querySelectorAll('.match-prompt')[0] as HTMLButtonElement
    fireEvent.click(firstPrompt)
    fireEvent.click(chipByText(container, pairs[0].answer))
    expect(container.querySelectorAll('.match-slot--wrong').length).toBe(0)
  })
})
