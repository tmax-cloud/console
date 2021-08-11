import * as React from 'react';
import { TextInputTypes } from '@patternfly/react-core';
import { InputField } from '@console/shared';
import { useTranslation } from 'react-i18next';

type PipelineGitOptionsProps = { prefixName: string };

const PipelineGitOptions: React.FC<PipelineGitOptionsProps> = ({ prefixName }) => {
  const { t } = useTranslation();
  return <>
    <InputField
      type={TextInputTypes.text}
      name={`${prefixName}.params.url`}
      label="URL"
      helpText={t('SINGLE:MSG_CI/CD_STARTPIPELINEPOPUP_GITRESOURCES_3')}
      required
    />
    <InputField
      type={TextInputTypes.text}
      name={`${prefixName}.params.revision`}
      label={t('SINGLE:MSG_CI/CD_STARTPIPELINEPOPUP_GITRESOURCES_2')}
      helpText={t('SINGLE:MSG_CI/CD_STARTPIPELINEPOPUP_GITRESOURCES_4')}
    />
  </>
};

export default PipelineGitOptions;
