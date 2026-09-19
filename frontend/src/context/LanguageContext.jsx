import { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'justiceflow_language';

export const LANGUAGES = {
  en: { code: 'en', label: 'English', native: 'English' },
  hi: { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  ta: { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
};

const translations = {
  en: {
    // Top Bar & Brand
    language: 'LANGUAGE:',
    appName: 'JusticeFlow',
    appSubtitle: 'Legal-Aid Screening Assistant',
    lawyerHeader: 'Legal-Aid Screening',
    policeHeader: 'Police Case Verification',
    familyHeader: 'Family Legal-Aid Assistance',
    demoNotice: 'Demo Environment — Synthetic case data only',
    disclaimer: 'This prototype provides preliminary case screening based on configured statutory rules. It does not constitute legal advice, determine final entitlement to bail, or replace review by a qualified legal professional or competent court.',

    // Roles
    lawyer: 'Lawyer',
    police: 'Police',
    familyMember: 'Family Member',
    lawyerTitle: 'Lawyer',
    policeTitle: 'Police',
    familyTitle: 'Family Member',
    lawyerDesc: 'Access case screening, eligibility analysis and case management.',
    policeDesc: 'Case verification, investigation tracking and information access.',
    familyDesc: 'Case status tracking, legal-aid assistance and know your rights.',
    selectRole: 'Select Your Role',
    continue: 'Continue',

    // Navigation & Common Actions
    dashboard: 'Dashboard',
    allCases: 'All Cases',
    newCase: 'New Case',
    caseSearch: 'Case Search',
    caseVerification: 'Case Verification',
    caseStatus: 'Case Status',
    priorityQueue: 'Priority Queue',
    legalAidRequests: 'Legal-Aid Requests',
    myRequests: 'My Requests',
    checkCase: 'Check Case',
    legalAidInfo: 'Legal-Aid Information',
    profile: 'Profile',
    logout: 'Logout',
    login: 'Login',
    email: 'Email',
    password: 'Password',
    submit: 'Submit',
    cancel: 'Cancel',
    search: 'Search',
    save: 'Save',
    back: 'Back',
    accept: 'Accept',
    decline: 'Decline',
    viewCase: 'View Case',
    verifyCase: 'Verify Case',

    // Case Fields
    caseNumber: 'Case Number',
    prisonerName: 'Prisoner Name',
    firNumber: 'FIR Number',
    district: 'District',
    court: 'Court',
    offence: 'Offence / Section',
    dateOfArrest: 'Date of Arrest',
    custodyStartDate: 'Date of Arrest / Custody Start Date',
    eligibility: 'Eligibility',

    // Statuses & Indicators
    potentiallyEligible: 'POTENTIALLY ELIGIBLE',
    thresholdReached: 'Threshold reached based on configured screening rules',
    notYetEligible: 'NOT YET AT THRESHOLD',
    approachingThreshold: 'Approaching Threshold',
    statutorilyExcluded: 'Statutorily Excluded',
    requestLegalAid: 'REQUEST LEGAL-AID ASSISTANCE',
    requestAssistance: 'Request Assistance',
    highAttention: 'HIGH ATTENTION',
    mediumAttention: 'MEDIUM ATTENTION',
    custodyDuration: 'Custody Duration',
    configuredThreshold: 'Configured Threshold',
    daysBeyondThreshold: 'Days Beyond Threshold',
    remainingDays: 'Days Remaining',
    verified: 'Verified',
    pendingVerification: 'Pending Verification',
  },

  hi: {
    // Top Bar & Brand
    language: 'भाषा (LANGUAGE):',
    appName: 'न्यायप्रवाह (JusticeFlow)',
    appSubtitle: 'विधिक सहायता केस स्क्रीनिंग सहायक',
    lawyerHeader: 'विधिक सहायता स्क्रीनिंग',
    policeHeader: 'पुलिस केस सत्यापन एवं पंजीकरण',
    familyHeader: 'पारिवारिक विधिक सहायता एवं स्थिति',
    demoNotice: 'डेमो वातावरण — केवल सांकेतिक केस डेटा',
    disclaimer: 'यह प्रारंभिक केस स्क्रीनिंग वैधानिक नियमों पर आधारित है। यह विधिक सलाह नहीं है और जमानत का अंतिम निर्णय सक्षम न्यायालय के अधीन है।',

    // Roles
    lawyer: 'अधिवक्ता (Lawyer)',
    police: 'पुलिस (Police)',
    familyMember: 'परिवारजन (Family Member)',
    lawyerTitle: 'अधिवक्ता (Lawyer)',
    policeTitle: 'पुलिस (Police)',
    familyTitle: 'परिवारजन (Family Member)',
    lawyerDesc: 'केस स्क्रीनिंग, पात्रता विश्लेषण और प्राथमिकता कतार तक पहुंचें।',
    policeDesc: 'नया केस दर्ज करें, केस सत्यापन और अधिकृत जानकारी देखें।',
    familyDesc: 'केस की स्थिति जांचें, विधिक सहायता का अनुरोध करें और अधिकार जानें।',
    selectRole: 'अपनी भूमिका चुनें (Select Your Role)',
    continue: 'आगे बढ़ें (Continue)',

    // Navigation & Common Actions
    dashboard: 'डैशबोर्ड (Dashboard)',
    allCases: 'सभी केस (All Cases)',
    newCase: 'नया केस (New Case)',
    caseSearch: 'केस खोज (Case Search)',
    caseVerification: 'केस सत्यापन (Case Verification)',
    caseStatus: 'केस स्थिति (Case Status)',
    priorityQueue: 'प्राथमिकता कतार (Priority Queue)',
    legalAidRequests: 'विधिक सहायता अनुरोध (Requests)',
    myRequests: 'मेरे अनुरोध (My Requests)',
    checkCase: 'केस जांचें (Check Case)',
    legalAidInfo: 'विधिक सहायता सूचना (Legal Info)',
    profile: 'प्रोफ़ाइल (Profile)',
    logout: 'लॉगआउट (Logout)',
    login: 'लॉग इन (Login)',
    email: 'ईमेल (Email)',
    password: 'पासवर्ड (Password)',
    submit: 'जमा करें (Submit)',
    cancel: 'रद्द करें (Cancel)',
    search: 'खोजें (Search)',
    save: 'सहेजें (Save)',
    back: 'पीछे (Back)',
    accept: 'स्वीकार करें (Accept)',
    decline: 'अस्वीकार करें (Decline)',
    viewCase: 'केस देखें (View Case)',
    verifyCase: 'केस सत्यापित करें (Verify)',

    // Case Fields
    caseNumber: 'केस संख्या (Case Number)',
    prisonerName: 'बंदी का नाम (Prisoner Name)',
    firNumber: 'प्राथमिकी संख्या (FIR Number)',
    district: 'जिला (District)',
    court: 'न्यायालय (Court)',
    offence: 'अपराध / धारा (Offence / Section)',
    dateOfArrest: 'गिरफ्तारी की तारीख (Date of Arrest)',
    custodyStartDate: 'गिरफ्तारी / हिरासत आरंभ तिथि',
    eligibility: 'पात्रता (Eligibility)',

    // Statuses & Indicators
    potentiallyEligible: 'संभावित पात्र (POTENTIALLY ELIGIBLE)',
    thresholdReached: 'कॉन्फ़िगर किए गए नियमों के आधार पर सीमा पूरी हो चुकी है',
    notYetEligible: 'अभी सीमा पूरी नहीं हुई (NOT YET AT THRESHOLD)',
    approachingThreshold: 'सीमा के निकट (Approaching Threshold)',
    statutorilyExcluded: 'कानूनी रूप से बाहर (Excluded)',
    requestLegalAid: 'विधिक सहायता का अनुरोध करें',
    requestAssistance: 'सहायता का अनुरोध करें',
    highAttention: 'उच्च प्राथमिकता (HIGH ATTENTION)',
    mediumAttention: 'मध्यम प्राथमिकता (MEDIUM ATTENTION)',
    custodyDuration: 'हिरासत अवधि (दिन)',
    configuredThreshold: 'निर्धारित सीमा (दिन)',
    daysBeyondThreshold: 'सीमा से अधिक दिन',
    remainingDays: 'शेष दिन',
    verified: 'सत्यापित (Verified)',
    pendingVerification: 'सत्यापन लंबित (Pending)',
  },

  ta: {
    // Top Bar & Brand
    language: 'மொழி (LANGUAGE):',
    appName: 'ஜஸ்டிஸ்ஃப்ளோ (JusticeFlow)',
    appSubtitle: 'சட்ட உதவி வழக்கு பரிசீலனை உதவியாளர்',
    lawyerHeader: 'சட்ட உதவி பரிசீலனை',
    policeHeader: 'காவல்துறை வழக்கு சரிபார்ப்பு',
    familyHeader: 'குடும்ப சட்ட உதவி மற்றும் நிலை',
    demoNotice: 'மாதிரி சூழல் — போலி வழக்கு தரவு மட்டுமே',
    disclaimer: 'இது சட்டப்பூர்வ விதிகளின் அடிப்படையிலான பூர்வாங்க பரிசீலனையாகும். இது சட்ட ஆலோசனையல்ல, பிணைக்கான இறுதி முடிவை நீதிமன்றமே தீர்மானிக்கும்.',

    // Roles
    lawyer: 'வழக்கறிஞர் (Lawyer)',
    police: 'காவல்துறை (Police)',
    familyMember: 'குடும்ப உறுப்பினர் (Family Member)',
    lawyerTitle: 'வழக்கறிஞர் (Lawyer)',
    policeTitle: 'காவல்துறை (Police)',
    familyTitle: 'குடும்ப உறுப்பினர் (Family Member)',
    lawyerDesc: 'வழக்கு பரிசீலனை, தகுதி பகுப்பாய்வு மற்றும் முன்னுரிமை வரிசை.',
    policeDesc: 'புதிய வழக்கு பதிவு, வழக்கு சரிபார்ப்பு மற்றும் அதிகாரப்பூர்வ தகவல்.',
    familyDesc: 'வழக்கு நிலையை அறியவும், இலவச சட்ட உதவி கோரவும்.',
    selectRole: 'உங்கள் பொறுப்பைத் தேர்ந்தெடுக்கவும்',
    continue: 'தொடரவும் (Continue)',

    // Navigation & Common Actions
    dashboard: 'முகப்பு (Dashboard)',
    allCases: 'அனைத்து வழக்குகள் (All Cases)',
    newCase: 'புதிய வழக்கு (New Case)',
    caseSearch: 'வழக்கு தேடல் (Case Search)',
    caseVerification: 'வழக்கு சரிபார்ப்பு (Verification)',
    caseStatus: 'வழக்கு நிலை (Case Status)',
    priorityQueue: 'முன்னுரிமை வரிசை (Priority Queue)',
    legalAidRequests: 'சட்ட உதவி கோரிக்கைகள் (Requests)',
    myRequests: 'எனது கோரிக்கைகள் (My Requests)',
    checkCase: 'வழக்கை சரிபார்க்கவும் (Check Case)',
    legalAidInfo: 'சட்ட உதவி தகவல் (Legal Info)',
    profile: 'சுயவிவரம் (Profile)',
    logout: 'வெளியேறு (Logout)',
    login: 'உள்நுழைக (Login)',
    email: 'மின்னஞ்சல் (Email)',
    password: 'கடவுச்சொல் (Password)',
    submit: 'சமர்ப்பி (Submit)',
    cancel: 'ரத்து செய் (Cancel)',
    search: 'தேடு (Search)',
    save: 'சேமி (Save)',
    back: 'பின்செல்க (Back)',
    accept: 'ஏற்றுக்கொள் (Accept)',
    decline: 'நிராகரி (Decline)',
    viewCase: 'வழக்கை பார்க்கவும் (View Case)',
    verifyCase: 'வழக்கை சரிபார்க்கவும் (Verify)',

    // Case Fields
    caseNumber: 'வழக்கு எண் (Case Number)',
    prisonerName: 'கைதி பெயர் (Prisoner Name)',
    firNumber: 'முதல் தகவல் அறிக்கை எண் (FIR)',
    district: 'மாவட்டம் (District)',
    court: 'நீதிமன்றம் (Court)',
    offence: 'குற்றப்பிரிவு (Offence / Section)',
    dateOfArrest: 'கைது தேதி (Date of Arrest)',
    custodyStartDate: 'கைது / காவல் தொடக்க தேதி',
    eligibility: 'தகுதி (Eligibility)',

    // Statuses & Indicators
    potentiallyEligible: 'சாத்தியமான தகுதி (POTENTIALLY ELIGIBLE)',
    thresholdReached: 'விதிகளின்படி தேவையான காவல் கால வரம்பு எட்டப்பட்டது',
    notYetEligible: 'இன்னும் வரம்பை எட்டவில்லை (NOT YET AT THRESHOLD)',
    approachingThreshold: 'வரம்பை நெருங்குகிறது (Approaching)',
    statutorilyExcluded: 'விதிவிலக்கு அளிக்கப்பட்டது (Excluded)',
    requestLegalAid: 'இலவச சட்ட உதவி கோரவும்',
    requestAssistance: 'உதவி கோரவும்',
    highAttention: 'அதிக முன்னுரிமை (HIGH ATTENTION)',
    mediumAttention: 'நடுத்தர முன்னுரிமை (MEDIUM ATTENTION)',
    custodyDuration: 'காவல் காலம் (நாட்கள்)',
    configuredThreshold: 'தேவையான கால வரம்பு (நாட்கள்)',
    daysBeyondThreshold: 'வரம்பை கடந்த நாட்கள்',
    remainingDays: 'மீதமுள்ள நாட்கள்',
    verified: 'சரிபார்க்கப்பட்டது (Verified)',
    pendingVerification: 'சரிபார்ப்பு நிலுவையில் (Pending)',
  },
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'en';
  });

  const setLanguage = (lang) => {
    if (LANGUAGES[lang]) {
      setLanguageState(lang);
      localStorage.setItem(STORAGE_KEY, lang);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && LANGUAGES[stored] && stored !== language) {
      setLanguageState(stored);
    }
  }, []);

  const t = (key) => {
    const dict = translations[language] || translations.en;
    return dict[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Fallback if rendered outside LanguageProvider
    const fallbackLang = localStorage.getItem(STORAGE_KEY) || 'en';
    return {
      language: fallbackLang,
      setLanguage: (l) => localStorage.setItem(STORAGE_KEY, l),
      t: (k) => translations[fallbackLang]?.[k] || translations.en[k] || k,
      LANGUAGES,
    };
  }
  return ctx;
};

export default LanguageContext;

