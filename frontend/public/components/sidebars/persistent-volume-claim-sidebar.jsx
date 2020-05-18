import * as _ from 'lodash-es';
import * as React from 'react';

import { PersistentVolumeClaimModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
// import { useTranslation } from 'react-i18next';

export const PersistentVolumeClaimSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  // const { t } = useTranslation();
  const samples = [
    {
      header: 'Create Persistent Volume Claims',
      details: `영구 볼륨의 사용을 위한 요청 명세를 관리하는 '영구 볼륨 클레임'을 생성할 수 있다.
      리소스 이름: 
      (1) name 영구 볼륨 클레임의 이름
      (2) namespace 영구 볼륨 클레임이 생성될 네이스페이스의 이름 (기본값: default)
      (3) accessModes 영구 볼륨 클레임의 접근 모드
      – ReadWriteOnce : 하나의 노드에서 볼륨을 읽기, 쓰기로 마운트
      – ReadOnlyMany : 여러 노드에서 볼륨을 읽기 전용으로 마운트
      – ReadWriteMany : 여러 노드에서 볼륨을 읽기, 쓰기로 마운트
      만약 블록 스토리지 클래스를 사용하는 경우 volumeMode가 Block인 경우에만 ReadWriteMany 적용이 가능
      (4) volumeMode 볼륨의 사용 모드 (기본값: Filesystem)
      – Filesystem
      – Block
      (5) storage 영구 볼륨 클레임의 크기
      (6) storageClassName 영구 볼륨 클레임의 스토리지 클래스 이름
      (7) selector 영구 볼륨 클레임과 바인딩할 볼륨 정보
      이때 'matchLabels'와 'matchExpressions'에 작성된 조건을 모두 충족하는 볼륨만 바인딩이 가능`,
      // TODO: yaml 추가하기
      templateName: 'persistentvolumeclaim-sample',
      kind: referenceForModel(PersistentVolumeClaimModel),
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
