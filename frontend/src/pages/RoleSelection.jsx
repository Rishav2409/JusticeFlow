import { useNavigate, Link } from 'react-router-dom';
import { isAuthenticated, getUser } from '../services/auth';
import { useLanguage } from '../context/LanguageContext';
import { useEffect } from 'react';
import JusticeLogo from '../components/JusticeLogo';

const ROLE_DASHBOARDS = {
  LAWYER: '/cases',
  POLICE: '/police/dashboard',
  FAMILY_MEMBER: '/family/dashboard',
  FAMILY: '/family/dashboard',
};

const RoleSelection = () => {
  const navigate = useNavigate();
  const { language: currentLang, setLanguage, t, LANGUAGES } = useLanguage();

  // If already authenticated, redirect to role-specific dashboard
  useEffect(() => {
    if (isAuthenticated()) {
      const user = getUser();
      const dest = user?.role ? (ROLE_DASHBOARDS[user.role] || '/cases') : '/cases';
      navigate(dest, { replace: true });
    }
  }, [navigate]);

  const roles = [
    {
      key: 'lawyer',
      icon: '⚖️',
      title: t('lawyerTitle'),
      subtitle: t('lawyerHeader'),
      description: t('lawyerDesc'),
      buttonText: `${t('continueBtn')} →`,
    },
    {
      key: 'police',
      icon: '🛡️',
      title: t('policeTitle'),
      subtitle: t('policeHeader'),
      description: t('policeDesc'),
      buttonText: `${t('continueBtn')} →`,
    },
    {
      key: 'family',
      icon: '👨‍👩‍👧',
      title: t('familyTitle'),
      subtitle: t('familyHeader'),
      description: t('familyDesc'),
      buttonText: `${t('continueBtn')} →`,
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      {/* Top Bar with Language Selector */}
      <div className="max-w-5xl mx-auto w-full px-4 pt-6 flex justify-between items-center">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5E4B40] hover:text-[#C65A16] transition-colors"
        >
          ← {t('selectLanguage')} ({LANGUAGES[currentLang]?.native})
        </Link>

        <div className="flex items-center gap-2">
          {Object.values(LANGUAGES).map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`
                px-2.5 py-1 rounded-md text-xs font-bold transition-colors
                ${currentLang === l.code
                  ? 'bg-[#C65A16] text-white'
                  : 'bg-[#FFF4EC] text-[#7A3A12] hover:bg-[#FDE8D7]'
                }
              `}
            >
              {l.native}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="pt-8 pb-4 text-center px-4">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-lg border border-[#E8D5C4] p-3">
          <JusticeLogo />
        </div>

        <h1 className="text-3xl font-bold text-[#2B170D] tracking-wide">
          {t('appName')}
        </h1>
        <p className="mt-1 text-sm font-semibold uppercase tracking-[0.14em] text-[#C65A16]">
          {t('appSubtitle')}
        </p>

        <h2 className="mt-6 text-xl font-bold text-[#2B170D]">
          {t('selectRole')}
        </h2>
        <p className="mt-1 text-sm text-[#5E4B40] max-w-lg mx-auto">
          Choose your designated portal to continue
        </p>
      </div>

      {/* 3 Role Cards */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {roles.map((role) => (
            <div
              key={role.key}
              onClick={() => navigate(`/login?role=${role.key}`)}
              className="
                group relative rounded-xl border border-[#D8B9A0] bg-[#FFF9F5]
                p-8 text-center transition-all duration-200 flex flex-col items-center
                shadow-md hover:shadow-xl hover:border-[#C65A16] hover:-translate-y-1 cursor-pointer
              "
            >
              <span className="text-5xl mb-4 block" role="img" aria-label={role.title}>
                {role.icon}
              </span>

              <h3 className="text-xl font-bold text-[#2B170D] mb-1">
                {role.title}
              </h3>

              <span className="inline-block rounded bg-[#FFF4EC] border border-[#E8C9B0] px-3 py-1 text-xs font-bold text-[#7A3A12] mb-3">
                {role.subtitle}
              </span>

              <p className="text-sm text-[#5E4B40] mb-8 leading-relaxed min-h-[3.5rem]">
                {role.description}
              </p>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/login?role=${role.key}`);
                }}
                className="
                  w-full rounded-lg bg-[#C65A16] px-6 py-3.5 text-sm font-bold
                  text-white uppercase tracking-wide transition-colors duration-200
                  group-hover:bg-[#E06B1F] focus:outline-none focus:ring-2 focus:ring-[#C65A16]
                  mt-auto shadow-sm
                "
              >
                {role.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 text-center border-t border-[#E8D5C4] px-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF4EC] border border-[#E8C9B0] px-4 py-1.5 mb-2">
          <span className="h-2 w-2 rounded-full bg-[#E06B1F]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#7A3A12]">
            {t('demoNotice')}
          </span>
        </div>
        <p className="text-xs text-[#806F64] max-w-2xl mx-auto">
          {t('disclaimer')}
        </p>
      </div>
    </div>
  );
};

export default RoleSelection;
