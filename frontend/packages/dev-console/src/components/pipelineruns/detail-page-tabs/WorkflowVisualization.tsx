import * as React from 'react';
import { WorkflowTemplateVisualization } from '../../pipelines/detail-page-tabs/pipeline-details/WorkflowTemplateVisualization';

type WorkflowVisualizationProps = {
  workflow: any;
};

export const WorkflowVisualization: React.FC<WorkflowVisualizationProps> = ({
  workflow
}) => (
  <WorkflowTemplateVisualization
    workflow={workflow}
    workflowTemplate={workflow}
  />
);
