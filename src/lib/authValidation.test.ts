import { describe, it, expect } from 'vitest'
import { isValidDisplayName, normalizeDisplayName } from './authValidation'

describe('normalizeDisplayName', () => {
  it('trims surrounding whitespace', () => {
    expect(normalizeDisplayName('  Ada  ')).toBe('Ada')
  })
})

describe('isValidDisplayName', () => {
  it('accepts a normal name', () => {
    expect(isValidDisplayName('Ada Lovelace')).toBe(true)
  })

  it('rejects empty and whitespace-only names', () => {
    expect(isValidDisplayName('')).toBe(false)
    expect(isValidDisplayName('     ')).toBe(false)
  })

  it('rejects names longer than 100 characters', () => {
    expect(isValidDisplayName('x'.repeat(100))).toBe(true)
    expect(isValidDisplayName('x'.repeat(101))).toBe(false)
  })
})
