import { describe, it, expect } from 'vitest'
import { evaluatePrereqAccess, isUnlockedByPrereq } from './lessonAccess'

describe('evaluatePrereqAccess', () => {
  it('unlocks lessons with no prerequisite', () => {
    expect(evaluatePrereqAccess(null, undefined)).toBe('unlocked')
    expect(evaluatePrereqAccess(null, false)).toBe('unlocked')
  })

  it('unlocks only when the prerequisite is completed', () => {
    expect(evaluatePrereqAccess('derivatives-basics', true)).toBe('unlocked')
  })

  it('locks when the prerequisite is incomplete or unknown (fail closed)', () => {
    expect(evaluatePrereqAccess('derivatives-basics', false)).toBe('locked')
    expect(evaluatePrereqAccess('derivatives-basics', undefined)).toBe('locked')
    expect(evaluatePrereqAccess('derivatives-basics', null)).toBe('locked')
  })
})

describe('isUnlockedByPrereq', () => {
  it('always unlocks the first lesson', () => {
    expect(isUnlockedByPrereq(false, false, false)).toBe(true)
  })

  it('unlocks when the previous lesson is completed', () => {
    expect(isUnlockedByPrereq(true, true, false)).toBe(true)
  })

  it('unlocks an already-completed lesson even if prev is not complete', () => {
    expect(isUnlockedByPrereq(true, false, true)).toBe(true)
  })

  it('locks when there is an incomplete prerequisite and self is incomplete', () => {
    expect(isUnlockedByPrereq(true, false, false)).toBe(false)
  })
})
