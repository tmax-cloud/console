import * as _ from 'lodash';
import * as React from 'react';
import { JSONSchema6 } from 'json-schema';
import { K8sKind, modelFor, K8sResourceKind, K8sResourceKindReference, kindForReference, CustomResourceDefinitionKind, definitionFor, referenceForModel } from '@console/internal/module/k8s';
import { CustomResourceDefinitionModel } from '@console/internal/models';
// import { Firehose } from '@console/internal/components/utils/firehose';
import { StatusBox, FirehoseResult, BreadCrumbs, resourcePathFromModel } from '@console/internal/components/utils';
import { RootState } from '@console/internal/redux';
import { SyncedEditor } from '@console/shared/src/components/synced-editor';
import { getActivePerspective } from '@console/internal/reducers/ui';
import { EditorType } from '@console/shared/src/components/synced-editor/editor-toggle';
import { connect } from 'react-redux';
import { exampleForModel } from '.';
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

export const CreateDefault: React.FC<CreateDefaultProps> = ({ customResourceDefinition, initialEditorType, loadError, match, model, activePerspective }) => {
  if (!model) {
    return null;
  }
  const [loaded, setLoaded] = React.useState(false);
  const [template, setTemplate] = React.useState({} as any);
  // const [yaml, setYaml] = React.useState('');
  // React.useEffect(() => {
  //   (async function getSchema() {
  //     await k8sCreateSchema(model.kind).then(data => setTemplate(data));
  //   })();
  // }, []);

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

  const [helpText, setHelpText] = React.useState(FORM_HELP_TEXT);
  const next = `${resourcePathFromModel(model, match.params.appName, match.params.ns)}`;
  let definition;

  if (customResourceDefinition) {
    definition = customResourceDefinition.data;
  }

  const [schema, FormComponent] = React.useMemo(() => {
    const baseSchema = customResourceDefinition ? definition?.spec?.validation?.openAPIV3Schema ?? (definitionFor(model) as JSONSchema6) : template?.spec?.validation?.openAPIV3Schema ?? template;
    return [_.defaultsDeep({}, DEFAULT_K8S_SCHEMA, _.omit(baseSchema, 'properties.status')), OperandForm];
  }, [template, definition, model]);

  const sample = React.useMemo<K8sResourceKind>(() => exampleForModel(definition, model), [definition, model]);

  const pruneFunc = React.useCallback(data => prune(data, sample), [sample]);

  const onChangeEditorType = React.useCallback(newMethod => {
    setHelpText(newMethod === EditorType.Form ? FORM_HELP_TEXT : YAML_HELP_TEXT);
  }, []);

  return (
    <StatusBox loaded={loaded} loadError={loadError} data={customResourceDefinition || template}>
      {loaded || !customResourceDefinition ? (
        <>
          <div className="co-create-operand__header">
            <div className="co-create-operand__header-buttons">
              <BreadCrumbs breadcrumbs={[{ name: `Create ${model.label}`, path: window.location.pathname }]} />
            </div>
            <h1 className="co-create-operand__header-text">{`Create ${model.label}`}</h1>
            <p className="help-block">{helpText}</p>
          </div>
          <SyncedEditor
            context={{
              formContext: { match, model, next, schema },
              yamlContext: { next, match },
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
};

const stateToProps = (state: RootState, props: Omit<CreateDefaultPageProps, 'model'>) => {
  let plural;
  let model;
  if (modelFor(pluralToKind.get(props.match.params.plural)['kind'])) {
    model = modelFor(pluralToKind.get(props.match.params.plural)['kind']);
    plural = referenceForModel(model);
  }
  return { model: state.k8s.getIn(['RESOURCES', 'models', plural]) || (state.k8s.getIn(['RESOURCES', 'models', model.kind]) as K8sKind), activePerspective: getActivePerspective(state) };
};

export const CreateDefaultPage = connect(stateToProps)((props: CreateDefaultPageProps) => {
  // const type = pluralToKind.get(props.match.params.plural)['type'];
  // const resources =
  //   type === 'CustomResourceDefinition' && props.model
  //     ? [
  //         {
  //           kind: CustomResourceDefinitionModel.kind,
  //           isList: false,
  //           name: nameForModel(props.model),
  //           prop: 'customResourceDefinition',
  //           optional: true,
  //         },
  //       ]
  //     : [];
  return (
    <>
      <Helmet>
        <title>{`Create ${kindForReference(props.match.params.plural)}`}</title>
      </Helmet>
      {/* <Firehose resources={resources}> */}
      {/* FIXME(alecmerdler): Hack because `Firehose` injects props without TypeScript knowing about it */}
      <CreateDefault {...(props as any)} model={props.model} match={props.match} initialEditorType={EditorType.Form} />
      {/* </Firehose> */}
    </>
  );
});

export type CreateDefaultProps = {
  activePerspective: string;
  customResourceDefinition?: FirehoseResult<CustomResourceDefinitionKind>;
  initialEditorType: EditorType;
  loaded: boolean;
  loadError?: any;
  match: RouterMatch<{ appName: string; ns: string; plural: K8sResourceKindReference }>;
  model: K8sKind;
};

export type CreateDefaultPageProps = {
  match: RouterMatch<{ appName: string; ns: string; plural: K8sResourceKindReference }>;
  model: K8sKind;
};
