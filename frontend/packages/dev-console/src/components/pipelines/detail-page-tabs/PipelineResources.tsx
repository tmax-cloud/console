import * as React from 'react';
import { TextInputTypes } from '@patternfly/react-core';
import { MultiColumnField, InputField, DropdownField } from '@console/shared';
import { pipelineResourceTypeSelections } from '../const';

import { useTranslation } from 'react-i18next';

type PipelineResourcesParam = {
  addLabel?: string;
  fieldName: string;
  isReadOnly?: boolean;
};

const PipelineResources: React.FC<PipelineResourcesParam> = (props) => {  
  const { fieldName, isReadOnly = false } = props;
  const { t } = useTranslation();
  const emptyMessage = `${t('SINGLE:MSG_PIPELINES_CREATEFORM_11')}`;
  return (
    <MultiColumnField
      name={fieldName}
      addLabel={`${t('SINGLE:MSG_PIPELINES_CREATEFORM_12')}`}
      headers={[`${t('SINGLE:MSG_PIPELINES_CREATEFORM_13')}`, `${t('SINGLE:MSG_PIPELINES_CREATEFORM_14')}`]}
      emptyValues={{ name: '', type: '' }}
      emptyMessage={emptyMessage}
      isReadOnly={isReadOnly}
    >
      <InputField
        name="name"
        type={TextInputTypes.text}
        placeholder={`${t('SINGLE:MSG_PIPELINES_CREATEFORM_13')}`}
        isReadOnly={isReadOnly}
      />
      <DropdownField
        name="type"
        items={pipelineResourceTypeSelections.bind(null, t)()}
        fullWidth
        disabled={isReadOnly}
        title={`${t('SINGLE:MSG_PIPELINES_CREATEFORM_15')}`}
      />
    </MultiColumnField>
  );
};

export default PipelineResources;
