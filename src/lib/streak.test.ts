import { describe, it, expect } from 'vitest'
import {
  dayKey,
  calendarDaysAgo,
  currentStreak,
  rollStreak,
  type StreakState,
} from './streak'

const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h)

describe('dayKey', () => {
  it('formats local date as YYYY-MM-DD', () => {
    expect(dayKey(at(2026, 6, 23))).toBe('2026-06-23')
    expect(dayKey(at(2026, 1, 5))).toBe('2026-01-05')
  })
})

describe('calendarDaysAgo', () => {
  it('counts whole calendar days regardless of time of day', () => {
    const now = at(2026, 6, 23, 1)
    expect(calendarDaysAgo(at(2026, 6, 23, 23).getTime(), now)).toBe(0)
    expect(calendarDaysAgo(at(2026, 6, 22, 1).getTime(), now)).toBe(1)
    expect(calendarDaysAgo(at(2026, 6, 20, 23).getTime(), now)).toBe(3)
  })
})

describe('currentStreak', () => {
  const now = at(2026, 6, 23)
  it('returns 0 when there is no usable state', () => {
    expect(currentStreak(null, now)).toBe(0)
    expect(currentStreak({ count: 0, lastActiveDate: null, longest: 0 }, now)).toBe(0)
  })
  it('keeps the streak when last active was today or yesterday', () => {
    expect(currentStreak({ count: 4, lastActiveDate: '2026-06-23', longest: 4 }, now)).toBe(4)
    expect(currentStreak({ count: 4, lastActiveDate: '2026-06-22', longest: 4 }, now)).toBe(4)
  })
  it('breaks the streak after a gap of more than one day', () => {
    expect(currentStreak({ count: 4, lastActiveDate: '2026-06-21', longest: 4 }, now)).toBe(0)
  })
})

describe('rollStreak', () => {
  const now = at(2026, 6, 23)
  const base: StreakState = { count: 5, lastActiveDate: '2026-06-22', longest: 7 }

  it('returns null when today is already recorded (idempotent)', () => {
    expect(rollStreak({ ...base, lastActiveDate: '2026-06-23' }, now)).toBeNull()
  })

  it('extends the streak when last active was yesterday', () => {
    expect(rollStreak(base, now)).toEqual({
      count: 6,
      lastActiveDate: '2026-06-23',
      longest: 7,
    })
  })

  it('resets to 1 after a gap, preserving the longest', () => {
    expect(rollStreak({ count: 5, lastActiveDate: '2026-06-20', longest: 7 }, now)).toEqual({
      count: 1,
      lastActiveDate: '2026-06-23',
      longest: 7,
    })
  })

  it('starts a streak at 1 with no prior activity', () => {
    expect(rollStreak({ count: 0, lastActiveDate: null, longest: 0 }, now)).toEqual({
      count: 1,
      lastActiveDate: '2026-06-23',
      longest: 1,
    })
  })

  it('raises the longest when the current run exceeds it', () => {
    const result = rollStreak({ count: 8, lastActiveDate: '2026-06-22', longest: 8 }, now)
    expect(result).toEqual({ count: 9, lastActiveDate: '2026-06-23', longest: 9 })
  })
})
