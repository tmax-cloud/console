import * as React from 'react';
import * as _ from 'lodash';
import { FormikProps, FormikValues } from 'formik';
import { Form, Stack, StackItem, TextInputTypes } from '@patternfly/react-core';
import { InputField, FormFooter } from '../../../../../console-shared/src';
import { Pipeline } from '../../../utils/pipeline-augment';
import { PipelineParameters, PipelineResources } from '../detail-page-tabs';
import { UpdateOperationType } from './const';
import { useResourceValidation } from './hooks';
import { removeTaskModal } from './modals';
import PipelineBuilderHeader from './PipelineBuilderHeader';
import PipelineBuilderVisualization from './PipelineBuilderVisualization';
import Sidebar from './task-sidebar/Sidebar';
import TaskSidebar from './task-sidebar/TaskSidebar';
import {
  CleanupResults,
  PipelineBuilderTaskGroup,
  SelectedBuilderTask,
  UpdateErrors,
  UpdateOperationUpdateTaskData
} from './types';
import { applyChange } from './update-utils';

import './PipelineBuilderForm.scss';

type PipelineBuilderFormProps = FormikProps<FormikValues> & {
  existingPipeline: Pipeline;
  namespace: string;
  t: any;
};

const PipelineBuilderForm: React.FC<PipelineBuilderFormProps> = props => {
  const [selectedTask, setSelectedTask] = React.useState<SelectedBuilderTask>(
    null
  );
  const selectedTaskRef = React.useRef<SelectedBuilderTask>(null);
  selectedTaskRef.current = selectedTask;

  const {
    existingPipeline,
    status,
    isSubmitting,
    dirty,
    handleReset,
    handleSubmit,
    errors,
    namespace,
    setFieldValue,
    setStatus,
    values,
    t
  } = props;
  const statusRef = React.useRef(status);
  statusRef.current = status;

  const updateErrors: UpdateErrors = React.useCallback(
    taskErrors => {
      if (taskErrors) {
        setStatus({
          ...statusRef.current,
          tasks: _.omitBy(
            _.merge({}, statusRef.current?.tasks, taskErrors),
            v => !v
          )
        });
      }
    },
    [setStatus]
  );

  useResourceValidation(values.tasks, values.resources, updateErrors);

  const updateTasks = (changes: CleanupResults): void => {
    const { tasks, listTasks, errors: taskErrors } = changes;

    setFieldValue('tasks', tasks);
    setFieldValue('listTasks', listTasks);
    updateErrors(taskErrors);
  };

  const selectedId = values.tasks[selectedTask?.taskIndex]?.name;
  const selectedIds = selectedId ? [selectedId] : [];

  const taskGroup: PipelineBuilderTaskGroup = {
    tasks: values.tasks,
    listTasks: values.listTasks,
    highlightedIds: selectedIds
  };

  const closeSidebarAndHandleReset = React.useCallback(() => {
    setSelectedTask(null);
    selectedTaskRef.current = null;
    handleReset();
  }, [handleReset]);

  return (
    <>
      <Stack className="odc-pipeline-builder-form">
        <StackItem>
          <PipelineBuilderHeader
            existingPipeline={existingPipeline}
            namespace={namespace}
            t={t}
          />
        </StackItem>
        <StackItem isFilled className="odc-pipeline-builder-form__content">
          <p
            className="co-m-pane__explanation"
            style={{ marginBottom: '10px' }}
          >
            {t('STRING:PIPELINE-CREATE_0')}
          </p>
          <Form
            className="odc-pipeline-builder-form__grid"
            onSubmit={handleSubmit}
          >
            <div className="odc-pipeline-builder-form__name">
              <InputField
                // label={t('CONTENT:NAME')}
                name="name"
                resourceType="pipeline"
                type={TextInputTypes.text}
                isDisabled={!!existingPipeline}
                required
                t={t}
              />
            </div>
            {/* <div>
              <h2>{t('CONTENT:PIPELINEPARAMETERS')}</h2>
              <PipelineParameters
                addLabel={t('CONTENT:ADDMORE')}
                fieldName="params"
              />
            </div> */}

            <div className={'row form-group'}>
              <div className="col-xs-2 control-label">
                <strong>{t('CONTENT:PIPELINEPARAMETERS')}</strong>
              </div>
              <div className="col-xs-10">
                <PipelineParameters
                  addLabel={t('CONTENT:ADDMORE')}
                  fieldName="params"
                />
              </div>
            </div>
            <div className={'row form-group required'}>
              <div className="col-xs-2 control-label">
                <strong>{t('CONTENT:PIPELINERESOURCES')}</strong>
              </div>
              <div className="col-xs-10">
                <PipelineResources
                  addLabel={t('CONTENT:ADDMORE')}
                  fieldName="resources"
                />
              </div>
            </div>
            {/* 
            <div>
              <h2>{t('CONTENT:PIPELINERESOURCES')}</h2>
              <PipelineResources
                addLabel={t('CONTENT:ADDMORE')}
                fieldName="resources"
              />
            </div> */}
            <div>
              <strong>{t('CONTENT:PIPELINEBUILD')}</strong>
              <PipelineBuilderVisualization
                namespace={namespace}
                tasksInError={status?.tasks || {}}
                onTaskSelection={(task, resource) => {
                  setSelectedTask({
                    taskIndex: values.tasks.findIndex(
                      ({ name }) => name === task.name
                    ),
                    resource
                  });
                }}
                onUpdateTasks={(updatedTaskGroup, op) =>
                  updateTasks(applyChange(updatedTaskGroup, op))
                }
                taskGroup={taskGroup}
              />
              <p
                className="co-m-pane__explanation"
                style={{ marginTop: '10px' }}
              >
                {t('STRING:PIPELINE-CREATE_1')}
              </p>
            </div>

            <FormFooter
              handleReset={closeSidebarAndHandleReset}
              errorMessage={status?.submitError}
              isSubmitting={isSubmitting}
              submitLabel={existingPipeline ? 'Save' : t('CONTENT:CREATE')}
              disableSubmit={
                false
                // !dirty ||
                // !_.isEmpty(errors) ||
                // !_.isEmpty(status?.tasks) ||
                // values.tasks.length === 0
              }
              resetLabel={t('CONTENT:CANCEL')}
              sticky
            />
          </Form>
        </StackItem>
      </Stack>
      <Sidebar
        open={!!selectedTask}
        onRequestClose={() => {
          if (selectedTask?.taskIndex === selectedTaskRef.current?.taskIndex) {
            setSelectedTask(null);
          }
        }}
      >
        {() => (
          <div className="pf-c-form">
            <TaskSidebar
              // Intentional remount when selection changes
              key={selectedTask.taskIndex}
              resourceList={values.resources || []}
              errorMap={status?.tasks || {}}
              onUpdateTask={(data: UpdateOperationUpdateTaskData) => {
                updateTasks(
                  applyChange(taskGroup, {
                    type: UpdateOperationType.UPDATE_TASK,
                    data
                  })
                );
              }}
              onRemoveTask={taskName => {
                removeTaskModal(taskName, () => {
                  setSelectedTask(null);
                  updateTasks(
                    applyChange(taskGroup, {
                      type: UpdateOperationType.REMOVE_TASK,
                      data: { taskName }
                    })
                  );
                });
              }}
              selectedPipelineTaskIndex={selectedTask.taskIndex}
              taskResource={selectedTask.resource}
              t={t}
            />
          </div>
        )}
      </Sidebar>
    </>
  );
};

export default PipelineBuilderForm;
