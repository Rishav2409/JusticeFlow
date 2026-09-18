function calculateEligibility(caseData, offenceData, referenceDate = new Date()) {
  const { custodyStartDate, delayDays = 0, firstTimeOffender, multiplePendingCases } = caseData;
  const custodyStart = new Date(custodyStartDate);
  
  if (custodyStart > referenceDate) {
    throw new Error('Custody start date cannot be in the future.');
  }
  
  if (delayDays < 0) {
    throw new Error('Delay days cannot be negative.');
  }

  if (!offenceData) {
    throw new Error('Offence data is required.');
  }

  const exclusions = [];
  let status = null;

  const ruleChecks = [
    { rule: 'No death/life imprisonment exclusion', passed: offenceData.death_or_life_exclusion === 0, detail: 'The offence specifies death or imprisonment for life as a possible punishment.' },
    { rule: 'No multiple pending cases', passed: !multiplePendingCases, detail: 'Multiple investigations, inquiries, trials, or cases are pending against the person.' }
  ];

  if (offenceData.death_or_life_exclusion === 1) {
    status = 'EXCLUDED';
    exclusions.push('The offence specifies death or imprisonment for life as a possible punishment. This case is excluded from screening under the configured Section 479 BNSS rule.');
  }
  
  if (multiplePendingCases) {
    status = 'EXCLUDED';
    exclusions.push('Multiple investigations, inquiries, trials, or cases are pending against the person. This case is excluded from screening under the configured Section 479 BNSS rule.');
  }

  // Calculate days
  // Use UTC to avoid timezone issues or just calendar days difference
  // Math.floor can sometimes be problematic with timezones if using getTime, but for this simple version it's okay, let's use UTC just in case.
  const timeDiff = referenceDate.getTime() - custodyStart.getTime();
  const totalCustodyDays = Math.floor(timeDiff / (1000 * 3600 * 24));
  
  if (delayDays > totalCustodyDays) {
    throw new Error('Delay days cannot exceed total custody days.');
  }

  const creditedDetentionDays = totalCustodyDays - delayDays;
  const maxImprisonmentDays = (offenceData.max_imprisonment_years * 365) + offenceData.max_imprisonment_days;
  
  const thresholdType = firstTimeOffender ? 'ONE_THIRD' : 'ONE_HALF';
  const thresholdFraction = firstTimeOffender ? (1/3) : (1/2);
  const thresholdDays = Math.floor(maxImprisonmentDays * thresholdFraction);

  let daysOverThreshold = 0;
  let daysRemaining = 0;

  if (status !== 'EXCLUDED') {
    if (creditedDetentionDays >= thresholdDays) {
      status = 'ELIGIBLE_NOW';
      daysOverThreshold = creditedDetentionDays - thresholdDays;
      ruleChecks.push({ rule: 'Detention threshold crossed', passed: true, detail: `Credited detention (${creditedDetentionDays} days) meets or exceeds threshold (${thresholdDays} days).` });
    } else {
      status = 'NOT_YET_ELIGIBLE';
      daysRemaining = thresholdDays - creditedDetentionDays;
      ruleChecks.push({ rule: 'Detention threshold crossed', passed: false, detail: `Credited detention (${creditedDetentionDays} days) is below threshold (${thresholdDays} days).` });
    }
  }

  ruleChecks.push({ rule: 'First-time offender', passed: !!firstTimeOffender, detail: firstTimeOffender ? 'First-time offender gets 1/3 threshold.' : 'Not a first-time offender (1/2 threshold).' });

  // Threshold date
  const thresholdDateObj = new Date(custodyStart.getTime());
  thresholdDateObj.setUTCDate(thresholdDateObj.getUTCDate() + delayDays + thresholdDays);
  const thresholdDate = thresholdDateObj.toISOString().split('T')[0];

  const reasons = [];
  reasons.push(`Total custody days: ${totalCustodyDays}`);
  reasons.push(`Delay days subtracted: ${delayDays}`);
  reasons.push(`Credited detention days: ${creditedDetentionDays}`);
  reasons.push(`Maximum imprisonment days for offence: ${maxImprisonmentDays}`);
  reasons.push(`Threshold type: ${thresholdType} (${thresholdDays} days)`);

  return {
    status,
    thresholdType: status === 'EXCLUDED' ? null : thresholdType,
    totalCustodyDays,
    delayDays,
    creditedDetentionDays,
    maxImprisonmentDays,
    thresholdDays,
    thresholdFraction: status === 'EXCLUDED' ? null : (firstTimeOffender ? '1/3' : '1/2'),
    daysOverThreshold,
    daysRemaining,
    thresholdDate,
    reasons,
    exclusions,
    ruleChecks,
    legalBasis: 'Section 479 BNSS',
    disclaimer: 'This prototype provides preliminary case screening based on configured statutory rules. It does not constitute legal advice, determine final entitlement to bail, or replace review by a qualified legal professional or competent court.',
    calculationMethod: 'Calendar days'
  };
}

module.exports = { calculateEligibility };
