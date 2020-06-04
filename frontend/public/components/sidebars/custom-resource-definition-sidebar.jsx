import * as _ from 'lodash-es';
import * as React from 'react';

import { CustomResourceDefinitionModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';
// import { useTranslation } from 'react-i18next';

export const CustomResourceDefinitionSidebar = ({ loadSampleYaml, downloadSampleYaml }) => {
  // const { t } = useTranslation();
  const samples = [
    {
      header: 'YAML file for a custom object',
      details: `Create a YAML definition for the custom object. In the following example definition, the cronSpec and image custom fields are set in a custom object of kind CronTab.
      The kind comes from the spec.kind field of the custom resource definition object.
      리소스 이름: 
      apiVersionSpecify the group name and API version (name/version) from the custom resource definition.
      kindSpecify the type in the custom resource definition.
      metadata.nameSpecify a name for the object.
      metadata.finalizersSpecify the finalizers for the object, if any. Finalizers allow controllers to implement conditions that must be completed before the object can be deleted.
      specSpecify conditions specific to the type of object.`,
      templateName: 'customresourcedefinition-sample',
      kind: referenceForModel(CustomResourceDefinitionModel),
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
