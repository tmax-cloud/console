import * as _ from 'lodash-es';
import * as React from 'react';

import { DataVolumeModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
// import { useTranslation } from 'react-i18next';

export const DataVolumeSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  // const { t } = useTranslation();
  const samples = [
    {
      header: 'Create Data Volumes',
      details: `데이터를 다른 컨테이너와 공유하거나 호스트에서 접근하기 위한 '데이터볼륨'을 생성할 수 있다.
      리소스 이름: 
      (1) name 데이터 볼륨의 이름
      (2) namespace 데이터 볼륨이 생성될 네이스페이스의 이름 (기본값: default)
      (3) http 가상 머신 이미지를 가져올 외부 경로 종류
      – http
      – s3
      – registry
      (4) url 가상 머신 이미지를 가져올 실제 경로
      (5) secretRef url에 접근할 때 인증이 필요한 경우 사용할 K8s Secret 리소스
      (6) certConfigMap url에 접근할 때 TLS 인증서가 필요한 경우 사용할 K8s ConfigMap 리소스
      (7) contentType 가상 머신 이미지 소스의 유형 (기본값: kubevirt)
      – kubevirt : 가상 머신 이미지 소스가 가상 디스크 이미지인 경우
      – archive : 외부 경로가 http이고, 가상 머신 이미지 소스가 tar 파일인 경우
      (8) accessModes 가상 머신을 생성할 때 사용될 영구 볼륨 클레임의 접근 모드
      – ReadWriteOnce : 하나의 노드에서 볼륨을 읽기, 쓰기로 마운트
      – ReadOnlyMany : 여러 노드에서 볼륨을 읽기 전용으로 마운트
      – ReadWriteMany : 여러 노드에서 볼륨을 읽기, 쓰기로 마운트
      만약 블록 스토리지 클래스를 사용하는 경우 volumeMode가 Block인 경우에만 ReadWriteMany 적용이 가능
      (9) storage 가상 머신을 생성할 때 사용될 영구 볼륨 클레임의 크기
      (10) storageClassName 가상 머신을 생성할 때 사용될 영구 볼륨 클레임의 스토리지 클래스 이름
      (11) volumeMode 볼륨의 사용 모드 (기본값: Filesystem)
      – Filesystem
      – Block`,
      // TODO: yaml 추가하기
      templateName: 'datavolume-sample',
      kind: referenceForModel(DataVolumeModel),
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
