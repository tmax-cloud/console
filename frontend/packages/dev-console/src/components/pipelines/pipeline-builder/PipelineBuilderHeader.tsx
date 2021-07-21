import * as React from 'react';
import { Flex, FlexItem, FlexItemModifiers } from '@patternfly/react-core';
import { Pipeline } from '../../../utils/pipeline-augment';
import { useTranslation } from 'react-i18next';
import { ResourceLabel } from '../../../../../../public/models/hypercloud/resource-plural';
//import { pluralToKind } from 'public/components/hypercloud/form';
import { PipelineModel } from '../../../../../../public/models/hypercloud';
import './PipelineBuilderHeader.scss';

type PipelineBuilderHeaderProps = {
  existingPipeline: Pipeline;
  namespace: string;
  isCreate: boolean;
};
/*
export const isCreatePage = defaultValues => {
  return !(_.has(defaultValues, 'spec') || _.has(defaultValues, 'status'));
};
*/

const PipelineBuilderHeader: React.FC<PipelineBuilderHeaderProps> = props => {
  const { t } = useTranslation();
  //const methods = useForm({ defaultValues: defaultValues });
  //const title = `${isCreatePage(defaultValues) ? t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: ResourceLabel({kind: kind}, t) }) : t('COMMON:MSG_MAIN_ACTIONBUTTON_15', { 0: ResourceLabel({kind: kind}, t) })}`;

  const kind = PipelineModel.kind;
  const title = `${props.isCreate ? t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: ResourceLabel({ kind: kind }, t) }) : t('COMMON:MSG_MAIN_ACTIONBUTTON_15', { 0: ResourceLabel({ kind: kind }, t) })}`;
  // const title = `${t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: ResourceLabel({kind: kind}, t) })}`;
  return (
    <div className="odc-pipeline-builder-header">
      <Flex className="odc-pipeline-builder-header__content pf-m-column">
        <Flex>
          <FlexItem breakpointMods={[{ modifier: FlexItemModifiers.grow }]}>
            <h1 className="odc-pipeline-builder-header__title">{title}</h1>
          </FlexItem>
        </Flex>
        <p className="help-block">{/*t('Description')*/}</p>
      </Flex>
      <hr />
    </div>
  );
};

export default PipelineBuilderHeader;
