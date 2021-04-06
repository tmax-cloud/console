import * as React from 'react';
import { Alert } from '@patternfly/react-core';
import PipelineTopologyGraph from '../../pipeline-topology/PipelineTopologyGraph';
import { getTopologyNodesEdges } from '../../pipeline-topology/utils';
import { PipelineLayout, NodeType } from '../../pipeline-topology/const';

import './PipelineVisualization.scss';
import * as _ from 'lodash-es';

interface WorkflowTemplateTopologyVisualizationProps {
  workflowTemplate: any;
  workflow?: any;
}

export const WorkflowTemplateVisualization: React.FC<WorkflowTemplateTopologyVisualizationProps> = ({
  workflowTemplate,
  workflow = undefined
}) => {
  const obj = workflow || workflowTemplate;
  const templates = _.get(obj, ['spec', 'templates']) || [];
  let template = null;
  let tasks = [];
  for (let tmp of templates) {
    if (tmp.hasOwnProperty('dag')) {
      template = { ...tmp, type: 'dag' };
    }
    else if (tmp.hasOwnProperty('steps')) {
      template = { ...tmp, type: 'step' };
    }
  }
  if (template?.type === 'dag') {
    tasks = _.get(template, ['dag', 'tasks']).map(item => {
      return {
        name: item.name,
        runAfter: item.dependencies || [],
        taskRef: {
          kind: 'Task',
          name: item.name,
        },
        ...item,
      };
    });
  } else if (template?.type === 'step') {
    tasks = template.steps[0] ? template.steps
      .map(item => item[0])
      .map((item, idx, arr) => {
        return {
          name: item.name,
          runAfter: idx ? [arr[idx - 1].name] : [],
          taskRef: {
            kind: 'Task',
            name: item.name,
          },
          ...item,
        };
      }) : [];
  }
  else {
    // 그래프로 표현할 항목이 없을 경우 템플릿을 노드 하나로 표현
    tasks = templates.map((item) => {
      return {
        name: item.name,
        isTemplate: true,
        runAfter: [],
        taskRef: {
          kind: 'Task',
          name: item.name,
        },
        ...item,
      };
    });
  }
  obj.spec.tasks = tasks;
  const { nodes, edges } = getTopologyNodesEdges(workflowTemplate, workflow);
  nodes.forEach(node => node.type = NodeType.WORKFLOW_NODE);

  if (nodes.length === 0 && edges.length === 0) {
    // Nothing to render
    // TODO: Confirm wording with UX; ODC-1860
    return (
      <Alert
        variant="info"
        isInline
        title={`This ${workflow ? 'Workflow' : 'Workflow Template'
          } has no step to visualize.`}
      />
    );
  }

  return (
    <div className="odc-pipeline-visualization">
      <PipelineTopologyGraph
        id={workflow?.metadata?.name || workflowTemplate.metadata.name}
        nodes={nodes}
        edges={edges}
        layout={PipelineLayout.DAGRE_VIEWER}
      />
    </div>
  );
};

