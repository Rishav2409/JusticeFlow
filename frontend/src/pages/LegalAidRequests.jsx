import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

const LegalAidRequests = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const url = filter === 'ALL' ? '/lawyers/requests' : `/lawyers/requests?status=${filter}`;
      const res = await api.get(url);
      setRequests(res.data || []);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-[#EEF7F0] text-[#4F8A62] border-[#4F8A62]';
      case 'DECLINED':
        return 'bg-[#FDF0F0] text-[#B94343] border-[#B94343]';
      case 'UNDER_REVIEW':
        return 'bg-[#FFF6E8] text-[#B97820] border-[#B97820]';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-[#D8B9A0] bg-[#FFF9F5] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#2B170D] flex items-center gap-2">
              <span>📋</span> All Legal-Aid Requests
            </h1>
            <p className="text-xs text-[#5E4B40] mt-0.5">
              Comprehensive list of requests submitted by family members for undertrial legal assistance.
            </p>
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['ALL', 'PENDING', 'ACCEPTED', 'DECLINED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`
                  px-3 py-1 rounded-lg text-xs font-bold transition-colors
                  ${filter === st
                    ? 'bg-[#C65A16] text-white shadow-sm'
                    : 'bg-white border border-[#D8B9A0] text-[#5E4B40] hover:bg-[#FFF4EC]'
                  }
                `}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table / List */}
      <div className="rounded-2xl border border-[#D8B9A0] bg-white p-6 shadow-sm">
        {loading ? (
          <p className="text-xs text-[#806F64] py-8 text-center">Loading requests...</p>
        ) : requests.length === 0 ? (
          <div className="text-center py-10 text-xs text-[#806F64]">
            No legal-aid requests found matching status: {filter}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#D8B9A0] text-[#806F64] uppercase tracking-wider font-bold">
                  <th className="py-3 px-3">Request ID</th>
                  <th className="py-3 px-3">Case Number</th>
                  <th className="py-3 px-3">Prisoner</th>
                  <th className="py-3 px-3">Offence</th>
                  <th className="py-3 px-3">Custody / Threshold</th>
                  <th className="py-3 px-3">Family Contact</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D5C4]">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-[#FFF9F5] transition-colors">
                    <td className="py-3 px-3 font-bold text-[#C65A16]">{r.request_id}</td>
                    <td className="py-3 px-3 font-semibold text-[#2B170D]">{r.case_number}</td>
                    <td className="py-3 px-3 text-[#2B170D] font-medium">{r.prisoner_name}</td>
                    <td className="py-3 px-3 text-[#5E4B40] max-w-xs truncate" title={r.offence_name}>
                      {r.offence_name}
                    </td>
                    <td className="py-3 px-3 text-[#5E4B40]">
                      {r.custody_duration_days}d / {r.configured_threshold_days}d
                      {r.days_beyond_threshold > 0 && (
                        <span className="text-[#4F8A62] font-bold ml-1">
                          (+{r.days_beyond_threshold}d)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-[#5E4B40]">
                      {r.family_member_name}
                      <span className="block text-[10px] text-[#806F64]">{r.family_member_phone}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => navigate(`/cases/${r.case_id}`)}
                        className="rounded bg-[#FFF4EC] border border-[#E8C9B0] px-2.5 py-1 text-[11px] font-bold text-[#7A3A12] hover:bg-[#C65A16] hover:text-white transition-colors"
                      >
                        View Case
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalAidRequests;

