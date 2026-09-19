import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getUser } from '../services/auth';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

const PoliceDashboard = () => {
  const user = getUser();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [verifyingId, setVerifyingId] = useState(null);
  const [verificationSuccess, setVerificationSuccess] = useState('');

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await api.get('/police/cases');
      setCases(res.data || []);
    } catch (err) {
      console.error('Failed to load police cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleVerify = async (caseId, caseNumber) => {
    setVerifyingId(caseId);
    setVerificationSuccess('');
    try {
      const res = await api.post(`/police/cases/${caseId}/verify`, {
        notes: `Factual custody records verified by ${user?.name || 'Officer'}.`
      });
      if (res.data?.success) {
        setVerificationSuccess(`Case ${caseNumber} verified successfully.`);
        fetchCases();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to verify case.');
    } finally {
      setVerifyingId(null);
    }
  };

  // Metrics
  const totalAssigned = cases.length;
  const pendingVerification = cases.filter(c => c.verification_status !== 'VERIFIED').length;
  const verifiedCases = cases.filter(c => c.verification_status === 'VERIFIED').length;
  const requiringAttention = cases.filter(c => c.eligibility_status === 'ELIGIBLE_NOW').length;

  // Filtered cases for search tab
  const filteredCases = cases.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.case_number?.toLowerCase().includes(q) ||
      c.prisoner_name?.toLowerCase().includes(q) ||
      c.fir_number?.toLowerCase().includes(q) ||
      c.district?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-[#D8B9A0] bg-[#FFF9F5] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🛡️</span>
            <div>
              <h1 className="text-2xl font-bold text-[#2B170D]">
                Police Case Verification & Monitoring Portal
              </h1>
              <p className="text-xs text-[#5E4B40] mt-0.5">
                Officer: <span className="font-bold text-[#2B170D]">{user?.name || 'Inspector V. Sharma'}</span> • Jurisdiction: {user?.district || 'Central Delhi'}
              </p>
            </div>
          </div>

          {/* Sub-nav Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchParams({ tab: 'overview' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'overview'
                  ? 'bg-[#C65A16] text-white shadow-sm'
                  : 'bg-white border border-[#D8B9A0] text-[#5E4B40] hover:bg-[#FFF4EC]'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setSearchParams({ tab: 'verification' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'verification'
                  ? 'bg-[#C65A16] text-white shadow-sm'
                  : 'bg-white border border-[#D8B9A0] text-[#5E4B40] hover:bg-[#FFF4EC]'
              }`}
            >
              ✓ Verification Queue ({pendingVerification})
            </button>
            <button
              onClick={() => setSearchParams({ tab: 'search' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'search'
                  ? 'bg-[#C65A16] text-white shadow-sm'
                  : 'bg-white border border-[#D8B9A0] text-[#5E4B40] hover:bg-[#FFF4EC]'
              }`}
            >
              🔍 Case Search
            </button>
          </div>
        </div>
      </div>

      {/* Verification Success Notice */}
      {verificationSuccess && (
        <div className="rounded-xl border border-[#4F8A62] bg-[#EEF7F0] p-4 text-xs font-bold text-[#4F8A62] flex items-center justify-between">
          <span>✓ {verificationSuccess}</span>
          <button onClick={() => setVerificationSuccess('')} className="hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* 4 Required Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#D8B9A0] bg-[#FFF9F5] p-5 text-center shadow-sm">
          <p className="text-2xl font-extrabold text-[#2B170D]">{loading ? '—' : totalAssigned}</p>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#806F64] mt-1">
            Total Assigned Cases
          </p>
        </div>

        <div className="rounded-2xl border border-[#B97820] bg-[#FFF6E8] p-5 text-center shadow-sm">
          <p className="text-2xl font-extrabold text-[#B97820]">{loading ? '—' : pendingVerification}</p>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#B97820] mt-1">
            Pending Verification
          </p>
        </div>

        <div className="rounded-2xl border border-[#4F8A62] bg-[#EEF7F0] p-5 text-center shadow-sm">
          <p className="text-2xl font-extrabold text-[#4F8A62]">{loading ? '—' : verifiedCases}</p>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#4F8A62] mt-1">
            Verified Cases
          </p>
        </div>

        <div className="rounded-2xl border border-[#B94343] bg-[#FDF0F0] p-5 text-center shadow-sm">
          <p className="text-2xl font-extrabold text-[#B94343]">{loading ? '—' : requiringAttention}</p>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#B94343] mt-1">
            Cases Requiring Attention
          </p>
        </div>
      </div>

      {/* =====================================================
          TAB 1: CASE VERIFICATION QUEUE
          ===================================================== */}
      {(activeTab === 'verification' || activeTab === 'overview') && (
        <div className="rounded-2xl border border-[#D8B9A0] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8D5C4] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#2B170D] flex items-center gap-2">
                <span>✓</span> Case Verification Queue
              </h2>
              <p className="text-xs text-[#5E4B40]">
                Authorize and confirm detention dates and police station records.
              </p>
            </div>
            <button
              onClick={fetchCases}
              className="text-xs font-bold text-[#C65A16] hover:underline"
            >
              🔄 Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-xs text-[#806F64] py-8 text-center">Loading cases...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#D8B9A0] text-[#806F64] uppercase tracking-wider font-bold">
                    <th className="py-3 px-3">Case Number</th>
                    <th className="py-3 px-3">Prisoner Name</th>
                    <th className="py-3 px-3">FIR / Station</th>
                    <th className="py-3 px-3">Offence</th>
                    <th className="py-3 px-3">Custody Since</th>
                    <th className="py-3 px-3">Verification</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8D5C4]">
                  {cases.slice(0, activeTab === 'overview' ? 6 : 50).map((c) => (
                    <tr key={c.id} className="hover:bg-[#FFF9F5] transition-colors">
                      <td className="py-3 px-3 font-bold text-[#C65A16]">{c.case_number}</td>
                      <td className="py-3 px-3 font-semibold text-[#2B170D]">{c.prisoner_name}</td>
                      <td className="py-3 px-3 text-[#5E4B40]">{c.fir_number || 'N/A'}</td>
                      <td className="py-3 px-3 text-[#5E4B40]">{c.section} {c.law_code}</td>
                      <td className="py-3 px-3 text-[#5E4B40]">{c.custody_start_date}</td>
                      <td className="py-3 px-3">
                        {c.verification_status === 'VERIFIED' ? (
                          <span className="inline-block rounded-full bg-[#EEF7F0] border border-[#4F8A62] px-2.5 py-0.5 text-[10px] font-bold text-[#4F8A62]">
                            ✓ VERIFIED
                          </span>
                        ) : (
                          <span className="inline-block rounded-full bg-[#FFF6E8] border border-[#B97820] px-2.5 py-0.5 text-[10px] font-bold text-[#B97820]">
                            PENDING VERIFICATION
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {c.verification_status === 'VERIFIED' ? (
                          <span className="text-[11px] text-[#806F64] italic">
                            By {c.verified_by || 'Officer'}
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={verifyingId === c.id}
                            onClick={() => handleVerify(c.id, c.case_number)}
                            className="
                              rounded-lg bg-[#C65A16] px-3 py-1.5 text-xs font-bold uppercase
                              tracking-wider text-white hover:bg-[#E06B1F] shadow-sm disabled:bg-[#D8B9A0]
                            "
                          >
                            {verifyingId === c.id ? 'Verifying...' : 'VERIFY CASE'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =====================================================
          TAB 2: CASE SEARCH & AUTHORIZED INFORMATION
          ===================================================== */}
      {activeTab === 'search' && (
        <div className="rounded-2xl border border-[#D8B9A0] bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[#2B170D] flex items-center gap-2">
            <span>🔍</span> Search Authorized Case Records
          </h2>
          <p className="text-xs text-[#5E4B40]">
            Look up undertrial cases by Case ID, Prisoner Name, FIR number, or District.
          </p>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Case Number (e.g. JF-1001), Prisoner Name, or FIR..."
            className="
              w-full rounded-xl border border-[#D8B9A0] bg-white px-4 py-3
              text-xs text-[#2B170D] placeholder-[#A09488] focus:border-[#C65A16]
              focus:ring-2 focus:ring-[#C65A16]/20 font-medium
            "
          />

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#D8B9A0] text-[#806F64] uppercase tracking-wider font-bold">
                  <th className="py-2.5 px-3">Case ID</th>
                  <th className="py-2.5 px-3">Prisoner Name</th>
                  <th className="py-2.5 px-3">FIR Number</th>
                  <th className="py-2.5 px-3">Offence</th>
                  <th className="py-2.5 px-3">Custody Start</th>
                  <th className="py-2.5 px-3">Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D5C4]">
                {filteredCases.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FFF9F5] transition-colors">
                    <td className="py-2.5 px-3 font-bold text-[#C65A16]">{c.case_number}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#2B170D]">{c.prisoner_name}</td>
                    <td className="py-2.5 px-3 text-[#5E4B40]">{c.fir_number || 'N/A'}</td>
                    <td className="py-2.5 px-3 text-[#5E4B40]">{c.section} {c.law_code}</td>
                    <td className="py-2.5 px-3 text-[#5E4B40]">{c.custody_start_date}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                        c.verification_status === 'VERIFIED'
                          ? 'bg-[#EEF7F0] border-[#4F8A62] text-[#4F8A62]'
                          : 'bg-[#FFF6E8] border-[#B97820] text-[#B97820]'
                      }`}>
                        {c.verification_status || 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoliceDashboard;
