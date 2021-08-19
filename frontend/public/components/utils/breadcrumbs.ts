import { K8sKind } from '../../module/k8s';
import { TFunction } from 'i18next';
import { ResourceLabel, ResourceLabelPlural } from '../../models/hypercloud/resource-plural';

export const breadcrumbsForDetailsPage = (kindObj: K8sKind, match: any, t?: TFunction) => () => {
  const makeDetailTitle = kind => {
    switch (kind) {
      case 'PyTorchJob':
        return { list: t('COMMON:MSG_MAIN_BUTTON_5') + ResourceLabelPlural({ kind: 'TrainingJob' }, t), detail: t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_143', { 0: t('COMMON:MSG_MAIN_BUTTON_5'), 1: ResourceLabel({ kind: 'TrainingJob' }, t) }) };
      case 'TFJob':
        return { list: t('COMMON:MSG_MAIN_BUTTON_4') + ResourceLabelPlural({ kind: 'TrainingJob' }, t), detail: t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_143', { 0: t('COMMON:MSG_MAIN_BUTTON_4'), 1: ResourceLabel({ kind: 'TrainingJob' }, t) }) };
      default:
        return { list: ResourceLabelPlural(kindObj, t), detail: t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel({ kind: kind }, t) }) };
    }
  };
  return [
    {
      name: makeDetailTitle(kindObj.kind).list,
      path: match.params.ns ? `/k8s/ns/${match.params.ns}/${match.params.plural}` : `/k8s/cluster/${match.params.plural}`,
    },
    { name: makeDetailTitle(kindObj.kind).detail, path: `${match.url}` },
  ];
};
