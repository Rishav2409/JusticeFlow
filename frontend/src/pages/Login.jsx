import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { login, isAuthenticated, getUser } from '../services/auth';
import { useLanguage } from '../context/LanguageContext';
import JusticeLogo from '../components/JusticeLogo';

const DEMO_ACCOUNTS = {
  lawyer: [
    { name: 'Advocate Ananya Sharma', email: 'ananya.lawyer@justiceflow.demo', password: 'lawyer123', tag: 'Criminal Defense, Central Delhi' },
    { name: 'Advocate Rahul Verma', email: 'rahul.lawyer@justiceflow.demo', password: 'lawyer123', tag: 'Legal Aid & Remand, South Delhi' },
    { name: 'Advocate Priya Menon', email: 'priya.lawyer@justiceflow.demo', password: 'lawyer123', tag: 'Trial Advocacy, New Delhi' },
  ],
  police: [
    { name: 'Officer Arjun Kumar', email: 'arjun.police@justiceflow.demo', password: 'police123', tag: 'PS Central Delhi' },
    { name: 'Officer Kavya Singh', email: 'kavya.police@justiceflow.demo', password: 'police123', tag: 'PS South Delhi' },
    { name: 'Officer Ravi Kumar', email: 'ravi.police@justiceflow.demo', password: 'police123', tag: 'PS New Delhi' },
  ],
  family: [
    { name: 'Ramesh Kumar', email: 'ramesh.family@justiceflow.demo', password: 'family123', tag: 'Case JF-1001' },
    { name: 'Sunita Devi', email: 'sunita.family@justiceflow.demo', password: 'family123', tag: 'Case JF-1002' },
    { name: 'Meena Raj', email: 'meena.family@justiceflow.demo', password: 'family123', tag: 'Case JF-1024' },
  ],
};

const ROLE_CONFIG = {
  lawyer: {
    roleKey: 'lawyer',
    titleKey: 'lawyerTitle',
    subtitleKey: 'lawyerDesc',
    icon: '⚖️',
    labelKey: 'email',
    defaultEmail: 'ananya.lawyer@justiceflow.demo',
    defaultPassword: 'lawyer123',
    dashboard: '/cases',
  },
  police: {
    roleKey: 'police',
    titleKey: 'policeTitle',
    subtitleKey: 'policeDesc',
    icon: '🛡️',
    labelKey: 'email',
    defaultEmail: 'arjun.police@justiceflow.demo',
    defaultPassword: 'police123',
    dashboard: '/police/dashboard',
  },
  family: {
    roleKey: 'family',
    titleKey: 'familyTitle',
    subtitleKey: 'familyDesc',
    icon: '👨‍👩‍👧',
    labelKey: 'email',
    defaultEmail: 'ramesh.family@justiceflow.demo',
    defaultPassword: 'family123',
    dashboard: '/family/dashboard',
  },
};

