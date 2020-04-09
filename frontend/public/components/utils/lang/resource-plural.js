import { kindObj } from '../../utils';
import { useTranslation } from 'react-i18next';

export const ResourcePlural = kind => {
  const ko = kindObj(kind);
  const { labelPlural } = ko;
  const { t } = useTranslation();

  let result = window.localStorage.getItem('i18nextLng') === 'en' ? labelPlural : t(`RESOURCE:${kind.toUpperCase()}`);

  return result;
};
