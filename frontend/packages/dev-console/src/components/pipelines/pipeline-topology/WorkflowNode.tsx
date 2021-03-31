import * as React from 'react';
import { observer, Node, NodeModel } from '../../../../../topology/src';
import { WorkflowVisualizationTask } from '../detail-page-tabs/pipeline-details/WorkflowVisualizationTask';
import { DROP_SHADOW_SPACING } from './const';
import { TaskNodeModelData } from './types';

type TaskNodeProps = {
  element: Node<NodeModel, TaskNodeModelData>;
  disableTooltip?: boolean;
};

const WorkflowNode: React.FC<TaskNodeProps> = ({ element }) => {
  const { height, width } = element.getBounds();
  const { pipeline, pipelineRun, task, selected } = element.getData();
  if (!!pipelineRun) {
    for (let node in pipelineRun.status.nodes) {
      // step, dag 인 경우 displayName으로 node 참조. 템플릿 항목 자체를 노드로 사용하는 경우 templateName으로 node 참조
      const nodeNameField = task.isTemplate ? 'templateName' : 'displayName';
      if (pipelineRun.status.nodes[node][nodeNameField] === task.name) {
        task.status = { reason: pipelineRun.status.nodes[node].phase }
        break;
      }
    }
  }
  return (
    <foreignObject width={width} height={height + DROP_SHADOW_SPACING}>
      <WorkflowVisualizationTask
        pipelineRunName={pipelineRun?.metadata?.name}
        task={task}
        pipelineRunStatus={pipelineRun && pipelineRun.status.phase}
        namespace={pipeline?.metadata?.namespace}
        disableTooltip={true}
        selected={selected}
      />
    </foreignObject>
  );
};

export default observer(WorkflowNode);
