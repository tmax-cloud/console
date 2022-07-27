
import { MenuLinkType } from '@console/internal/hypercloud/menu/menu-types';
import { NonK8sKind } from '@console/internal/module/k8s';

export const HelmRepositoryModel: NonK8sKind = {
    kind: 'HelmRepository',
    label: 'Helm Repository',
    labelPlural: 'Helm Repositories',
    abbr: 'HR',
    namespaced: false,
    plural: 'helmrepositories',
    menuInfo: {
      visible: true,
      type: MenuLinkType.HrefLink,
      isMultiOnly: false,
      href: '/helmrepositories',
    },
    i18nInfo: {
      label: 'COMMON:MSG_LNB_MENU_241',
      labelPlural: 'COMMON:MSG_LNB_MENU_240',
    },
    nonK8SResource: true,
  };

  export const HelmChartModel: NonK8sKind = {
    kind: 'HelmChart',
    label: 'Helm Chart',
    labelPlural: 'Helm Charts',
    abbr: 'HC',
    namespaced: false,
    plural: 'helmcharts',
    menuInfo: {
      visible: true,
      type: MenuLinkType.HrefLink,
      isMultiOnly: false,
      href: '/helmcharts',
    },
    i18nInfo: {
      label: 'COMMON:MSG_LNB_MENU_224',
      labelPlural: 'COMMON:MSG_LNB_MENU_223',
    },
    nonK8SResource: true,
  };

  export const HelmReleaseModel: NonK8sKind = {
    kind: 'HelmRelease',
    label: 'Helm Release',
    labelPlural: 'Helm Releases',
    abbr: 'HR',
    namespaced: true,
    plural: 'helmreleases',
    menuInfo: {
      visible: true,
      type: MenuLinkType.HrefLink,
      isMultiOnly: false,
      href: '/helmreleases',
    },
    i18nInfo: {
      label: 'COMMON:MSG_LNB_MENU_204',
      labelPlural: 'COMMON:MSG_LNB_MENU_203',
    },
    nonK8SResource: true,
  };