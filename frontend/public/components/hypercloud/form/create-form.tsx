import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { DevTool } from '@hookform/devtools';
import { ActionGroup, Button } from '@patternfly/react-core';
import { k8sCreate, k8sUpdate, referenceFor, K8sResourceKind, modelFor } from '../../../module/k8s';
import { pluralToKind } from './';
import { ButtonBar, history, resourceObjPath } from '../../utils';
import { Section } from '../utils/section';

import { useTranslation } from 'react-i18next';
import { ResourceLabel } from '../../../models/hypercloud/resource-plural';
import { Tooltip } from '@patternfly/react-core';
import { saveButtonDisabledString, isSaveButtonDisabled } from '../utils/button-state';

export const isCreatePage = defaultValues => {
  return !_.has(defaultValues, 'metadata.creationTimestamp');
};
export const kindToggle = (kindPlural, methods) => {
  //범용적으로 변경할 필요 있음
  if (kindPlural === 'roles') {
    const kindToggle = useWatch({
      control: methods.control,
      name: 'kind',
      defaultValue: 'Role',
    });
    kindToggle === 'Role' ? (kindPlural = 'roles') : (kindPlural = 'clusterroles');
  }
  return kindPlural;
};

export const WithCommonForm = (SubForm, params, defaultValues, modal?: boolean) => {
  const { t } = useTranslation();

  const isButtonDisabled = defaultValues.status && isSaveButtonDisabled(defaultValues);

  const FormComponent: React.FC<CommonFormProps_> = props => {
    const methods = useForm({ defaultValues: defaultValues });

    const kind = pluralToKind(kindToggle(params.plural, methods));
    //const kind = pluralToKind(params.plural);

    // const title = `${props.titleVerb} ${params?.type === 'form' ? '' : params.type || 'Sample'} ${kind || ''}`;
    //const title = `${isCreatePage(defaultValues) ? 'Create' : 'Edit'} ${kind || 'Sample'}`;
    const title = `${isCreatePage(defaultValues) ? t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: ResourceLabel({ kind: kind }, t) }) : t('COMMON:MSG_MAIN_ACTIONBUTTON_15', { 0: ResourceLabel({ kind: kind }, t) })}`;

    const [inProgress, setProgress] = React.useState(false);
    const [errorMessage, setError] = React.useState('');

    const onClick = methods.handleSubmit(data => {
      let inDo;
      if (isCreatePage(defaultValues)) {
        inDo = _.defaultsDeep(data, props.fixed);
      } else {
        // 1. data에는 이미 spec에 대한 값은 다 있을 것이기 때문에 기존 defaultValues에서 spec영역만을 제외한 부분을 fixed로 정의
        let fixed = _.cloneDeep(defaultValues);
        delete fixed.spec;
        // 2. defaultsDeep 첫번째 매개변수 하위 요소에 빈 배열이 있을 경우 source 객체 값을 그대로 받아옴.. 그래서 1번에서 빈배열로 변환될 소지가 있는 spec을 제외한 fixed객체를 만들어서 넘겨줌
        inDo = _.defaultsDeep(data, fixed);
      }
      inDo = props.onSubmitCallback(inDo);
      const model = inDo.kind && inDo.kind !== kind ? modelFor(inDo.kind) : kind && modelFor(kind);
      if (inDo.error) {
        setProgress(false);
        setError(inDo.error);
      } else {
        setProgress(true);
        isCreatePage(defaultValues)
          ? k8sCreate(model, inDo)
              .then(() => {
                history.push(resourceObjPath(inDo, referenceFor(model)));
              })
              .catch(e => {
                setProgress(false);
                setError(e.message);
              })
          : k8sUpdate(model, inDo)
              .then(() => {
                history.push(resourceObjPath(inDo, referenceFor(model)));
              })
              .catch(e => {
                setProgress(false);
                setError(e.message);
              });
      }
    });
    return (
      <FormProvider {...methods}>
        <div className="co-m-pane__body">
          <Helmet>
            <title>{title}</title>
          </Helmet>
          <form className="co-m-pane__body-group co-m-pane__form">
            <h1 className="co-m-pane__heading co-m-pane__heading--baseline">
              <div className="co-m-pane__name">{title}</div>
            </h1>
            <p className="co-m-pane__explanation">{props.explanation}</p>
            {props.useDefaultForm && (
              <fieldset>
                <Section label={props.nameSectionTitle || t('COMMON:MSG_MAIN_TABLEHEADER_1')} id="name" isRequired={true}>
                  <input className="pf-c-form-control" id="name" name="metadata.name" ref={methods.register} />
                </Section>
              </fieldset>
            )}
            <SubForm isCreate={props.isCreate} />
            <ButtonBar inProgress={inProgress} errorMessage={errorMessage}>
              <ActionGroup className="pf-c-form">
                {!!isButtonDisabled ? (
                  <Tooltip content={saveButtonDisabledString(t)} maxWidth="30rem" position="bottom">
                    <div>
                      <Button type="button" variant="primary" id="save-changes" onClick={onClick} isDisabled={true}>
                        {isCreatePage(defaultValues) ? props.saveButtonText || `${t('COMMON:MSG_COMMON_BUTTON_COMMIT_1')}` : `${t('COMMON:MSG_COMMON_BUTTON_COMMIT_3')}`}
                      </Button>
                    </div>
                  </Tooltip>
                ) : (
                  <Button type="button" variant="primary" id="save-changes" onClick={onClick} isDisabled={false}>
                    {isCreatePage(defaultValues) ? props.saveButtonText || `${t('COMMON:MSG_COMMON_BUTTON_COMMIT_1')}` : `${t('COMMON:MSG_COMMON_BUTTON_COMMIT_3')}`}
                  </Button>
                )}
                <Button type="button" variant="secondary" id="cancel" onClick={history.goBack}>
                  {`${t('COMMON:MSG_COMMON_BUTTON_COMMIT_2')}`}
                </Button>
              </ActionGroup>
            </ButtonBar>
          </form>
          <DevTool control={methods.control} />
        </div>
      </FormProvider>
    );
  };

  FormComponent.defaultProps = {
    useDefaultForm: true,
  };

  return FormComponent;
};

type CommonFormProps_ = {
  obj?: K8sResourceKind;
  fixed: object;
  isCreate: boolean;
  titleVerb: string;
  onSubmitCallback: Function;
  saveButtonText?: string;
  explanation?: string;
  useDefaultForm?: boolean;
  nameSectionTitle?: string;
};
