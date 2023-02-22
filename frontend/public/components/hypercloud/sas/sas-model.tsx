import { MenuLinkType } from '@console/internal/hypercloud/menu/menu-types';
import { NonK8sKind } from '@console/internal/module/k8s';

export const SasAppModel: NonK8sKind = {
  kind: 'SasApp',
  label: 'SasApp',
  labelPlural: 'SasApp',
  abbr: 'HR',
  namespaced: false,
  plural: 'SasApp',
  menuInfo: {
    visible: true,
    type: MenuLinkType.HrefLink,
    isMultiOnly: false,
    href: '/sas-app',
  },
  i18nInfo: {
    label: '앱',
    labelPlural: '앱',
  },
  nonK8SResource: true,
};
