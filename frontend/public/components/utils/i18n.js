import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './lang/en.json';
import ko from './lang/ko.json';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    lng: 'en',
    debug: true,
    resources: {
      ko: {
        vertNav: ko.vertNav,
        additional: ko.additional,
        resource: ko.resource,
        string: ko.string,
        content: ko.content
      },
      en: {
        vertNav: en.vertNav,
        additional: en.additional,
        resource: en.resource,
        string: en.string,
        content: en.content
      }
    },

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    }
  });


export default i18n;
