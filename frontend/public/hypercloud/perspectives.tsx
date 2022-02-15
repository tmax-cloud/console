import * as React from 'react';
import { CogsIcon } from '@patternfly/react-icons';
import { Perspective } from '@console/plugin-sdk';
import { FLAGS } from '@console/shared/src/constants';
import { getActivePerspective, getActiveCluster } from '@console/internal/actions/ui';
import { TFunction } from 'i18next';
import * as MultiClusterIcon from '@console/internal/imgs/hypercloud/lnb/multi_cluster.svg';
import * as MasterClusterIcon from '@console/internal/imgs/hypercloud/lnb/master_cluster.svg';
import * as SingleClusterIcon from '@console/internal/imgs/hypercloud/lnb/single_cluster.svg';
import * as DeveloperIcon from '@console/internal/imgs/hypercloud/lnb/developer.svg';
import * as SelectedMultiClusterIcon from '@console/internal/imgs/hypercloud/lnb/filled/multi_cluster_filled.svg';
import * as SelectedMasterClusterIcon from '@console/internal/imgs/hypercloud/lnb/filled/master_cluster_filled.svg';
import * as SelectedSingleClusterIcon from '@console/internal/imgs/hypercloud/lnb/filled/single_cluster_filled.svg';
import * as SelectedDeveloperIcon from '@console/internal/imgs/hypercloud/lnb/filled/developer_filled.svg';

export enum PerspectiveType {
  MASTER = 'MASTER',
  MULTI = 'MULTI',
  SINGLE = 'SINGLE',
  DEVELOPER = 'DEVELOPER',
  BAREMETAL = 'BAREMETAL',
  CUSTOM = 'CUSTOM',
}

export const PerspectiveLabelKeys = {
  [PerspectiveType.MASTER]: 'COMMON:MSG_LNB_MENU_CONSOLE_LIST_3',
  [PerspectiveType.MULTI]: 'COMMON:MSG_LNB_MENU_CONSOLE_LIST_2',
  [PerspectiveType.SINGLE]: 'COMMON:MSG_LNB_MENU_CONSOLE_LIST_1',
  [PerspectiveType.DEVELOPER]: 'COMMON:MSG_DETAILS_TABACCESSPERMISSIONS_RADIOBUTTON_2',
  [PerspectiveType.BAREMETAL]: 'BAREMETAL',
  [PerspectiveType.CUSTOM]: 'CUSTOM',
};

export const isSingleClusterPerspective = () => {
  return window.SERVER_FLAGS.McMode && getActivePerspective() == PerspectiveType.SINGLE;
};

export const isMasterClusterPerspective = () => {
  return getActivePerspective() == PerspectiveType.MASTER;
};
export const getSingleClusterFullBasePath = () => {
  return `${window.SERVER_FLAGS.singleClusterBasePath}api/${getActiveCluster()}`;
};

