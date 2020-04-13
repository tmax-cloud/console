import * as _ from 'lodash-es';
import * as React from 'react';

import { VirtualMachineModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';

const samples = [
  {
    header: 'VirtualMachine for Window',
    templateName: 'read-virtualmachine-window',
    kind: referenceForModel(VirtualMachineModel),
  },
  {
    header: 'VirtualMachine for Linux',
    templateName: 'read-virtualmachine-linux',
    kind: referenceForModel(VirtualMachineModel),
  },
];

export const VirtualMachineSidebar = ({ kindObj, loadSampleYaml, downloadSampleYaml, isCreateMode }) => {
  const filteredSamples = isCreateMode ? samples : _.filter(samples, { kind: referenceForModel(kindObj) });
  return (
    <ol className="co-resource-sidebar-list">
      {_.map(filteredSamples, sample => (
        <SampleYaml key={sample.templateName} sample={sample} loadSampleYaml={loadSampleYaml} downloadSampleYaml={downloadSampleYaml} />
      ))}
    </ol>
  );
};
