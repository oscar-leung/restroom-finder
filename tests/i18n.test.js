import { describe, it, expect } from 'vitest'
import { translate, setLocale, getLocale, LOCALES } from '../src/i18n/index.js'
import { STRINGS } from '../src/i18n/strings.js'

describe('i18n', () => {
  it('translates known keys per locale', () => {
    expect(translate('filter.free', null, 'en')).toBe('Free')
    expect(translate('filter.free', null, 'es')).toBe('Gratis')
    expect(translate('filter.free', null, 'ja')).toBe('無料')
  })

  it('interpolates {vars}', () => {
    expect(translate('map.viewAll', { n: 7 }, 'en')).toBe('View all 7 on map')
    expect(translate('hero.nth', { n: 3 }, 'de')).toBe('#3 NÄCHSTGELEGEN')
  })

  it('falls back to English for a locale gap, and to the key for unknown keys', () => {
    expect(translate('made.up.key', null, 'fr')).toBe('made.up.key')
  })

  it('every key has an English base string', () => {
    for (const [key, entry] of Object.entries(STRINGS)) {
      expect(entry.en, `missing en for ${key}`).toBeTruthy()
    }
  })

  it('every locale in the switcher has >90% coverage', () => {
    const keys = Object.keys(STRINGS)
    for (const { code } of LOCALES) {
      const covered = keys.filter((k) => STRINGS[k][code] !== undefined).length
      expect(covered / keys.length, `${code} coverage`).toBeGreaterThan(0.9)
    }
  })

  it('setLocale persists and rejects unknown codes', () => {
    setLocale('es')
    expect(getLocale()).toBe('es')
    setLocale('xx') // unsupported → ignored
    expect(getLocale()).toBe('es')
    setLocale('en')
  })
})
