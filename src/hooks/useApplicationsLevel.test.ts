import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

// Seams: AuthContext supplies the signed-in user; the applicationsLevel lib owns
// Firestore I/O. Mocking both keeps this a pure hook test (no real Firebase).
const { loadMock, saveMock, useAuthMock } = vi.hoisted(() => ({
  loadMock: vi.fn(),
  saveMock: vi.fn(),
  useAuthMock: vi.fn(),
}))

vi.mock('../contexts/AuthContext', () => ({
  useAuth: useAuthMock,
}))

vi.mock('../lib/applicationsLevel', () => ({
  loadApplicationsLevel: loadMock,
  saveApplicationsLevel: saveMock,
}))

// Imported after mocks are registered (vi.mock is hoisted regardless).
import { useApplicationsLevel } from './useApplicationsLevel'
import {
  INITIAL_STATE,
  levelFromRating,
  nextRating,
  type Outcome,
  type RatingState,
} from '../utils/applications/difficulty'

const WIN: Outcome = { solved: true, wrongAttempts: 0, skipped: false }
const LOSS: Outcome = { solved: false, wrongAttempts: 0, skipped: true }

beforeEach(() => {
  loadMock.mockReset()
  saveMock.mockReset()
  useAuthMock.mockReset()
  saveMock.mockResolvedValue(undefined)
})

describe('useApplicationsLevel: applyOutcome', () => {
  it('returns nextRating(prev, outcome) and raises the rating on a win', async () => {
    useAuthMock.mockReturnValue({ user: { uid: 'u1' } })
    const loaded: RatingState = { rating: 8, games: 3 }
    loadMock.mockResolvedValue(loaded)

    const { result } = renderHook(() => useApplicationsLevel())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.state).toEqual(loaded)

    const expected = nextRating(loaded, WIN)

    let returned: RatingState | undefined
    act(() => {
      returned = result.current.applyOutcome(WIN)
    })

    // The hook now RETURNS the freshly computed RatingState...
    expect(returned).toEqual(expected)
    // ...a win raises the rating...
    expect(returned!.rating).toBeGreaterThan(loaded.rating)
    // ...and the returned value matches what the hook surfaces.
    expect(result.current.state).toEqual(expected)
    expect(result.current.level).toBe(levelFromRating(expected.rating))
  })

  it('lowers the rating on a loss and returns the new state', async () => {
    useAuthMock.mockReturnValue({ user: { uid: 'u1' } })
    const loaded: RatingState = { rating: 8, games: 0 }
    loadMock.mockResolvedValue(loaded)

    const { result } = renderHook(() => useApplicationsLevel())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const expected = nextRating(loaded, LOSS)

    let returned: RatingState | undefined
    act(() => {
      returned = result.current.applyOutcome(LOSS)
    })

    expect(returned).toEqual(expected)
    expect(returned!.rating).toBeLessThan(loaded.rating)
    expect(result.current.state).toEqual(expected)
  })

  it('persists the returned state for a signed-in user', async () => {
    useAuthMock.mockReturnValue({ user: { uid: 'u1' } })
    const loaded: RatingState = { rating: 5, games: 2 }
    loadMock.mockResolvedValue(loaded)

    const { result } = renderHook(() => useApplicationsLevel())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const expected = nextRating(loaded, WIN)
    act(() => {
      result.current.applyOutcome(WIN)
    })

    await waitFor(() => expect(saveMock).toHaveBeenCalled())
    expect(saveMock).toHaveBeenCalledWith('u1', expected)
  })

  it('still returns the new state when signed out (no persistence attempted)', async () => {
    useAuthMock.mockReturnValue({ user: null })

    const { result } = renderHook(() => useApplicationsLevel())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.state).toEqual(INITIAL_STATE)

    const expected = nextRating(INITIAL_STATE, WIN)
    let returned: RatingState | undefined
    act(() => {
      returned = result.current.applyOutcome(WIN)
    })

    expect(returned).toEqual(expected)
    expect(saveMock).not.toHaveBeenCalled()
  })
})
