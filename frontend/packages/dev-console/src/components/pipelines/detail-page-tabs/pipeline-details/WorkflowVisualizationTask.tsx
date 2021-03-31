import * as React from 'react';
import * as _ from 'lodash';
import * as cx from 'classnames';
import {
  K8sResourceKind,
} from '../../../../../../../public/module/k8s';
import {
  Firehose,
} from '../../../../../../../public/components/utils';
import {
  ClusterTaskModel
} from '../../../../../../../public/models';
import { ColoredStatusIconWorkFlow } from './StatusIcon';
import {
  TaskStatus
} from './pipeline-step-utils';
import './WorkflowVisualizationTask.scss';

interface TaskProps {
  pipelineRunName?: string;
  name: string;
  loaded?: boolean;
  task?: {
    data: K8sResourceKind;
    loaded: boolean;
  };
  status?: TaskStatus;
  namespace: string;
  isPipelineRun: boolean;
  disableTooltip?: boolean;
  selected?: boolean;
}

interface WorkflowVisualizationTaskProp {
  pipelineRunName?: string;
  namespace: string;
  task: {
    name?: string;
    taskRef: {
      name: string;
      kind?: string;
    };
    status?: TaskStatus;
  };
  taskRun?: string;
  pipelineRunStatus?: string;
  disableTooltip?: boolean;
  selected?: boolean;
}

export const WorkflowVisualizationTask: React.FC<WorkflowVisualizationTaskProp> = ({
  pipelineRunName,
  task,
  namespace,
  pipelineRunStatus,
  disableTooltip,
  selected,
}) => {
  const taskStatus = task.status;
  const taskComponent = (
    <TaskComponent
      pipelineRunName={pipelineRunName}
      name={task.name || ''}
      namespace={namespace}
      status={taskStatus}
      isPipelineRun={!!pipelineRunStatus}
      disableTooltip={disableTooltip}
      selected={selected}
    />
  );

  if (disableTooltip) {
    return taskComponent;
  }

  let resources;
  if (task.taskRef.kind === ClusterTaskModel.kind) {
    resources = [
      {
        // kind: referenceForModel(ClusterTaskModel),
        kind: 'ClusterTask',
        name: task.taskRef.name,
        prop: 'task'
      }
    ];
  } else {
    resources = [
      {
        // kind: referenceForModel(TaskModel),
        kind: 'Task',
        name: task.taskRef.name,
        namespace,
        prop: 'task'
      }
    ];
  }
  return <Firehose resources={resources}>{taskComponent}</Firehose>;
};
const TaskComponent: React.FC<TaskProps> = ({
  pipelineRunName,
  namespace,
  task,
  status,
  name,
  isPipelineRun,
  disableTooltip,
  selected,
}) => {
  const showStatusState: boolean = isPipelineRun && !!status && !!status.reason;
  const visualName = name;

  let taskPill = (
    <div
      className={cx('odc-pipeline-vis-task__content', {
        'is-selected': selected
      })}
    >
      <div
        className={cx('odc-pipeline-vis-task__title-wrapper', {
          'is-text-center': !isPipelineRun
        })}
      >
        <div className="odc-pipeline-vis-task__title">{visualName}</div>
      </div>
      {isPipelineRun && (
        <div className="odc-pipeline-vis-task__status">
          {showStatusState && (
            <ColoredStatusIconWorkFlow status={status.reason} height={18} width={18} />
          )}
        </div>
      )}
    </div>
  );

  const visTask = (
    <>
      <div className="odc-pipeline-vis-task__connector" />
      {taskPill}
    </>
  );
  return (
    <div className="odc-pipeline-vis-task">
      {visTask}
    </div>
  );
};
