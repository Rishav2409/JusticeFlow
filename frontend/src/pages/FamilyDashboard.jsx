import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getUser } from '../services/auth';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

const FamilyDashboard = () => {
  const user = getUser();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'check';

  // Search & Case State
  const [caseNumber, setCaseNumber] = useState('');
  const [caseData, setCaseData] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Legal-Aid Lawyers Directory & Request Modal
  const [lawyers, setLawyers] = useState([]);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestPhone, setRequestPhone] = useState('+91 98765 11223');
  const [requestNotes, setRequestNotes] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState('');

  // My Requests State
  const [myRequests, setMyRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Load user's existing requests
  const fetchMyRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await api.get('/family/legal-aid-requests');
      setMyRequests(res.data || []);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  // Load lawyers directory
  const fetchLawyers = async () => {
    try {
      const res = await api.get('/legal-aid/lawyers');
      setLawyers(res.data?.lawyers || []);
    } catch (err) {
      console.error('Failed to load lawyers:', err);
    }
  };

  useEffect(() => {
    fetchMyRequests();
    fetchLawyers();
  }, []);

  const handleCaseSearch = async (e) => {
    e?.preventDefault();
    setSearchError('');
    setCaseData(null);
    setRequestSuccess('');

    if (!caseNumber.trim()) {
      setSearchError('Please enter a case number.');
      return;
    }

    setSearchLoading(true);
    try {
      const res = await api.get(`/family/cases/${encodeURIComponent(caseNumber.trim())}`);
      setCaseData(res.data);
    } catch (err) {
      setSearchError(err.response?.data?.error || 'Case not found. Please check the case number.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleOpenRequestModal = () => {
    setShowRequestModal(true);
    setSelectedLawyer(null);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!caseData) return;

    setSubmittingRequest(true);
    try {
      const res = await api.post('/family/legal-aid-requests', {
        case_id: caseData.id,
        case_number: caseData.case_number,
        selected_lawyer_id: selectedLawyer?.userId || selectedLawyer?.id || null,
        family_phone: requestPhone,
        notes: requestNotes,
      });

      if (res.data?.success) {
        setRequestSuccess('Your legal-aid assistance request has been submitted successfully to the legal-aid counsel.');
        setShowRequestModal(false);
        fetchMyRequests();
        // Refresh case data to reflect request
        handleCaseSearch();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit request.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-[#EEF7F0] text-[#4F8A62] border-[#4F8A62]';
      case 'UNDER_REVIEW':
        return 'bg-[#FFF6E8] text-[#B97820] border-[#B97820]';
      case 'DECLINED':
        return 'bg-[#FDF0F0] text-[#B94343] border-[#B94343]';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Role Banner */}
      <div className="rounded-2xl border border-[#D8B9A0] bg-[#FFF9F5] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">👨‍👩‍👧</span>
            <div>
              <h1 className="text-2xl font-bold text-[#2B170D]">
                Family Portal — Case Status & Legal-Aid
              </h1>
              <p className="text-xs text-[#5E4B40] mt-0.5">
                Welcome, <span className="font-bold text-[#2B170D]">{user?.name || 'Family Member'}</span>. Transparent case screening and free legal aid coordination.
              </p>
            </div>
          </div>

          {/* Quick Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchParams({ tab: 'check' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'check'
                  ? 'bg-[#C65A16] text-white shadow-sm'
                  : 'bg-white border border-[#D8B9A0] text-[#5E4B40] hover:bg-[#FFF4EC]'
              }`}
            >
              🔍 Check Case Status
            </button>
            <button
              onClick={() => setSearchParams({ tab: 'requests' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors relative ${
                activeTab === 'requests'
                  ? 'bg-[#C65A16] text-white shadow-sm'
                  : 'bg-white border border-[#D8B9A0] text-[#5E4B40] hover:bg-[#FFF4EC]'
              }`}
            >
              📋 My Requests ({myRequests.length})
            </button>
            <button
              onClick={() => setSearchParams({ tab: 'info' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'info'
                  ? 'bg-[#C65A16] text-white shadow-sm'
                  : 'bg-white border border-[#D8B9A0] text-[#5E4B40] hover:bg-[#FFF4EC]'
              }`}
            >
              📖 Know Your Rights
            </button>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {requestSuccess && (
        <div className="rounded-xl border border-[#4F8A62] bg-[#EEF7F0] p-4 text-xs font-medium text-[#4F8A62] flex items-center justify-between">
          <span>✓ {requestSuccess}</span>
          <button onClick={() => setRequestSuccess('')} className="font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* =====================================================
          TAB 1: CHECK CASE STATUS & PRELIMINARY SCREENING
          ===================================================== */}
      {activeTab === 'check' && (
        <div className="space-y-6">
          {/* Lookup Input Box */}
          <div className="rounded-2xl border border-[#D8B9A0] bg-[#FFF9F5] p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#2B170D] mb-1 flex items-center gap-2">
              <span>🔍</span> Check Case Status
            </h2>
            <p className="text-xs text-[#5E4B40] mb-4">
              Enter the official Case Number (e.g., <span className="font-bold text-[#C65A16]">JF-1001</span>, <span className="font-bold text-[#C65A16]">JF-1002</span>, or <span className="font-bold text-[#C65A16]">JF-1024</span>) to check custody thresholds and legal-aid status.
            </p>

            <form onSubmit={handleCaseSearch} className="flex gap-3">
              <input
                type="text"
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                placeholder="e.g. JF-1001"
                className="
                  flex-1 rounded-xl border border-[#D8B9A0] bg-white px-4 py-3
                  text-sm text-[#2B170D] placeholder-[#A09488] focus:border-[#C65A16]
                  focus:ring-2 focus:ring-[#C65A16]/20 font-medium
                "
              />
              <button
                type="submit"
                disabled={searchLoading}
                className="
                  rounded-xl bg-[#C65A16] px-6 py-3 text-sm font-bold uppercase
                  tracking-wider text-white hover:bg-[#E06B1F] transition-colors
                  shadow-sm disabled:bg-[#D8B9A0]
                "
              >
                {searchLoading ? 'Searching...' : 'Check Case'}
              </button>
            </form>

            {/* Quick Demo Case Pills */}
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-[#806F64] font-semibold">Try sample cases:</span>
              {[
                { num: 'JF-1001', label: 'Potentially Eligible' },
                { num: 'JF-1002', label: 'Approaching Threshold' },
                { num: 'JF-1003', label: 'Not Yet at Threshold' },
                { num: 'JF-1024', label: 'High Attention (+33d)' },
              ].map((pill) => (
                <button
                  key={pill.num}
                  type="button"
                  onClick={() => {
                    setCaseNumber(pill.num);
                    setCaseData(null);
                    setSearchError('');
                  }}
                  className="rounded-full bg-white border border-[#D8B9A0] px-2.5 py-0.5 text-[11px] font-semibold text-[#5E4B40] hover:border-[#C65A16] hover:text-[#C65A16]"
                >
                  {pill.num} ({pill.label})
                </button>
              ))}
            </div>

            {searchError && (
              <div className="mt-4 rounded-xl border border-[#E8A0A0] bg-[#FDF0F0] p-3 text-xs text-[#B94343] font-semibold">
                {searchError}
              </div>
            )}
          </div>

          {/* Screening Result Display */}
          {caseData && (
            <div className="rounded-2xl border border-[#D8B9A0] bg-white p-6 shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8D5C4] pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#806F64]">
                    Preliminary Statutory Screening Result
                  </span>
                  <h3 className="text-2xl font-bold text-[#2B170D]">
                    {caseData.prisoner_name}
                  </h3>
                  <p className="text-xs text-[#5E4B40]">
                    Case Number: <span className="font-bold text-[#C65A16]">{caseData.case_number}</span> • Court: {caseData.court}
                  </p>
                </div>

                {/* Prominent Status Pill */}
                <div className="text-right">
                  {caseData.is_potentially_eligible ? (
                    <div className="rounded-xl border-2 border-[#4F8A62] bg-[#EEF7F0] px-4 py-2 text-center inline-block">
                      <span className="text-sm font-extrabold text-[#4F8A62] block">
                        POTENTIALLY ELIGIBLE
                      </span>
                      <span className="text-[10px] text-[#4F8A62] font-semibold uppercase tracking-wider">
                        Threshold reached based on configured screening rules
                      </span>
                    </div>
                  ) : (
                    <div className="rounded-xl border-2 border-[#B97820] bg-[#FFF6E8] px-4 py-2 text-center inline-block">
                      <span className="text-sm font-extrabold text-[#B97820] block">
                        {caseData.status_label}
                      </span>
                      <span className="text-[10px] text-[#B97820] font-semibold uppercase tracking-wider">
                        {caseData.days_remaining > 0 ? `${caseData.days_remaining} days remaining to configured threshold` : 'Threshold not yet reached'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Factual Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="rounded-xl bg-[#FFF9F5] border border-[#E8D5C4] p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#806F64]">Custody Duration</p>
                  <p className="text-xl font-bold text-[#2B170D] mt-1">{caseData.custody_duration_days} days</p>
                  <p className="text-[10px] text-[#806F64]">Since {caseData.custody_start_date}</p>
                </div>

                <div className="rounded-xl bg-[#FFF9F5] border border-[#E8D5C4] p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#806F64]">Configured Threshold</p>
                  <p className="text-xl font-bold text-[#2B170D] mt-1">{caseData.configured_threshold_days} days</p>
                  <p className="text-[10px] text-[#806F64]">Statutory baseline</p>
                </div>

                <div className="rounded-xl bg-[#FFF9F5] border border-[#E8D5C4] p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#806F64]">Credited Detention</p>
                  <p className="text-xl font-bold text-[#2B170D] mt-1">{caseData.credited_detention_days} days</p>
                  <p className="text-[10px] text-[#806F64]">After delay subtraction</p>
                </div>

                <div className={`rounded-xl border p-3 ${
                  caseData.is_potentially_eligible
                    ? 'bg-[#EEF7F0] border-[#4F8A62] text-[#4F8A62]'
                    : 'bg-[#FFF6E8] border-[#B97820] text-[#B97820]'
                }`}>
                  <p className="text-[11px] font-bold uppercase tracking-wider">
                    {caseData.is_potentially_eligible ? 'Days Beyond Threshold' : 'Days Remaining'}
                  </p>
                  <p className="text-xl font-bold mt-1">
                    {caseData.is_potentially_eligible
                      ? `+${caseData.days_beyond_threshold} days`
                      : `${caseData.days_remaining} days`
                    }
                  </p>
                  <p className="text-[10px]">
                    {caseData.is_potentially_eligible ? 'Urgent Review' : 'Monitoring required'}
                  </p>
                </div>
              </div>

              {/* Offence & Details */}
              <div className="rounded-xl bg-[#FFF9F5] border border-[#E8D5C4] p-4 text-xs space-y-1">
                <p className="font-bold text-[#2B170D]">Configured Offence Information:</p>
                <p className="text-[#5E4B40]">{caseData.offence_name}</p>
                <p className="text-[11px] text-[#806F64]">
                  Jurisdiction: {caseData.district} • Estimated Threshold Date: {caseData.threshold_date || 'N/A'}
                </p>
              </div>

              {/* Action Section */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E8D5C4]">
                <div className="text-xs text-[#5E4B40]">
                  {caseData.is_potentially_eligible ? (
                    <span className="text-[#4F8A62] font-semibold">
                      ✓ The statutory threshold has been crossed. You may request legal-aid assistance.
                    </span>
                  ) : (
                    <span className="text-[#806F64]">
                      ℹ Case has not reached configured screening threshold. Continue monitoring.
                    </span>
                  )}
                </div>

                {caseData.is_potentially_eligible && (
                  <div>
                    {caseData.existing_request ? (
                      <div className="inline-flex items-center gap-2 rounded-lg bg-[#EEF7F0] border border-[#4F8A62] px-4 py-2 text-xs font-bold text-[#4F8A62]">
                        <span>✓ Request Active ({caseData.existing_request.status})</span>
                        <button
                          onClick={() => setSearchParams({ tab: 'requests' })}
                          className="underline hover:text-[#2B170D]"
                        >
                          View Status
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleOpenRequestModal}
                        className="
                          rounded-xl bg-[#C65A16] px-6 py-3 text-xs font-extrabold uppercase
                          tracking-wider text-white hover:bg-[#E06B1F] shadow-md transition-colors
                        "
                      >
                        REQUEST LEGAL-AID ASSISTANCE
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Mandatory Legal Disclaimer */}
              <div className="rounded-xl border border-[#E8D5C4] bg-[#FFF4EC] p-3 text-[11px] leading-relaxed text-[#7A3A12]">
                <span className="font-bold">IMPORTANT LEGAL DISCLAIMER: </span>
                {caseData.disclaimer}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================
          TAB 2: MY REQUESTS
          ===================================================== */}
      {activeTab === 'requests' && (
        <div className="rounded-2xl border border-[#D8B9A0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8D5C4] pb-4">
            <div>
              <h2 className="text-xl font-bold text-[#2B170D] flex items-center gap-2">
                <span>📋</span> My Legal-Aid Assistance Requests
              </h2>
              <p className="text-xs text-[#5E4B40]">
                Track the status of legal-aid assistance requests submitted for review.
              </p>
            </div>
            <button
              onClick={fetchMyRequests}
              className="text-xs font-bold text-[#C65A16] hover:underline"
            >
              🔄 Refresh
            </button>
          </div>

          {loadingRequests ? (
            <p className="text-xs text-[#806F64] py-8 text-center">Loading requests...</p>
          ) : myRequests.length === 0 ? (
            <div className="text-center py-10 bg-[#FFF9F5] rounded-xl border border-dashed border-[#D8B9A0]">
              <p className="text-sm font-semibold text-[#5E4B40]">No assistance requests submitted yet.</p>
              <p className="text-xs text-[#806F64] mt-1">
                Enter a case number in the 'Check Case Status' tab to begin.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-xl border border-[#D8B9A0] bg-[#FFF9F5] p-5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#C65A16]">{req.request_id}</span>
                        <span className="text-xs font-semibold text-[#2B170D]">Case: {req.case_number}</span>
                      </div>
                      <p className="text-xs text-[#5E4B40] mt-0.5">
                        Prisoner: <span className="font-semibold text-[#2B170D]">{req.prisoner_name}</span> • Offence: {req.offence_name}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`inline-block rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${getStatusBadge(req.status)}`}>
                        {req.status.replace(/_/g, ' ')}
                      </span>
                      <p className="text-[10px] text-[#806F64] mt-1">
                        Submitted: {new Date(req.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Factual Information & Lawyer update */}
                  <div className="rounded-lg bg-white border border-[#E8D5C4] p-3 text-xs flex flex-col sm:flex-row justify-between gap-3">
                    <div>
                      <span className="text-[#806F64] font-semibold">Assigned Legal-Aid Counsel:</span>{' '}
                      <span className="font-bold text-[#2B170D]">{req.lawyer_name || 'Legal-Aid Duty Queue'}</span>
                    </div>

                    <div className="text-[#5E4B40]">
                      {req.status === 'ACCEPTED' && (
                        <span className="text-[#4F8A62] font-semibold">
                          ✓ Your legal-aid assistance request has been accepted by the assigned lawyer.
                        </span>
                      )}
                      {req.status === 'PENDING' && (
                        <span className="text-blue-700 font-semibold">
                          ⏳ Request placed in Lawyer Priority Queue awaiting review.
                        </span>
                      )}
                      {req.status === 'UNDER_REVIEW' && (
                        <span className="text-[#B97820] font-semibold">
                          🔍 Counsel is actively reviewing case records.
                        </span>
                      )}
                      {req.status === 'DECLINED' && (
                        <span className="text-[#B94343] font-semibold">
                          Another legal-aid lawyer may review your request.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =====================================================
          TAB 3: LEGAL AID INFORMATION & HELPLINES
          ===================================================== */}
      {activeTab === 'info' && (
        <div className="space-y-6">
          {/* Rights cards */}
          <div className="rounded-2xl border border-[#D8B9A0] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#2B170D] mb-4 flex items-center gap-2">
              <span>📖</span> Know Your Rights — Legal-Aid & Bail Provisions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-[#E8D5C4] bg-[#FFF9F5] p-5 space-y-2">
                <h3 className="text-sm font-bold text-[#C65A16] flex items-center gap-1.5">
                  <span>⚖️</span> Section 479 BNSS / Section 436A CrPC
                </h3>
                <p className="text-xs text-[#5E4B40] leading-relaxed">
                  An undertrial prisoner (other than those facing death or life imprisonment offenses) who has served half the maximum imprisonment specified for the alleged offence is entitled to apply for release on personal bond with or without sureties. First-time offenders can be considered after one-third detention.
                </p>
              </div>

              <div className="rounded-xl border border-[#E8D5C4] bg-[#FFF9F5] p-5 space-y-2">
                <h3 className="text-sm font-bold text-[#C65A16] flex items-center gap-1.5">
                  <span>🏛️</span> Article 39A & Free Legal Aid
                </h3>
                <p className="text-xs text-[#5E4B40] leading-relaxed">
                  The Constitution of India mandates equal justice and free legal aid. Under the Legal Services Authorities Act, all undertrials in custody are entitled to free legal assistance regardless of financial means.
                </p>
              </div>

              <div className="rounded-xl border border-[#E8D5C4] bg-[#FFF9F5] p-5 space-y-2">
                <h3 className="text-sm font-bold text-[#C65A16] flex items-center gap-1.5">
                  <span>📋</span> Right to Representation
                </h3>
                <p className="text-xs text-[#5E4B40] leading-relaxed">
                  Every undertrial has the right to be represented by an advocate at every remand hearing and bail proceeding. If an accused cannot afford an advocate, a Legal Aid Defense Counsel (LADC) will be appointed.
                </p>
              </div>

              <div className="rounded-xl border border-[#E8D5C4] bg-[#FFF9F5] p-5 space-y-2">
                <h3 className="text-sm font-bold text-[#C65A16] flex items-center gap-1.5">
                  <span>🔔</span> Information for Family Members
                </h3>
                <p className="text-xs text-[#5E4B40] leading-relaxed">
                  Police and prison authorities are required to promptly inform the nominated family member or friend of the grounds of custody and the court where the prisoner will be produced.
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Helplines */}
          <div className="rounded-2xl border border-[#D8B9A0] bg-[#FFF9F5] p-6 shadow-sm">
            <h3 className="text-base font-bold text-[#2B170D] mb-4 flex items-center gap-2">
              <span>📞</span> Official Legal-Aid & Emergency Helplines
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="rounded-xl bg-white border border-[#E8D5C4] p-4">
                <p className="text-3xl font-extrabold text-[#C65A16]">15100</p>
                <p className="text-xs font-bold uppercase tracking-wider text-[#2B170D] mt-1">NALSA Helpline</p>
                <p className="text-[10px] text-[#806F64] mt-0.5">National Legal Services Authority (Toll-Free)</p>
              </div>

              <div className="rounded-xl bg-white border border-[#E8D5C4] p-4">
                <p className="text-3xl font-extrabold text-[#C65A16]">1516</p>
                <p className="text-xs font-bold uppercase tracking-wider text-[#2B170D] mt-1">NHRC Helpline</p>
                <p className="text-[10px] text-[#806F64] mt-0.5">National Human Rights Commission</p>
              </div>

              <div className="rounded-xl bg-white border border-[#E8D5C4] p-4">
                <p className="text-3xl font-extrabold text-[#C65A16]">112</p>
                <p className="text-xs font-bold uppercase tracking-wider text-[#2B170D] mt-1">Emergency Support</p>
                <p className="text-[10px] text-[#806F64] mt-0.5">National Emergency Helpline</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          LAWYER SELECTION & REQUEST MODAL
          ===================================================== */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-5 border border-[#D8B9A0] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E8D5C4] pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#2B170D]">
                  Request Legal-Aid Assistance
                </h3>
                <p className="text-xs text-[#5E4B40]">
                  Case: <span className="font-bold text-[#C65A16]">{caseData?.case_number}</span> ({caseData?.prisoner_name})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              {/* Lawyer Directory Section */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2B170D] mb-2">
                  Select Legal-Aid Lawyer (Factual Directory)
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {/* Option: General Queue */}
                  <div
                    onClick={() => setSelectedLawyer(null)}
                    className={`
                      rounded-xl border p-3 cursor-pointer transition-all text-xs
                      ${selectedLawyer === null
                        ? 'border-[#C65A16] bg-[#FFF4EC] shadow-sm'
                        : 'border-[#E8D5C4] hover:bg-[#FFF9F5]'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#2B170D]">
                        🏛️ Route to Available Legal-Aid Duty Counsel (General Queue)
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#C65A16]">
                        {selectedLawyer === null ? 'Selected' : 'Select'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5E4B40] mt-1">
                      Automatically assigns the request to the first available empanelled legal-aid counsel for the district.
                    </p>
                  </div>

                  {/* Factual Lawyer Cards */}
                  {lawyers.map((l) => (
                    <div
                      key={l.id}
                      onClick={() => setSelectedLawyer(l)}
                      className={`
                        rounded-xl border p-3 cursor-pointer transition-all text-xs
                        ${selectedLawyer?.id === l.id
                          ? 'border-[#C65A16] bg-[#FFF4EC] shadow-sm'
                          : 'border-[#E8D5C4] hover:bg-[#FFF9F5]'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#2B170D]">{l.name}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#C65A16]">
                          {selectedLawyer?.id === l.id ? 'Selected' : 'Select'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[11px] text-[#5E4B40] mt-1">
                        <p><span className="text-[#806F64]">Practice:</span> {l.practice_area}</p>
                        <p><span className="text-[#806F64]">Languages:</span> {l.languages}</p>
                        <p><span className="text-[#806F64]">District:</span> {l.district}</p>
                        <p><span className="text-[#806F64]">Workload:</span> <span className="font-semibold text-[#4F8A62]">{l.current_workload}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2B170D] mb-1">
                  Family Contact Phone
                </label>
                <input
                  type="text"
                  value={requestPhone}
                  onChange={(e) => setRequestPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  required
                  className="
                    w-full rounded-lg border border-[#D8B9A0] bg-white px-3 py-2
                    text-xs text-[#2B170D] focus:border-[#C65A16] focus:ring-1 focus:ring-[#C65A16]
                  "
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2B170D] mb-1">
                  Optional Message / Notes
                </label>
                <textarea
                  rows="2"
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  placeholder="Any specific factual details for counsel..."
                  className="
                    w-full rounded-lg border border-[#D8B9A0] bg-white px-3 py-2
                    text-xs text-[#2B170D] focus:border-[#C65A16] focus:ring-1 focus:ring-[#C65A16]
                  "
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8D5C4]">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="rounded-lg px-4 py-2 text-xs font-bold text-[#5E4B40] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="
                    rounded-lg bg-[#C65A16] px-5 py-2.5 text-xs font-bold uppercase
                    tracking-wider text-white hover:bg-[#E06B1F] shadow-sm disabled:bg-[#D8B9A0]
                  "
                >
                  {submittingRequest ? 'Submitting...' : 'Submit Request to Counsel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyDashboard;
