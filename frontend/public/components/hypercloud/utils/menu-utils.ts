import * as _ from 'lodash-es';
import { ClusterMenuPolicyModel, ServiceModel } from '@console/internal/models';
import { modelFor, Selector, k8sGet } from '@console/internal/module/k8s';
import { CMP_PRIMARY_KEY, CustomMenusMap, MenuContainerLabels, CUSTOM_LABEL_TYPE } from '@console/internal/hypercloud/menu/menu-types';
import { coFetchJSON } from '@console/internal/co-fetch';
import i18next, { TFunction } from 'i18next';
import { ResourceLabel, getI18nInfo } from '@console/internal/models/hypercloud/resource-plural';

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
  return new Promise(resolve => {
    coFetchJSON(getCmpListFetchUrl())
      .then(res => {
        const policy = res?.items?.[0];
        window.SERVER_FLAGS.showCustomPerspective = policy?.showCustomPerspective || false;
        resolve(DoneMessage);
      })
      .catch(() => {
        window.SERVER_FLAGS.showCustomPerspective = false;
        // eslint-disable-next-line no-console
        console.log(`No cmp resource.`);
        // MEMO : 링크나 메뉴생성에 에러가 나도 일단 app 화면은 떠야 되니 resolve처리함.
        resolve(DoneMessage);
      });
  });
};

const initializeMenuUrl = async (labelSelector: any, menuKey: string) => {
  const portNum = await initializePortNum();
  return new Promise(resolve => {
    const url = ingressUrlWithLabelSelector(labelSelector);
    coFetchJSON(url)
      .then(res => {
        const { items } = res;
        if (items?.length > 0) {
          const ingress = items[0];
          const host = ingress.spec?.rules?.[0]?.host;
          if (host) {
            const menu = _.get(CustomMenusMap, menuKey);
            if (menuKey === 'Grafana') {
              !!menu && _.assign(menu, { url: `https://${host}:${portNum}/login/generic_oauth` });
            } else {
              !!menu && _.assign(menu, { url: `https://${host}:${portNum}` });
            }
          }
        }
        resolve(DoneMessage);
      })
      .catch(() => {
        resolve(DoneMessage);
      });
  });
};

const getWebSecurePortNum = ports => {
  const webSecureIdx = _.findIndex(ports, ({ name }) => name === 'websecure');
  return ports[webSecureIdx].port.toString();
};

const initializePortNum = async () => {
  try {
    const { spec } = await k8sGet(ServiceModel, 'api-gateway', 'api-gateway-system', { basePath: `${location.origin}/api/console` });
    return spec.type === 'LoadBalancer' ? '443' : getWebSecurePortNum(spec.ports);
  } catch (error) {
    console.error('[TEST]', error);
    return '443';
  }
};

export const initializationForMenu = async () => {
  await initializeCmpFlag();
  await initializeMenuUrl(
    {
      'ingress.tmaxcloud.org/name': 'hyperregistry ',
    },
    'Harbor',
  );
  await initializeMenuUrl(
    {
      'ingress.tmaxcloud.org/name': 'argocd ',
    },
    'ArgoCD',
  );
  await initializeMenuUrl(
    {
      'ingress.tmaxcloud.org/name': 'gitlab ',
    },
    'Git',
  );
  await initializeMenuUrl(
    {
      'ingress.tmaxcloud.org/name': 'grafana ',
    },
    'Grafana',
  );
  await initializeMenuUrl(
    {
      'ingress.tmaxcloud.org/name': 'kiali ',
    },
    'Kiali',
  );
  await initializeMenuUrl(
    {
      'ingress.tmaxcloud.org/name': 'kibana',
    },
    'Kibana',
  );
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
export const getMenuTitle = (kind, t: TFunction): { label: string; type: string } => {
  if (modelFor(kind)) {
    return getLabelTextByKind(kind, t);
  }
  const menuInfo = CustomMenusMap[kind];
  if (menuInfo) {
    return getLabelTextByDefaultLabel(menuInfo.defaultLabel, t);
  }
  return { label: '', type: CUSTOM_LABEL_TYPE };
};

export const getContainerLabel = (label, t: TFunction) => {
  const labelText = label?.toLowerCase().replace(' ', '') || '';
  const containerKeyOrLabel = MenuContainerLabels[labelText] ? MenuContainerLabels[labelText] : label;
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
