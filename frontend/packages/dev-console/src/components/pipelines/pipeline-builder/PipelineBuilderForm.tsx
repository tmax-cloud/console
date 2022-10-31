import * as React from 'react';
import * as _ from 'lodash';
import { FormikProps, FormikValues } from 'formik';
import { Form, Stack, StackItem, TextInputTypes } from '@patternfly/react-core';
import { InputField, FormFooter } from '@console/shared';
import { Pipeline } from '../../../utils/pipeline-augment';
import { PipelineParameters, PipelineResources, PipelineWorkspaces } from '../detail-page-tabs';
import { UpdateOperationType } from './const';
import { useResourceValidation } from './hooks';
import { removeTaskModal } from './modals';
import PipelineBuilderVisualization from './PipelineBuilderVisualization';
import Sidebar from './task-sidebar/Sidebar';
import TaskSidebar from './task-sidebar/TaskSidebar';
import { CleanupResults, PipelineBuilderTaskGroup, SelectedBuilderTask, UpdateErrors, UpdateOperationUpdateTaskData } from './types';
import { applyChange } from './update-utils';
import { useTranslation } from 'react-i18next';
import { Section } from '../../../../../../public/components/hypercloud/utils/section';
import { SelectorInput } from '../../../../../../public/components/utils';

//import { TFunction } from 'i18next';

import './PipelineBuilderForm.scss';

type PipelineBuilderFormProps = FormikProps<FormikValues> & {
  existingPipeline: Pipeline;
  namespace: string;
  isCreate?: boolean;
};

const PipelineBuilderForm: React.FC<PipelineBuilderFormProps> = props => {
  const [selectedTask, setSelectedTask] = React.useState<SelectedBuilderTask>(null);
  const selectedTaskRef = React.useRef<SelectedBuilderTask>(null);
  selectedTaskRef.current = selectedTask;

  //const methods = useFormContext();
  //const { control } = methods;
  const { t } = useTranslation();

  const { existingPipeline, status, isSubmitting, dirty, handleReset, handleSubmit, errors, namespace, setFieldValue, setStatus, values } = props;
  const statusRef = React.useRef(status);
  statusRef.current = status;

  const updateErrors: UpdateErrors = React.useCallback(
    taskErrors => {
      if (taskErrors) {
        setStatus({
          ...statusRef.current,
          tasks: _.omitBy(_.merge({}, statusRef.current?.tasks, taskErrors), v => !v),
        });
      }
    },
    [setStatus],
  );

  useResourceValidation(values.tasks, values.resources, updateErrors);

  const updateTasks = (changes: CleanupResults): void => {
    const { tasks, listTasks, errors: taskErrors } = changes;
    tasks.forEach(task => {
      task?.params?.forEach(param => {
        if (param.value === undefined) {
          param.value = param.type && param.type === 'array' ? [''] : '';
        }
      });
    });

    setFieldValue('tasks', tasks);
    setFieldValue('listTasks', listTasks);
    updateErrors(taskErrors);
  };

  const selectedId = values.tasks[selectedTask?.taskIndex]?.name;
  const selectedIds = selectedId ? [selectedId] : [];

  const taskGroup: PipelineBuilderTaskGroup = {
    tasks: values.tasks,
    listTasks: values.listTasks,
    highlightedIds: selectedIds,
  };

  const closeSidebarAndHandleReset = React.useCallback(() => {
    setSelectedTask(null);
    selectedTaskRef.current = null;
    handleReset();
  }, [handleReset]);

  const labels = SelectorInput.arrayify(values.metadata.labels);

  return (
    <>
      <Stack className="odc-pipeline-builder-form">
        <StackItem isFilled className="odc-pipeline-builder-form__content">
          <Form className="odc-pipeline-builder-form__grid" onSubmit={handleSubmit}>
            <div className="odc-pipeline-builder-form__short-section">
              <Section label={t('SINGLE:MSG_PIPELINES_CREATEFORM_1')} id="name" isRequired={true}>
                <InputField name="name" type={TextInputTypes.text} isDisabled={!!existingPipeline} required />
              </Section>
            </div>

            <div>
              <Section label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_8')} id="labels" description={t('SINGLE:MSG_TASKS_CREATFORM_DIV2_92')}>
                <SelectorInput onChange={val => setFieldValue('metadata.labels', SelectorInput.objectify(val))} tags={labels} />
              </Section>
            </div>

            <div>
              <Section label={t('SINGLE:MSG_PIPELINES_CREATEFORM_2')} id="params">
                <PipelineParameters addLabel="Add Parameters" fieldName="params" />
              </Section>
            </div>

            <div>
              <Section label={t('SINGLE:MSG_PIPELINES_CREATEFORM_10')} id="resources">
                <PipelineResources addLabel="Add Resources" fieldName="resources" />
              </Section>
            </div>

            <div>
              <Section label={t('SINGLE:MSG_PIPELINES_CREATEFORM_30')} id="workspaces">
                <PipelineWorkspaces addLabel="Add Workspaces" fieldName="workspaces" />
              </Section>
            </div>

            <div>
              <Section label={t('SINGLE:MSG_PIPELINES_CREATEFORM_20')} id="task" isRequired={true}>
                {/*<h2>{t('SINGLE:MSG_PIPELINES_CREATEFORM_20')}<h2 style={style}>*</h2></h2>*/}
                <PipelineBuilderVisualization
                  namespace={namespace}
                  tasksInError={status?.tasks || {}}
                  onTaskSelection={(task, resource) => {
                    setSelectedTask({
                      taskIndex: values.tasks.findIndex(({ name }) => name === task.name),
                      resource,
                    });
                  }}
                  onUpdateTasks={(updatedTaskGroup, op) => updateTasks(applyChange(updatedTaskGroup, op))}
                  taskGroup={taskGroup}
                />
              </Section>
              <p className="help-block">{t('SINGLE:MSG_PIPELINES_CREATEFORM_22')}</p>
            </div>

            <FormFooter handleReset={closeSidebarAndHandleReset} errorMessage={status?.submitError} isSubmitting={isSubmitting} submitLabel={existingPipeline ? t('COMMON:MSG_COMMON_BUTTON_COMMIT_3') : t('COMMON:MSG_COMMON_BUTTON_COMMIT_1')} disableSubmit={!dirty || !_.isEmpty(errors) || !_.isEmpty(status?.tasks) || values.tasks.length === 0} resetLabel={t('COMMON:MSG_COMMON_BUTTON_COMMIT_2')} sticky />
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
                updateTasks(applyChange(taskGroup, { type: UpdateOperationType.UPDATE_TASK, data }));
              }}
              onRemoveTask={taskName => {
                removeTaskModal(t, taskName, () => {
                  setSelectedTask(null);
                  updateTasks(
                    applyChange(taskGroup, {
                      type: UpdateOperationType.REMOVE_TASK,
                      data: { taskName },
                    }),
                  );
                });
              }}
              selectedPipelineTaskIndex={selectedTask.taskIndex}
              taskResource={selectedTask.resource}
            />
          </div>
        )}
      </Sidebar>
    </>
  );
};

export default PipelineBuilderForm;
