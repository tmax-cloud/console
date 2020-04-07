import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './lang/en.json';
import ko from './lang/ko.json';

const options = {
  lookupLocalStorage: 'i18nextLng',
  caches: ['localStorage'],
  cookieMinutes: 7 * 24 * 60 * 60 * 1000,
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(LanguageDetector)
  .init({
    lng: 'ko',
    debug: true,
    detection: options,
    resources: {
      ko: {
        vertNav: ko.vertNav,
        additional: ko.additional,
        resource: ko.resource,
        string: ko.string,
        content: ko.content,
      },
      en: {
        vertNav: en.vertNav,
        additional: en.additional,
        resource: en.resource,
        string: en.string,
        content: en.content,
      },
    },

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

export default i18n;
