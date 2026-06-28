/**
 * Integration coverage for ApplicationsPage: the page-level unlock gate AND the
 * newly-wired shared AppHeader (Interests link + Quadratic / Calculator tools +
 * Sign out) that now sits on this page alongside Home/Practice/Scrapbook/Interests.
 *
 * Gating mirrors TabNav: locked until "Rules of Derivatives" (derivative-rules)
 * is completed — completing only Lesson 1 (derivatives-basics) must NOT unlock it.
 * The heavy AI/Firestore seams are stubbed so the test exercises real page +
 * header wiring, not the network.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { APPLICATIONS_UNLOCK_LESSON } from '../utils/applications/scenarios'

// Drive the completed-lessons gate from each test.
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

// AuthContext is shared by the page AND AppHeader; one mock covers both.
const signOutMock = vi.fn()
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { uid: 'u1' }, signOut: signOutMock }),
}))

// Difficulty + interests hooks: settled, no Firestore.
vi.mock('../hooks/useApplicationsLevel', () => ({
  useApplicationsLevel: () => ({
    state: { rating: 1000, games: 0 },
    level: 5,
    loading: false,
    applyOutcome: () => ({ rating: 1000, games: 1 }),
    setLevelForTesting: () => ({ rating: 1000, games: 0 }),
  }),
}))
vi.mock('../hooks/useInterests', () => ({
  useInterests: () => ({ interests: [], loading: false, save: vi.fn() }),
}))

// AI / Firestore side-effect seams used by the page + buffer.
vi.mock('../utils/applications/aiThemes', () => ({ prefetchThemes: vi.fn() }))
vi.mock('../utils/applications/scenarioRewrite', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/applications/scenarioRewrite')>()
  // Identity rewrite (no model call); keep the real answer-value helper the card needs.
  return { ...actual, rewriteScenario: vi.fn((s: unknown) => Promise.resolve(s)) }
})
vi.mock('../lib/applicationsActivity', () => ({
  loadApplicationsActivity: vi.fn(() => Promise.resolve({})),
  recordApplicationsSeen: vi.fn(() => Promise.resolve()),
}))
vi.mock('../lib/stickers/trigger', () => ({
  loseStickers: vi.fn(() => Promise.resolve()),
  maybeSpawnSticker: vi.fn(() => Promise.resolve()),
}))

import ApplicationsPage from './ApplicationsPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <ApplicationsPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  lessonsState.current = { completed: new Set<string>(), loading: false }
  signOutMock.mockReset()
})

describe('ApplicationsPage: unlock gating', () => {
  it('uses the same unlock lesson as TabNav (derivative-rules)', () => {
    expect(APPLICATIONS_UNLOCK_LESSON).toBe('derivative-rules')
  })

  it('stays LOCKED when only Lesson 1 (derivatives-basics) is completed', () => {
    lessonsState.current = { completed: new Set(['derivatives-basics']), loading: false }
    renderPage()

    expect(screen.getByText(/applications are locked/i)).toBeInTheDocument()
    // The unlocked-only "Solved this session" counter must not be shown.
    expect(screen.queryByText(/solved this session/i)).not.toBeInTheDocument()
  })

  it('UNLOCKS once "Rules of Derivatives" (derivative-rules) is completed', async () => {
    lessonsState.current = {
      completed: new Set(['derivatives-basics', 'derivative-rules']),
      loading: false,
    }
    renderPage()

    await waitFor(() =>
      expect(screen.queryByText(/applications are locked/i)).not.toBeInTheDocument(),
    )
    expect(screen.getByText(/solved this session/i)).toBeInTheDocument()
  })

  it('shows a loading state (no lock flash) while progress is still loading', () => {
    lessonsState.current = { completed: new Set<string>(), loading: true }
    renderPage()

    expect(screen.getByText(/loading your progress/i)).toBeInTheDocument()
    expect(screen.queryByText(/applications are locked/i)).not.toBeInTheDocument()
  })
})

describe('ApplicationsPage: shared AppHeader is wired in', () => {
  it('renders the header tools + nav regardless of the lock state', () => {
    lessonsState.current = { completed: new Set(['derivatives-basics']), loading: false }
    renderPage()

    // AppHeader is present even on the locked page.
    expect(screen.getByRole('button', { name: 'Quadratic' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Calculator' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
    // Default header variant links to Interests.
    expect(screen.getByRole('link', { name: 'Interests' })).toHaveAttribute(
      'href',
      '/interests',
    )
  })

  it('opens the Calculator tool modal from the header on the unlocked page', async () => {
    lessonsState.current = {
      completed: new Set(['derivatives-basics', 'derivative-rules']),
      loading: false,
    }
    const user = userEvent.setup()
    renderPage()

    await waitFor(() =>
      expect(screen.queryByText(/applications are locked/i)).not.toBeInTheDocument(),
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Calculator' }))
    expect(screen.getByRole('dialog', { name: 'Calculator' })).toBeInTheDocument()
  })

  it('wires Sign out to the auth context', async () => {
    lessonsState.current = { completed: new Set(['derivatives-basics']), loading: false }
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /sign out/i }))
    expect(signOutMock).toHaveBeenCalledTimes(1)
  })
})
