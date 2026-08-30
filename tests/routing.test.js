import { describe, it, expect } from 'vitest'
import { describeStep, stepArrow, bearing, bearingToCardinal } from '../src/services/routing.js'

describe('turn-by-turn humanizer', () => {
  it('describes the common maneuvers', () => {
    expect(describeStep({ type: 'depart' })).toBe('Head out')
    expect(describeStep({ type: 'arrive' })).toBe('Arrive')
    expect(describeStep({ type: 'turn', modifier: 'left' })).toBe('Turn left')
    expect(describeStep({ type: 'fork', modifier: 'right' })).toBe('At the fork, keep right')
    expect(describeStep({ type: 'continue', modifier: 'straight' })).toBe('Continue straight')
    expect(describeStep({ type: 'continue', modifier: 'slight left' })).toBe('Continue slight left')
    expect(describeStep({ type: 'roundabout' })).toBe('Take the roundabout')
  })

  it('maps modifiers to arrows with sensible fallbacks', () => {
    expect(stepArrow({ type: 'turn', modifier: 'left' })).toBe('←')
    expect(stepArrow({ type: 'arrive' })).toBe('🏁')
    expect(stepArrow({ type: 'depart' })).toBe('🚶')
    expect(stepArrow({ type: 'turn', modifier: 'weird' })).toBe('↑')
  })
})

describe('bearing', () => {
  it('points north/east/south/west for axis-aligned pairs', () => {
    expect(bearingToCardinal(bearing(0, 0, 1, 0))).toBe('N')
    expect(bearingToCardinal(bearing(0, 0, 0, 1))).toBe('E')
    expect(bearingToCardinal(bearing(1, 0, 0, 0))).toBe('S')
    expect(bearingToCardinal(bearing(0, 1, 0, 0))).toBe('W')
  })
})
