import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { caseService } from '../services/api';
import { getUser } from '../services/auth';
import { useLanguage } from '../context/LanguageContext';
import StatusBadge from '../components/StatusBadge';

const CaseList = () => {
  const user = getUser();
  const { t } = useLanguage();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    caseService.getAll()
      .then(data => setCases(data))
      .catch(err => console.error('Failed to fetch cases', err))
      .finally(() => setLoading(false));
  }, []);

  /* =========================
     CASE STATISTICS
     ========================= */

  const totalCases = cases.length;

  const eligibleCases = cases.filter(
    c => c.eligibility_status === 'ELIGIBLE_NOW'
  ).length;

  const notYetEligibleCases = cases.filter(
    c => c.eligibility_status === 'NOT_YET_ELIGIBLE'
  ).length;

  const excludedCases = cases.filter(
    c => c.eligibility_status === 'EXCLUDED'
  ).length;

  /* =========================
     STATUS LABEL
     ========================= */

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ELIGIBLE_NOW':
        return 'REVIEW REQUIRED';

      case 'NOT_YET_ELIGIBLE':
        return 'NOT YET ELIGIBLE';

      case 'EXCLUDED':
        return 'EXCLUDED';

      default:
        return status || 'UNKNOWN';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">

      {/* =========================
          PAGE HEADER
          ========================= */}

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-8">

        <div>

          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-justice-accent mb-2">
            Case Management
          </p>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-justice-text">
            {t('allCases')}
          </h1>

          <p className="mt-2 text-base text-justice-secondary">
            Review and screen registered undertrial cases.
          </p>

        </div>

        {user?.role === 'POLICE' && (
          <Link
            to="/police/new-case"
            className="inline-flex items-center justify-center gap-2 bg-justice-accent hover:bg-justice-accent-hover text-white px-5 py-3 rounded-lg text-base font-semibold shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <span className="text-xl leading-none">
              ＋
            </span>

            {t('newCase')}
          </Link>
        )}

      </div>


      {/* =========================
          STATISTICS
          ========================= */}

      {!loading && cases.length > 0 && (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          {/* =========================
              TOTAL CASES
              ========================= */}

          <div className="bg-white border border-justice-border rounded-xl p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-semibold uppercase tracking-wider text-justice-muted">
                  Total Cases
                </p>

                <p className="text-3xl font-bold text-justice-text mt-2">
                  {totalCases}
                </p>

              </div>

              <div className="w-11 h-11 rounded-lg bg-[#FFF4EC] border border-[#E8C9B0] flex items-center justify-center text-xl text-justice-accent">
                ▣
              </div>

            </div>

            <p className="text-sm text-justice-muted mt-3">
              Cases in screening database
            </p>

          </div>


          {/* =========================
              REVIEW REQUIRED
              ========================= */}

          <div className="bg-white border border-[#BBD8C3] rounded-xl p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-semibold uppercase tracking-wider text-[#4F8A62]">
                  Review Required
                </p>

                <p className="text-3xl font-bold text-justice-text mt-2">
                  {eligibleCases}
                </p>

              </div>

              <div className="w-11 h-11 rounded-lg bg-[#EEF7F0] border border-[#BBD8C3] flex items-center justify-center text-xl text-[#4F8A62]">
                ✓
              </div>

            </div>

            <p className="text-sm text-justice-muted mt-3">
              Potentially eligible cases
            </p>

          </div>


          {/* =========================
              PENDING
              ========================= */}

          <div className="bg-white border border-[#E7C98F] rounded-xl p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-semibold uppercase tracking-wider text-[#8A5B16]">
                  Pending
                </p>

                <p className="text-3xl font-bold text-justice-text mt-2">
                  {notYetEligibleCases}
                </p>

              </div>

              <div className="w-11 h-11 rounded-lg bg-[#FFF6E8] border border-[#E7C98F] flex items-center justify-center text-xl text-[#B97820]">
                ◷
              </div>

            </div>

            <p className="text-sm text-justice-muted mt-3">
              Below configured threshold
            </p>

          </div>


          {/* =========================
              EXCLUDED
              ========================= */}

          <div className="bg-white border border-[#E4B7B7] rounded-xl p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-semibold uppercase tracking-wider text-[#A63D3D]">
                  Excluded
                </p>

                <p className="text-3xl font-bold text-justice-text mt-2">
                  {excludedCases}
                </p>

              </div>

              <div className="w-11 h-11 rounded-lg bg-[#FFF0F0] border border-[#E4B7B7] flex items-center justify-center text-xl text-[#B94343]">
                ×
              </div>

            </div>

            <p className="text-sm text-justice-muted mt-3">
              Outside configured screening rule
            </p>

          </div>

        </div>

      )}


      {/* =========================
          LOADING
          ========================= */}

      {loading ? (

        <div className="bg-white border border-justice-border rounded-xl shadow-sm py-20 text-center">

          <div className="inline-flex items-center justify-center w-11 h-11 rounded-full border-2 border-[#E8D5C4] border-t-justice-accent animate-spin mb-4">
          </div>

          <p className="text-base text-justice-secondary">
            Loading cases...
          </p>

        </div>

      ) : cases.length === 0 ? (

        /* =========================
           EMPTY STATE
           ========================= */

        <div className="bg-white border border-justice-border rounded-xl shadow-sm py-20 text-center">

          <div className="w-16 h-16 mx-auto rounded-xl bg-[#FFF4EC] border border-[#E8C9B0] flex items-center justify-center text-3xl text-justice-accent mb-5">
            ▣
          </div>

          <h2 className="text-xl font-semibold text-justice-text">
            No cases yet
          </h2>

          <p className="text-base text-justice-muted mt-2 mb-6">
            Start by adding a case for preliminary screening.
          </p>

          <Link
            to="/add-case"
            className="inline-flex items-center gap-2 bg-justice-accent hover:bg-justice-accent-hover text-white px-5 py-3 rounded-lg text-base font-semibold transition-colors"
          >
            <span className="text-xl leading-none">
              ＋
            </span>

            Create First Case
          </Link>

        </div>

      ) : (

        /* =========================
           CASE TABLE
           ========================= */

        <div className="bg-white border border-justice-border rounded-xl shadow-sm overflow-hidden">

          {/* =========================
              TABLE HEADER
              ========================= */}

          <div className="px-6 py-5 border-b border-justice-border bg-[#FFF9F5] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

            <div>

              <h2 className="text-xl font-semibold text-justice-text">
                Case Registry
              </h2>

              <p className="text-sm text-justice-muted mt-1">
                Preliminary screening records
              </p>

            </div>

            <div className="text-sm font-medium text-justice-secondary">
              {totalCases} {totalCases === 1 ? 'case' : 'cases'}
            </div>

          </div>


          {/* =========================
              RESPONSIVE TABLE
              ========================= */}

          <div className="overflow-x-auto">

            <table className="min-w-full">

              <thead className="bg-[#2B170D] border-b border-[#4A2A1A]">

                <tr>

                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-[#F5E8DE] uppercase tracking-[0.12em] whitespace-nowrap"
                  >
                    Case ID
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-[#F5E8DE] uppercase tracking-[0.12em] whitespace-nowrap"
                  >
                    Applicant
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-[#F5E8DE] uppercase tracking-[0.12em] whitespace-nowrap"
                  >
                    Offence
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-[#F5E8DE] uppercase tracking-[0.12em] whitespace-nowrap"
                  >
                    Custody Start
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-[#F5E8DE] uppercase tracking-[0.12em] whitespace-nowrap"
                  >
                    Status
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-[#F5E8DE] uppercase tracking-[0.12em] whitespace-nowrap"
                  >
                    Created
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-4 text-right text-xs font-semibold text-[#F5E8DE] uppercase tracking-[0.12em] whitespace-nowrap"
                  >
                    Action
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-[#E8D5C4]">

                {cases.map((c) => (

                  <tr
                    key={c.id}
                    className="group bg-white hover:bg-[#FFF9F5] transition-colors duration-150"
                  >

                    {/* =========================
                        CASE ID
                        ========================= */}

                    <td className="px-6 py-5 whitespace-nowrap">

                      <Link
                        to={`/cases/${c.id}`}
                        className="text-base font-semibold text-justice-accent hover:text-justice-accent-hover transition-colors"
                      >
                        {c.case_number}
                      </Link>

                    </td>


                    {/* =========================
                        APPLICANT
                        ========================= */}

                    <td className="px-6 py-5 whitespace-nowrap">

                      <div className="text-base font-medium text-justice-text">
                        {c.prisoner_name}
                      </div>

                    </td>


                    {/* =========================
                        OFFENCE
                        ========================= */}

                    <td className="px-6 py-5 whitespace-nowrap">

                      <div className="text-base text-justice-secondary">
                        {c.law_code} Sec {c.section}
                      </div>

                      {c.offence_name && (
                        <div className="text-sm text-justice-muted mt-1">
                          {c.offence_name}
                        </div>
                      )}

                    </td>


                    {/* =========================
                        CUSTODY START
                        ========================= */}

                    <td className="px-6 py-5 whitespace-nowrap">

                      <span className="text-base text-justice-secondary">
                        {c.custody_start_date}
                      </span>

                    </td>


                    {/* =========================
                        STATUS
                        ========================= */}

                    <td className="px-6 py-5 whitespace-nowrap">

                      <div className="flex flex-col items-start gap-1.5">

                        <StatusBadge
                          status={c.eligibility_status}
                          daysRemaining={c.eligibility_result?.daysRemaining}
                        />

                        <span className="text-xs text-justice-muted">
                          {getStatusLabel(c.eligibility_status)}
                        </span>

                      </div>

                    </td>


                    {/* =========================
                        CREATED
                        ========================= */}

                    <td className="px-6 py-5 whitespace-nowrap">

                      <span className="text-sm text-justice-muted">
                        {c.created_at
                          ? c.created_at.split('T')[0] || c.created_at.split(' ')[0]
                          : 'N/A'}
                      </span>

                    </td>


                    {/* =========================
                        ACTION
                        ========================= */}

                    <td className="px-6 py-5 whitespace-nowrap text-right">

                      <Link
                        to={`/cases/${c.id}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-justice-secondary hover:text-justice-accent border border-justice-border hover:border-justice-accent hover:bg-[#FFF4EC] px-3.5 py-2 rounded-md transition-all duration-150"
                      >
                        View

                        <span className="text-justice-accent">
                          →
                        </span>

                      </Link>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>


          {/* =========================
              TABLE FOOTER
              ========================= */}

          <div className="px-6 py-4 bg-[#FFF9F5] border-t border-justice-border">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

              <p className="text-sm text-justice-muted">
                Screening results require review by a qualified legal professional.
              </p>

              <p className="text-xs uppercase tracking-wider font-semibold text-justice-muted">
                JusticeFlow • Demo
              </p>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default CaseList;