import * as React from 'react';
import { MultiWorkspacesField } from './MultiWorkspacesField';

type PipelineWorkspacesProps = {
  addLabel?: string;
  fieldName: string;
  isReadOnly?: boolean;
};

const PipelineWorkspaces: React.FC<PipelineWorkspacesProps> = props => {
  const { fieldName } = props;

  return <MultiWorkspacesField name={fieldName}></MultiWorkspacesField>;
};

export default PipelineWorkspaces;
