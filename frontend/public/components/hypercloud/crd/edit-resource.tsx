import * as _ from 'lodash';
import * as React from 'react';
import { JSONSchema6 } from 'json-schema';
import { K8sKind, modelFor, K8sResourceKind, K8sResourceKindReference, kindForReference, CustomResourceDefinitionKind, definitionFor, referenceForModel } from '@console/internal/module/k8s';
import { CustomResourceDefinitionModel, SecretModel, TemplateModel, ClusterTemplateModel } from '@console/internal/models';
import { StatusBox, FirehoseResult, resourcePathFromModel } from '@console/internal/components/utils';
import { RootState } from '@console/internal/redux';
import { SyncedEditor } from '@console/shared/src/components/synced-editor';
import { getActivePerspective } from '@console/internal/reducers/ui';
import { EditorType } from '@console/shared/src/components/synced-editor/editor-toggle';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { match as RouterMatch } from 'react-router';
import { OperandForm } from '@console/operator-lifecycle-manager/src/components/operand/operand-form';
import { OperandYAML } from '@console/operator-lifecycle-manager/src/components/operand/operand-yaml';
import { FORM_HELP_TEXT, YAML_HELP_TEXT, DEFAULT_K8S_SCHEMA } from '@console/operator-lifecycle-manager/src/components/operand/const';
import { prune } from '@console/shared/src/components/dynamic-form/utils';
import { pluralToKind } from '../form';
import { kindToSchemaPath } from '@console/internal/module/hypercloud/k8s/kind-to-schema-path';
import { getAccessToken } from '../../../hypercloud/auth';
import { getK8sAPIPath } from '@console/internal/module/k8s/resource.js';
// import { safeDump } from 'js-yaml';
// eslint-disable-next-line @typescript-eslint/camelcase

// MEMO : YAML Editor만 제공돼야 되는 리소스 kind
const OnlyYamlEditorKinds = [SecretModel.kind, TemplateModel.kind, ClusterTemplateModel.kind];

export const EditDefault: React.FC<EditDefaultProps> = ({ customResourceDefinition, initialEditorType, loadError, match, model, activePerspective, obj, create }) => {
  if (!model) {
    return null;
  }
  console.log(create);

  if (OnlyYamlEditorKinds.includes(model.kind)) {
    const next = `${resourcePathFromModel(model, match.params.appName, match.params.ns)}`;
    // let definition;

    // if (customResourceDefinition) {
    //   definition = customResourceDefinition.data;
    // }

    // const sample = React.useMemo<K8sResourceKind>(() => exampleForModel(definition, model), [definition, model]);
    const sample = obj;
    return (
      <>
        <SyncedEditor
          context={{
            formContext: { create },
            yamlContext: { next, match, create },
          }}
          initialData={sample}
          initialType={EditorType.YAML}
          FormEditor={null}
          YAMLEditor={OperandYAML}
          supplyEditorToggle={false}
        />
      </>
    );
  } else {
    const [loaded, setLoaded] = React.useState(false);
    const [template, setTemplate] = React.useState({} as any);

    React.useEffect(() => {
      console.log('model: ', model);
      let type = pluralToKind.get(model.plural)['type'];
      let url;
      if (type === 'CustomResourceDefinition') {
        url = getK8sAPIPath({ apiGroup: CustomResourceDefinitionModel.apiGroup, apiVersion: CustomResourceDefinitionModel.apiVersion });
        url = `${document.location.origin}${url}/customresourcedefinitions/${model.plural}.${model.apiGroup}`;
      } else {
        const directory = kindToSchemaPath.get(model.kind)?.['directory'];
        const file = kindToSchemaPath.get(model.kind)?.['file'];
        url = `${document.location.origin}/api/resource/${directory}/${file}`;
      }
      const xhrTest = new XMLHttpRequest();
      xhrTest.open('GET', url);
      xhrTest.setRequestHeader('Authorization', `Bearer ${getAccessToken()}`);
      xhrTest.onreadystatechange = function() {
        if (xhrTest.readyState == XMLHttpRequest.DONE && xhrTest.status == 200) {
          let template = xhrTest.response;
          template = JSON.parse(template);
          setTemplate(template);
          setLoaded(true);
        }
      };
      xhrTest.send();
    }, []);

    const [, setHelpText] = React.useState(FORM_HELP_TEXT);
    const next = `${resourcePathFromModel(model, match.params.appName, match.params.ns)}`;
    let definition;

    if (customResourceDefinition) {
      definition = customResourceDefinition.data;
    }

    const [schema, FormComponent] = React.useMemo(() => {
      const baseSchema = customResourceDefinition ? definition?.spec?.validation?.openAPIV3Schema ?? (definitionFor(model) as JSONSchema6) : template?.spec?.validation?.openAPIV3Schema ?? template;
      return [_.defaultsDeep({}, DEFAULT_K8S_SCHEMA, _.omit(baseSchema, 'properties.status')), OperandForm];
    }, [template, definition, model]);
    const sample = obj;
    const pruneFunc = React.useCallback(data => prune(data, sample), [sample]);

    const onChangeEditorType = React.useCallback(newMethod => {
      setHelpText(newMethod === EditorType.Form ? FORM_HELP_TEXT : YAML_HELP_TEXT);
    }, []);

    return (
      <StatusBox loaded={loaded} loadError={loadError} data={customResourceDefinition || template}>
        {loaded || !customResourceDefinition ? (
          <>
            <SyncedEditor
              context={{
                formContext: { match, model, next, schema, create },
                yamlContext: { next, match, create },
              }}
              FormEditor={FormComponent}
              initialData={sample}
              initialType={initialEditorType}
              onChangeEditorType={onChangeEditorType}
              prune={pruneFunc}
              YAMLEditor={OperandYAML}
            />
          </>
        ) : null}
      </StatusBox>
    );
  }
};

const stateToProps = (state: RootState, props: Omit<EditDefaultPageProps, 'model'>) => {
  let plural;
  let model;
  if (modelFor(pluralToKind.get(props.match.params.plural)['kind'])) {
    model = modelFor(pluralToKind.get(props.match.params.plural)['kind']);
    plural = referenceForModel(model);
  }
  return { model: state.k8s.getIn(['RESOURCES', 'models', plural]) || (state.k8s.getIn(['RESOURCES', 'models', model.kind]) as K8sKind), activePerspective: getActivePerspective(state) };
};

export const EditDefaultPage = connect(stateToProps)((props: EditDefaultPageProps) => {
  return (
    <>
      <Helmet>
        <title>{`Edit ${kindForReference(props.match.params.plural)}`}</title>
      </Helmet>
      <EditDefault {...(props as any)} model={props.model} match={props.match} initialEditorType={EditorType.Form} create={false} />
    </>
  );
});

export type EditDefaultProps = {
  activePerspective: string;
  customResourceDefinition?: FirehoseResult<CustomResourceDefinitionKind>;
  initialEditorType: EditorType;
  loaded: boolean;
  loadError?: any;
  match: RouterMatch<{ appName: string; ns: string; plural: K8sResourceKindReference }>;
  model: K8sKind;
  obj?: K8sResourceKind;
  create: boolean;
};

export type EditDefaultPageProps = {
  match: RouterMatch<{ appName: string; ns: string; plural: K8sResourceKindReference }>;
  model: K8sKind;
};
