import * as React from 'react';
import { TextInputTypes } from '@patternfly/react-core';
import { InputField } from '@console/shared';
import { useTranslation } from 'react-i18next';

type PipelineImageOptionsProps = { prefixName: string };

const PipelineImageOptions: React.FC<PipelineImageOptionsProps> = ({ prefixName }) => {
  const { t } = useTranslation();
  return <InputField
    type={TextInputTypes.text}
    name={`${prefixName}.params.url`}
    label="URL"
    helpText={t('SINGLE:MSG_CI/CD_STARTPIPELINEPOPUP_IMAGERESOURCES_2')}
    required
  />
};

export default PipelineImageOptions;
