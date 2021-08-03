import * as React from 'react';
import * as _ from 'lodash';
import { FormikValues, useField, useFormikContext } from 'formik';
import { Select, SelectOption } from '@patternfly/react-core';
import { referenceForModel } from '@console/internal/module/k8s';
import {
  useK8sWatchResource,
  WatchK8sResource,
} from '@console/internal/components/utils/k8s-watch-hook';
import { LoadingInline } from '@console/internal/components/utils';
import { PipelineResourceModel } from '../../../../models';
import { PipelineResourceKind } from '../../../../utils/pipeline-augment';
import { CREATE_PIPELINE_RESOURCE } from './const';
import { InputField } from '@console/shared';

import './PipelineResourceDropdown.scss';
import { useTranslation } from 'react-i18next';

type PipelineResourceDropdownProps = {
  autoSelect?: boolean;
  filterType: string;
  name: string;
  namespace: string;
  selectedKey: string;
};

const PipelineResourceDropdown: React.FC<PipelineResourceDropdownProps> = (props) => {
  const { autoSelect, filterType, name, namespace, selectedKey } = props;

  const [isExpanded, setExpanded] = React.useState(false);
  const { setFieldValue, setFieldTouched } = useFormikContext<FormikValues>();
  const [, { touched }] = useField(name);

  const resourceDefinition: WatchK8sResource = React.useMemo(
    () => ({
      isList: true,
      namespace,
      kind: referenceForModel(PipelineResourceModel),
    }),
    [namespace],
  );
  const [resources, loaded, error] = useK8sWatchResource<PipelineResourceKind[]>(
    resourceDefinition,
  );

  const availableResources: PipelineResourceKind[] = resources.filter(
    (resource) => resource.spec.type === filterType,
  );

  const canAutoSelect = autoSelect && !touched && loaded && !error;
  React.useEffect(() => {
    if (canAutoSelect) {
      if (availableResources.length === 0) {
        setFieldValue(name, CREATE_PIPELINE_RESOURCE);
      } else {
        setFieldValue(name, availableResources[0].metadata.name);
      }
      setFieldTouched(name);
    }
  }, [canAutoSelect, name, availableResources, setFieldTouched, setFieldValue]);

  const options = [
    { label: 'Create Pipeline Resource', value: CREATE_PIPELINE_RESOURCE },
    ...availableResources.map((resource) => {
      const resourceName = resource.metadata.name;
      const url = _.find(resource.spec.params, ['name', 'url'])?.value || '';
      const label = url.trim().length > 0 ? `${url} (${resourceName})` : resourceName;

      return { label, value: resourceName };
    }),
  ];
  const { t } = useTranslation();

  return (
    <>
    <Select
      className="odc-pipeline-resource-dropdown"
      selections={selectedKey}
      isExpanded={isExpanded}
      onToggle={() => setExpanded(!isExpanded)}
      onSelect={(e, value) => {
        setFieldValue(name, value);
        setExpanded(false);
      }}
      placeholderText={!loaded ? <LoadingInline /> : 'Select Pipeline Resource'}
      isDisabled={loaded && availableResources.length === 0}
    >
      {options.map(({ label, value }) => (
        <SelectOption key={value} value={value}>
          {label}
        </SelectOption>
      ))}
    </Select>
    <InputField        
        name={name}
        label={t('COMMON:MSG_MAIN_TABLEHEADER_1')}        
        isDisabled
      />
    </>
  );
};

export default PipelineResourceDropdown;
