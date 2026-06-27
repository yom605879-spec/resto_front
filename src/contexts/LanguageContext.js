'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { uz } from '../locales/uz';
import { ru } from '../locales/ru';
import { en } from '../locales/en';

const translations = { uz, ru, en };

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState('uz');

  useEffect(() => {
    // Load from local storage on mount
    const saved = localStorage.getItem('app_locale');
    if (saved && translations[saved]) {
      setLocale(saved);
    }
  }, []);

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLocale(lang);
      localStorage.setItem('app_locale', lang);
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[locale];
    
    for (const k of keys) {
      if (value[k] === undefined) {
        // Fallback to uzbek if missing
        let fallback = translations['uz'];
        for (const fk of keys) {
          if (!fallback) return key;
          fallback = fallback[fk];
        }
        return fallback || key;
      }
      value = value[k];
    }
    
    return value;
  };

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
