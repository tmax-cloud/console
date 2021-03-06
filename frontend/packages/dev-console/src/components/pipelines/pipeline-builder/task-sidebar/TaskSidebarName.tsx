import * as React from 'react';
import { FormGroup, TextInput, TextInputTypes } from '@patternfly/react-core';
import { SidebarInputWrapper } from './temp-utils';
import { useTranslation } from 'react-i18next';

type TaskSidebarNameProps = {
  initialName: string;
  onChange: (newName: string) => void;
  taskName: string;
};

const VALID_NAME = /^([a-z]([-a-z0-9]*[a-z0-9])?)*$/;
const INVALID_ERROR_MESSAGE =
  'Name must consist of lower-case letters, numbers and hyphens. It must start with a letter and end with a letter or number.';

const getError = (value: string): string | null => {
  let error = null;
  if (value === '') {
    error = 'Required';
  } else if (!VALID_NAME.test(value)) {
    error = INVALID_ERROR_MESSAGE;
  }
  return error;
};

const TaskSidebarName: React.FC<TaskSidebarNameProps> = (props) => {
  const { initialName, onChange, taskName } = props;
  const [interimName, setInterimName] = React.useState(initialName);
  const [error, setError] = React.useState(null);
  const isValid = !error;
  const { t } = useTranslation();

  return (
    <FormGroup
      fieldId="task-name"
      label={t('SINGLE:MSG_PIPELINES_CREATEFORM_25')}
      helperTextInvalid={error}
      isValid={isValid}
      isRequired
    >
      <SidebarInputWrapper>
        <TextInput
          id="task-name"
          isValid={isValid}
          isRequired
          onChange={(value) => {
            setInterimName(value);
            setError(getError(value));
          }}
          onBlur={() => {
            if (isValid) {
              onChange(interimName);
            }
          }}
          placeholder={taskName}
          type={TextInputTypes.text}
          value={interimName}
        />
      </SidebarInputWrapper>
    </FormGroup>
  );
};

export default TaskSidebarName;
