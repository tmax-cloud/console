import * as _ from 'lodash-es';
import * as React from 'react';

import { UsergroupModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
// import { useTranslation } from 'react-i18next';

export const UserGroupSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  // const { t } = useTranslation();
  const samples = [
    {
      header: 'Example 1. Creat UserGroups',
      details: `리소스 이름: 
      metadata.name          사용자 그룹의 ID
      userGroupInfo.name     사용자 그룹의 이름
      userGroupInfo.department     사용자 그룹 부서
      userGroupInfo.position      사용자 그룹 직위
      userGroupInfo.description   사용자 그룹 설명`,
      templateName: 'usergroup-sample',
      kind: referenceForModel(UsergroupModel),
    }
  ];

  return (
    <ol className="co-resource-sidebar-list">
      {_.map(samples, sample => (
        <SampleYaml key={sample.templateName} sample={sample} loadSampleYaml={loadSampleYaml} downloadSampleYaml={downloadSampleYaml} />
      ))}
    </ol>
  );
};
