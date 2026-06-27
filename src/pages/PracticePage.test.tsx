import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PracticePage from './PracticePage'
import type { ProblemSlide } from '../types/lesson'

const { loadActivity, recordActivity } = vi.hoisted(() => ({
  loadActivity: vi.fn(),
  recordActivity: vi.fn(() => Promise.resolve()),
}))

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { uid: 'u1' }, signOut: vi.fn() }),
}))

vi.mock('../hooks/useCompletedLessons', () => ({
  useCompletedLessons: () => ({ completed: new Set(['L1']), loading: false }),
}))

vi.mock('../lib/practiceActivity', () => ({
  loadPracticeActivity: loadActivity,
  recordPracticeActivity: recordActivity,
}))

vi.mock('../lib/applicationsActivity', () => ({
  loadApplicationsActivity: vi.fn(() => Promise.resolve({})),
}))

vi.mock('../lib/progress', () => ({
  loadAllLessonProgress: vi.fn(() => Promise.resolve({})),
}))

vi.mock('../utils/applications', () => ({
  APPLICATION_LESSONS: [],
}))

function mc(id: string): ProblemSlide {
  return {
    id,
    type: 'problem',
    component: 'multipleChoice',
    title: 'Q',
    body: '',
    config: { prompt: 'Pick', options: ['no', 'yes'], correctIndex: 1 },
    feedback: { correct: '', wrong: '' },
    attempts: 'unlimited',
  }
}

vi.mock('../utils/practice', () => ({
  PRACTICE_LESSONS: [
    {
      lessonId: 'L1',
      lessonTitle: 'Limits',
      topics: [
        { id: 't-a', label: 'Topic A', generate: () => mc('t-a') },
        { id: 't-b', label: 'Topic B', generate: () => mc('t-b') },
      ],
    },
  ],
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <PracticePage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  loadActivity.mockReset()
  recordActivity.mockClear()
})

describe('PracticePage review panel', () => {
  it('shows "Worth reviewing" for never-practiced topics', async () => {
    loadActivity.mockResolvedValue({})
    renderPage()

    expect(await screen.findByText(/worth reviewing/i)).toBeInTheDocument()
    // Both unlocked topics surface as review chips (never studied => due).
    const chips = await screen.findAllByText('Not studied yet')
    expect(chips).toHaveLength(2)
  })

  it('hides the panel once every unlocked topic is fresh', async () => {
    const now = Date.now()
    loadActivity.mockResolvedValue({ 't-a': now, 't-b': now })
    renderPage()

    // The panel may flash while activity loads ({} initial state), then hides.
    await waitFor(() => {
      expect(screen.queryByText(/worth reviewing/i)).not.toBeInTheDocument()
    })
  })
})
