import * as _ from 'lodash-es';
import { ClusterMenuPolicyModel, IngressModel } from '@console/internal/models';
import { k8sList, k8sGet, Selector, modelFor } from '@console/internal/module/k8s';
import { CMP_PRIMARY_KEY, CustomMenusMap } from '@console/internal/hypercloud/menu/menu-types';
import { coFetchJSON } from '@console/internal/co-fetch';
import { selectorToString } from '@console/internal/module/k8s/selector';
import i18next, { TFunction } from 'i18next';
import { ResourceLabel } from '@console/internal/models/hypercloud/resource-plural';
import { MenuContainerLabels } from '@console/internal/hypercloud/menu/menu-types';

const ingressUrlWithLabelSelector = labelSelector => {
  const { apiGroup, apiVersion, plural } = IngressModel;
  const labelSelectorString = selectorToString(labelSelector as Selector);
  const query = `&${encodeURIComponent('labelSelector')}=${encodeURIComponent(labelSelectorString)}`;
  return `api/console/apis/${apiGroup}/${apiVersion}/${plural}?${query}`;
};

const doneMessage = 'done';

const initializeCmpFlag = () => {
  return new Promise((resolve, reject) => {
    k8sList(ClusterMenuPolicyModel, {
      labelSelector: {
        [CMP_PRIMARY_KEY]: 'true',
      },
    })
      .then(policies => {
        const policy = policies?.[0];
        window.SERVER_FLAGS.showCustomPerspective = policy?.showCustomPerspective || false;
        resolve(doneMessage);
      })
      .catch(err => {
        window.SERVER_FLAGS.showCustomPerspective = false;
        console.log(`No cmp resource.`);
        // MEMO : 링크나 메뉴생성에 에러가 나도 일단 app 화면은 떠야 되니 resolve처리함.
        resolve(doneMessage);
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
        resolve(doneMessage);
      })
      .catch(err => {
        console.log('No ingress resource for harbor.');
        resolve(doneMessage);
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
          resolve(doneMessage);
        }
      })
      .catch(err => {
        console.log('No ingress resource for gitlab.');
        resolve(doneMessage);
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
        resolve(doneMessage);
      })
      .catch(err => {
        resolve(doneMessage);
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
    return getLabelTextByModel(kind, t);
  } else {
    const menuInfo = CustomMenusMap[kind];
    if (!!menuInfo) {
      return getLabelTextByDefaultLabel(menuInfo.defaultLabel, t);
    } else {
      return '';
    }
  }
};

export const getLabelTextByModel = (kind, t: TFunction) => {
  const model = modelFor(kind);
  return ResourceLabel(model, t);
};

export const getLabelTextByDefaultLabel = (defaultLabel, t: TFunction) => {
  const i18nExists = i18next.exists(defaultLabel);
  return i18nExists ? t(defaultLabel) : defaultLabel;
};

export const getContainerLabel = (label, t: TFunction) => {
  const labelText = label?.toLowerCase().replace(' ', '') || '';
  return !!MenuContainerLabels[labelText] ? t(MenuContainerLabels[labelText]) : label;
};
