import * as _ from 'lodash-es';
import * as React from 'react';

import { RegistryModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
// import { useTranslation } from 'react-i18next';

export const RegistrySidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  // const { t } = useTranslation();
  const samples = [
    {
      header: 'Create Registries',
      details: `도커 이미지를 저장 및 배포하는 프라이빗 레지스트리를 생성 및 조회할 수 있다.
      리소스 이름: 
      metadata.name 레지스트리의 이름
      metadata.namespace 레지스트리가 생성될 네임스페이스의 이름
      spec.image 이미지 저장소 경로
      spec. description 레지스트리에 대한 설명
      spec.loginid 레지스트리에 로그인할 ID
      spec.loginPassword 레지스트리에 로그인할 ID의 패스워드
      spec.service.port 레지스트리에 노출할 포트 번호
      spec.service.type 레지스트리 서비스 타입 (ClusterIP, NodePort, LoadBalancer)
      spec.persistentVolumeClaim.accessModes 영구 볼륨 클레임의 접근 모드 (ReadWriteOnce, ReadWriteMany)
      spec.persistentVolumeClaim.storageSize 영구 볼륨 클레임의 스토리지 용량
      spec.persistentVolumeClaim.storageClassName 영구 볼륨 클레임의 스토리지 클래스 이름`,
      templateName: 'registry-sample',
      kind: referenceForModel(RegistryModel),
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