const ROLE_DASHBOARDS = {
  LAWYER: '/cases',
  POLICE: '/police/dashboard',
  FAMILY_MEMBER: '/family/dashboard',
  FAMILY: '/family/dashboard',
};

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleKey = searchParams.get('role') || 'lawyer';
  const config = ROLE_CONFIG[roleKey] || ROLE_CONFIG.lawyer;
  const accounts = DEMO_ACCOUNTS[roleKey] || DEMO_ACCOUNTS.lawyer;

  const { language: currentLang, setLanguage, t, LANGUAGES } = useLanguage();

  const [email, setEmail] = useState(accounts[0]?.email || '');
  const [password, setPassword] = useState(accounts[0]?.password || '');
  const [selectedAccountIdx, setSelectedAccountIdx] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated()) {
      const user = getUser();
      const dest = user?.role ? (ROLE_DASHBOARDS[user.role] || '/cases') : '/cases';
      navigate(dest, { replace: true });
    }
  }, [navigate]);

  const handleSelectAccount = (acc, idx) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setSelectedAccountIdx(idx);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      const data = await login(email.trim(), password);
      if (data.success) {
        const userRole = data.user?.role;
        const dest = userRole ? (ROLE_DASHBOARDS[userRole] || config.dashboard) : config.dashboard;
        navigate(dest, { replace: true });
      } else {
        setError(data.error || 'Login failed.');
      }
    } catch (err) {
      const message = err.response?.data?.error || 'Invalid email or password.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between px-4 py-6">
      {/* Top Header */}
      <div className="max-w-md mx-auto w-full flex justify-between items-center mb-6">
        <Link
          to="/role-selection"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#5E4B40] hover:text-[#C65A16] transition-colors"
        >
          ← {t('back')}
        </Link>

        <div className="flex items-center gap-1.5">
          {Object.values(LANGUAGES).map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`
                px-2.5 py-1 rounded-md text-xs font-bold transition-colors
                ${currentLang === l.code
                  ? 'bg-[#C65A16] text-white shadow-sm'
                  : 'bg-[#FFF4EC] text-[#7A3A12] hover:bg-[#FDE8D7]'
                }
              `}
            >
              {l.native}
            </button>
          ))}
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md mx-auto">
        <div className="rounded-2xl border border-[#D8B9A0] bg-[#FFF9F5] p-8 shadow-lg">
          {/* Brand & Icon */}
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow border border-[#E8D5C4] p-2.5">
              {roleKey === 'lawyer' ? (
                <JusticeLogo />
              ) : (
                <span className="text-3xl">{config.icon}</span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-[#2B170D]">
              {t(config.titleKey)} {t('login')}
            </h1>
            <p className="mt-1 text-xs text-[#5E4B40]">
              {t(config.subtitleKey)}
            </p>
          </div>

          {/* Multiple Accounts Selector */}
          <div className="mb-5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A3A12] mb-2">
              Select Authenticated Account:
            </label>
            <div className="space-y-1.5">
              {accounts.map((acc, idx) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleSelectAccount(acc, idx)}
                  className={`
                    w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between
                    ${selectedAccountIdx === idx
                      ? 'border-[#C65A16] bg-[#FFF4EC] shadow-sm text-[#2B170D]'
                      : 'border-[#E8D5C4] bg-white text-[#5E4B40] hover:bg-[#FFF9F5]'
                    }
                  `}
                >
                  <div className="min-w-0">
                    <p className="font-bold truncate">{acc.name}</p>
                    <p className="text-[10px] text-[#806F64] truncate">{acc.tag} • {acc.email}</p>
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                    selectedAccountIdx === idx ? 'bg-[#C65A16] text-white' : 'text-[#806F64]'
                  }`}>
                    {selectedAccountIdx === idx ? 'Selected' : 'Select'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="mb-5 rounded-lg border border-[#E8A0A0] bg-[#FDF0F0] px-4 py-2.5 text-xs text-[#B94343] font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2B170D] mb-1.5">
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="
                  w-full rounded-lg border border-[#D8B9A0] bg-white px-4 py-2.5
                  text-sm text-[#2B170D] placeholder-[#A09488] focus:border-[#C65A16]
                  focus:ring-2 focus:ring-[#C65A16]/20 transition-colors
                "
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2B170D] mb-1.5">
                {t('password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="
                  w-full rounded-lg border border-[#D8B9A0] bg-white px-4 py-2.5
                  text-sm text-[#2B170D] placeholder-[#A09488] focus:border-[#C65A16]
                  focus:ring-2 focus:ring-[#C65A16]/20 transition-colors
                "
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`
                w-full rounded-lg py-3 text-sm font-bold uppercase tracking-wider
                text-white transition-colors duration-200 mt-2 shadow-sm
                ${loading
                  ? 'bg-[#D8B9A0] cursor-not-allowed'
                  : 'bg-[#C65A16] hover:bg-[#E06B1F]'
                }
              `}
            >
              {loading ? `${t('login')}...` : t('login')}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-xs text-[#806F64]">
          {t('appName')} • {t('appSubtitle')}
        </p>
      </div>
    </div>
  );
};

export default Login;
