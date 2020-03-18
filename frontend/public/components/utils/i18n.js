import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// import Backend from 'i18next-xhr-backend';
// import LanguageDetector from 'i18next-browser-languagedetector';

import en from './lang/en.json';
import ko from './lang/ko.json';


i18n
  // .use(Backend)
  // .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // resources: {
    //   en: {
    //     translation: {
    //       'welcome': 'Welcome to React and react-i18next'
    //     }
    //   },
    //   ko: {
    //     translation: {
    //       'welcome': '환영합니다. 리액트 리액트 i18n'
    //     }
    //   }
    // },
    fallbackLng: 'ko',
    debug: true,
    resources: {
      ko: {
        lang: ko
      },
      en: {
        lang: en
      }
    },
    ns: ['lang'],

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    }
  });


export default i18n;
