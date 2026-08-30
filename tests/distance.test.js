import { describe, it, expect } from 'vitest'
import { distanceMeters, formatDistance, setDistanceUnit } from '../src/utils/distance.js'

describe('distanceMeters', () => {
  it('is zero for identical points', () => {
    expect(distanceMeters(37.7749, -122.4194, 37.7749, -122.4194)).toBe(0)
  })

  it('matches the haversine value for a known pair', () => {
    // 0.01° of latitude ≈ 1111.9 m anywhere on Earth
    const d = distanceMeters(37.7749, -122.4194, 37.7849, -122.4194)
    expect(d).toBeGreaterThan(1100)
    expect(d).toBeLessThan(1125)
  })

  it('is symmetric', () => {
    const a = distanceMeters(37.7749, -122.4194, 40.7128, -74.006)
    const b = distanceMeters(40.7128, -74.006, 37.7749, -122.4194)
    expect(a).toBeCloseTo(b, 6)
  })
})

describe('formatDistance', () => {
  it('formats metric', () => {
    setDistanceUnit('metric')
    expect(formatDistance(240)).toMatch(/240\s?m/)
    expect(formatDistance(1500)).toMatch(/1\.5\s?km/)
  })

  it('formats imperial', () => {
    setDistanceUnit('imperial')
    const ft = formatDistance(100) // ≈ 328 ft
    expect(ft).toMatch(/ft/)
    const mi = formatDistance(3218) // ≈ 2 mi
    expect(mi).toMatch(/mi/)
  })
})
