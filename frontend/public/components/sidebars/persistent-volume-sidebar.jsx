import * as _ from 'lodash-es';
import * as React from 'react';

import { PersistentVolumeModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
// import { useTranslation } from 'react-i18next';

export const PersistentVolumeSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  // const { t } = useTranslation();
  const samples = [
    {
      header: 'Create Persistent Volume',
      details: `클러스터의 내구성 있는 저장소인 '영구 볼륨'을 생성할 수 있다
      리소스 이름: 
      (1) name 영구 볼륨의 이름
      (2) storage 영구 볼륨의 크기
      (3) accessModes 영구 볼륨의 접근 모드
      – ReadWriteOnce : 하나의 노드에서 볼륨을 읽기, 쓰기로 마운트
      – ReadOnlyMany : 여러 노드에서 볼륨을 읽기 전용으로 마운트
      – ReadWriteMany : 여러 노드에서 볼륨을 읽기, 쓰기로 마운트
      만약 블록 스토리지 클래스를 사용하는 경우 volumeMode가 Block인 경우에만 ReadWriteMany 적용이 가능
      (4) persistentVolumeReclaimPolicy 사용이 끝난 영구 볼륨의 처리 방식 (기본값: Delete)
      – Retain : 볼륨을 삭제하지 않고, 데이터를 보존
      – Recycle : 데이터를 삭제하고, 새로운 영구 볼륨 클레임에서 재사용
      – Delete : 볼륨을 삭제
      Recycle은 플러그인 유형이 nfs, hostpath인 경우에만 가능
      (5) storageClassName 영구 볼륨의 스토리지 클래스 이름
      (6) mountOptions 플러그인의 특성에 따른 마운트 옵션
      (7) 플러그인 유형 스토리지를 프로비저닝할 때 사용할 플러그인 유형의 상세 명세`,
      // TODO: yaml 추가하기
      templateName: 'persistentvolume-sample',
      kind: referenceForModel(PersistentVolumeModel),
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
