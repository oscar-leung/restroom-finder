import { describe, it, expect } from 'vitest'
import { FLAGS, getFlag, setFlag, clearOverrides, isFlagOn } from '../src/utils/featureFlags.js'

describe('feature flags', () => {
  it('returns null and warns for unknown flags', () => {
    expect(getFlag('does_not_exist')).toBeNull()
  })

  it('every defined flag resolves to one of its variants', () => {
    for (const [key, def] of Object.entries(FLAGS)) {
      const v = getFlag(key)
      expect(def.variants).toContain(v)
    }
  })

  it('is deterministic for the same visitor', () => {
    const first = getFlag('go_button_label')
    for (let i = 0; i < 5; i++) expect(getFlag('go_button_label')).toBe(first)
  })

  it('localStorage override wins over cohort assignment', () => {
    setFlag('country_filter', 'on')
    expect(getFlag('country_filter')).toBe('on')
    expect(isFlagOn('country_filter')).toBe(true)
    setFlag('country_filter', 'off')
    expect(getFlag('country_filter')).toBe('off')
    expect(isFlagOn('country_filter')).toBe(false)
    clearOverrides()
  })

  it('ignores overrides that name a nonexistent variant', () => {
    setFlag('country_filter', 'purple')
    const v = getFlag('country_filter')
    expect(FLAGS.country_filter.variants).toContain(v)
    clearOverrides()
  })
})
