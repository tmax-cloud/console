import * as _ from 'lodash-es';
import * as React from 'react';

import { VirtualMachineModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
// import { useTranslation } from 'react-i18next';

export const VirtualMachineSidebar = ({ kindObj, loadSampleYaml, downloadSampleYaml, isCreateMode }) => {
  // const { t } = useTranslation();
  const samples = [
    {
      header: 'windows 가상머신 샘플',
      details: `windows 가상머신에 대한 VM 오브젝트를 생성하는데 사용한다.
      .spec.template.spec.Affinity.nodeAffinity – 생성시 선호 node 설정 항목이다.
      .spec.template.domain.devices.disk – instance에 attach 할 disk의 설정 항목이다.
      .spec.template.domain.devices.interfaces – 네트워크 interface들에 대한 설정 항목이다.
      .spec.template.domain.gpus – attach 할 gpu device 설정 항목이다.
      .spec.template.domain.cpu – attach 할 cpu 설정 항목이다.
      .spec.template.domain.memory – attach 할 memory 설정 항목이다.`,
      templateName: 'virtualmachine-sample',
      kind: referenceForModel(VirtualMachineModel),
    },
    {
      header: 'ubuntu 가상머신 샘플',
      details: `ubuntu 가상머신에 대한 VM 오브젝트를 생성하는데 사용한다.
      .spec.template.spec – device 및 resource 설정 항목이다.`,
      templateName: 'virtualmachine-sample2',
      kind: referenceForModel(VirtualMachineModel),
    },
  ];
  const filteredSamples = isCreateMode ? samples : _.filter(samples, { kind: referenceForModel(kindObj) });
  console.log(filteredSamples);
  return (
    <ol className="co-resource-sidebar-list">
      {_.map(filteredSamples, sample => {
        return <SampleYaml key={sample.templateName} sample={sample} loadSampleYaml={loadSampleYaml} downloadSampleYaml={downloadSampleYaml} />;
      })}
    </ol>
  );
};
