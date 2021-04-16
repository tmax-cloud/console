import * as React from 'react';
import { Flex, FlexItem, FlexItemModifiers } from '@patternfly/react-core';
import { Pipeline } from '../../../utils/pipeline-augment';
//import { useTranslation } from 'react-i18next';

import './PipelineBuilderHeader.scss';

type PipelineBuilderHeaderProps = {
  existingPipeline: Pipeline;
  namespace: string;
};

const PipelineBuilderHeader: React.FC<PipelineBuilderHeaderProps> = (props) => {
  //const { t } = useTranslation();
  return (
    <div className="odc-pipeline-builder-header">
      <Flex className="odc-pipeline-builder-header__content pf-m-column">
      <Flex>
        <FlexItem breakpointMods={[{ modifier: FlexItemModifiers.grow }]}>
          <h1 className="odc-pipeline-builder-header__title">Create Pipeline</h1>
        </FlexItem>
      </Flex>
      <p className="help-block">
        {/*t('Description')*/}
      </p>
      </Flex>
      <hr />
    </div>
  );
};

export default PipelineBuilderHeader;
