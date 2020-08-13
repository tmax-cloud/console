import * as React from 'react';
import { TextInputTypes } from '@patternfly/react-core';
import {
  MultiColumnField,
  InputField,
  DropdownField
} from '../../../../../console-shared/src';
// import { pipelineResourceTypeSelections } from '../const';
import { useTranslation } from 'react-i18next';
type PipelineResourcesParam = {
  addLabel?: string;
  fieldName: string;
  isReadOnly?: boolean;
};

const PipelineResources: React.FC<PipelineResourcesParam> = props => {
  const {
    addLabel = 'Add Pipeline Resource',
    fieldName,
    isReadOnly = false
  } = props;
  // const emptyMessage = 'No resources are associated with this pipeline.';
  const emptyMessage = '';
  const { t } = useTranslation();

  let pipelineResourceTypeSelections = {
    '': t('CONTENT:SELECTRESOURCETYPE'),
    git: 'Git',
    image: t('CONTENT:IMAGE')
    // cluster: 'Cluster',
    // storage: t('CONTENT:STORAGE')
  };
  return (
    <MultiColumnField
      name={fieldName}
      addLabel={addLabel}
      headers={[t('CONTENT:NAME'), t('CONTENT:RESOURCETYPE')]}
      emptyValues={{ name: '', type: '' }}
      emptyMessage={emptyMessage}
      isReadOnly={isReadOnly}
    >
      <InputField
        name="name"
        type={TextInputTypes.text}
        placeholder={t('CONTENT:NAME')}
        isReadOnly={isReadOnly}
      />
      <DropdownField
        name="type"
        items={pipelineResourceTypeSelections}
        fullWidth
        disabled={isReadOnly}
      />
    </MultiColumnField>
  );
};

export default PipelineResources;
