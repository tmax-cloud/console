import * as _ from 'lodash-es';
import { ClusterMenuPolicyModel, IngressModel } from '@console/internal/models';
import { k8sList, k8sGet, modelFor, Selector } from '@console/internal/module/k8s';
import { CMP_PRIMARY_KEY, CustomMenusMap } from '@console/internal/hypercloud/menu/menu-types';
import { coFetchJSON } from '@console/internal/co-fetch';
import i18next, { TFunction } from 'i18next';
import { ResourceLabel, getI18nInfo } from '@console/internal/models/hypercloud/resource-plural';
import { MenuContainerLabels, CUSTOM_LABEL_TYPE } from '@console/internal/hypercloud/menu/menu-types';
import { ingressUrlWithLabelSelector, DoneMessage } from './ingress-utils';
import { selectorToString } from '@console/internal/module/k8s/selector';

const en = i18next.getFixedT('en');

export const getCmpListFetchUrl = () => {
  const { apiGroup, apiVersion, plural } = ClusterMenuPolicyModel;
  const labelSelectorString = selectorToString({
    [CMP_PRIMARY_KEY]: 'true',
  } as Selector);
  const query = `&${encodeURIComponent('labelSelector')}=${encodeURIComponent(labelSelectorString)}`;

  return `${location.origin}/api/kubernetes/apis/${apiGroup}/${apiVersion}/${plural}?${query}`;
};
const initializeCmpFlag = () => {
  return new Promise((resolve, reject) => {
    coFetchJSON(getCmpListFetchUrl())
      .then(res => {
        const policy = res?.items?.[0];
        window.SERVER_FLAGS.showCustomPerspective = policy?.showCustomPerspective || false;
        resolve(DoneMessage);
      })
      .catch(err => {
        window.SERVER_FLAGS.showCustomPerspective = false;
        console.log(`No cmp resource.`);
        // MEMO : 링크나 메뉴생성에 에러가 나도 일단 app 화면은 떠야 되니 resolve처리함.
        resolve(DoneMessage);
      });
  });
};

const initializeHarborUrl = () => {
  return new Promise((resolve, reject) => {
    k8sList(IngressModel, { ns: 'hyperregistry' })
      .then(ingresses => {
        const regex = /-harbor-ingress$/;
        const matchedIngresses = ingresses?.filter(ingress => regex.test(ingress.metadata?.name));
        if (matchedIngresses?.length > 0) {
          const host = matchedIngresses[0]?.spec?.rules?.[0]?.host;
          if (!!host) {
            const harborMenu = _.get(CustomMenusMap, 'Harbor');
            !!harborMenu && _.assign(harborMenu, { url: `https://${host}` });
          }
        }
        resolve(DoneMessage);
      })
      .catch(err => {
        console.log('No ingress resource for harbor.');
        resolve(DoneMessage);
      });
  });
};

const initializeGitlabUrl = () => {
  return new Promise((resolve, reject) => {
    k8sGet(IngressModel, 'gitlab-ingress', 'gitlab-system')
      .then(ingress => {
        const host = ingress?.spec?.rules?.[0]?.host;
        if (!!host) {
          const gitlabMenu = _.get(CustomMenusMap, 'Git');
          !!gitlabMenu && _.assign(gitlabMenu, { url: `https://${host}` });
          resolve(DoneMessage);
        }
      })
      .catch(err => {
        console.log('No ingress resource for gitlab.');
        resolve(DoneMessage);
      });
  });
};

const initializeGrafanaUrl = () => {
  return new Promise((resolve, reject) => {
    const url = ingressUrlWithLabelSelector({
      'tmaxcloud.org/ingress': 'grafana',
    });
    coFetchJSON(url)
      .then(res => {
        const { items } = res;
        if (items?.length > 0) {
          const ingress = items[0];
          const host = ingress.spec?.rules?.[0]?.host;
          if (!!host) {
            const grafanaMenu = _.get(CustomMenusMap, 'Grafana');
            !!grafanaMenu && _.assign(grafanaMenu, { url: `https://${host}` });
          }
        }
        resolve(DoneMessage);
      })
      .catch(err => {
        resolve(DoneMessage);
      });
  });
};

export const initializationForMenu = async () => {
  await initializeCmpFlag();
  await initializeHarborUrl();
  await initializeGitlabUrl();
  await initializeGrafanaUrl();
};

export const getMenuTitle = (kind, t: TFunction) => {
  if (!!modelFor(kind)) {
    return getLabelTextByKind(kind, t)?.label;
  } else {
    const menuInfo = CustomMenusMap[kind];
    if (!!menuInfo) {
      return getLabelTextByDefaultLabel(menuInfo.defaultLabel, t)?.label;
    } else {
      return '';
    }
  }
};

export const getLabelTextByKind = (kind, t: TFunction) => {
  const model = modelFor(kind);
  const label = ResourceLabel(model, t);
  const key = getI18nInfo(model)?.label;
  const type = i18next.exists(key) ? en(key) : CUSTOM_LABEL_TYPE;
  return { label, type };
};

export const getLabelTextByDefaultLabel = (defaultLabel, t: TFunction) => {
  const i18nExists = i18next.exists(defaultLabel);
  let label = '';
  let type = '';
  if (i18nExists) {
    label = t(defaultLabel);
    type = en(defaultLabel);
  } else {
    //user가 추가한 menu이거나 i18n키가 없는경우
    label = defaultLabel;
    type = CUSTOM_LABEL_TYPE;
  }
  return { label, type };
};

export const getContainerLabel = (label, t: TFunction) => {
  const labelText = label?.toLowerCase().replace(' ', '') || '';
  const containerKeyOrLabel = !!MenuContainerLabels[labelText] ? MenuContainerLabels[labelText] : label;
  const i18nExist = i18next.exists(containerKeyOrLabel);
  let containerLabel = '';
  let type = '';
  if (i18nExist) {
    containerLabel = t(containerKeyOrLabel);
    type = en(containerKeyOrLabel);
  } else {
    containerLabel = labelText;
    type = CUSTOM_LABEL_TYPE;
  }
  return { containerLabel, type };
};
