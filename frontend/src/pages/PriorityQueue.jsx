import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

const PriorityQueue = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [actionMessage, setActionMessage] = useState('');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await api.get('/lawyers/priority-queue');
      setQueue(res.data?.queue || []);
    } catch (err) {
      console.error('Failed to load priority queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleAccept = async (requestId) => {
    setActionLoading((prev) => ({ ...prev, [requestId]: 'accepting' }));
    setActionMessage('');
    try {
      const res = await api.post(`/lawyers/requests/${requestId}/accept`);
      setActionMessage(res.data?.message || 'Legal-aid request accepted.');
      fetchQueue();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to accept request.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: null }));
    }
  };

  const handleDecline = async (requestId) => {
    setActionLoading((prev) => ({ ...prev, [requestId]: 'declining' }));
    setActionMessage('');
    try {
      const res = await api.post(`/lawyers/requests/${requestId}/decline`);
      setActionMessage(res.data?.message || 'Legal-aid request declined.');
      fetchQueue();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to decline request.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: null }));
    }
  };

  const getPriorityBadge = (level) => {
    switch (level) {
      case 'HIGH_ATTENTION':
        return {
          badge: 'bg-[#FDF0F0] text-[#B94343] border-[#B94343]',
          label: 'HIGH ATTENTION',
          border: 'border-l-4 border-l-[#B94343]',
        };
      case 'MEDIUM':
        return {
          badge: 'bg-[#FFF6E8] text-[#B97820] border-[#B97820]',
          label: 'MEDIUM ATTENTION',
          border: 'border-l-4 border-l-[#B97820]',
        };
      case 'APPROACHING':
        return {
          badge: 'bg-blue-50 text-blue-700 border-blue-300',
          label: 'APPROACHING THRESHOLD',
          border: 'border-l-4 border-l-blue-500',
        };
      default:
        return {
          badge: 'bg-gray-100 text-gray-700 border-gray-300',
          label: 'STANDARD REVIEW',
          border: 'border-l-4 border-l-gray-400',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-[#D8B9A0] bg-[#FFF9F5] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">⚡</span>
              <h1 className="text-2xl font-bold text-[#2B170D]">
                Lawyer Priority Queue
              </h1>
            </div>
            <p className="text-xs text-[#5E4B40]">
              Transparent, explainable prioritization for incoming legal-aid assistance requests based on statutory detention metrics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-white border border-[#D8B9A0] px-3 py-1.5 text-xs font-bold text-[#C65A16]">
              Pending Requests: {queue.length}
            </span>
            <button
              onClick={fetchQueue}
              className="rounded-lg bg-[#C65A16] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#E06B1F] transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Incoming Notification Alert */}
      {queue.length > 0 && (
        <div className="rounded-2xl border-2 border-[#C65A16] bg-[#FFF4EC] p-5 shadow-md space-y-2">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🔔</span>
            <div className="flex-1">
              <h3 className="text-base font-bold text-[#2B170D]">
                New Bail Assistance Requests Awaiting Your Review ({queue.length})
              </h3>
              <p className="text-xs text-[#5E4B40] mt-0.5">
                Family members have submitted legal-aid representation requests specifically to you. Review the statutory detention metrics below and click <span className="font-bold text-[#4F8A62]">[Accept Request]</span> to confirm counsel representation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Notification */}
      {actionMessage && (
        <div className="rounded-xl border border-[#4F8A62] bg-[#EEF7F0] p-4 text-xs font-bold text-[#4F8A62] flex items-center justify-between">
          <span>✓ {actionMessage}</span>
          <button onClick={() => setActionMessage('')} className="hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Priority Logic Transparency Card */}
      <div className="rounded-xl border border-[#E8D5C4] bg-[#FFF4EC] p-4 text-xs text-[#7A3A12] leading-relaxed">
        <span className="font-bold">EXPLAINABLE PRIORITIZATION LOGIC: </span>
        Requests are ordered deterministically by statutory threshold status, days beyond threshold, and request waiting time. JusticeFlow presents factual indicators to support the legal professional's judgment and does not employ automated legal decisions.
      </div>

      {/* Queue Items */}
      {loading ? (
        <div className="text-center py-12 text-sm text-[#806F64]">
          Loading priority queue...
        </div>
      ) : queue.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-white border border-[#D8B9A0] p-6">
          <p className="text-base font-bold text-[#2B170D]">Priority Queue is Clear</p>
          <p className="text-xs text-[#5E4B40] mt-1">
            All pending legal-aid requests have been processed. New requests submitted by family members will appear here immediately.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((req) => {
            const p = getPriorityBadge(req.priority_level);
            return (
              <div
                key={req.id}
                className={`rounded-2xl border border-[#D8B9A0] bg-white p-6 shadow-md transition-shadow hover:shadow-lg ${p.border} space-y-4`}
              >
                {/* Top Row: Case & Priority Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8D5C4] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full border px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${p.badge}`}>
                        {p.label}
                      </span>
                      <span className="text-xs font-bold text-[#C65A16]">
                        {req.request_id}
                      </span>
                      <span className="text-xs text-[#806F64]">
                        • Case: <span className="font-bold text-[#2B170D]">{req.case_number}</span>
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#2B170D] mt-1">
                      {req.prisoner_name}
                    </h3>
                  </div>

                  <div className="text-sm font-semibold text-[#806F64]">
                    Waiting: <span className="font-bold text-[#2B170D]">{req.request_age_days} day(s)</span>
                  </div>
                </div>

                {/* Factual Indicators Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="rounded-xl bg-[#FFF9F5] border border-[#E8D5C4] p-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#806F64]">Credited Custody</p>
                    <p className="text-base font-bold text-[#2B170D] mt-0.5">{req.custody_duration_days} days</p>
                  </div>

                  <div className="rounded-xl bg-[#FFF9F5] border border-[#E8D5C4] p-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#806F64]">Threshold</p>
                    <p className="text-base font-bold text-[#2B170D] mt-0.5">{req.configured_threshold_days} days</p>
                  </div>

                  <div className={`rounded-xl border p-2.5 ${
                    req.days_beyond_threshold > 0
                      ? 'bg-[#EEF7F0] border-[#4F8A62] text-[#4F8A62]'
                      : 'bg-[#FFF6E8] border-[#B97820] text-[#B97820]'
                  }`}>
                    <p className="text-[10px] font-bold uppercase tracking-wider">
                      {req.days_beyond_threshold > 0 ? 'Beyond Threshold' : 'Detention Status'}
                    </p>
                    <p className="text-base font-bold mt-0.5">
                      {req.days_beyond_threshold > 0 ? `+${req.days_beyond_threshold} days` : 'Under Threshold'}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#FFF9F5] border border-[#E8D5C4] p-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#806F64]">Offence Law</p>
                    <p className="text-xs font-bold text-[#2B170D] mt-1 truncate" title={req.offence_name}>
                      {req.offence_name}
                    </p>
                  </div>
                </div>

                {/* Explainable Priority Reasons Box */}
                <div className="rounded-xl bg-[#FFF9F5] border border-[#E8D5C4] p-3 text-xs">
                  <span className="font-bold text-[#2B170D] block mb-1">
                    Priority Indicators & Justification:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {req.priority_reasons?.map((reason, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-md bg-white border border-[#D8B9A0] px-2.5 py-1 text-[11px] font-medium text-[#5E4B40]"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Family Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#5E4B40] gap-2">
                  <div>
                    <span className="font-semibold">Requested By:</span> {req.family_member_name} ({req.family_member_phone || 'N/A'})
                    {req.notes && <p className="italic text-[11px] text-[#806F64] mt-0.5">"{req.notes}"</p>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E8D5C4]">
                  <button
                    type="button"
                    onClick={() => navigate(`/cases/${req.case_id}`)}
                    className="
                      rounded-lg border border-[#D8B9A0] bg-white px-4 py-2 text-xs
                      font-bold text-[#2B170D] hover:bg-[#FFF4EC] transition-colors
                    "
                  >
                    View Case
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading[req.id] !== undefined && actionLoading[req.id] !== null}
                    onClick={() => handleDecline(req.id)}
                    className="
                      rounded-lg border border-[#E8A0A0] bg-white px-4 py-2 text-xs
                      font-bold text-[#B94343] hover:bg-[#FDF0F0] transition-colors
                    "
                  >
                    {actionLoading[req.id] === 'declining' ? 'Declining...' : 'Decline'}
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading[req.id] !== undefined && actionLoading[req.id] !== null}
                    onClick={() => handleAccept(req.id)}
                    className="
                      rounded-lg bg-[#4F8A62] px-5 py-2 text-xs font-bold uppercase
                      tracking-wider text-white hover:bg-[#437954] shadow-sm transition-colors
                    "
                  >
                    {actionLoading[req.id] === 'accepting' ? 'Accepting...' : 'Accept Request'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PriorityQueue;

