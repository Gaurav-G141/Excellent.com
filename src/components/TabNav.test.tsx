import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { TabNav } from './TabNav'
import { APPLICATIONS_UNLOCK_LESSON } from '../utils/applications/scenarios'

// A controllable useCompletedLessons so each test drives the gating directly.
const { lessonsState } = vi.hoisted(() => ({
  lessonsState: {
    current: { completed: new Set<string>(), loading: false } as {
      completed: Set<string>
      loading: boolean
    },
  },
}))

vi.mock('../hooks/useCompletedLessons', () => ({
  useCompletedLessons: () => lessonsState.current,
}))

// Keep Practice gating isolated and deterministic for these tests.
vi.mock('../utils/practice', () => ({
  PRACTICE_LESSONS: [{ lessonId: 'limits-derivative', lessonTitle: 'Limits', topics: [] }],
}))

function renderNav() {
  return render(
    <MemoryRouter>
      <TabNav />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  lessonsState.current = { completed: new Set<string>(), loading: false }
})

describe('TabNav: Applications gating', () => {
  it('unlocks behind "Rules of Derivatives" specifically', () => {
    expect(APPLICATIONS_UNLOCK_LESSON).toBe('derivative-rules')
  })

  it('keeps Applications locked when only "derivatives-basics" is completed', () => {
    lessonsState.current = { completed: new Set(['derivatives-basics']), loading: false }
    renderNav()
    expect(screen.getByLabelText('Applications (locked)')).toBeInTheDocument()
  })

  it('unlocks Applications once "derivative-rules" is completed', () => {
    lessonsState.current = {
      completed: new Set(['derivatives-basics', 'derivative-rules']),
      loading: false,
    }
    renderNav()
    expect(screen.queryByLabelText('Applications (locked)')).not.toBeInTheDocument()
    // The plain (unlocked) Applications link is present.
    expect(screen.getByRole('link', { name: 'Applications' })).toBeInTheDocument()
  })

  it('does not show the lock while progress is still loading', () => {
    lessonsState.current = { completed: new Set<string>(), loading: true }
    renderNav()
    expect(screen.queryByLabelText('Applications (locked)')).not.toBeInTheDocument()
  })
})
