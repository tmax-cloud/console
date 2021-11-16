import * as React from 'react';
import * as _ from 'lodash';
import { HintBlock, LoadingBox, FirehoseResult } from '@console/internal/components/utils';
import { useTranslation } from 'react-i18next';
import ODCEmptyState from './EmptyState';

export interface ProjectsExistWrapperProps {
  title: string;
  projects?: FirehoseResult;
  children: React.ReactElement;
}

const ProjectsExistWrapper: React.FC<ProjectsExistWrapperProps> = ({ title, projects, children }) => {
  const { t } = useTranslation();
  if (!projects.loaded) {
    return <LoadingBox />;
  }

  if (_.isEmpty(projects.data)) {
    return (
      <ODCEmptyState
        title={title}
        hintBlock={
          <HintBlock title={t('COMMON:MSG_COMMON_ERROR_MESSAGE_51')}>
            <p>{t('COMMON:MSG_COMMON_ERROR_MESSAGE_52')}</p>
          </HintBlock>
        }
      />
    );
  }

  return children;
};

export default ProjectsExistWrapper;
