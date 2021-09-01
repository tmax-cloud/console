import i18next, { TFunction } from 'i18next';
import { modelFor } from '../../module/k8s';

const translateLabel = (str: string, t: TFunction) => {
  return !!str && i18next.exists(str) ? t(str) : str;
};

const getI18nInfo = (kindObj: any) => {
  const model = modelFor(kindObj.kind);
  return model?.i18nInfo || model;
};

export const ResourceLabel = (kindObj: any, t: TFunction) => {
  return translateLabel(getI18nInfo(kindObj)?.label, t);
};

export const ResourceLabelPlural = (kindObj: any, t: TFunction) => {
  return translateLabel(getI18nInfo(kindObj)?.labelPlural, t);
};

export type I18nInfo = {
  label: string;
  labelPlural: string;
};
