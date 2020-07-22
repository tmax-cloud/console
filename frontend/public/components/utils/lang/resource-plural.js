import { kindObj } from '../../utils';
// import { useTranslation } from 'react-i18next';

export const ResourcePlural = (kind, t) => {
  const ko = kindObj(kind);
  const { labelPlural } = ko;
  // const { t } = useTranslation();
  if (!t) {
    return labelPlural;
  }

  let result = window.localStorage.getItem('i18nextLng') === 'en' ? labelPlural : t(`RESOURCE:${kind.toUpperCase()}`);

  return result;
};
