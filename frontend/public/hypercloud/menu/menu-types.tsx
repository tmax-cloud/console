import startsWith from './starts-with';

export enum MenuType {
  CONTAINER = 'CONTAINER',
  REGISTERED_MENU = 'REGISTERED_MENU',
  SEPERATOR = 'SEPERATOR',
}

export enum MenuLinkType {
  ResourceNSLink = 'ResourceNSLink',
  HrefLink = 'HrefLink',
  ResourceClusterLink = 'ResourceClusterLink',
  NewTabLink = 'NewTabLink',
}

type BasicMenuInfo = {
  type: MenuLinkType;
  defaultLabel?: string;
  isMultiOnly: boolean;
  startsWith?: Array<string>;
  visible: boolean;
  kind?: string;
};

type BasicCustomMenuInfo = {
  type: MenuLinkType;
  defaultLabel: string;
  isMultiOnly: boolean;
  startsWith?: Array<string>;
  visible: boolean;
  kind: string;
};

// MEMO : 각 Link 타입에서 필요한 속성들 type 지정
interface ResourceNSLinkProps extends BasicMenuInfo {
  type: MenuLinkType.ResourceNSLink;
  resource?: string;
}
interface ResourceClusterLinkProps extends BasicMenuInfo {
  type: MenuLinkType.ResourceClusterLink;
  resource?: string;
}
interface HrefLinkProps extends BasicMenuInfo {
  type: MenuLinkType.HrefLink;
  href: string;
  activePath?: string;
}
interface NewTabLinkProps extends BasicMenuInfo {
  type: MenuLinkType.NewTabLink;
  newTabLinkType: 'grafana' | 'kibana' | 'git' | 'kiali';
}

export type MenuInfo = BasicMenuInfo & (ResourceNSLinkProps | ResourceClusterLinkProps | HrefLinkProps | NewTabLinkProps);
type CustomMenuInfo = BasicCustomMenuInfo & (ResourceNSLinkProps | ResourceClusterLinkProps | HrefLinkProps | NewTabLinkProps);

interface CustomMenusMap {
  [key: string]: CustomMenuInfo;
}

// MEMO : 기본적인 LNB 1st depth(컨테이너) 라벨들은 i18n적용되도록 키값 Map 만들어놓음
// TODO : (더 좋은 방법이 없을까)
export const MenuContainerLabels = {
  home: 'COMMON:MSG_LNB_MENU_1',
  workload: 'COMMON:MSG_LNB_MENU_22',
  helm: 'COMMON:MSG_LNB_MENU_202',
  networking: 'COMMON:MSG_LNB_MENU_46',
  storage: 'COMMON:MSG_LNB_MENU_50',
  management: 'COMMON:MSG_LNB_MENU_79',
  host: 'COMMON:MSG_LNB_MENU_72',
  authentications: 'COMMON:MSG_LNB_MENU_73',
  servicecatalogs: 'COMMON:MSG_LNB_MENU_10',
  servicemesh: 'COMMON:MSG_LNB_MENU_35',
  'ci/cd': 'COMMON:MSG_LNB_MENU_56',
  aidevops: 'COMMON:MSG_LNB_MENU_64',
  image: 'COMMON:MSG_DETAILS_TABDETAILS_CONTAINERS_TABLEHEADER_3',
  federation: 'COMMON:MSG_LNB_MENU_86',
  ansible: 'COMMON:MSG_LNB_MENU_197',
};

// MEMO : CustomMenusMap에 들어갈 커스텀메뉴의 이름은 K8sKind의 kind이름과 중복되면 안됨. (예: Event의 경우 EventModel이 존재함. 이렇게 이름이 겹치면 안됨 => Events로 CustomMenu이름 지정)
export const CustomMenusMap: CustomMenusMap = {
  Dashboard: {
    kind: 'Dashboard',
    visible: true,
    type: MenuLinkType.HrefLink,
    defaultLabel: 'COMMON:MSG_LNB_MENU_90',
    href: '/dashboards',
    activePath: '/dashboards/',
    isMultiOnly: false,
  },
  Search: {
    kind: 'Search',
    visible: true,
    type: MenuLinkType.HrefLink,
    defaultLabel: 'COMMON:MSG_LNB_MENU_4',
    href: '/search',
    startsWith: startsWith.searchStartsWith,
    isMultiOnly: false,
  },
  Audit: {
    kind: 'Audit',
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    defaultLabel: 'COMMON:MSG_LNB_MENU_5',
    resource: 'audits',
    isMultiOnly: false,
  },
  Events: {
    kind: 'Events',
    visible: true,
    type: MenuLinkType.ResourceNSLink,
    defaultLabel: 'COMMON:MSG_LNB_MENU_6',
    resource: 'events',
    isMultiOnly: false,
  },
  Grafana: {
    kind: 'Grafana',
    visible: true,
    type: MenuLinkType.NewTabLink,
    defaultLabel: 'COMMON:MSG_LNB_MENU_98',
    newTabLinkType: 'grafana',
    isMultiOnly: false,
  },
  Kibana: {
    kind: 'Kibana',
    visible: true,
    type: MenuLinkType.NewTabLink,
    defaultLabel: 'COMMON:MSG_LNB_MENU_99',
    newTabLinkType: 'kibana',
    isMultiOnly: false,
  },
  Git: {
    kind: 'Git',
    visible: true,
    type: MenuLinkType.NewTabLink,
    defaultLabel: 'COMMON:MSG_LNB_MENU_195',
    newTabLinkType: 'git',
    isMultiOnly: false,
  },
  Add: {
    kind: 'Add',
    visible: true,
    type: MenuLinkType.HrefLink,
    defaultLabel: '+ Add',
    href: '/add',
    activePath: '/add/',
    isMultiOnly: false,
  },
  Kiali: {
    kind: 'Kiali',
    visible: true,
    type: MenuLinkType.NewTabLink,
    defaultLabel: 'COMMON:MSG_LNB_MENU_45',
    newTabLinkType: 'kiali',
    isMultiOnly: false,
  },
  OperatorHub: {
    kind: 'OperatorHub',
    visible: false,
    type: MenuLinkType.HrefLink,
    defaultLabel: 'COMMON:MSG_LNB_MENU_8',
    href: '/operatorhub',
    isMultiOnly: false,
  },
  ClusterServiceVersion: {
    kind: 'ClusterServiceVersion',
    visible: false,
    type: MenuLinkType.ResourceNSLink,
    resource: 'clusterserviceversions',
    defaultLabel: 'COMMON:MSG_LNB_MENU_9',
    startsWith: startsWith.clusterserviceversionsStartsWith,
    isMultiOnly: false,
  },
};
