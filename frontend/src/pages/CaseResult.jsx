import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { caseService } from '../services/api';

const CaseResult = () => {
  const { id } = useParams();

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    caseService.getById(id)
      .then(data => setCaseData(data))
      .catch(err =>
        setError(
          err.response?.data?.error ||
          'Failed to load case data'
        )
      )
      .finally(() => setLoading(false));
  }, [id]);

  /* =========================
     LOADING STATE
     ========================= */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">

        <div className="text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#E8D5C4] border-t-[#C65A16]">
          </div>

          <p className="text-base font-medium text-[#5E4B40]">
            Loading case details...
          </p>

          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#806F64]">
            JusticeFlow
          </p>

        </div>

      </div>
    );
  }


  /* =========================
     ERROR STATE
     ========================= */

  if (error) {
    return (
      <div className="mx-auto max-w-3xl py-16">

        <div className="rounded-xl border border-[#E4B7B7] bg-[#FFF0F0] p-7 text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white border border-[#E4B7B7] text-[#B94343] text-lg">
            ⚠
          </div>

          <h2 className="mt-4 text-xl font-semibold text-[#2B170D]">
            Unable to load case
          </h2>

          <p className="mt-2 text-base text-[#A63D3D]">
            {error}
          </p>

          <Link
            to="/cases"
            className="mt-6 inline-flex rounded-lg bg-[#C65A16] px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-[#E06B1F]"
          >
            Back to Cases
          </Link>

        </div>

      </div>
    );
  }


  /* =========================
     CASE NOT FOUND
     ========================= */

  if (!caseData) {
    return (
      <div className="py-16 text-center">

        <p className="text-xl font-semibold text-[#2B170D]">
          Case not found
        </p>

        <Link
          to="/cases"
          className="mt-4 inline-flex text-base font-medium text-[#C65A16] hover:text-[#E06B1F]"
        >
          ← Back to All Cases
        </Link>

      </div>
    );
  }


  /* =========================
     RESULT DATA
     ========================= */

  const result = caseData.eligibility_result || {};
  const status = result.status;


  /* =========================
     STATUS THEME
     ========================= */

  let statusTheme = {
    container: 'border-[#D8B9A0] bg-[#FFF9F5]',
    icon: 'bg-white border-[#D8B9A0] text-[#806F64]',
    iconText: '•',
    label: 'SCREENING RESULT',
    title: 'SCREENING RESULT',
    subtitle: '',
    accent: '#806F64',
  };


  if (status === 'ELIGIBLE_NOW') {

    statusTheme = {
      container: 'border-[#BBD8C3] bg-[#EEF7F0]',
      icon: 'bg-white border-[#BBD8C3] text-[#4F8A62]',
      iconText: '✓',
      label: 'REVIEW FLAG',
      title: 'POTENTIALLY ELIGIBLE',
      subtitle: `Threshold crossed by ${result.daysOverThreshold} days`,
      accent: '#4F8A62',
    };

  } else if (
    status === 'NOT_YET_ELIGIBLE' &&
    result.daysRemaining <= 30
  ) {

    statusTheme = {
      container: 'border-[#E7C98F] bg-[#FFF6E8]',
      icon: 'bg-white border-[#E7C98F] text-[#B97820]',
      iconText: '!',
      label: 'REVIEW FLAG',
      title: 'APPROACHING THRESHOLD',
      subtitle: `Estimated ${result.daysRemaining} days remaining`,
      accent: '#B97820',
    };

  } else if (status === 'NOT_YET_ELIGIBLE') {

    statusTheme = {
      container: 'border-[#E4B7B7] bg-[#FFF0F0]',
      icon: 'bg-white border-[#E4B7B7] text-[#B94343]',
      iconText: '!',
      label: 'SCREENING STATUS',
      title: 'NOT CURRENTLY ELIGIBLE',
      subtitle: `Estimated ${result.daysRemaining} days remaining`,
      accent: '#B94343',
    };

  } else if (status === 'EXCLUDED') {

    statusTheme = {
      container: 'border-[#E4B7B7] bg-[#FFF0F0]',
      icon: 'bg-white border-[#E4B7B7] text-[#B94343]',
      iconText: '×',
      label: 'SCREENING STATUS',
      title: 'EXCLUDED FROM THIS RULE',
      subtitle:
        result.exclusions?.join(' ') ||
        'Excluded based on the configured rule',
      accent: '#B94343',
    };
  }


  /* =========================
     FORMAT MAX PUNISHMENT
     ========================= */

  const formatMaxPunishment = () => {

    if (caseData.death_or_life_exclusion === 1) {
      return 'Death / Life imprisonment';
    }

    const years = caseData.max_imprisonment_years || 0;
    const days = caseData.max_imprisonment_days || 0;

    if (years > 0 && days > 0) {
      return `${years} years, ${days} days`;
    }

    if (years > 0) {
      return `${years} years`;
    }

    if (days > 0) {
      return `${days} days`;
    }

    return 'N/A';
  };


  /* =========================
     STATUS DESCRIPTION
     ========================= */

  const statusDescription =
    status === 'ELIGIBLE_NOW'
      ? 'The configured screening threshold has been crossed. Further legal review is required.'
      : status === 'NOT_YET_ELIGIBLE' && result.daysRemaining <= 30
        ? 'The case is approaching the configured statutory threshold and may warrant timely review.'
        : status === 'NOT_YET_ELIGIBLE'
          ? 'The credited custody period has not yet reached the configured screening threshold.'
          : status === 'EXCLUDED'
            ? 'One or more configured exclusion conditions apply to this preliminary screening.'
            : 'Review the calculated result and configured rule checks below.';


  return (
    <div className="mx-auto max-w-5xl space-y-6">


      {/* =========================================================
          TOP NAVIGATION
      ========================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <Link
          to="/cases"
          className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#806F64] transition-colors hover:text-[#C65A16]"
        >
          <span className="text-lg">
            ←
          </span>

          Back to All Cases
        </Link>


        <Link
          to="/add-case"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#D8B9A0] bg-white px-4 py-2.5 text-sm font-semibold text-[#5E4B40] transition-all hover:border-[#C65A16] hover:bg-[#FFF4EC] hover:text-[#C65A16]"
        >
          <span className="text-lg">
            ＋
          </span>

          New Case
        </Link>

      </div>


      {/* =========================================================
          PAGE TITLE
      ========================================================== */}

      <div className="border-b border-[#E8D5C4] pb-6">

        <div className="flex items-center gap-3">

          <div className="h-1 w-12 rounded-full bg-[#C65A16]">
          </div>

          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C65A16]">
            Screening Report
          </span>

        </div>


        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#2B170D]">
              Case Screening Result
            </h1>

            <p className="mt-2 text-base text-[#5E4B40]">
              Preliminary statutory screening based on configured rules
            </p>

          </div>


          <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[#806F64]">
            Case #{caseData.case_number}
          </span>

        </div>

      </div>


      {/* =========================================================
          STATUS HERO
      ========================================================== */}

      <section
        className={`overflow-hidden rounded-2xl border ${statusTheme.container}`}
      >

        <div className="p-6 sm:p-8">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

            <div
              className={`flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl border text-3xl font-bold ${statusTheme.icon}`}
            >
              {statusTheme.iconText}
            </div>


            <div className="min-w-0">

              <p
                className="text-xs font-bold uppercase tracking-[0.2em]"
                style={{ color: statusTheme.accent }}
              >
                {statusTheme.label}
              </p>


              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#2B170D] sm:text-3xl">
                {statusTheme.title}
              </h2>


              <p className="mt-2 text-base text-[#5E4B40]">
                {statusTheme.subtitle}
              </p>

            </div>

          </div>


          <div className="mt-6 border-t border-black/10 pt-5">

            <p className="max-w-3xl text-sm leading-relaxed text-[#5E4B40]">
              {statusDescription}
            </p>

          </div>

        </div>


        {/* Status Footer */}

        <div className="border-t border-black/10 bg-white/50 px-6 py-3 sm:px-8">

          <div className="flex items-center gap-2">

            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: statusTheme.accent }}
            >
            </span>

            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E4B40]">
              Lawyer review required
            </span>

          </div>

        </div>

      </section>


      {/* =========================================================
          CASE SUMMARY
      ========================================================== */}

      <section className="overflow-hidden rounded-xl border border-[#D8B9A0] bg-white shadow-sm">

        <div className="border-b border-[#E8D5C4] bg-[#FFF9F5] px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFF4EC] text-sm font-bold text-[#C65A16]">
              01
            </div>

            <div>

              <h3 className="text-xl font-semibold text-[#2B170D]">
                Case Summary
              </h3>

              <p className="mt-0.5 text-sm text-[#806F64]">
                Identifying information associated with this screening
              </p>

            </div>

          </div>

        </div>


        <div className="grid grid-cols-1 gap-px bg-[#E8D5C4] sm:grid-cols-2 lg:grid-cols-3">


          {/* Case ID */}

          <div className="bg-white p-5">

            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#806F64]">
              Case ID
            </p>

            <p className="mt-2 text-base font-semibold text-[#2B170D]">
              {caseData.case_number}
            </p>

          </div>


          {/* Applicant */}

          <div className="bg-white p-5">

            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#806F64]">
              Applicant
            </p>

            <p className="mt-2 text-base font-semibold text-[#2B170D]">
              {caseData.prisoner_name}
            </p>

          </div>


          {/* Custody Start */}

          <div className="bg-white p-5">

            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#806F64]">
              Custody Start
            </p>

            <p className="mt-2 text-base font-semibold text-[#2B170D]">
              {caseData.custody_start_date}
            </p>

          </div>


          {/* Offence */}

          <div className="bg-white p-5 sm:col-span-2">

            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#806F64]">
              Offence
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2">

              <span className="rounded-md bg-[#C65A16] px-2.5 py-1 text-xs font-bold text-white">
                {caseData.law_code}
              </span>

              <span className="text-sm font-semibold text-[#5E4B40]">
                Section {caseData.section}
              </span>

              <span className="hidden text-[#D8B9A0] sm:inline">
                —
              </span>

              <span className="text-base text-[#2B170D]">
                {caseData.offence_name}
              </span>

            </div>

          </div>


          {/* FIR / District */}

          <div className="bg-white p-5">

            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#806F64]">
              FIR / District
            </p>

            <p className="mt-2 text-base font-semibold text-[#2B170D]">

              {caseData.fir_number || 'N/A'}

              <span className="mx-2 text-[#D8B9A0]">
                /
              </span>

              {caseData.district || 'N/A'}

            </p>

          </div>


          {/* Court + Lawyer */}

          <div className="bg-white p-5 sm:col-span-2 lg:col-span-3">

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#806F64]">
                  Court
                </p>

                <p className="mt-2 text-base font-medium text-[#5E4B40]">
                  {caseData.court || 'N/A'}
                </p>

              </div>


              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#806F64]">
                  Assigned Lawyer
                </p>

                <p className="mt-2 text-base font-medium text-[#5E4B40]">
                  {caseData.lawyer || 'N/A'}
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================================
          CALCULATION BREAKDOWN
      ========================================================== */}

      {status !== 'EXCLUDED' && (

        <section className="overflow-hidden rounded-xl border border-[#D8B9A0] bg-white shadow-sm">

          <div className="border-b border-[#E8D5C4] bg-[#FFF9F5] px-6 py-5">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFF4EC] text-sm font-bold text-[#C65A16]">
                02
              </div>

              <div>

                <h3 className="text-xl font-semibold text-[#2B170D]">
                  Calculation Breakdown
                </h3>

                <p className="mt-0.5 text-sm text-[#806F64]">
                  Transparent calculation used by the screening engine
                </p>

              </div>

            </div>

          </div>


          <div className="p-6">

            <div className="overflow-hidden rounded-lg border border-[#D8B9A0]">


              {/* Maximum imprisonment */}

              <div className="flex flex-col gap-2 border-b border-[#E8D5C4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                <span className="text-sm text-[#806F64]">
                  Maximum imprisonment
                </span>

                <span className="text-base font-semibold text-[#2B170D]">
                  {formatMaxPunishment()}
                </span>

              </div>


              {/* Maximum days */}

              <div className="flex flex-col gap-2 border-b border-[#E8D5C4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                <span className="text-sm text-[#806F64]">
                  Maximum imprisonment (days)
                </span>

                <span className="text-base font-semibold text-[#2B170D]">
                  {result.maxImprisonmentDays} days
                </span>

              </div>


              {/* Threshold */}

              <div className="flex flex-col gap-2 border-b border-[#E8D5C4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                <span className="text-sm text-[#806F64]">
                  Applicable threshold
                </span>

                <span className="text-base font-semibold text-[#2B170D] sm:text-right">

                  {result.thresholdFraction} of maximum sentence

                  <span className="ml-1 text-sm font-normal text-[#806F64]">
                    (
                    {result.thresholdType === 'ONE_THIRD'
                      ? 'first-time offender'
                      : 'standard'}
                    )
                  </span>

                </span>

              </div>


              {/* Required threshold */}

              <div className="flex flex-col gap-2 border-b border-[#E8D5C4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                <span className="text-sm text-[#806F64]">
                  Required threshold
                </span>

                <span className="text-base font-semibold text-[#2B170D]">
                  {result.thresholdDays} days
                </span>

              </div>


              {/* Total custody */}

              <div className="flex flex-col gap-2 border-b border-[#E8D5C4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                <span className="text-sm text-[#806F64]">
                  Total custody
                </span>

                <span className="text-base font-semibold text-[#2B170D]">
                  {result.totalCustodyDays} days
                </span>

              </div>


              {/* Excluded delay */}

              <div className="flex flex-col gap-2 border-b border-[#E8D5C4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                <span className="text-sm text-[#806F64]">
                  Excluded delay — accused attributable
                </span>

                <span className="text-base font-semibold text-[#B94343]">
                  {result.delayDays} days
                </span>

              </div>


              {/* Credited detention */}

              <div className="flex flex-col gap-2 bg-[#EEF7F0] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                <span className="text-sm font-bold uppercase tracking-wider text-[#4F8A62]">
                  Credited detention
                </span>

                <span className="text-lg font-bold text-[#3F7652]">
                  {result.creditedDetentionDays} days
                </span>

              </div>


              {/* Threshold date */}

              <div className="flex flex-col gap-2 border-t border-[#E8D5C4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                <span className="text-sm text-[#806F64]">
                  Threshold date — estimated
                </span>

                <span className="text-base font-semibold text-[#2B170D]">
                  {result.thresholdDate}
                </span>

              </div>


              {/* Calculation method */}

              <div className="flex flex-col gap-2 border-t border-[#E8D5C4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                <span className="text-sm text-[#806F64]">
                  Calculation method
                </span>

                <span className="text-base font-semibold text-[#2B170D] sm:text-right">
                  {result.calculationMethod}
                </span>

              </div>

            </div>

          </div>

        </section>

      )}


      {/* =========================================================
          RULE CHECKS
      ========================================================== */}

      {result.ruleChecks && result.ruleChecks.length > 0 && (

        <section className="overflow-hidden rounded-xl border border-[#D8B9A0] bg-white shadow-sm">

          <div className="border-b border-[#E8D5C4] bg-[#FFF9F5] px-6 py-5">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFF4EC] text-sm font-bold text-[#C65A16]">
                03
              </div>

              <div>

                <h3 className="text-xl font-semibold text-[#2B170D]">
                  Rule Checks
                </h3>

                <p className="mt-0.5 text-sm text-[#806F64]">
                  Individual conditions evaluated by the screening engine
                </p>

              </div>

            </div>

          </div>


          <div className="divide-y divide-[#E8D5C4]">

            {result.ruleChecks.map((check, i) => (

              <div
                key={i}
                className="flex items-start gap-4 px-6 py-5 hover:bg-[#FFF9F5] transition-colors"
              >

                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border text-base font-bold ${
                    check.passed
                      ? 'border-[#BBD8C3] bg-[#EEF7F0] text-[#4F8A62]'
                      : 'border-[#E4B7B7] bg-[#FFF0F0] text-[#B94343]'
                  }`}
                >
                  {check.passed ? '✓' : '×'}
                </div>


                <div className="min-w-0 flex-1">

                  <div className="flex flex-wrap items-center gap-2">

                    <p className="text-base font-semibold text-[#2B170D]">
                      {check.rule}
                    </p>


                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                        check.passed
                          ? 'border-[#BBD8C3] bg-[#EEF7F0] text-[#3F7652]'
                          : 'border-[#E4B7B7] bg-[#FFF0F0] text-[#A63D3D]'
                      }`}
                    >
                      {check.passed ? 'Passed' : 'Flagged'}
                    </span>

                  </div>


                  <p className="mt-2 text-sm leading-relaxed text-[#806F64]">
                    {check.detail}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </section>

      )}


      {/* =========================================================
          EXCLUSION REASONS
      ========================================================== */}

      {result.exclusions && result.exclusions.length > 0 && (

        <section className="overflow-hidden rounded-xl border border-[#E4B7B7] bg-white shadow-sm">

          <div className="border-b border-[#E4B7B7] bg-[#FFF0F0] px-6 py-5">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-[#E4B7B7] text-base font-bold text-[#B94343]">
                !
              </div>

              <div>

                <h3 className="text-xl font-semibold text-[#2B170D]">
                  Exclusion Reason{result.exclusions.length > 1 ? 's' : ''}
                </h3>

                <p className="mt-0.5 text-sm text-[#A63D3D]">
                  Conditions affecting this screening result
                </p>

              </div>

            </div>

          </div>


          <div className="space-y-3 p-6">

            {result.exclusions.map((reason, i) => (

              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border border-[#E4B7B7] bg-[#FFF8F8] px-4 py-4"
              >

                <span className="mt-0.5 text-base font-bold text-[#B94343]">
                  ×
                </span>

                <p className="text-sm leading-relaxed text-[#7F4B4B]">
                  {reason}
                </p>

              </div>

            ))}

          </div>

        </section>

      )}


      {/* =========================================================
          LEGAL BASIS
      ========================================================== */}

      <section className="rounded-xl border border-[#D8B9A0] bg-[#FFF9F5] p-6">

        <div className="flex items-start gap-4">

          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-[#E8C9B0] bg-white text-base font-semibold text-[#C65A16]">
            §
          </div>


          <div>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#806F64]">
              Legal Basis
            </p>

            <p className="mt-2 text-base font-semibold text-[#2B170D]">
              {result.legalBasis || 'Section 479 BNSS'}
            </p>

            <p className="mt-3 text-sm leading-relaxed text-[#806F64]">
              Note: Procedural-law applicability in transitional cases
              requires professional verification. The interpretation of
              sections may vary by jurisdiction and current jurisprudence.
            </p>

          </div>

        </div>

      </section>


      {/* =========================================================
          DISCLAIMER
      ========================================================== */}

      <section className="rounded-xl border border-[#E7C98F] bg-[#FFF6E8] p-5">

        <div className="flex items-start gap-3">

          <span className="mt-0.5 text-base text-[#B97820]">
            ⚠
          </span>


          <div>

            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8A5B16]">
              Important Notice
            </p>

            <p className="mt-2 text-sm leading-relaxed text-[#765B35]">
              {result.disclaimer ||
                'This prototype provides preliminary case screening based on configured statutory rules. It does not constitute legal advice, determine final entitlement to bail, or replace review by a qualified legal professional or competent court.'}
            </p>

          </div>

        </div>

      </section>


      {/* =========================================================
          BOTTOM ACTIONS
      ========================================================== */}

      <div className="flex flex-col gap-3 border-t border-[#E8D5C4] pt-6 sm:flex-row sm:justify-between">

        <Link
          to="/cases"
          className="inline-flex items-center justify-center rounded-lg border border-[#D8B9A0] bg-white px-5 py-3 text-base font-semibold text-[#5E4B40] transition-colors hover:border-[#C65A16] hover:bg-[#FFF4EC] hover:text-[#C65A16]"
        >
          ← Return to Case List
        </Link>


        <Link
          to="/add-case"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C65A16] px-5 py-3 text-base font-semibold text-white shadow-md transition-all hover:bg-[#E06B1F] hover:shadow-lg"
        >
          Screen Another Case

          <span>
            →
          </span>

        </Link>

      </div>


    </div>
  );
};

export default CaseResult;