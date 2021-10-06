import * as _ from 'lodash-es';
import { ClusterMenuPolicyModel, IngressModel } from '@console/internal/models';
import { k8sList, k8sGet } from '@console/internal/module/k8s';
import { CMP_PRIMARY_KEY, CustomMenusMap } from '@console/internal/hypercloud/menu/menu-types';

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
        resolve('done');
      })
      .catch(err => {
        window.SERVER_FLAGS.showCustomPerspective = false;
        console.log(`No cmp resource.`);
        // MEMO : 링크나 메뉴생성에 에러가 나도 일단 app 화면은 떠야 되니 resolve처리함.
        resolve('done');
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
        resolve('done');
      })
      .catch(err => {
        console.log('No ingress resource for harbor.');
        resolve('done');
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
          resolve('done');
        }
      })
      .catch(err => {
        console.log('No ingress resource for gitlab.');
        resolve('done');
      });
  });
};

export const initializationForMenu = async () => {
  await initializeCmpFlag();
  await initializeHarborUrl();
  await initializeGitlabUrl();
};
