import startsWith from './starts-with';

export const CMP_PRIMARY_KEY = 'primary';
export const CUSTOM_LABEL_TYPE = '@@customlabel@@';

export enum MenuType {
  CONTAINER = 'CONTAINER',
  REGISTERED_MENU = 'REGISTERED_MENU',
  NEW_TAB_LINK = 'NEW_TAB_LINK',
  SEPERATOR = 'SEPERATOR',
}

export enum MenuLinkType {
  ResourceNSLink = 'ResourceNSLink',
  HrefLink = 'HrefLink',
  ResourceClusterLink = 'ResourceClusterLink',
  NewTabLink = 'NewTabLink',
}

/**
 * 리소스 Model의 MenuInfo에서 사용할 기본적인 속성들.
 * @prop {MenuLinkType} type - 메뉴 link의 타입.
 * @prop {string} defaultLabel - 메뉴 label값. i18n String 키값으로 넣어줄 시 번역이 적용된다.
 * @prop {boolean} isMultiOnly - 멀티클러스터 탭에서만 추가 가능한지 여부를 정해주는 속성.
 * @prop {Array<string>} startsWith - 메뉴버튼이 활성화표시 될 조건 path들에 대한 배열이다.
 * @prop {boolean} visible - 메뉴 표시여부에 대한 속성이다. (false이면 사용자가 작성한 CMP리소스 내용에 메뉴추가를 해도 LNB에 보이지 않는다.)
 * @prop {string} kind - 메뉴의 kind 속성. CustomMenusMap 키값과 동일하게 설정해줘야 한다.
 */
type BasicMenuInfo = {
  type: MenuLinkType;
  defaultLabel?: string;
  isMultiOnly: boolean;
  startsWith?: Array<string>;
  visible: boolean;
  kind?: string;
};

/**
 * CustomMenuInfo에서 사용할 기본적인 속성들.
 * @prop {MenuLinkType} type - 메뉴 link의 타입.
 * @prop {string} defaultLabel - 메뉴 label값. i18n String 키값으로 넣어줄 시 번역이 적용된다.
 * @prop {boolean} isMultiOnly - 멀티클러스터 탭에서만 추가 가능한지 여부를 정해주는 속성.
 * @prop {Array<string>} startsWith - 메뉴버튼이 활성화표시 될 조건 path들에 대한 배열이다.
 * @prop {boolean} visible - 메뉴 표시여부에 대한 속성이다. (false이면 사용자가 작성한 CMP리소스 내용에 메뉴추가를 해도 LNB에 보이지 않는다.)
 * @prop {string} kind - 메뉴의 kind 속성. CustomMenusMap 키값과 동일하게 설정해줘야 한다.
 */
type BasicCustomMenuInfo = {
  type: MenuLinkType;
  defaultLabel: string;
  isMultiOnly: boolean;
  startsWith?: Array<string>;
  visible: boolean;
  kind: string;
};

interface ResourceNSLinkProps extends BasicMenuInfo {
  type: MenuLinkType.ResourceNSLink;
  resource?: string;
}
interface ResourceClusterLinkProps extends BasicMenuInfo {
  type: MenuLinkType.ResourceClusterLink;
  resource?: string;
}

/**
 * href link의 속성들이다.
 * @prop {string} href - 이동할 href 값.
 * @prop {string} activePath - LNB의 버튼이 활성화 상태일 때의 url path 조건.
 */
interface HrefLinkProps extends BasicMenuInfo {
  type: MenuLinkType.HrefLink;
  href: string;
  activePath?: string;
}

/**
 * 새 탭으로 열리는 link의 속성들이다.
 * @prop {string} url - 새탭을 띄워줄 url 속성.
 */
interface NewTabLinkProps extends BasicMenuInfo {
  type: MenuLinkType.NewTabLink;
  url?: string;
}

export type MenuInfo = BasicMenuInfo & (ResourceNSLinkProps | ResourceClusterLinkProps | HrefLinkProps | NewTabLinkProps);
type CustomMenuInfo = BasicCustomMenuInfo & (ResourceNSLinkProps | ResourceClusterLinkProps | HrefLinkProps | NewTabLinkProps);

interface CustomMenus {
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
  provisioning: 'COMMON:MSG_LNB_MENU_218',
};

// MEMO : CustomMenusMap에 들어갈 커스텀메뉴의 이름은 K8sKind의 kind이름과 중복되면 안됨. (예: Event의 경우 EventModel이 존재함. 이렇게 이름이 겹치면 안됨 => Events로 CustomMenu이름 지정)
export const CustomMenusMap: CustomMenus = {
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
  ArgoCD: {
    kind: 'ArgoCD',
    visible: true,
    type: MenuLinkType.NewTabLink,
    defaultLabel: 'ArgoCD',
    url: '',
    // url: 'argocd.ckcloud.org',
    isMultiOnly: false,
  },
  Grafana: {
    kind: 'Grafana',
    visible: true,
    type: MenuLinkType.NewTabLink,
    defaultLabel: 'COMMON:MSG_LNB_MENU_98',
    url: '',
    isMultiOnly: false,
  },
  Kibana: {
    kind: 'Kibana',
    visible: true,
    type: MenuLinkType.NewTabLink,
    defaultLabel: 'COMMON:MSG_LNB_MENU_99',
    url: `${document.location.origin}/api/kibana/`,
    isMultiOnly: false,
  },
  Git: {
    kind: 'Git',
    visible: true,
    type: MenuLinkType.NewTabLink,
    defaultLabel: 'COMMON:MSG_LNB_MENU_195',
    url: '',
    isMultiOnly: false,
  },
  Add: {
    kind: 'Add',
    visible: true,
    type: MenuLinkType.HrefLink,
    defaultLabel: 'COMMON:MSG_LNB_MENU_217',
    href: '/add',
    activePath: '/add/',
    isMultiOnly: false,
  },
  Kiali: {
    kind: 'Kiali',
    visible: true,
    type: MenuLinkType.NewTabLink,
    defaultLabel: 'COMMON:MSG_LNB_MENU_45',
    url: `${document.location.origin}/api/kiali/`,
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
  Topology: {
    kind: 'Topology',
    visible: true,
    type: MenuLinkType.HrefLink,
    defaultLabel: 'COMMON:MSG_LNB_MENU_191',
    href: '/topology',
    activePath: '/topology/',
    isMultiOnly: false,
  },
  Harbor: {
    kind: 'Harbor',
    visible: true,
    type: MenuLinkType.NewTabLink,
    defaultLabel: 'COMMON:MSG_LNB_MENU_155',
    url: '',
    isMultiOnly: false,
  },
  Trace: {
    kind: 'trace',
    visible: true,
    type: MenuLinkType.NewTabLink,
    defaultLabel: 'COMMON:MSG_DETAILS_TABTRACE_1',
    url: '',
    isMultiOnly: false,
  },
};
// MEMO : url이 ''로 지정된 메뉴들은 app.jsx에서 초기 렌더 시 ingress 리소스에서 host주소 가져와서 url로 지정해줌.
