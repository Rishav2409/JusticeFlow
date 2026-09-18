const { describe, it } = require('node:test');
const assert = require('node:assert');
const { calculateEligibility } = require('../src/rules/eligibilityEngine');

describe('Eligibility Engine', () => {
  const referenceDate = new Date('2026-09-18T00:00:00Z');

  it('1. should return ELIGIBLE_NOW when custody exceeds half threshold', () => {
    const offence = { max_imprisonment_years: 3, max_imprisonment_days: 0, death_or_life_exclusion: 0 };
    // 3 years * 365 = 1095 days. Half = 547 days.
    // 600 days ago from 2026-09-18 is roughly 2025-01-26
    const custodyStart = new Date(referenceDate.getTime() - 600 * 24 * 3600 * 1000).toISOString().split('T')[0];
    
    const caseData = { custodyStartDate: custodyStart, delayDays: 0, firstTimeOffender: false, multiplePendingCases: false };
    const res = calculateEligibility(caseData, offence, referenceDate);
    
    assert.strictEqual(res.status, 'ELIGIBLE_NOW');
    assert.strictEqual(res.thresholdType, 'ONE_HALF');
    assert.strictEqual(res.thresholdDays, 547);
  });

  it('2. should return NOT_YET_ELIGIBLE when below half threshold', () => {
    const offence = { max_imprisonment_years: 7, max_imprisonment_days: 0, death_or_life_exclusion: 0 };
    const custodyStart = new Date(referenceDate.getTime() - 200 * 24 * 3600 * 1000).toISOString().split('T')[0];
    
    const caseData = { custodyStartDate: custodyStart, delayDays: 0, firstTimeOffender: false, multiplePendingCases: false };
    const res = calculateEligibility(caseData, offence, referenceDate);
    
    assert.strictEqual(res.status, 'NOT_YET_ELIGIBLE');
    assert.ok(res.daysRemaining > 0);
  });

  it('3. should return ELIGIBLE_NOW for first-time offender at one-third threshold', () => {
    const offence = { max_imprisonment_years: 3, max_imprisonment_days: 0, death_or_life_exclusion: 0 };
    const custodyStart = new Date(referenceDate.getTime() - 400 * 24 * 3600 * 1000).toISOString().split('T')[0];
    
    const caseData = { custodyStartDate: custodyStart, delayDays: 0, firstTimeOffender: true, multiplePendingCases: false };
    const res = calculateEligibility(caseData, offence, referenceDate);
    
    assert.strictEqual(res.status, 'ELIGIBLE_NOW');
    assert.strictEqual(res.thresholdType, 'ONE_THIRD');
    assert.strictEqual(res.thresholdDays, 365);
  });

  it('4. should return NOT_YET_ELIGIBLE for first-time offender below one-third', () => {
    const offence = { max_imprisonment_years: 3, max_imprisonment_days: 0, death_or_life_exclusion: 0 };
    const custodyStart = new Date(referenceDate.getTime() - 100 * 24 * 3600 * 1000).toISOString().split('T')[0];
    
    const caseData = { custodyStartDate: custodyStart, delayDays: 0, firstTimeOffender: true, multiplePendingCases: false };
    const res = calculateEligibility(caseData, offence, referenceDate);
    
    assert.strictEqual(res.status, 'NOT_YET_ELIGIBLE');
  });

  it('5. should return EXCLUDED for death/life offences', () => {
    const offence = { max_imprisonment_years: 0, max_imprisonment_days: 0, death_or_life_exclusion: 1 };
    const custodyStart = new Date(referenceDate.getTime() - 100 * 24 * 3600 * 1000).toISOString().split('T')[0];
    
    const caseData = { custodyStartDate: custodyStart, delayDays: 0, firstTimeOffender: false, multiplePendingCases: false };
    const res = calculateEligibility(caseData, offence, referenceDate);
    
    assert.strictEqual(res.status, 'EXCLUDED');
    assert.ok(res.exclusions.length > 0);
  });

  it('6. should return EXCLUDED for multiple pending cases', () => {
    const offence = { max_imprisonment_years: 3, max_imprisonment_days: 0, death_or_life_exclusion: 0 };
    const custodyStart = new Date(referenceDate.getTime() - 100 * 24 * 3600 * 1000).toISOString().split('T')[0];
    
    const caseData = { custodyStartDate: custodyStart, delayDays: 0, firstTimeOffender: false, multiplePendingCases: true };
    const res = calculateEligibility(caseData, offence, referenceDate);
    
    assert.strictEqual(res.status, 'EXCLUDED');
  });

  it('7. should subtract accused-attributable delay from credited detention', () => {
    const offence = { max_imprisonment_years: 3, max_imprisonment_days: 0, death_or_life_exclusion: 0 };
    const custodyStart = new Date(referenceDate.getTime() - 600 * 24 * 3600 * 1000).toISOString().split('T')[0];
    
    const caseData = { custodyStartDate: custodyStart, delayDays: 100, firstTimeOffender: false, multiplePendingCases: false };
    const res = calculateEligibility(caseData, offence, referenceDate);
    
    assert.strictEqual(res.totalCustodyDays, 600);
    assert.strictEqual(res.creditedDetentionDays, 500);
  });

  it('8. should calculate correct threshold date', () => {
    const offence = { max_imprisonment_years: 3, max_imprisonment_days: 0, death_or_life_exclusion: 0 }; // threshold 547
    const custodyStart = '2024-01-01'; // Date: 2024-01-01T00:00:00Z
    
    const caseData = { custodyStartDate: custodyStart, delayDays: 10, firstTimeOffender: false, multiplePendingCases: false };
    const res = calculateEligibility(caseData, offence, referenceDate);
    
    // threshold = 547. delay = 10. total 557 days after 2024-01-01
    // 2024 is leap year, 366 days. 
    // Wait, let's just use JS Date for expected.
    const expectedObj = new Date('2024-01-01T00:00:00Z');
    expectedObj.setUTCDate(expectedObj.getUTCDate() + 10 + 547);
    const expected = expectedObj.toISOString().split('T')[0];

    assert.strictEqual(res.thresholdDate, expected);
  });

  it('9. should throw/return error for future custody date', () => {
    const offence = { max_imprisonment_years: 3, max_imprisonment_days: 0, death_or_life_exclusion: 0 };
    const caseData = { custodyStartDate: '2030-01-01', delayDays: 0, firstTimeOffender: false, multiplePendingCases: false };
    
    assert.throws(() => calculateEligibility(caseData, offence, referenceDate));
  });

  it('10. should throw/return error for negative delay days', () => {
    const offence = { max_imprisonment_years: 3, max_imprisonment_days: 0, death_or_life_exclusion: 0 };
    const caseData = { custodyStartDate: '2024-01-01', delayDays: -5, firstTimeOffender: false, multiplePendingCases: false };
    
    assert.throws(() => calculateEligibility(caseData, offence, referenceDate));
  });

  it('11. should throw/return error when delay days exceed total custody', () => {
    const offence = { max_imprisonment_years: 3, max_imprisonment_days: 0, death_or_life_exclusion: 0 };
    const caseData = { custodyStartDate: '2026-09-01', delayDays: 50, firstTimeOffender: false, multiplePendingCases: false };
    
    assert.throws(() => calculateEligibility(caseData, offence, referenceDate));
  });

  it('12. should include correct rule checks in result', () => {
    const offence = { max_imprisonment_years: 3, max_imprisonment_days: 0, death_or_life_exclusion: 0 };
    const custodyStart = new Date(referenceDate.getTime() - 600 * 24 * 3600 * 1000).toISOString().split('T')[0];
    
    const caseData = { custodyStartDate: custodyStart, delayDays: 0, firstTimeOffender: false, multiplePendingCases: false };
    const res = calculateEligibility(caseData, offence, referenceDate);
    
    assert.ok(res.ruleChecks.find(r => r.rule === 'No death/life imprisonment exclusion').passed);
    assert.ok(res.ruleChecks.find(r => r.rule === 'No multiple pending cases').passed);
    assert.ok(res.ruleChecks.find(r => r.rule === 'First-time offender').passed === false);
    assert.ok(res.ruleChecks.find(r => r.rule === 'Detention threshold crossed').passed);
  });
});
