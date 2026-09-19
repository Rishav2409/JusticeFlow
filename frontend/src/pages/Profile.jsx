import { getUser, logout } from '../services/auth';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const user = getUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/role-selection');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="rounded-2xl border border-[#D8B9A0] bg-[#FFF9F5] p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-[#2B170D] flex items-center gap-2">
          <span>👤</span> User Profile
        </h1>
        <p className="text-xs text-[#5E4B40] mt-0.5">
          Authenticated Session Details • JusticeFlow Demo Platform
        </p>
      </div>

      <div className="rounded-2xl border border-[#D8B9A0] bg-white p-6 shadow-md space-y-5">
        <div className="flex items-center gap-4 border-b border-[#E8D5C4] pb-4">
          <div className="h-16 w-16 rounded-full bg-[#FFF4EC] border border-[#E8C9B0] flex items-center justify-center text-3xl">
            {user?.role === 'LAWYER' ? '⚖️' : user?.role === 'POLICE' ? '🛡️' : '👨‍👩‍👧'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#2B170D]">{user?.name}</h2>
            <p className="text-xs text-[#5E4B40]">{user?.email}</p>
            <span className="inline-block mt-1 rounded bg-[#C65A16] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              {user?.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl bg-[#FFF9F5] border border-[#E8D5C4] p-3">
            <span className="text-[#806F64] font-semibold block">User ID:</span>
            <span className="font-bold text-[#2B170D] text-sm">{user?.id}</span>
          </div>

          <div className="rounded-xl bg-[#FFF9F5] border border-[#E8D5C4] p-3">
            <span className="text-[#806F64] font-semibold block">Jurisdiction / District:</span>
            <span className="font-bold text-[#2B170D] text-sm">{user?.district || 'Central Delhi'}</span>
          </div>

          <div className="rounded-xl bg-[#FFF9F5] border border-[#E8D5C4] p-3">
            <span className="text-[#806F64] font-semibold block">Security Level:</span>
            <span className="font-bold text-[#4F8A62] text-sm">Role-Authorized (JWT)</span>
          </div>

          <div className="rounded-xl bg-[#FFF9F5] border border-[#E8D5C4] p-3">
            <span className="text-[#806F64] font-semibold block">Environment:</span>
            <span className="font-bold text-[#C65A16] text-sm">Demo / Review 2 Hackathon</span>
          </div>
        </div>

        <div className="pt-4 border-t border-[#E8D5C4] flex justify-end">
          <button
            onClick={handleLogout}
            className="rounded-xl bg-[#B94343] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#A33838] transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;

