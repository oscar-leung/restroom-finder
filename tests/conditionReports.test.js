import { describe, it, expect } from 'vitest'
import {
  reportCondition,
  getConditionWarning,
  getRecentReports,
  getPoints,
  isSuppressed,
  getSuppressedCount,
  clearSuppressed,
  REPORT_TYPES,
} from '../src/services/conditionReports.js'

describe('reportCondition', () => {
  it('stores the report and awards the type\'s points', () => {
    const res = reportCondition('b1', 'needs_supplies')
    expect(res.awarded).toBe(REPORT_TYPES.needs_supplies.points)
    expect(getRecentReports('b1')).toHaveLength(1)
    expect(getPoints().total).toBe(REPORT_TYPES.needs_supplies.points)
  })

  it('rate-limits the same type from the same visitor within 30 min', () => {
    reportCondition('b2', 'dirty')
    const second = reportCondition('b2', 'dirty')
    expect(second).toEqual({ rateLimited: true })
    expect(getRecentReports('b2')).toHaveLength(1)
  })

  it('allows different types back-to-back', () => {
    reportCondition('b3', 'dirty')
    const res = reportCondition('b3', 'out_of_order')
    expect(res.rateLimited).toBeUndefined()
    expect(getRecentReports('b3')).toHaveLength(2)
  })

  it('rejects unknown types and missing ids', () => {
    expect(reportCondition('b4', 'sparkling')).toBeNull()
    expect(reportCondition(null, 'clean')).toBeNull()
  })
})

describe('getConditionWarning', () => {
  it('is null with no reports or only positive ones', () => {
    expect(getConditionWarning('none')).toBeNull()
    reportCondition('c1', 'clean')
    expect(getConditionWarning('c1')).toBeNull()
  })

  it('returns the worst negative report', () => {
    reportCondition('c2', 'dirty')          // weight -1
    reportCondition('c2', 'out_of_order')   // weight -2
    const warn = getConditionWarning('c2')
    expect(warn.type).toBe('out_of_order')
    expect(warn.label).toBe(REPORT_TYPES.out_of_order.label)
  })

  it('a newer clean report clears the warning', () => {
    reportCondition('c3', 'dirty')
    expect(getConditionWarning('c3')).not.toBeNull()
    reportCondition('c3', 'clean') // newer positive → state improved
    expect(getConditionWarning('c3')).toBeNull()
  })
})

describe('not_here suppression', () => {
  it('reporting not_here suppresses the entry', () => {
    expect(isSuppressed('d1')).toBe(false)
    reportCondition('d1', 'not_here')
    expect(isSuppressed('d1')).toBe(true)
    expect(getSuppressedCount()).toBe(1)
  })

  it('clearSuppressed restores everything', () => {
    reportCondition('d2', 'not_here')
    reportCondition('d3', 'not_here')
    expect(getSuppressedCount()).toBe(2)
    clearSuppressed()
    expect(getSuppressedCount()).toBe(0)
    expect(isSuppressed('d2')).toBe(false)
  })
})
