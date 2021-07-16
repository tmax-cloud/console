import * as React from 'react';
import { Alert } from '@patternfly/react-core';
import { k8sGet } from '@console/internal/module/k8s';
import { PipelineModel } from '../../../models';
import PipelineVisualization from '../../pipelines/detail-page-tabs/pipeline-details/PipelineVisualization';
import { Pipeline, PipelineRun, pipelineRefExists, PipelineTask } from '../../../utils/pipeline-augment';
import { useTranslation } from 'react-i18next';

type PipelineRunVisualizationProps = {
  pipelineRun: PipelineRun;
};

const PipelineRunVisualization: React.FC<PipelineRunVisualizationProps> = ({ pipelineRun }) => {
  const [errorMessage, setErrorMessage] = React.useState<string>(null);
  const [pipeline, setPipeline] = React.useState<Pipeline>(null);

  const { t } = useTranslation();

  React.useEffect(() => {
    if (pipelineRefExists(pipelineRun)) {
      k8sGet(PipelineModel, pipelineRun.spec.pipelineRef.name, pipelineRun.metadata.namespace)
        .then((res: Pipeline) => setPipeline(res))
        .catch((error) => {
          if (error?.message == `pipelines.tekton.dev "${pipelineRun.spec.pipelineRef.name}" not found`) {
            error.message = t('COMMON:MSG_DETAILS_TABDETAILS_83', { 0: pipelineRun.spec.pipelineRef.name });
          }
          setErrorMessage(error?.message || 'Could not load visualization at this time.')
        },
        );
    } else {
      const p: Pipeline = {
        spec: {
          tasks: pipelineRun.spec.pipelineSpec.tasks.map((task): PipelineTask => {
            return {
              name: task.name,
              params: task.params,
              taskRef: {
                name: task.name,
              },
              runAfter: task.runAfter,
              resources: task.resources
            }
          })
        }
      };
      setPipeline(p);
    }
  }, [pipelineRun, setPipeline]);

  if (errorMessage) {
    return <Alert variant="danger" isInline title={errorMessage} />;
  }

  if (!pipeline || !pipelineRun) {
    return null;
  }

  return <PipelineVisualization pipeline={pipeline} pipelineRun={pipelineRun} />;
};

export default PipelineRunVisualization;
