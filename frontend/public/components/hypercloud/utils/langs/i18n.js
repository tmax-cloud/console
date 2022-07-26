import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { coFetchJSON } from '@console/internal/co-fetch';

const LANG = ['en', 'ko'];
const NS = ['COMMON', 'SINGLE', 'MULTI', 'DESCRIPTION'];

export const LANGUAGE_LOCAL_STORAGE_KEY = 'i18nextLng';

export const setLanguage = lang => localStorage.setItem(LANGUAGE_LOCAL_STORAGE_KEY, lang);

export const getLanguage = () => {
  if (!localStorage.getItem(LANGUAGE_LOCAL_STORAGE_KEY)) {
    setLanguage('ko'); // 기본 언어는 ko
  }
  return localStorage.getItem(LANGUAGE_LOCAL_STORAGE_KEY);
};

export const getI18nResources = async () => {
  const data = await coFetchJSON('/api/hypercloud/version');
  const k8sVersion = data.find(item => item.name === 'Kubernetes')?.version;
  const version = `${k8sVersion?.split('.')[0]}.${k8sVersion?.split('.')[1]}`;
  let en, ko;
  if (version) {
    en = await import(`./k8s-${version}/en.json`);
    ko = await import(`./k8s-${version}/ko.json`);
  } else {
    en = await import('./k8s-v1.19/en.json');
    ko = await import('./k8s-v1.19/ko.json');
  }
  let resources = {};
  if (en && ko) {
    resources = {
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
  }
  LANG.forEach(lang => {
    NS.forEach(ns => {
      i18n.addResourceBundle(lang, ns, resources?.[lang]?.[ns] || {});
    });
  });
};

const options = {
  lookupLocalStorage: LANGUAGE_LOCAL_STORAGE_KEY,
  caches: ['localStorage'],
  cookieMinutes: 7 * 24 * 60 * 60 * 1000,
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    lng: getLanguage(),
    debug: true,
    detection: options,
    resources: {},
    fallbackLng: LANG,
    defaultNS: NS[0],
    ns: NS,
    keySeparator: false,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

export default i18n;
