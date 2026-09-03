import { describe, it, expect } from 'vitest'
import { normalizeCountry } from '../src/utils/country.js'

describe('normalizeCountry', () => {
  it('collapses US spellings', () => {
    for (const v of ['US', 'us', 'USA', 'United States', 'united states of america', 'U.S.A.']) {
      expect(normalizeCountry(v)).toBe('US')
    }
  })

  it('collapses UK spellings to GB', () => {
    for (const v of ['UK', 'United Kingdom', 'GB', 'great britain']) {
      expect(normalizeCountry(v)).toBe('GB')
    }
  })

  it('passes unknown values through uppercased', () => {
    expect(normalizeCountry('br')).toBe('BR')
    expect(normalizeCountry('Narnia')).toBe('NARNIA')
  })

  it('returns null for blank input', () => {
    expect(normalizeCountry('')).toBeNull()
    expect(normalizeCountry('   ')).toBeNull()
    expect(normalizeCountry(null)).toBeNull()
    expect(normalizeCountry(undefined)).toBeNull()
  })
})
