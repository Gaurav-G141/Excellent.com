import { describe, it, expect } from 'vitest'
import { isValidUserPatch, isValidProgressDoc } from './firestoreValidation'

describe('isValidProgressDoc', () => {
  it('accepts the exact shape the client writes', () => {
    expect(
      isValidProgressDoc({ currentSlideIndex: 3, lessonCompleted: false, updatedAt: 'ts' }),
    ).toBe(true)
    expect(isValidProgressDoc({ currentSlideIndex: 0, lessonCompleted: true })).toBe(true)
  })

  it('rejects extra / unknown keys (forged fields)', () => {
    expect(
      isValidProgressDoc({ currentSlideIndex: 0, lessonCompleted: true, isAdmin: true }),
    ).toBe(false)
  })

  it('rejects bad types and out-of-range indices', () => {
    expect(isValidProgressDoc({ currentSlideIndex: -1, lessonCompleted: false })).toBe(false)
    expect(isValidProgressDoc({ currentSlideIndex: 1.5, lessonCompleted: false })).toBe(false)
    expect(isValidProgressDoc({ currentSlideIndex: 99999, lessonCompleted: false })).toBe(false)
    expect(isValidProgressDoc({ currentSlideIndex: 0, lessonCompleted: 'yes' })).toBe(false)
    expect(isValidProgressDoc({ lessonCompleted: true })).toBe(false)
  })
})

describe('isValidUserPatch', () => {
  it('accepts a signup profile', () => {
    expect(
      isValidUserPatch({ displayName: 'Ada', email: 'a@b.com', createdAt: 'ts' }),
    ).toBe(true)
  })

  it('accepts a streak merge patch', () => {
    expect(
      isValidUserPatch({ streakCount: 5, lastActiveDate: '2026-06-23', longestStreak: 9 }),
    ).toBe(true)
  })

  it('rejects forged / out-of-range streaks', () => {
    expect(isValidUserPatch({ streakCount: 999999999 })).toBe(false)
    expect(isValidUserPatch({ streakCount: 5.5 })).toBe(false)
    expect(isValidUserPatch({ longestStreak: -1 })).toBe(false)
  })

  it('rejects unknown keys and empty / oversized display names', () => {
    expect(isValidUserPatch({ role: 'admin' })).toBe(false)
    expect(isValidUserPatch({ displayName: '' })).toBe(false)
    expect(isValidUserPatch({ displayName: 'x'.repeat(101) })).toBe(false)
  })

  it('rejects malformed lastActiveDate', () => {
    expect(isValidUserPatch({ lastActiveDate: '2026-06-23T00:00:00Z' })).toBe(false)
    expect(isValidUserPatch({ lastActiveDate: 20260623 })).toBe(false)
  })
})
