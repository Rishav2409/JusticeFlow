// =====================================================
// JUSTICEFLOW LOCALIZATION SERVICE
// Supports English, Hindi, Tamil
// =====================================================

const LANGUAGE_KEY = 'justiceflow_language';

export const LANGUAGES = {
  en: { code: 'en', label: 'English', native: 'English' },
  hi: { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  ta: { code: 'ta', label: 'Tamil', native: 'தமிழ்' }
};

export const translations = {
  en: {
    // Brand & App
    appName: 'JusticeFlow',
    appSubtitle: 'Legal-Aid Screening Assistant',
    lawyerHeader: 'Legal-Aid Case Management',
    policeHeader: 'Police Case Verification',
    familyHeader: 'Family Legal-Aid Assistance',
    demoNotice: 'Demo Environment — Synthetic case data only',
    disclaimer: 'This prototype provides preliminary case screening based on configured statutory rules. It does not constitute legal advice, determine final entitlement to bail, or replace review by a qualified legal professional or competent court.',
    
    // Navigation
    dashboard: 'Dashboard',
    allCases: 'All Cases',
    newCase: 'New Case',
    priorityQueue: 'Priority Queue',
    legalAidRequests: 'Legal-Aid Requests',
    myRequests: 'My Requests',
    checkCase: 'Check Case Status',
    caseStatus: 'Case Status',
    legalAidInfo: 'Legal-Aid Information',
    caseSearch: 'Case Search',
    caseVerification: 'Case Verification',
    profile: 'Profile',
    logout: 'Logout',
    selectLanguage: 'Select Language',
    selectRole: 'Select Your Role',

    // Role Titles
    lawyerTitle: 'Lawyer',
    policeTitle: 'Police',
    familyTitle: 'Family Member',
    lawyerDesc: 'Access case screening, eligibility analysis and case management.',
    policeDesc: 'Case verification, investigation tracking and information access.',
    familyDesc: 'Case status tracking, legal-aid assistance and know your rights.',
    continueBtn: 'Continue',

    // Statuses & Thresholds
    potentiallyEligible: 'POTENTIALLY ELIGIBLE',
    thresholdReached: 'Threshold reached based on configured screening rules',
    notYetEligible: 'NOT YET AT THRESHOLD',
    approachingThreshold: 'Approaching Threshold',
    statutorilyExcluded: 'Statutorily Excluded',
    requestLegalAid: 'REQUEST LEGAL-AID ASSISTANCE',
    requestAssistance: 'Request Assistance',
    caseNumber: 'Case Number',
    prisonerName: 'Prisoner Name',
    offence: 'Offence',
    district: 'District',
    court: 'Court',
    custodyDuration: 'Custody Duration',
    configuredThreshold: 'Configured Threshold',
    daysBeyondThreshold: 'Days Beyond Threshold',
    remainingDays: 'Days Remaining',
    thresholdDate: 'Estimated Threshold Date',
    verified: 'Verified',
    pendingVerification: 'Pending Verification',
    verifyCase: 'Verify Case',
    
    // Priority Queue
    highAttention: 'HIGH ATTENTION',
    mediumAttention: 'MEDIUM ATTENTION',
    reviewStatus: 'REVIEW',
    accept: 'Accept',
    decline: 'Decline',
    viewCase: 'View Case',
    requestWaiting: 'Request Waiting',
    priorityFactors: 'Priority Indicators',
    
    // Lawyer Directory
    availableLawyers: 'Available Legal-Aid Lawyers',
    practiceArea: 'Practice Area',
    languagesKnown: 'Languages',
    workload: 'Current Workload',
    availability: 'Availability',
    generalQueue: 'Route to Available Duty Counsel',
    
    // Actions
    search: 'Search',
    submit: 'Submit',
    cancel: 'Cancel',
    back: 'Back',
  },

  hi: {
    // Brand & App
    appName: 'न्यायप्रवाह (JusticeFlow)',
    appSubtitle: 'विधिक सहायता केस स्क्रीनिंग सहायक',
    lawyerHeader: 'विधिक सहायता केस प्रबंधन',
    policeHeader: 'पुलिस केस सत्यापन एवं अधिकृत सूचना',
    familyHeader: 'पारिवारिक विधिक सहायता एवं स्थिति',
    demoNotice: 'डेमो वातावरण — केवल सांकेतिक डेटा',
    disclaimer: 'यह प्रारंभिक केस स्क्रीनिंग वैधानिक नियमों पर आधारित है। यह विधिक सलाह नहीं है और जमानत का अंतिम निर्णय सक्षम न्यायालय के अधीन है।',
    
    // Navigation
    dashboard: 'डैशबोर्ड (Dashboard)',
    allCases: 'सभी केस (All Cases)',
    newCase: 'नया केस (New Case)',
    priorityQueue: 'प्राथमिकता कतार (Priority Queue)',
    legalAidRequests: 'विधिक सहायता अनुरोध (Requests)',
    myRequests: 'मेरे अनुरोध (My Requests)',
    checkCase: 'केस स्थिति जांचें (Check Case)',
    caseStatus: 'केस स्थिति (Case Status)',
    legalAidInfo: 'विधिक सहायता सूचना (Legal Info)',
    caseSearch: 'केस खोज (Case Search)',
    caseVerification: 'केस सत्यापन (Case Verification)',
    profile: 'प्रोफ़ाइल (Profile)',
    logout: 'लॉगआउट (Logout)',
    selectLanguage: 'भाषा चुनें (Select Language)',
    selectRole: 'अपनी भूमिका चुनें (Select Role)',

    // Role Titles
    lawyerTitle: 'अधिवक्ता (Lawyer)',
    policeTitle: 'पुलिस (Police)',
    familyTitle: 'परिवारजन (Family Member)',
    lawyerDesc: 'केस स्क्रीनिंग, पात्रता विश्लेषण और केस प्रबंधन तक पहुंचें।',
    policeDesc: 'केस सत्यापन, जांच ट्रैकिंग और अधिकृत जानकारी।',
    familyDesc: 'केस की स्थिति जांचें, विधिक सहायता का अनुरोध करें और अधिकार जानें।',
    continueBtn: 'आगे बढ़ें',

    // Statuses & Thresholds
    potentiallyEligible: 'संभावित पात्र (POTENTIALLY ELIGIBLE)',
    thresholdReached: 'कॉन्फ़िगर किए गए नियमों के आधार पर सीमा पूरी हो चुकी है',
    notYetEligible: 'अभी सीमा पूरी नहीं हुई (NOT YET AT THRESHOLD)',
    approachingThreshold: 'सीमा के निकट (Approaching Threshold)',
    statutorilyExcluded: 'कानूनी रूप से बाहर (Excluded)',
    requestLegalAid: 'विधिक सहायता का अनुरोध करें',
    requestAssistance: 'सहायता का अनुरोध करें',
    caseNumber: 'केस संख्या (Case Number)',
    prisonerName: 'बंदी का नाम',
    offence: 'अपराध धारा',
    district: 'जिला',
    court: 'न्यायालय',
    custodyDuration: 'हिरासत अवधि (दिन)',
    configuredThreshold: 'निर्धारित सीमा (दिन)',
    daysBeyondThreshold: 'सीमा से अधिक दिन',
    remainingDays: 'शेष दिन',
    thresholdDate: 'अनुमानित पात्रता तिथि',
    verified: 'सत्यापित (Verified)',
    pendingVerification: 'सत्यापन लंबित (Pending)',
    verifyCase: 'केस सत्यापित करें',

    // Priority Queue
    highAttention: 'उच्च प्राथमिकता (HIGH ATTENTION)',
    mediumAttention: 'मध्यम प्राथमिकता (MEDIUM)',
    reviewStatus: 'समीक्षाधीन (REVIEW)',
    accept: 'स्वीकार करें (Accept)',
    decline: 'अस्वीकार करें (Decline)',
    viewCase: 'केस देखें (View Case)',
    requestWaiting: 'प्रतीक्षा समय',
    priorityFactors: 'प्राथमिकता संकेतक',

    // Lawyer Directory
    availableLawyers: 'उपलब्ध विधिक सहायता अधिवक्ता',
    practiceArea: 'कार्यक्षेत्र',
    languagesKnown: 'भाषाएं',
    workload: 'कार्यभार',
    availability: 'उपलब्धता',
    generalQueue: 'सामान्य कानूनी सहायता कतार को भेजें',

    // Actions
    search: 'खोजें',
    submit: 'जमा करें',
    cancel: 'रद्द करें',
    back: 'पीछे जाएं',
  },

  ta: {
    // Brand & App
    appName: 'ஜஸ்டிஸ்ஃப்ளோ (JusticeFlow)',
    appSubtitle: 'சட்ட உதவி வழக்கு பரிசீலனை உதவியாளர்',
    lawyerHeader: 'சட்ட உதவி வழக்கு மேலாண்மை',
    policeHeader: 'காவல்துறை வழக்கு சரிபார்ப்பு',
    familyHeader: 'குடும்ப சட்ட உதவி மற்றும் நிலை',
    demoNotice: 'மாதிரி சூழல் — போலி வழக்கு தரவு மட்டுமே',
    disclaimer: 'இது சட்டப்பூர்வ விதிகளின் அடிப்படையிலான பூர்வாங்க பரிசீலனையாகும். இது சட்ட ஆலோசனையல்ல, பிணைக்கான இறுதி முடிவை நீதிமன்றமே தீர்மானிக்கும்.',
    
    // Navigation
    dashboard: 'முகப்பு (Dashboard)',
    allCases: 'அனைத்து வழக்குகள் (All Cases)',
    newCase: 'புதிய வழக்கு (New Case)',
    priorityQueue: 'முன்னுரிமை வரிசை (Priority Queue)',
    legalAidRequests: 'சட்ட உதவி கோரிக்கைகள்',
    myRequests: 'எனது கோரிக்கைகள் (My Requests)',
    checkCase: 'வழக்கு நிலை சரிபார்க்கவும்',
    caseStatus: 'வழக்கு நிலை (Case Status)',
    legalAidInfo: 'சட்ட உதவி தகவல் (Legal Info)',
    caseSearch: 'வழக்கு தேடல் (Case Search)',
    caseVerification: 'வழக்கு சரிபார்ப்பு',
    profile: 'சுயவிவரம் (Profile)',
    logout: 'வெளியேறு (Logout)',
    selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    selectRole: 'உங்கள் பொறுப்பைத் தேர்ந்தெடுக்கவும்',

    // Role Titles
    lawyerTitle: 'வழக்கறிஞர் (Lawyer)',
    policeTitle: 'காவல்துறை (Police)',
    familyTitle: 'குடும்ப உறுப்பினர் (Family Member)',
    lawyerDesc: 'வழக்கு பரிசீலனை, தகுதி பகுப்பாய்வு மற்றும் வழக்கு மேலாண்மை.',
    policeDesc: 'வழக்கு சரிபார்ப்பு மற்றும் அதிகாரப்பூர்வ தகவல் அணுகல்.',
    familyDesc: 'வழக்கு நிலையை அறியவும், சட்ட உதவி கோரவும் மற்றும் உரிமைகளை அறியவும்.',
    continueBtn: 'தொடரவும்',

    // Statuses & Thresholds
    potentiallyEligible: 'சாத்தியமான தகுதி (POTENTIALLY ELIGIBLE)',
    thresholdReached: 'விதிகளின்படி தேவையான காவல் கால வரம்பு எட்டப்பட்டது',
    notYetEligible: 'இன்னும் வரம்பை எட்டவில்லை',
    approachingThreshold: 'வரம்பை நெருங்குகிறது',
    statutorilyExcluded: 'விதிவிலக்கு அளிக்கப்பட்டது',
    requestLegalAid: 'இலவச சட்ட உதவி கோரவும்',
    requestAssistance: 'உதவி கோரவும்',
    caseNumber: 'வழக்கு எண்',
    prisonerName: 'கைதி பெயர்',
    offence: 'குற்றப்பிரிவு',
    district: 'மாவட்டம்',
    court: 'நீதிமன்றம்',
    custodyDuration: 'காவல் காலம் (நாட்கள்)',
    configuredThreshold: 'தேவையான கால வரம்பு',
    daysBeyondThreshold: 'வரம்பை கடந்த நாட்கள்',
    remainingDays: 'மீதமுள்ள நாட்கள்',
    thresholdDate: 'எதிர்பார்க்கப்படும் தேதி',
    verified: 'சரிபார்க்கப்பட்டது',
    pendingVerification: 'சரிபார்ப்பு நிலுவையில்',
    verifyCase: 'வழக்கை சரிபார்க்கவும்',

    // Priority Queue
    highAttention: 'அதிக முன்னுரிமை (HIGH ATTENTION)',
    mediumAttention: 'நடுத்தர முன்னுரிமை (MEDIUM)',
    reviewStatus: 'பரிசீலனை (REVIEW)',
    accept: 'ஏற்றுக்கொள் (Accept)',
    decline: 'நிராகரி (Decline)',
    viewCase: 'வழக்கை பார்க்கவும்',
    requestWaiting: 'காத்திருப்பு நேரம்',
    priorityFactors: 'முன்னுரிமை காரணிகள்',

    // Lawyer Directory
    availableLawyers: 'கிடைக்கும் சட்ட உதவி வழக்கறிஞர்கள்',
    practiceArea: 'பயிற்சி துறை',
    languagesKnown: 'மொழிகள்',
    workload: 'பணிச்சுமை',
    availability: 'கிடைக்கும் நிலை',
    generalQueue: 'பொது சட்ட உதவி வரிசைக்கு அனுப்பவும்',

    // Actions
    search: 'தேடு',
    submit: 'சமர்ப்பி',
    cancel: 'ரத்து செய்',
    back: 'பின்செல்க',
  }
};

export function getLanguage() {
  return localStorage.getItem(LANGUAGE_KEY) || 'en';
}

export function setLanguage(lang) {
  if (LANGUAGES[lang]) {
    localStorage.setItem(LANGUAGE_KEY, lang);
    window.dispatchEvent(new Event('languagechange'));
  }
}

export function t(key) {
  const lang = getLanguage();
  const dict = translations[lang] || translations.en;
  return dict[key] || translations.en[key] || key;
}

