"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "hi";

interface LanguageContextType {
  language: Language;
  lang: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "hi" : "en"));
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, lang: language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    "header.title": "Akhil Bharat Hindu Mahasabha (U.P.)",
    "header.subtitle": "Official Website • Uttar Pradesh (India)",
    "header.announcement": "Announcement:",
    "header.nav.home": "Home",
    "header.nav.about": "About",
    "header.nav.leadership": "Leadership",
    "header.nav.organization": "Organization",
    "header.nav.news": "News",
    "header.nav.events": "Events",
    "header.nav.documents": "Documents",
    "header.nav.membership": "Membership",
    "header.nav.contact": "Contact",

    // Hero Section
    "hero.subtitle": "Akhil Bharat Hindu Mahasabha • Uttar Pradesh",
    "hero.title": "Nation First, Dharma Forever",
    "hero.description": "Preserving Sanatana Dharma. Defending Bharat's Unity. Empowering Hindu Samaj.",
    "hero.btn.join": "JOIN US",
    "hero.btn.ideology": "OUR IDEOLOGY",

    // Welcome Section
    "welcome.title": "Welcome",
    "welcome.description": "Welcome to the official website of Akhil Bharat Hindu Mahasabha Uttar Pradesh, a historic and nationalist organization committed to protecting and promoting the values of Sanatana Dharma, Bharatiya culture, and Hindu unity. Established as one of India's oldest socio-political movements, the Mahasabha has played a vital role in the freedom struggle, the revival of Hindu identity, and the defense of Hindu interests across Bharat.",
    "welcome.btn.about": "About",
    "welcome.btn.leadership": "Leadership",
    "welcome.btn.contact": "Contact",

    // Focus Areas
    "focus.title": "We are Dedicated to:",
    "focus.subtitle": "Our core principles and focus areas for building a strong, unified, and dharmic society",
    "focus.area1.title": "Protecting Hindu Identity",
    "focus.area1.desc": "Preserving and promoting Sanatana Dharma, Bharatiya culture, and Hindu unity across Uttar Pradesh.",
    "focus.area2.title": "Cultural Heritage",
    "focus.area2.desc": "Safeguarding our ancient scriptures, rituals, and philosophical traditions for future generations.",
    "focus.area3.title": "Youth Empowerment",
    "focus.area3.desc": "Building tomorrow by instilling values of righteousness, integrity, and social responsibility.",
    "focus.area4.title": "Nation First",
    "focus.area4.desc": "Upholding national unity, defending sovereignty, and opposing divisive anti-national forces.",
    "focus.area5.title": "Sanskrit Revival",
    "focus.area5.desc": "Promoting Sanskrit as a treasure trove of ancient wisdom, philosophy, science, and arts.",
    "focus.area6.title": "Swadeshi Ideals",
    "focus.area6.desc": "Fostering economic self-reliance through indigenous production and consumption.",

    // Leaders Section
    "leaders.title": "Historic National Leaders of ABHM",
    "leaders.subtitle": "Remembering the visionaries who shaped our movement",
    "leaders.viewAll": "View complete leadership details →",
    "leader1.name": "Pandit Madan Mohan Malaviya",
    "leader1.role": "Founder & Freedom Fighter",
    "leader2.name": "Vinayak Damodar Savarkar",
    "leader2.role": "Former President (1937-43)",
    "leader3.name": "Dr. Shyama Prasad Mukherjee",
    "leader3.role": "National Leader",
    "leader4.name": "Lala Lajpat Rai",
    "leader4.role": "Nationalist Leader",

    // News & Events
    "news.title": "News & Events",
    "news.subtitle": "Latest updates and upcoming activities",
    "news.viewAll": "View all →",
    "news.announcements": "News & Announcements",
    "news.noItems": "No news items are currently published.",
    "events.upcoming": "Upcoming Events",
    "events.noItems": "No events are currently published.",

    // Downloads
    "downloads.title": "Official Documents & Downloads",
    "downloads.subtitle": "Access constitution, reports, and official letters",
    "downloads.btn": "Browse Documents",

    // Footer
    "footer.org": "Akhil Bharat Hindu Mahasabha (U.P.)",
    "footer.description": "A historic and nationalist organization committed to protecting and promoting the values of Sanatana Dharma, Bharatiya culture, and Hindu unity across Uttar Pradesh.",
    "footer.followUs": "Follow Us",
    "footer.usefulLinks": "Useful Links",
    "footer.subscribe": "Subscribe Now",
    "footer.subscribeDesc": "Don't miss our future updates!",
    "footer.emailPlaceholder": "Enter your email",
    "footer.btnSubscribe": "Subscribe",
    "footer.btnSubscribed": "Subscribed!",
    "footer.copyright": "Akhil Bharat Hindu Mahasabha (U.P.) | All Rights Reserved",
  },
  hi: {
    // Header
    "header.title": "अखिल भारत हिंदू महासभा (उ.प्र.)",
    "header.subtitle": "आधिकारिक वेबसाइट • उत्तर प्रदेश (भारत)",
    "header.announcement": "घोषणा:",
    "header.nav.home": "मुख्य पृष्ठ",
    "header.nav.about": "हमारे बारे में",
    "header.nav.leadership": "नेतृत्व",
    "header.nav.organization": "संगठन",
    "header.nav.news": "समाचार",
    "header.nav.events": "कार्यक्रम",
    "header.nav.documents": "दस्तावेज़",
    "header.nav.membership": "सदस्यता",
    "header.nav.contact": "संपर्क",

    // Hero Section
    "hero.subtitle": "अखिल भारत हिंदू महासभा • उत्तर प्रदेश",
    "hero.title": "राष्ट्र प्रथम, धर्म सदा",
    "hero.description": "सनातन धर्म की रक्षा। भारत की एकता की रक्षा। हिंदू समाज को सशक्त बनाना।",
    "hero.btn.join": "हमसे जुड़ें",
    "hero.btn.ideology": "हमारी विचारधारा",

    // Welcome Section
    "welcome.title": "स्वागत है",
    "welcome.description": "अखिल भारत हिंदू महासभा उत्तर प्रदेश की आधिकारिक वेबसाइट पर आपका स्वागत है, यह एक ऐतिहासिक और राष्ट्रवादी संगठन है जो सनातन धर्म, भारतीय संस्कृति और हिंदू एकता के मूल्यों की रक्षा और प्रचार के लिए प्रतिबद्ध है। भारत के सबसे पुराने सामाजिक-राजनीतिक आंदोलनों में से एक के रूप में स्थापित, महासभा ने स्वतंत्रता संग्राम, हिंदू पहचान के पुनरुद्धार और भारत भर में हिंदू हितों की रक्षा में महत्वपूर्ण भूमिका निभाई है।",
    "welcome.btn.about": "हमारे बारे में",
    "welcome.btn.leadership": "नेतृत्व",
    "welcome.btn.contact": "संपर्क",

    // Focus Areas
    "focus.title": "हम समर्पित हैं:",
    "focus.subtitle": "एक मजबूत, एकजुट और धार्मिक समाज के निर्माण के लिए हमारे मूल सिद्धांत और फोकस क्षेत्र",
    "focus.area1.title": "हिंदू पहचान की रक्षा",
    "focus.area1.desc": "उत्तर प्रदेश में सनातन धर्म, भारतीय संस्कृति और हिंदू एकता को संरक्षित और बढ़ावा देना।",
    "focus.area2.title": "सांस्कृतिक विरासत",
    "focus.area2.desc": "भावी पीढ़ियों के लिए हमारे प्राचीन शास्त्रों, अनुष्ठानों और दार्शनिक परंपराओं की रक्षा करना।",
    "focus.area3.title": "युवा सशक्तिकरण",
    "focus.area3.desc": "धार्मिकता, अखंडता और सामाजिक जिम्मेदारी के मूल्यों को स्थापित करके कल का निर्माण।",
    "focus.area4.title": "राष्ट्र प्रथम",
    "focus.area4.desc": "राष्ट्रीय एकता को बनाए रखना, संप्रभुता की रक्षा करना और विभाजनकारी राष्ट्र विरोधी ताकतों का विरोध करना।",
    "focus.area5.title": "संस्कृत पुनरुद्धार",
    "focus.area5.desc": "प्राचीन ज्ञान, दर्शन, विज्ञान और कला के खजाने के रूप में संस्कृत को बढ़ावा देना।",
    "focus.area6.title": "स्वदेशी आदर्श",
    "focus.area6.desc": "स्वदेशी उत्पादन और उपभोग के माध्यम से आर्थिक आत्मनिर्भरता को बढ़ावा देना।",

    // Leaders Section
    "leaders.title": "अखिल भारत हिंदू महासभा के ऐतिहासिक राष्ट्रीय नेता",
    "leaders.subtitle": "उन दूरदर्शी लोगों को याद करते हुए जिन्होंने हमारे आंदोलन को आकार दिया",
    "leaders.viewAll": "पूर्ण नेतृत्व विवरण देखें →",
    "leader1.name": "पंडित मदन मोहन मालवीय",
    "leader1.role": "संस्थापक और स्वतंत्रता सेनानी",
    "leader2.name": "विनायक दामोदर सावरकर",
    "leader2.role": "पूर्व अध्यक्ष (1937-43)",
    "leader3.name": "डॉ. श्यामा प्रसाद मुखर्जी",
    "leader3.role": "राष्ट्रीय नेता",
    "leader4.name": "लाला लाजपत राय",
    "leader4.role": "राष्ट्रवादी नेता",

    // News & Events
    "news.title": "समाचार और कार्यक्रम",
    "news.subtitle": "नवीनतम अपडेट और आगामी गतिविधियां",
    "news.viewAll": "सभी देखें →",
    "news.announcements": "समाचार और घोषणाएं",
    "news.noItems": "वर्तमान में कोई समाचार प्रकाशित नहीं है।",
    "events.upcoming": "आगामी कार्यक्रम",
    "events.noItems": "वर्तमान में कोई कार्यक्रम प्रकाशित नहीं है।",

    // Downloads
    "downloads.title": "आधिकारिक दस्तावेज़ और डाउनलोड",
    "downloads.subtitle": "संविधान, रिपोर्ट और आधिकारिक पत्रों तक पहुंच",
    "downloads.btn": "दस्तावेज़ ब्राउज़ करें",

    // Footer
    "footer.org": "अखिल भारत हिंदू महासभा (उ.प्र.)",
    "footer.description": "एक ऐतिहासिक और राष्ट्रवादी संगठन जो उत्तर प्रदेश में सनातन धर्म, भारतीय संस्कृति और हिंदू एकता के मूल्यों की रक्षा और प्रचार के लिए प्रतिबद्ध है।",
    "footer.followUs": "हमें फॉलो करें",
    "footer.usefulLinks": "उपयोगी लिंक",
    "footer.subscribe": "अभी सदस्यता लें",
    "footer.subscribeDesc": "हमारे भविष्य के अपडेट न चूकें!",
    "footer.emailPlaceholder": "अपना ईमेल दर्ज करें",
    "footer.btnSubscribe": "सदस्यता लें",
    "footer.btnSubscribed": "सदस्यता ली गई!",
    "footer.copyright": "अखिल भारत हिंदू महासभा (उ.प्र.) | सर्वाधिकार सुरक्षित",
  },
};
