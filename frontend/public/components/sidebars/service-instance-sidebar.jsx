import * as _ from 'lodash-es';
import * as React from 'react';

import { ServiceInstanceModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
// import { useTranslation } from 'react-i18next';

export const ServiceInstanceSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  // const { t } = useTranslation();
  const samples = [
    {
      //   highlightText: t('CONTENT:LIMIT'),
      header: '서비스 인스턴스 샘플',
      details: `클러스터 서비스 클래스의 프로비저닝 된 인스턴스를 생성할 수 있다.
      .spec.cluseterServiceClassName – 클러스터 서비스 클래스 이름    
      .spec.clusterServicePlanName – 클러스터 서비스 플랜 이름`,
      templateName: 'serviceinstance-sample',
      kind: referenceForModel(ServiceInstanceModel),
    },
    {
        //   highlightText: t('CONTENT:LIMIT'),
      header: '서비스 인스턴스 샘플 (was) ex)apache',
      details: ` was 클러스터 서비스 클래스의 프로비저닝 된 인스턴스를 생성할 수 있다. ex) apache
      .spec.clusterServiceClassName – 클러스터 서비스 클래스 이름
      .spec.clusterServiceClassRef – 클러스터 서비스 클래스 Ref
      .spec.clusterServicePlanName –  클러스터 서비스 플랜 이름
      .spec.clusterServicePlanRef – 클러스터 서비스 플랜 Ref
      .spec.parameters – 서비스 인스턴스의 parameter 정의`,
      templateName: 'serviceinstance-sample2',
      kind: referenceForModel(ServiceInstanceModel),
      },
      {
        //   highlightText: t('CONTENT:LIMIT'),
      header: '서비스 인스턴스 샘플 (db) ex)mysql',
      details: `db 클러스터 서비스 클래스의 프로비저닝 된 인스턴스를 생성할 수 있다. ex) mysql
      .spec.clusterServiceClassName – 클러스터 서비스 클래스 이름
      .spec.clusterServiceClassRef – 클러스터 서비스 클래스 Ref    
      .spec.clusterServicePlanName –  클러스터 서비스 플랜 이름    
      .spec.clusterServicePlanRef – 클러스터 서비스 플랜 Ref    
      .spec.parameters – 서비스 인스턴스의 parameter 정의`,       
       templateName: 'serviceinstance-sample3',
      kind: referenceForModel(ServiceInstanceModel),
      },
  ];

  return (
    <ol className="co-resource-sidebar-list">
      {_.map(samples, sample => (
        <SampleYaml key={sample.templateName} sample={sample} loadSampleYaml={loadSampleYaml} downloadSampleYaml={downloadSampleYaml} />
      ))}
    </ol>
  );
};
