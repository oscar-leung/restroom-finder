import { describe, it, expect, vi } from 'vitest'
import { isOpenNow, formatHours } from '../src/utils/hours.js'

describe('isOpenNow', () => {
  it('handles the 24/7 fast path without the library', () => {
    expect(isOpenNow('24/7')).toEqual({ isOpen: true, knownStatus: true })
  })

  it('reports unknown for missing/blank values', () => {
    expect(isOpenNow(null).knownStatus).toBe(false)
    expect(isOpenNow('').knownStatus).toBe(false)
    expect(isOpenNow(undefined).knownStatus).toBe(false)
  })

  it('parses real opening_hours once the lazy library loads', async () => {
    // First call kicks the dynamic import and returns unknown
    isOpenNow('Mo-Su 00:00-24:00')
    await vi.waitFor(() => {
      expect(isOpenNow('Mo-Su 00:00-24:00', new Date()).knownStatus).toBe(true)
    }, { timeout: 5000 })
    expect(isOpenNow('Mo-Su 00:00-24:00').isOpen).toBe(true)
    // A window that can never be "now"
    const noon = new Date()
    noon.setHours(12, 0, 0, 0)
    expect(isOpenNow('Mo-Su 03:00-03:01', noon)).toEqual({ isOpen: false, knownStatus: true })
  })

  it('reports unknown for unparseable strings', async () => {
    isOpenNow('24/7') // ensure module path exercised
    await vi.waitFor(() => {
      expect(isOpenNow('Mo-Su 00:00-24:00').knownStatus).toBe(true)
    }, { timeout: 5000 })
    expect(isOpenNow('whenever the janitor feels like it').knownStatus).toBe(false)
  })
})

describe('formatHours', () => {
  it('special-cases 24/7', () => {
    expect(formatHours('24/7')).toBe('Open 24 hours')
  })

  it('expands day abbreviations', () => {
    expect(formatHours('Mo-Fr 09:00-17:00')).toBe('Mon-Fri 09:00-17:00')
    expect(formatHours('Sa,Su 10:00-16:00')).toBe('Sat,Sun 10:00-16:00')
  })

  it('returns null for empty input', () => {
    expect(formatHours(null)).toBeNull()
  })
})
