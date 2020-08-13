import * as React from 'react';
import { FormGroup } from '@patternfly/react-core';
import { Dropdown } from '../../../../../../../public/components/utils';
import {
  PipelineResource,
  PipelineResourceTaskResource,
  PipelineTaskResource
} from '../../../../utils/pipeline-augment';
import { SidebarInputWrapper } from './temp-utils';
import { useTranslation } from 'react-i18next';
type TaskSidebarResourceProps = {
  availableResources: PipelineResource[];
  onChange: (resourceName: string, resource: PipelineResource) => void;
  resource: PipelineResourceTaskResource;
  taskResource?: PipelineTaskResource;
};

const TaskSidebarResource: React.FC<TaskSidebarResourceProps> = props => {
  const { availableResources, onChange, resource, taskResource } = props;

  const dropdownResources = availableResources.filter(
    ({ name, type }) => resource.type === type && !!name
  );
  const { t } = useTranslation();
  return (
    <FormGroup
      fieldId={resource.name}
      label={resource.name}
      helperText={`Only showing resources for this type (${resource.type}).`}
      helperTextInvalid={
        dropdownResources.length === 0
          ? `No resources available. Add pipeline resources.`
          : ''
      }
      isValid={dropdownResources.length > 0}
      isRequired
    >
      <SidebarInputWrapper>
        <Dropdown
          title={
            resource.type === 'image'
              ? t('CONTENT:SELECTIMAGERESOURCE')
              : t('CONTENT:SELECTGITRESOURCE')
          }
          items={dropdownResources.reduce(
            (acc, { name }) => ({ ...acc, [name]: name }),
            {}
          )}
          disabled={dropdownResources.length === 0}
          selectedKey={taskResource?.resource || ''}
          dropDownClassName="dropdown--full-width"
          onChange={(value: string) => {
            onChange(
              resource.name,
              dropdownResources.find(({ name }) => name === value)
            );
          }}
        />
      </SidebarInputWrapper>
    </FormGroup>
  );
};

export default TaskSidebarResource;
