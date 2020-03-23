import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// import Backend from 'i18next-xhr-backend';
// import LanguageDetector from 'i18next-browser-languagedetector';


import ko from './lang/ko.json';
import en from './lang/en.json';


i18n
  // .use(Backend)
  .use(initReactI18next)
  // .use(LanguageDetector)
  .init({
    lng: 'en',
    debug: true,
    resources: {
      ko: {
        vertNav: ko.vertNav,
        additional: ko.additional,
        resource: ko.resource,
        string: ko.string
      },
      en: {
        vertNav: en.vertNav,
        additional: en.additional,
        resource: en.resource,
        string: en.string
      }
    },

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    }
  });


export default i18n;



// import lnbEn from './lang/lnb.en.json';
// import lnbKo from './lang/lnb.ko.json';
// import contentsEn from './lang/contents.en.json';
// import contentsKo from './lang/contents.ko.json';
// import vertEn from './lang/vertNav.en.json';
// import vertKo from './lang/vertNav.ko.json';

// i18n
//   // .use(Backend)
//   // .use(LanguageDetector)
//   .use(initReactI18next)
//   .init({
//     fallbackLng: 'ko',
//     debug: true,
//     resources: {
//       ko: {
//         lnb: lnbKo,
//         contents: contentsKo,
//         vertNav: vertKo
//       },
//       en: {
//         lnb: lnbEn,
//         contents: contentsEn,
//         vertNav: vertEn
//       }
//     },
//     ns: ['lnb', 'contents'],

//     interpolation: {
//       escapeValue: false, // not needed for react as it escapes by default
//     }
//   });


// export default i18n;
