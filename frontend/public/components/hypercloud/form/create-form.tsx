import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { useForm, FormProvider } from 'react-hook-form';
import { DevTool } from '@hookform/devtools';
import { ActionGroup, Button } from '@patternfly/react-core';
import { k8sCreate, k8sUpdate, referenceFor, K8sResourceKind, modelFor } from '../../../module/k8s';
import { pluralToKind } from './';
import { ButtonBar, history, resourceObjPath } from '../../utils';
import { Section } from '../utils/section';
import {useTranslation } from 'react-i18next'

export const isCreatePage = defaultValues => {
  return !_.has(defaultValues, 'spec');
};

export const WithCommonForm = (SubForm, params, defaultValues, modal?: boolean) => {
  const FormComponent: React.FC<CommonFormProps_> = props => {
    const {t} = useTranslation();
    const methods = useForm({ defaultValues: defaultValues });

    const kind = pluralToKind(params.plural);
    // const title = `${props.titleVerb} ${params?.type === 'form' ? '' : params.type || 'Sample'} ${kind || ''}`;
    const title = `${isCreatePage(defaultValues) ? 'Create' : 'Edit'} ${kind || 'Sample'}`;

    const [inProgress, setProgress] = React.useState(false);
    const [errorMessage, setError] = React.useState('');

    const onClick = methods.handleSubmit(data => {
      let inDo = isCreatePage(defaultValues) ?_.defaultsDeep(props.fixed, data) : _.defaultsDeep(defaultValues, data);
      inDo = props.onSubmitCallback(inDo);
      const model = inDo.kind && inDo.kind !== kind ? modelFor(inDo.kind) : kind && modelFor(kind);
      isCreatePage(defaultValues) ?
        k8sCreate(model, inDo)
          .then(() => {
            history.push(resourceObjPath(inDo, referenceFor(model)));
          })
          .catch(e => {
            setProgress(false);
            setError(e.message);
          }): 
        k8sUpdate(model, inDo)
          .then(() => {
            history.push(resourceObjPath(inDo, referenceFor(model)));
          })
          .catch(e => {
            setProgress(false);
            setError(e.message);
          })
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
                <Section label="이름" id="name" isRequired={true}>
                  <input className="pf-c-form-control" id="name" name="metadata.name" ref={methods.register} />
                </Section>
              </fieldset>
            )}
            <SubForm isCreate={props.isCreate} />
            <ButtonBar inProgress={inProgress} errorMessage={errorMessage}>
              <ActionGroup className="pf-c-form">
                <Button type="button" variant="primary" id="save-changes" onClick={onClick}>
                  {isCreatePage(defaultValues) ? props.saveButtonText || 'Create' : 'Save'}
                </Button>
                <Button type="button" variant="secondary" id="cancel" onClick={history.goBack}>
                  Cancel
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
};
