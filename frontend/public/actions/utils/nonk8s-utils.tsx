import * as _ from 'lodash-es';
//get list api url 반환
export const nonK8sListUrl = (kind: string, query: any) =>{
    switch (kind) {
      case 'HelmRelease':
        return query?.ns ? `https://helm.tmaxcloud.org/helm/ns/${query.ns}/releases` : 'https://helm.tmaxcloud.org/helm/all-namespaces/releases';
      case 'HelmChart':
        return 'https://helm.tmaxcloud.org/helm/charts';
      default:
        return '';
    }
  };
  //결과 List 정리
  export const nonK8sListResult = (kind: string, response: any) => {
    switch (kind) {
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