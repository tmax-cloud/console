import * as _ from 'lodash-es';
import * as React from 'react';

import { StorageClassModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
// import { useTranslation } from 'react-i18next';

export const StorageClassSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  // const { t } = useTranslation();
  const samples = [
    {
      header: 'Create Block Storage Class',
      details: `블록 스토리지 클래스의 생성을 위한 가장 기본적인 작성 예이다.
      리소스 이름: 
      (1) name 스토리지 클래스의 이름
      (2) clusterID Rook Ceph 클러스터가 설치된 네임스페이스의 이름 (기본값: rook-ceph)
      만약 기본값을 변경할 경우 secret의 네임스페이스도 변경 필요
      (3) pool Ceph pool의 이름 (기본값: replicapool)
      (4) imageFormat RBD 이미지의 포맷 (기본값: 2)
      이미지 포맷을 1로 설정할 경우 deprecated되어 볼륨 cloning 등의 기능들은 사용할 수 없음
      (5) imageFeatures RBD 이미지의 특성 (기본값: layering)
      현재 striping, exclusive-lock, object-map, fast-diff, deep-flatten, journaling 등은 미지원
      (6) secret-names 오퍼레이터에 의해 생성된 Ceph 관리자의 secret (고정값)
      (7) fstype 스토리지의 파일 시스템 타입 (기본값: ext4)
      (8) mounter 볼륨을 마운트할 때 rbd-nbd 모듈의 사용 여부 (기본값: 미사용)
      (9) allowVolumeExpansion 볼륨 크기 확장 기능의 지원 여부 (기본값: true)
      (10) reclaimPolicy 사용이 끝난 영구 볼륨의 처리 방식 (기본값: Delete)
      – Retain : 볼륨을 삭제하지 않고, 데이터를 보존
      – Delete : 볼륨을 삭제`,
      // TODO: yaml 추가하기
      templateName: 'storageclass-sample',
      kind: referenceForModel(StorageClassModel),
    },
    {
      header: 'Create File Storage Class',
      details: `파일 스토리지 클래스의 생성을 위한 가장 기본적인 작성 예이다.
      리소스 이름:
      (1) name 스토리지 클래스의 이름
      (2) clusterID Rook Ceph 클러스터가 설치된 네임스페이스의 이름 (기본값: rook-ceph)
      만약 기본값을 변경할 경우 secret의 네임스페이스도 변경 필요
      (3) fsName CephFS의 파일 시스템 이름 (기본값: myfs)
      (4) pool Ceph pool의 이름 (기본값: myfs-data0)
      (5) secret-names 오퍼레이터에 의해 생성된 Ceph 관리자의 secret (고정값)
      (6) mounter 볼륨을 마운트할 때 사용할 모듈 (기본값: 미사용)
      – fuse : ceph-fuse
      – kernel : ceph kernelclient
      만약 해당 필드값을 작성하지 않으면 기본 volume mounter를 드라이버가 판단함
      (7) reclaimPolicy 사용이 끝난 영구 볼륨의 처리 방식 (기본값: Delete)
      – Retain : 볼륨을 삭제하지 않고, 데이터를 보존
      – Delete : 볼륨을 삭제
      (8) allowVolumeExpansion 볼륨 크기 확장 기능의 지원 여부 (기본값: true)
      (9) mountOptions 마운트할 때 디버깅의 가능 여부 (기본값: 미사용)`,
      // TODO: yaml 추가하기
      templateName: 'storageclass-sample2',
      kind: referenceForModel(StorageClassModel),
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