/* 임시 */
// TODO:  싱글 클러스터 증가시 동적 생성하는 방법 확인
//        getK8sLandingPageURL, getImportRedirectURL 하는 상황 파악 및 수정
export const getPerspectives: (t?: TFunction) => Perspective[] = (t?: TFunction) => {
  let isFirstTime;
  if (localStorage.getItem('flag/first-time-login')) {
    isFirstTime = localStorage.getItem('flag/first-time-login') === 'true' ? true : false;
  } else {
    isFirstTime = false;
  }
  const perspectives: Perspective[] = window.SERVER_FLAGS.McMode
    ? [
        {
          type: 'Perspective',
          properties: {
            id: PerspectiveType.MULTI,
            name: t ? t(PerspectiveLabelKeys[PerspectiveType.MULTI]) : 'Multi-Cluster',
            icon: <img src={MultiClusterIcon} className="font-icon co-console-dropdowntoggle-icon" />,
            selectedIcon: <img src={SelectedMultiClusterIcon} className="font-icon" />,
            default: true,
            getLandingPageURL: flags => (isFirstTime ? '/k8s/all-namespaces/clustermanagers' : '/welcome'),
            getK8sLandingPageURL: flags => (isFirstTime ? '/k8s/all-namespaces/clustermanagers' : '/welcome'),
            getImportRedirectURL: project => `/k8s/all-namespaces/projects/${project}/workloads`,
          },
        },
        {
          type: 'Perspective',
          properties: {
            id: PerspectiveType.MASTER,
            name: t ? t(PerspectiveLabelKeys[PerspectiveType.MASTER]) : 'Master-Cluster',
            icon: <img src={MasterClusterIcon} className="font-icon co-console-dropdowntoggle-icon" />,
            selectedIcon: <img src={SelectedMasterClusterIcon} className="font-icon" />,
            getLandingPageURL: flags => (isFirstTime ? (flags[FLAGS.CAN_LIST_NS] ? '/master/dashboards' : '/k8s/cluster/namespaces') : '/welcome'),
            getK8sLandingPageURL: flags => (isFirstTime ? (flags[FLAGS.CAN_LIST_NS] ? '/master/dashboards' : '/k8s/cluster/namespaces') : '/welcome'),

            getImportRedirectURL: project => `/k8s/cluster/projects/${project}/workloads`,
          },
        },
        {
          type: 'Perspective',
          properties: {
            id: PerspectiveType.SINGLE,
            name: t ? t(PerspectiveLabelKeys[PerspectiveType.SINGLE]) : 'Single-Cluster',
            icon: <img src={SingleClusterIcon} className="font-icon co-console-dropdowntoggle-icon" />,
            selectedIcon: <img src={SelectedSingleClusterIcon} className="font-icon" />,
            getLandingPageURL: flags => (isFirstTime ? (flags[FLAGS.CAN_LIST_NS] ? '/single/dashboards' : '/k8s/cluster/namespaces') : '/welcome'),
            getK8sLandingPageURL: flags => (isFirstTime ? (flags[FLAGS.CAN_LIST_NS] ? '/single/dashboards' : '/k8s/cluster/namespaces') : '/welcome'),
            getImportRedirectURL: project => `/k8s/cluster/projects/${project}/workloads`,
          },
        },
        {
          type: 'Perspective',
          properties: {
            id: PerspectiveType.DEVELOPER,
            name: t ? t(PerspectiveLabelKeys[PerspectiveType.DEVELOPER]) : 'Developer', // 임시. 스트링 나오면 재적용 필요
            icon: <img src={DeveloperIcon} className="font-icon co-console-dropdowntoggle-icon" />,
            selectedIcon: <img src={SelectedDeveloperIcon} className="font-icon" />,
            getLandingPageURL: flags => (isFirstTime ? '/developer/add' : '/welcome'),
            getK8sLandingPageURL: flags => (isFirstTime ? '/developer/add' : '/welcome'),
            getImportRedirectURL: project => `/k8s/cluster/projects/${project}/workloads`,
          },
        },
        {
          type: 'Perspective',
          properties: {
            id: PerspectiveType.BAREMETAL,
            name: t ? t(PerspectiveLabelKeys[PerspectiveType.BAREMETAL]) : 'Baremetal',
            icon: <img src={MultiClusterIcon} className="font-icon co-console-dropdowntoggle-icon" />,
            selectedIcon: <img src={SelectedMultiClusterIcon} className="font-icon" />,
            default: true,
            getLandingPageURL: flags => (isFirstTime ? '/k8s/all-namespaces/awxs' : '/welcome'),
            getK8sLandingPageURL: flags => (isFirstTime ? '/k8s/all-namespaces/awxs' : '/welcome'),
            getImportRedirectURL: project => `/k8s/all-namespaces/projects/${project}/workloads`,
          },
        },
      ]
    : [
        {
          type: 'Perspective',
          properties: {
            id: PerspectiveType.MASTER,
            name: t ? t(PerspectiveLabelKeys[PerspectiveType.MASTER]) : 'Master-Cluster',
            icon: <img src={MasterClusterIcon} className="font-icon co-console-dropdowntoggle-icon" />,
            selectedIcon: <img src={SelectedMasterClusterIcon} className="font-icon" />,
            default: true,
            getLandingPageURL: flags => (isFirstTime ? (flags[FLAGS.CAN_LIST_NS] ? '/master/dashboards' : '/k8s/cluster/namespaces') : '/welcome'),
            getK8sLandingPageURL: flags => (isFirstTime ? (flags[FLAGS.CAN_LIST_NS] ? '/master/dashboards' : '/k8s/cluster/namespaces') : '/welcome'),
            getImportRedirectURL: project => `/k8s/cluster/projects/${project}/workloads`,
          },
        },
        {
          type: 'Perspective',
          properties: {
            id: PerspectiveType.DEVELOPER,
            name: t ? t(PerspectiveLabelKeys[PerspectiveType.DEVELOPER]) : 'Developer', // 임시. 스트링 나오면 재적용 필요
            icon: <img src={DeveloperIcon} className="font-icon co-console-dropdowntoggle-icon" />,
            selectedIcon: <img src={SelectedDeveloperIcon} className="font-icon" />,
            getLandingPageURL: flags => (isFirstTime ? '/developer/add' : '/welcome'),
            getK8sLandingPageURL: flags => (isFirstTime ? '/developer/add' : '/welcome'),
            getImportRedirectURL: project => `/k8s/cluster/projects/${project}/workloads`,
          },
        },
      ];

  if (window.SERVER_FLAGS.showCustomPerspective === undefined || window.SERVER_FLAGS.showCustomPerspective === true) {
    perspectives.push({
      type: 'Perspective',
      properties: {
        id: PerspectiveType.CUSTOM,
        name: 'Custom', // 임시. 스트링 나오면 재적용 필요
        icon: <CogsIcon className="font-icon co-console-dropdowntoggle-icon" />,
        selectedIcon: <CogsIcon className="font-icon " />,
        getLandingPageURL: flags => (isFirstTime ? '/custom/add' : '/welcome'),
        getK8sLandingPageURL: flags => (isFirstTime ? '/custom/add' : '/welcome'),
        getImportRedirectURL: project => `/k8s/cluster/projects/${project}/workloads`,
      },
    });
  }

  return perspectives;
};
