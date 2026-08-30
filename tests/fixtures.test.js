import { describe, it, expect } from 'vitest'
import {
  getFixtureEdits,
  saveFixtureEdits,
  getMergedFixtures,
} from '../src/services/fixtures.js'

const osmEntry = {
  id: 'osm-node-1',
  fixtures: { toilets: 3, sink: true, paper_towels: null },
  baby_change: true,
}

describe('fixtures merge (user edits > source tags)', () => {
  it('returns all-null for an entry with no data', () => {
    const m = getMergedFixtures({ id: 'x', fixtures: {} })
    expect(m).toEqual({
      stalls: null, sink: null, paper_towels: null, changing_table: null, edited: false,
    })
  })

  it('shows source tags through when there are no edits', () => {
    const m = getMergedFixtures(osmEntry)
    expect(m.stalls).toBe(3)
    expect(m.sink).toBe(true)
    expect(m.changing_table).toBe(true) // from baby_change
    expect(m.edited).toBe(false)
  })

  it('user edits override source values', () => {
    saveFixtureEdits(osmEntry.id, { stalls: '5', paper_towels: 'no', changing_table: 'yes' })
    const m = getMergedFixtures(osmEntry)
    expect(m.stalls).toBe(5)
    expect(m.paper_towels).toBe(false)
    expect(m.sink).toBe(true) // untouched → source value survives
    expect(m.edited).toBe(true)
  })

  it('"don\'t know" (empty) fields never mask source data', () => {
    saveFixtureEdits(osmEntry.id, { stalls: '', sink: null, paper_towels: null, changing_table: null })
    expect(getFixtureEdits(osmEntry.id)).toBeNull() // all-empty edit clears the record
    const m = getMergedFixtures(osmEntry)
    expect(m.stalls).toBe(3)
    expect(m.edited).toBe(false)
  })

  it('clamps negative stall counts to zero', () => {
    saveFixtureEdits('y', { stalls: '-4' })
    expect(getFixtureEdits('y').stalls).toBe(0)
  })
})
