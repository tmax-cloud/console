import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import ko from './ko.json';

export const LANGUAGE_LOCAL_STORAGE_KEY = 'i18nextLng';

export const setLanguage = lang => localStorage.setItem(LANGUAGE_LOCAL_STORAGE_KEY, lang);

export const getLanguage = () => {
  if (!localStorage.getItem(LANGUAGE_LOCAL_STORAGE_KEY)) {
    setLanguage('ko'); // 기본 언어는 ko
  }
  return localStorage.getItem(LANGUAGE_LOCAL_STORAGE_KEY);
};

const options = {
  lookupLocalStorage: LANGUAGE_LOCAL_STORAGE_KEY,
  caches: ['localStorage'],
  cookieMinutes: 7 * 24 * 60 * 60 * 1000,
};

const resource = {
  en: {
    COMMON: en.COMMON,
    SINGLE: en.SINGLE,
    MULTI: en.MULTI,
    DESCRIPTION: en.DESCRIPTION,
  },
  ko: {
    COMMON: ko.COMMON,
    SINGLE: ko.SINGLE,
    MULTI: ko.MULTI,
    DESCRIPTION: ko.DESCRIPTION,
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    lng: getLanguage(),
    debug: true,
    detection: options,
    resources: resource,
    keySeparator: false,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

export default i18n;
