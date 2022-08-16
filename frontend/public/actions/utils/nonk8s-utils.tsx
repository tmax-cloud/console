import * as _ from 'lodash-es';
import { coFetchJSON } from '../../co-fetch';
export const helmAPI = '/api/kubernetes/apis/helmapi.tmax.io/v1';

export const getKind = (id: string) => {
  return id.split('~~')[0];
};
const getHelmRepo = (id: string) => {
  return id.split('~~')[1];
};

//get object api url 반환
export const nonK8sObjectUrl = async (id: string, namespace: string, name: string) => {
  const kind = getKind(id);
  const helmRepo = getHelmRepo(id);

  switch (kind) {
    case 'HelmRepository':
      return `${helmAPI}/repos/${name}`;
    case 'HelmRelease':
      return `${helmAPI}/namespaces/${namespace}/releases/${name}`;
    case 'HelmChart':
      return `${helmAPI}/charts/${helmRepo}_${name}`;
    default:
      return '';
  }
};

//get object 결과 정리
export const nonK8sObjectResult = (kind: string, response: any) => {
  switch (kind) {
    case 'HelmRepository':
      return response.repoInfo[0];
    case 'HelmRelease':
      return response.release[0];
    case 'HelmChart':
      let entriesvalues = Object.values(_.get(response, 'indexfile.entries'));
      return entriesvalues[0][0];
    default:
      return {};
  }
};

//get list api url 반환
export const nonK8sListUrl = async (id: string, query: any) => {
  const kind = getKind(id);
  const helmRepo = getHelmRepo(id);

  switch (kind) {
    case 'HelmRepository':
      return `${helmAPI}/repos`;
    case 'HelmRelease':
      return query?.ns ? `${helmAPI}/namespaces/${query.ns}/releases` : `${helmAPI}/releases`;
    case 'HelmChart':
      return helmRepo ? `${helmAPI}/charts?repository=${helmRepo}` : `${helmAPI}/charts`;
    default:
      return '';
  }
};
//get list 결과 정리
export const nonK8sListResult = async (id: string, response: any) => {
  const kind = getKind(id);
  switch (kind) {
    case 'HelmRepository':
      await (async () => {
        await Promise.all(
          response.repoInfo.map(async repoinfo => {
            const response = await coFetchJSON(`${helmAPI}/charts?repository=${repoinfo.name}`);
            let tempList = [];
            let entriesvalues = Object.values(_.get(response, 'indexfile.entries'));
            entriesvalues.map(value => {
              tempList.push(value[0]);
            });
            repoinfo.charts = tempList;
          }),
        );
      })();
      return response.repoInfo;
    case 'HelmRelease':
      return response.release;
    case 'HelmChart':
      let tempList = [];
      let entriesvalues = Object.values(_.get(response, 'indexfile.entries'));
      entriesvalues.map(value => {
        tempList.push(value[0]);
      });
      return tempList;
    default:
      return [];
  }
};
