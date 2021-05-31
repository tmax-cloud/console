import * as React from 'react';
import * as _ from 'lodash';
import { K8sResourceKind } from '@console/internal/module/k8s';
import { EditorType, EditorToggle } from './editor-toggle';
import { safeJSToYAML, asyncYAMLToJS } from '../../utils/yaml';
import { Alert, Button } from '@patternfly/react-core';
import { usePrevious } from '@console/metal3-plugin/src/hooks';

const YAML_KEY_ORDER = ['apiVerion', 'kind', 'metadata', 'spec', 'status'];
export const YAML_TO_JS_OPTIONS = {
  skipInvalid: true,
  sortKeys: (a, b) => _.indexOf(YAML_KEY_ORDER, a) - _.indexOf(YAML_KEY_ORDER, b),
};

// Provides toggling and syncing between a form and yaml editor. The formData state is the source
// of truth. Both the form editor and the yaml editor update the formData state. Here's the basic logic of this component:
// In the form view:
//   - formData is both rendered and updated by the form component
//   - on toggle to YAML editor, yaml is parsed from current formData state.
// In the YAML view:
//   - on each yaml change, attempt to parse yaml to js:
//       - If it fails, nothing happens. formData remains unchanged.
//       - If successful, formData is updated to resulting js
//   - on toggle to form view, no action needs to be taken to sync because formData has remained up to date with each yaml change
//
//  This means that when switching from YAML to Form, you can lose changes if the YAML editor contains unparsable YAML
//  TODO Add an extra step when switching from yaml to form to warn user if they are about to lose changes.
export const SyncedEditor: React.FC<SyncedEditorProps> = ({ context = {}, FormEditor, initialType = EditorType.Form, initialData = {}, onChangeEditorType = _.noop, onChange = _.noop, prune, YAMLEditor, supplyEditorToggle = true }) => {
  const { formContext, yamlContext } = context;
  const [formData, setFormData] = React.useState<K8sResourceKind>(initialData);
  const [yaml, setYAML] = React.useState<string>(safeJSToYAML(initialData));
  const [type, setType] = React.useState<EditorType>(initialType);
  const [safeToSwitch, setSafeToSwitch] = React.useState<boolean>(true);
  const [yamlWarning, setYAMLWarning] = React.useState<boolean>(false);
  const prevInitialData = usePrevious(initialData);

  const handleFormDataChange = (newFormData: K8sResourceKind = {}) => {
    if (!_.isEqual(newFormData, formData)) {
      setFormData(newFormData);
      onChange(newFormData);
    }
  };

  const handleYAMLChange = (newYAML: string = '') => {
    asyncYAMLToJS(newYAML)
      .then(js => {
        setSafeToSwitch(true);
        handleFormDataChange(js);
      })
      .catch(() => setSafeToSwitch(false));
  };

  const changeEditorType = (newType: EditorType): void => {
    setType(newType);
    onChangeEditorType(newType);
  };

  const handleToggleToForm = () => {
    if (safeToSwitch) {
      changeEditorType(EditorType.Form);
    } else {
      setYAMLWarning(true);
    }
  };

  const handleToggleToYAML = () => {
    setYAML(safeJSToYAML(prune?.(formData) ?? formData, yaml, YAML_TO_JS_OPTIONS));
    changeEditorType(EditorType.YAML);
  };

  const onClickYAMLWarningConfirm = () => {
    setSafeToSwitch(true);
    setYAMLWarning(false);
    changeEditorType(EditorType.Form);
  };

  const onClickYAMLWarningCancel = () => {
    setYAMLWarning(false);
  };

  const onChangeType = newType => {
    switch (newType) {
      case EditorType.YAML:
        handleToggleToYAML();
        break;
      case EditorType.Form:
        handleToggleToForm();
        break;
      default:
        break;
    }
  };

  // MEMO : 원인은 아직 못찾았으나 'yaml' useState의 값 초기화 하는 부분에서 safeJSToYAML()결과값으로 초기화되지 않고 예전값 상태로 남아있음.
  // MEMO: formData의 경우 잘 초기화 되는데 yaml만 안됨.. 직접 safeJSToYAML로 변환한 값(최신값) yaml의 값 비교해서 다르면 최신값으로 set해주도록 처리함.
  const newYaml = safeJSToYAML(initialData);
  if (!_.isEqual(prevInitialData, initialData) && yaml !== newYaml) {
    setYAML(newYaml);
  }

  return (
    <>
      {supplyEditorToggle ? <EditorToggle value={type} onChange={onChangeType} /> : null}
      {yamlWarning && (
        <Alert className="co-synced-editor__yaml-warning" variant="danger" isInline title="Invalid YAML cannot be persisted">
          <p>Switching to Form View will delete any invalid YAML.</p>
          <Button variant="danger" onClick={onClickYAMLWarningConfirm}>
            Switch and Delete
          </Button>
          &nbsp;
          <Button variant="secondary" onClick={onClickYAMLWarningCancel}>
            Cancel
          </Button>
        </Alert>
      )}
      {type === EditorType.Form ? <FormEditor formData={formData} onChange={handleFormDataChange} prune={prune} {...formContext} /> : <YAMLEditor initialYAML={yaml} onChange={handleYAMLChange} {...yamlContext} />}
    </>
  );
};

type SyncedEditorProps = {
  context: {
    formContext: { [key: string]: any };
    yamlContext: { [key: string]: any };
  };
  FormEditor: React.FC<any>;
  initialType?: EditorType;
  initialData?: K8sResourceKind;
  onChangeEditorType?: (newType: EditorType) => void;
  onChange?: (data: K8sResourceKind) => void;
  prune?: (data: any) => any;
  YAMLEditor: React.FC<any>;
  supplyEditorToggle?: boolean;
};
