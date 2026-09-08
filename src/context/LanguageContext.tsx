import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../locales/en';
import { ar } from '../locales/ar';
import { Language, Direction } from '../types';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof typeof en) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('kayedu_lang');
    return (saved === 'ar' || saved === 'en') ? saved : 'en';
  });

  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('kayedu_lang', language);
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
    if (language === 'ar') {
      document.body.classList.add('font-arabic');
    } else {
      document.body.classList.remove('font-arabic');
    }
  }, [language, direction]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState(prev => (prev === 'en' ? 'ar' : 'en'));
  };

  const t = (key: keyof typeof en): string => {
    const dict = language === 'ar' ? ar : en;
    return dict[key] || en[key] || (key as string);
  };

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
