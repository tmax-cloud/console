import * as _ from 'lodash-es';
import { IngressModel } from '@console/internal/models';
import { Selector } from '@console/internal/module/k8s';
import { coFetchJSON } from '@console/internal/co-fetch';
import { selectorToString } from '@console/internal/module/k8s/selector';
import { initializationForMenu } from '@console/internal/components/hypercloud/utils/menu-utils';

export const DoneMessage = 'done';

export const ingressUrlWithLabelSelector = labelSelector => {
  const { apiGroup, apiVersion, plural } = IngressModel;
  const labelSelectorString = selectorToString(labelSelector as Selector);
  const query = `&${encodeURIComponent('labelSelector')}=${encodeURIComponent(labelSelectorString)}`;
  return `api/console/apis/${apiGroup}/${apiVersion}/${plural}?${query}`;
};

const setSingleClusterBasePath = () => {
  return new Promise((resolve, reject) => {
    const url = ingressUrlWithLabelSelector({
      'ingress.tmaxcloud.org/name': 'multicluster',
    });
    // MEMO : singleClusterBasePath설정을 위해 필요한 콜은 마스터클러스터 콜이여서 직접 location.origin으로 도메인 설정해줌.
    // MEMO : (직접적인 https://가 포함된 도메인 설정 없을 경우 co-fetch.js의 coFetchCommon에서 perspective 상태에 따라 도메인을 바꿔줌)
    coFetchJSON(`${location.origin}/${url}`)
      .then(res => {
        const { items } = res;
        if (items?.length > 0) {
          const ingress = items[0];
          const host = ingress.spec?.rules?.[0]?.host;
          if (!!host) {
            window.SERVER_FLAGS.singleClusterBasePath = `https://${host}/`;
          }
        }
        resolve(DoneMessage);
      })
      .catch(err => {
        resolve(DoneMessage);
      });
  });
};

export const setUrlFromIngresses = async () => {
  await setSingleClusterBasePath();
  await initializationForMenu();
};
