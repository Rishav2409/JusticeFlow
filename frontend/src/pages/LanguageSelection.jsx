import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import JusticeLogo from '../components/JusticeLogo';

const LanguageSelection = () => {
  const navigate = useNavigate();
  const { setLanguage } = useLanguage();

  const handleSelect = (langCode) => {
    setLanguage(langCode);
    navigate('/role-selection');
  };

  const languageOptions = [
    {
      code: 'en',
      title: 'English',
      native: 'English',
      description: 'Continue in English language',
      badge: 'Default',
    },
    {
      code: 'hi',
      title: 'Hindi',
      native: 'हिन्दी',
      description: 'हिन्दी भाषा में आगे बढ़ें',
      badge: 'राजभाषा',
    },
    {
      code: 'ta',
      title: 'Tamil',
      native: 'தமிழ்',
      description: 'தமிழில் தொடரவும்',
      badge: 'தமிழ்',
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      {/* Header */}
      <div className="pt-16 pb-6 text-center px-4">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-lg border border-[#E8D5C4] p-3">
          <JusticeLogo />
        </div>

        <h1 className="text-3xl font-bold text-[#2B170D] tracking-wide">
          JusticeFlow
        </h1>
        <p className="mt-1 text-sm font-semibold uppercase tracking-[0.14em] text-[#C65A16]">
          Legal-Aid Screening Assistant
        </p>

        <div className="mt-8 max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-[#2B170D]">
            Select Your Language / भाषा चुनें / மொழியைத் தேர்ந்தெடுக்கவும்
          </h2>
          <p className="mt-2 text-sm text-[#5E4B40]">
            Please choose your preferred language to continue
          </p>
        </div>
      </div>

      {/* Language Cards */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
          {languageOptions.map((opt) => (
            <div
              key={opt.code}
              onClick={() => handleSelect(opt.code)}
              className="
                group relative rounded-xl border border-[#D8B9A0] bg-[#FFF9F5]
                px-6 py-8 text-center transition-all duration-200
                flex flex-col items-center shadow-md hover:shadow-xl hover:border-[#C65A16]
                hover:-translate-y-1 cursor-pointer
              "
            >
              <span className="absolute top-3 right-3 rounded-full bg-[#FFF4EC] border border-[#E8C9B0] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#C65A16]">
                {opt.badge}
              </span>

              <div className="h-16 w-16 rounded-full bg-[#FFF4EC] border border-[#E8D5C4] flex items-center justify-center mb-4 group-hover:bg-[#C65A16] transition-colors">
                <span className="text-2xl font-bold text-[#C65A16] group-hover:text-white transition-colors">
                  {opt.native.charAt(0)}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-[#2B170D] mb-1">
                {opt.native}
              </h3>
              <p className="text-sm font-semibold text-[#C65A16] mb-3">
                {opt.title}
              </p>
              <p className="text-xs text-[#5E4B40] mb-6 leading-relaxed">
                {opt.description}
              </p>

              <button
                type="button"
                className="
                  w-full rounded-lg bg-[#C65A16] px-6 py-3 text-sm font-bold
                  text-white uppercase tracking-wide transition-colors duration-200
                  group-hover:bg-[#E06B1F] mt-auto
                "
              >
                Select {opt.native}
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
            Demo Environment
          </span>
        </div>
        <p className="text-xs text-[#806F64]">
          JusticeFlow • Legal-Aid Screening Assistant
        </p>
      </div>
    </div>
  );
};

export default LanguageSelection;

