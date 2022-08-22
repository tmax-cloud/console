import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { coFetchJSON } from '@console/internal/co-fetch';

import en from './k8s-v1.19/en.json';
import ko from './k8s-v1.19/ko.json';

const DEFAULT_K8S_VERSION = 'v1.19';
const VERSION = ['v1.19', 'v1.22'];
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
  const data = await coFetchJSON('/api/kubernetes/version').catch(e => console.error(e));
  const k8sVersion = data ? data.gitVersion : DEFAULT_K8S_VERSION;
  const version = k8sVersion && k8sVersion.split('.').length > 1 ? `${k8sVersion.split('.')[0]}.${k8sVersion.split('.')[1]}` : DEFAULT_K8S_VERSION;
  if (VERSION.includes(version) && version !== DEFAULT_K8S_VERSION) {
    const en = await import(`./k8s-${version}/${LANG[0]}.json`);
    const ko = await import(`./k8s-${version}/${LANG[1]}.json`);
    NS.forEach(ns => {
      i18n.addResourceBundle(LANG[0], ns, en[ns] || {});
      i18n.addResourceBundle(LANG[1], ns, ko[ns] || {});
    });
  }
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
    fallbackLng: LANG,
    defaultNS: NS[0],
    ns: NS,
    keySeparator: false,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

export default i18n;
