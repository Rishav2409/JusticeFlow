import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OffenceSearch from '../components/OffenceSearch';
import { caseService } from '../services/api';

const CaseEntry = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    case_number: '',
    prisoner_name: '',
    fir_number: '',
    district: '',
    court: '',
    lawyer: '',
    custody_start_date: '',
    delay_attributable: false,
    delay_days: 0,
    first_time_offender: true,
    multiple_pending_cases: false,
  });

  const [selectedOffence, setSelectedOffence] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const calculateTotalDays = (startDateStr) => {
    if (!startDateStr) return 0;

    const start = new Date(startDateStr + 'T00:00:00Z');
    const today = new Date();

    const todayUTC = new Date(
      Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      )
    );

    const diffTime = todayUTC.getTime() - start.getTime();

    return Math.floor(
      diffTime / (1000 * 60 * 60 * 24)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.case_number.trim()) {
      setError('Case ID is required.');
      return;
    }

    if (!formData.prisoner_name.trim()) {
      setError('Prisoner/Applicant name is required.');
      return;
    }

    if (!selectedOffence) {
      setError('Please select an offence from the database.');
      return;
    }

    if (!formData.custody_start_date) {
      setError('Date of arrest / custody start is required.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    if (formData.custody_start_date > today) {
      setError('Date of arrest cannot be in the future.');
      return;
    }

    const delayDays = formData.delay_attributable
      ? (parseInt(formData.delay_days) || 0)
      : 0;

    if (delayDays < 0) {
      setError('Delay days cannot be negative.');
      return;
    }

    const totalCustodyDays = calculateTotalDays(
      formData.custody_start_date
    );

    if (delayDays > totalCustodyDays) {
      setError(
        `Excluded delay days (${delayDays}) cannot exceed total custody days (${totalCustodyDays}).`
      );
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        case_number: formData.case_number.trim(),
        prisoner_name: formData.prisoner_name.trim(),
        fir_number: formData.fir_number.trim() || null,
        district: formData.district.trim() || null,
        court: formData.court.trim() || null,
        lawyer: formData.lawyer.trim() || null,
        offence_id: selectedOffence.id,
        custody_start_date: formData.custody_start_date,
        delay_days: delayDays,
        first_time_offender: formData.first_time_offender ? 1 : 0,
        multiple_pending_cases: formData.multiple_pending_cases ? 1 : 0,
      };

      const newCase = await caseService.create(payload);

      navigate(`/cases/${newCase.id}`);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
        'Failed to screen case. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================
     REUSABLE FORM STYLES
     ========================= */

  const inputClass =
    'mt-2 block w-full rounded-lg border border-[#D8B9A0] bg-white px-4 py-3.5 text-base text-[#2B170D] placeholder:text-[#806F64] transition-all duration-200 focus:border-[#C65A16] focus:ring-2 focus:ring-[#C65A16]/20';

  const labelClass =
    'block text-sm font-semibold uppercase tracking-[0.12em] text-[#5E4B40]';

  return (
    <div className="max-w-5xl mx-auto">

      {/* =========================
          PAGE HEADER
          ========================= */}
      <div className="mb-9">

        <div className="flex items-center gap-3 mb-4">

          <div className="h-1 w-12 rounded-full bg-[#C65A16]"></div>

          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C65A16]">
            Case Screening
          </span>

        </div>


        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">

          <div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#2B170D]">
              New Case Screening
            </h1>

            <p className="mt-3 text-base text-[#5E4B40] max-w-2xl leading-relaxed">
              Enter case, offence and custody information to perform
              preliminary statutory screening.
            </p>

          </div>


          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#806F64]">

            <span className="w-2.5 h-2.5 rounded-full bg-[#C65A16]"></span>

            Preliminary review

          </div>

        </div>

      </div>


      {/* =========================
          ERROR
          ========================= */}
      {error && (
        <div className="mb-7 rounded-xl border border-[#E4B7B7] bg-[#FFF4F4] px-5 py-4">

          <div className="flex items-start gap-3">

            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#F8DEDE] text-[#B94343]">

              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 001.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>

            </div>


            <div>

              <p className="text-sm font-semibold uppercase tracking-wider text-[#B94343]">
                Screening Error
              </p>

              <p className="mt-1 text-base text-[#704040]">
                {error}
              </p>

            </div>

          </div>

        </div>
      )}


      <form onSubmit={handleSubmit} className="space-y-7">


        {/* =========================================================
            SECTION 01 — CASE INFORMATION
        ========================================================== */}

        <section className="overflow-hidden rounded-xl border border-[#D8B9A0] bg-white shadow-sm">

          {/* Section Header */}
          <div className="flex items-center gap-4 border-b border-[#E8D5C4] bg-[#FFF9F5] px-6 py-5">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C65A16] text-sm font-bold text-white shadow-sm">
              01
            </div>

            <div>

              <h2 className="text-xl font-semibold text-[#2B170D]">
                Case Information
              </h2>

              <p className="mt-1 text-sm text-[#806F64]">
                Basic identification and case details
              </p>

            </div>

          </div>


          {/* Fields */}
          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">

            {/* Case ID */}
            <div>

              <label className={labelClass}>
                Case ID <span className="text-[#B94343]">*</span>
              </label>

              <input
                type="text"
                name="case_number"
                required
                value={formData.case_number}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. CR-2026-441"
              />

            </div>


            {/* Applicant */}
            <div>

              <label className={labelClass}>
                Prisoner / Applicant Name{' '}
                <span className="text-[#B94343]">*</span>
              </label>

              <input
                type="text"
                name="prisoner_name"
                required
                value={formData.prisoner_name}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter full name"
              />

            </div>


            {/* FIR */}
            <div>

              <label className={labelClass}>
                FIR Number
              </label>

              <input
                type="text"
                name="fir_number"
                value={formData.fir_number}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. FIR/2026/0182"
              />

            </div>


            {/* District */}
            <div>

              <label className={labelClass}>
                District
              </label>

              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter district"
              />

            </div>


            {/* Court */}
            <div>

              <label className={labelClass}>
                Court
              </label>

              <input
                type="text"
                name="court"
                value={formData.court}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter court name"
              />

            </div>


            {/* Lawyer */}
            <div>

              <label className={labelClass}>
                Assigned Lawyer
              </label>

              <input
                type="text"
                name="lawyer"
                value={formData.lawyer}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter lawyer name"
              />

            </div>

          </div>

        </section>


        {/* =========================================================
            SECTION 02 — OFFENCE
        ========================================================== */}

        <section className="overflow-visible rounded-xl border border-[#D8B9A0] bg-white shadow-sm">

          {/* Section Header */}
          <div className="flex items-center gap-4 border-b border-[#E8D5C4] bg-[#FFF9F5] px-6 py-5">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C65A16] text-sm font-bold text-white shadow-sm">
              02
            </div>

            <div>

              <h2 className="text-xl font-semibold text-[#2B170D]">
                Offence
              </h2>

              <p className="mt-1 text-sm text-[#806F64]">
                Select the applicable offence from the configured database
              </p>

            </div>

          </div>


          {/* Offence Content */}
          <div className="p-6">

            <div className="mb-5 flex items-start gap-3 rounded-lg border border-[#E8D5C4] bg-[#FFF9F5] px-4 py-4">

              <span className="mt-0.5 text-xl text-[#C65A16]">
                ⚖
              </span>

              <p className="text-sm leading-relaxed text-[#5E4B40]">
                Search by law code, section or offence name. The selected
                offence will be used by the statutory screening engine.
              </p>

            </div>


            <OffenceSearch
              onSelect={setSelectedOffence}
              selectedOffence={selectedOffence}
            />

          </div>

        </section>


        {/* =========================================================
            SECTION 03 — CUSTODY & PROCEDURAL INFORMATION
        ========================================================== */}

        <section className="overflow-hidden rounded-xl border border-[#D8B9A0] bg-white shadow-sm">

          {/* Section Header */}
          <div className="flex items-center gap-4 border-b border-[#E8D5C4] bg-[#FFF9F5] px-6 py-5">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C65A16] text-sm font-bold text-white shadow-sm">
              03
            </div>

            <div>

              <h2 className="text-xl font-semibold text-[#2B170D]">
                Custody & Procedural Information
              </h2>

              <p className="mt-1 text-sm text-[#806F64]">
                Information required for statutory threshold screening
              </p>

            </div>

          </div>


          {/* Custody Content */}
          <div className="space-y-7 p-6">

            {/* Custody Date */}
            <div className="max-w-md">

              <label className={labelClass}>
                Date of Arrest / Custody Start{' '}
                <span className="text-[#B94343]">*</span>
              </label>

              <input
                type="date"
                name="custody_start_date"
                required
                max={new Date().toISOString().split('T')[0]}
                value={formData.custody_start_date}
                onChange={handleChange}
                className={inputClass}
              />

              <p className="mt-2 text-sm text-[#806F64]">
                Used to calculate the credited period of custody.
              </p>

            </div>


            {/* Delay */}
            <div className="border-t border-[#E8D5C4] pt-6">

              <label className="flex cursor-pointer items-start gap-4">

                <input
                  id="delay_attributable"
                  name="delay_attributable"
                  type="checkbox"
                  checked={formData.delay_attributable}
                  onChange={handleChange}
                  className="mt-1 h-5 w-5 rounded border-[#D8B9A0] bg-white accent-[#C65A16]"
                />


                <div>

                  <span className="text-base font-semibold text-[#2B170D]">
                    Delay attributable to accused?
                  </span>

                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#806F64]">
                    Select this when a portion of the trial delay is
                    attributable to the accused, such as absconding or
                    another configured exclusion.
                  </p>

                </div>

              </label>


              {formData.delay_attributable && (
                <div className="ml-9 mt-5 border-l-2 border-[#C65A16] pl-5">

                  <label className={labelClass}>
                    Number of Excluded Delay Days
                  </label>

                  <input
                    type="number"
                    name="delay_days"
                    min="0"
                    value={formData.delay_days}
                    onChange={handleChange}
                    className="mt-2 block w-48 rounded-lg border border-[#D8B9A0] bg-white px-4 py-3.5 text-base text-[#2B170D] focus:border-[#C65A16] focus:ring-2 focus:ring-[#C65A16]/20"
                  />

                  <p className="mt-2 text-sm text-[#806F64]">
                    These days will be excluded from credited custody.
                  </p>

                </div>
              )}

            </div>


            {/* First-time offender */}
            <div className="border-t border-[#E8D5C4] pt-6">

              <label className="flex cursor-pointer items-start gap-4">

                <input
                  id="first_time_offender"
                  name="first_time_offender"
                  type="checkbox"
                  checked={formData.first_time_offender}
                  onChange={handleChange}
                  className="mt-1 h-5 w-5 rounded border-[#D8B9A0] bg-white accent-[#C65A16]"
                />


                <div>

                  <span className="text-base font-semibold text-[#2B170D]">
                    First-time offender?
                  </span>

                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#806F64]">
                    Keep enabled if the applicant has no prior conviction
                    for purposes of this preliminary screening.
                  </p>

                </div>

              </label>

            </div>


            {/* Multiple cases */}
            <div className="border-t border-[#E8D5C4] pt-6">

              <label className="flex cursor-pointer items-start gap-4">

                <input
                  id="multiple_pending_cases"
                  name="multiple_pending_cases"
                  type="checkbox"
                  checked={formData.multiple_pending_cases}
                  onChange={handleChange}
                  className="mt-1 h-5 w-5 rounded border-[#D8B9A0] bg-white accent-[#C65A16]"
                />


                <div>

                  <span className="text-base font-semibold text-[#2B170D]">
                    Multiple pending investigations / trials / cases?
                  </span>

                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#806F64]">
                    Select this when the applicant is involved in multiple
                    ongoing cases relevant to the configured screening rule.
                  </p>

                </div>

              </label>

            </div>

          </div>

        </section>


        {/* =========================================================
            SCREEN ACTION
        ========================================================== */}

        <div className="rounded-xl border border-[#D8B9A0] bg-[#FFF9F5] p-6 shadow-sm">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#5E4B40]">
                Ready to screen
              </p>

              <p className="mt-1 text-sm text-[#806F64]">
                The configured statutory rules will be applied to the
                information provided above.
              </p>

            </div>


            <button
              type="submit"
              disabled={submitting}
              className={`inline-flex min-w-[190px] items-center justify-center gap-3 rounded-lg px-6 py-3.5 text-base font-semibold text-white shadow-md transition-all duration-200 ${
                submitting
                  ? 'cursor-not-allowed bg-[#C65A16] opacity-60'
                  : 'bg-[#C65A16] hover:bg-[#E06B1F] hover:shadow-lg'
              }`}
            >

              {submitting ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>

                  Screening...
                </>
              ) : (
                <>
                  <span>
                    Screen Case
                  </span>

                  <span className="text-lg">
                    →
                  </span>
                </>
              )}

            </button>

          </div>

        </div>

      </form>


      {/* =========================
          SMALL PAGE NOTE
          ========================= */}
      <div className="mt-6 flex items-start gap-2 px-1">

        <span className="text-sm text-[#806F64]">
          ⓘ
        </span>

        <p className="text-sm leading-relaxed text-[#806F64]">
          Required fields are marked with *. Screening results are
          preliminary and require review by a qualified legal professional.
        </p>

      </div>

    </div>
  );
};

export default CaseEntry;