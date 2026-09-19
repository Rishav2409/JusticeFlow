import { NavLink, useNavigate } from 'react-router-dom';
import { getUser, logout } from '../services/auth';
import { useLanguage } from '../context/LanguageContext';
import JusticeLogo from './JusticeLogo';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const user = getUser();
  const { language: currentLang, setLanguage, t, LANGUAGES } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate('/role-selection');
  };

  const isPolice = user?.role === 'POLICE';
  const isFamily = user?.role === 'FAMILY_MEMBER' || user?.role === 'FAMILY';
  const isLawyer = !isPolice && !isFamily;

  // Header Subtitle based on Role
  const roleSubtitle = isPolice
    ? t('policeHeader')
    : isFamily
    ? t('familyHeader')
    : t('lawyerHeader');

  const navItemClass = ({ isActive }) => `
    flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200
    ${isActive
      ? 'bg-[#C65A16] text-white shadow-md'
      : 'bg-transparent text-[#F5E8DE] hover:bg-[#4A2A1A] hover:text-white'
    }
  `;

  return (
    <div className="flex min-h-screen w-full bg-white text-[#2B170D]">
      {/* =====================================================
          SIDEBAR
          ===================================================== */}
      <aside className="w-64 md:w-72 flex-shrink-0 min-h-screen bg-[#2B170D] text-white flex flex-col justify-between">
        <div>
          {/* BRAND */}
          <div className="px-4 py-6 md:px-6 md:py-7 border-b border-[#4A2A1A]">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="h-11 w-11 md:h-12 md:w-12 flex-shrink-0 rounded-xl bg-white p-2 shadow-lg overflow-hidden flex items-center justify-center">
                <JusticeLogo />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-bold tracking-wide text-white leading-tight">
                  {t('appName')}
                </h1>
                <p className="mt-0.5 text-[10px] md:text-xs font-semibold uppercase tracking-[0.14em] text-[#F0A46F] truncate">
                  {roleSubtitle}
                </p>
              </div>
            </div>
          </div>

          {/* NAVIGATION */}
          <nav className="px-3 md:px-4 py-4 space-y-1">
            <p className="px-3 mb-2 text-[10px] md:text-xs font-bold uppercase tracking-[0.18em] text-[#D8B9A0]">
              {isPolice ? t('policeTitle') : isFamily ? t('familyTitle') : t('lawyerTitle')}
            </p>

            {/* LAWYER NAVIGATION (No New Case!) */}
            {isLawyer && (
              <>
                <NavLink to="/cases" end className={navItemClass}>
                  <span className="text-base">📊</span>
                  <span>{t('dashboard')}</span>
                </NavLink>

                <NavLink to="/cases" className={navItemClass}>
                  <span className="text-base">▣</span>
                  <span>{t('allCases')}</span>
                </NavLink>

                <NavLink to="/lawyer/priority-queue" className={navItemClass}>
                  <span className="text-base">⚡</span>
                  <span className="flex-1">{t('priorityQueue')}</span>
                  <span className="rounded-full bg-[#E06B1F] px-1.5 py-0.2 text-[10px] font-bold">New</span>
                </NavLink>

                <NavLink to="/lawyer/requests" className={navItemClass}>
                  <span className="text-base">📋</span>
                  <span>{t('legalAidRequests')}</span>
                </NavLink>

                <NavLink to="/profile" className={navItemClass}>
                  <span className="text-base">👤</span>
                  <span>{t('profile')}</span>
                </NavLink>
              </>
            )}

            {/* POLICE NAVIGATION (Includes New Case!) */}
            {isPolice && (
              <>
                <NavLink to="/police/dashboard" end className={navItemClass}>
                  <span className="text-base">🛡️</span>
                  <span>{t('dashboard')}</span>
                </NavLink>

                <NavLink to="/police/new-case" className={navItemClass}>
                  <span className="text-base">＋</span>
                  <span>{t('newCase')}</span>
                </NavLink>

                <NavLink to="/police/dashboard?tab=search" className={navItemClass}>
                  <span className="text-base">🔍</span>
                  <span>{t('caseSearch')}</span>
                </NavLink>

                <NavLink to="/police/dashboard?tab=verification" className={navItemClass}>
                  <span className="text-base">✓</span>
                  <span>{t('caseVerification')}</span>
                </NavLink>

                <NavLink to="/police/dashboard?tab=overview" className={navItemClass}>
                  <span className="text-base">📋</span>
                  <span>{t('caseStatus')}</span>
                </NavLink>

                <NavLink to="/profile" className={navItemClass}>
                  <span className="text-base">👤</span>
                  <span>{t('profile')}</span>
                </NavLink>
              </>
            )}

            {/* FAMILY MEMBER NAVIGATION */}
            {isFamily && (
              <>
                <NavLink to="/family/dashboard" end className={navItemClass}>
                  <span className="text-base">🏠</span>
                  <span>{t('dashboard')}</span>
                </NavLink>

                <NavLink to="/family/dashboard?tab=check" className={navItemClass}>
                  <span className="text-base">🔍</span>
                  <span>{t('checkCase')}</span>
                </NavLink>

                <NavLink to="/family/dashboard?tab=requests" className={navItemClass}>
                  <span className="text-base">📋</span>
                  <span>{t('myRequests')}</span>
                </NavLink>

                <NavLink to="/family/dashboard?tab=info" className={navItemClass}>
                  <span className="text-base">📖</span>
                  <span>{t('legalAidInfo')}</span>
                </NavLink>

                <NavLink to="/profile" className={navItemClass}>
                  <span className="text-base">👤</span>
                  <span>{t('profile')}</span>
                </NavLink>
              </>
            )}
          </nav>
        </div>

        {/* BOTTOM CONTROLS */}
        <div className="p-3 md:p-4 space-y-3">
          {/* Language Switcher in Sidebar */}
          <div className="rounded-lg bg-[#351C10] p-2 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D8B9A0]">
              🌐 {t('language')}
            </span>
            <div className="flex gap-1">
              {Object.values(LANGUAGES).map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`
                    px-2 py-0.5 rounded text-[11px] font-bold transition-colors
                    ${currentLang === l.code
                      ? 'bg-[#C65A16] text-white shadow-sm'
                      : 'text-[#BFA99A] hover:text-white bg-transparent'
                    }
                  `}
                >
                  {l.native}
                </button>
              ))}
            </div>
          </div>

          {/* AUTHENTICATED USER */}
          {user && (
            <div className="rounded-lg bg-[#351C10] p-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#F5E8DE] truncate">
                    {user.name}
                  </p>
                  <span className="inline-block mt-0.5 rounded bg-[#C65A16] px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-white">
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="
                    ml-2 flex-shrink-0 rounded-md px-2.5 py-1 text-[10px] font-bold
                    uppercase tracking-wider text-[#BFA99A] hover:text-white hover:bg-[#4A2A1A]
                    transition-colors
                  "
                  title={t('logout')}
                >
                  {t('logout')}
                </button>
              </div>
            </div>
          )}

          {/* DEMO ENVIRONMENT BADGE */}
          <div className="rounded-lg border border-[#5C3824] bg-[#351C10] p-2.5 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#E06B1F]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#F5E8DE]">
                {t('demoNotice')}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-[#BFA99A]">
              Synthetic case data only
            </p>
          </div>
        </div>
      </aside>

      {/* =====================================================
          MAIN AREA
          ===================================================== */}
      <main className="min-w-0 flex-1 min-h-screen bg-white flex flex-col">
        {/* Banner */}
        <div className="w-full border-b border-[#E8C9B0] bg-[#FFF4EC] px-4 py-2 text-center text-xs font-medium text-[#7A3A12]">
          <span className="mr-1.5">⚠</span>
          {t('demoNotice')}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 md:px-10">
          <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col">
            <div className="flex-1 min-w-0">
              {children}
            </div>

            {/* Footer */}
            <footer className="mt-10 border-t border-[#E8D5C4] pt-5 pb-5 text-center">
              <p className="max-w-4xl mx-auto text-[11px] leading-relaxed text-[#806F64]">
                {t('disclaimer')}
              </p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#A08D81]">
                {t('appName')} • {t('appSubtitle')}
              </p>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;