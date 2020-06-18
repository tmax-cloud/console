import * as _ from 'lodash-es';
import * as React from 'react';

import { LimitRangeModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
// import { useTranslation } from 'react-i18next';

export const LimitRangeSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  // const { t } = useTranslation();
  const samples = [
    {
      header: 'Limit Range Object Definition',
      details: `리소스 이름: 
      metadata.namecore-resource-limitsThe name of the limit range object.
      spec.limits.max.cpuThe maximum amount of CPU that a pod can request on a node across all containers.
      spec.limits.max.memoryThe maximum amount of memory that a pod can request on a node across all containers.
      spec.limits.min.cpuThe minimum amount of CPU that a pod can request on a node across all containers.
      spec.limits.min.memoryThe minimum amount of memory that a pod can request on a node across all containers.
      spec.limits.default.cpuThe default amount of CPU that a container will be limited to use if not specified.
      spec.limits.default.memoryThe default amount of memory that a container will be limited to use if not specified.
      spec.limits.defaultRequest.cpuThe default amount of CPU that a container will request to use if not specified.
      spec.limits.defaultRequest.memoryThe default amount of memory that a container will request to use if not specified.
      spec.limits.maxLimitRequestRatioThe maximum amount of CPU burst that a container can make as a ratio of its limit over request.
      `,
      templateName: 'limitrange-sample',
      kind: referenceForModel(LimitRangeModel),
    },
    {
      header: 'OpenShift Container Platform Limit Range Object Definition',
      details: `리소스 이름: 
      spec.limits.max.storageThe maximum size of an image that can be pushed to an internal registry.
      spec.limits.max.tmax.io/image-tagsThe maximum number of unique image tags per image stream’s spec.
      spec.limits.max.tmax.io/images    The maximum number of unique image references per image stream’s status.`,
      templateName: 'limitrange-sample2',
      kind: referenceForModel(LimitRangeModel),
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
