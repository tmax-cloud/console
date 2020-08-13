import * as React from 'react';
import { TextInputTypes } from '@patternfly/react-core';
import {
  MultiColumnField,
  InputField
} from '../../../../../console-shared/src';
import { useTranslation } from 'react-i18next';

type PipelineParametersProps = {
  addLabel?: string;
  fieldName: string;
  isReadOnly?: boolean;
};

const PipelineParameters: React.FC<PipelineParametersProps> = props => {
  const {
    addLabel = 'Add Pipeline Parameter',
    fieldName,
    isReadOnly = false
  } = props;
  // const emptyMessage = 'No parameters are associated with this pipeline.';
  const emptyMessage = '';
  const { t } = useTranslation();
  return (
    <MultiColumnField
      name={fieldName}
      addLabel={addLabel}
      headers={[
        t('CONTENT:NAME'),
        t('CONTENT:DESCRIPTION'),
        t('CONTENT:DEFAULTVALUE')
      ]}
      emptyValues={{ name: '', description: '', default: '' }}
      emptyMessage={emptyMessage}
      isReadOnly={isReadOnly}
    >
      <InputField
        name="name"
        type={TextInputTypes.text}
        placeholder={t('CONTENT:NAME')}
        isReadOnly={isReadOnly}
      />
      <InputField
        name="description"
        type={TextInputTypes.text}
        placeholder={t('CONTENT:DESCRIPTION')}
        isReadOnly={isReadOnly}
      />
      <InputField
        name="default"
        type={TextInputTypes.text}
        placeholder={t('CONTENT:DEFAULTVALUE')}
        isReadOnly={isReadOnly}
      />
    </MultiColumnField>
  );
};

export default PipelineParameters;
