import * as React from 'react';
import { PipelineBuilderPage } from '../../../../../packages/dev-console/src/components/pipelines/pipeline-builder';
import { default as PipelineBuilderEditPage } from '../../../../../packages/dev-console/src/components/pipelines/pipeline-builder/PipelineBuilderEditPage';
import { isCreatePage } from '../create-form';
/* MEMO : Pipeline Form은 기존에 구현된 Page들을 재사용함. */
export const CreatePipeline = props => {
  if (!!props.obj && !isCreatePage(props.obj)) {
    return <PipelineBuilderEditPage {...props} isCreate={false} />;
  } else {
    return <PipelineBuilderPage {...props} isCreate={true} />;
  }
};
