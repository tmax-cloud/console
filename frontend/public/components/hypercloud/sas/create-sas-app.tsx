import * as React from 'react';
import { Form, FormGroup, TextInput, FileUpload, FormSelect, FormSelectOption, ActionGroup, Button } from '@patternfly/react-core';
// import { WebSocketContext } from '../../app';
import FileUploadIcon from '@patternfly/react-icons/dist/esm/icons/file-upload-icon';

export const CreateSasApp = () => {
  // const webSocket = React.useContext(WebSocketContext);
  const [name, setName] = React.useState('');
  const [value, setValue] = React.useState(null);
  const [filename, setFilename] = React.useState('');
  const [version, setVersion] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [replica, setReplica] = React.useState('');
  const [target, setTarget] = React.useState('');

  const targetOptions = [
    { value: 'target1', label: 'target1', disabled: false },
    { value: 'target2', label: 'target2', disabled: false },
  ];

  const handleTargetChange = (value: string, _event: React.FormEvent<HTMLSelectElement>) => {
    setTarget(value);
  };

  const handleNameChange = (name: string) => {
    setName(name);
  };

  const handleFileInputChange = (file, _event) => {
    setFilename(file.name);
    setValue(file);
  };

  const handleVersionChange = (phone: string) => {
    setVersion(phone);
  };
  const handleDescriptionChange = (phone: string) => {
    setDescription(phone);
  };
  const handleReplicaChange = (phone: string) => {
    setReplica(phone);
  };
  const submit = () => {
    console.log(name, value, filename, version, description, replica, target);
  };
  const cancel = () => {};
  return (
    <div>
      <div className={'cron-title'}>
        <h1>{'앱 생성'}</h1>
      </div>
      <div className={'co-m-pane__body'}>
        <Form>
          <FormGroup label="앱 이름" isRequired fieldId="simple-form-name-01">
            <TextInput isRequired type="text" id="simple-form-name-01" name="simple-form-name-01" aria-describedby="simple-form-name-01-helper" value={name} onChange={handleNameChange} />
          </FormGroup>
          <FormGroup label="jar 파일" isRequired fieldId="simple-form-jar-02">
            <FileUpload clearButtonText={''} id="customized-preview-file" value={value} filename={filename} filenamePlaceholder="Drag and drop a file or upload one" onChange={handleFileInputChange} hideDefaultPreview browseButtonText="검색...">
              {value && (
                <div className="pf-u-m-md">
                  <FileUploadIcon size="lg" /> Custom preview here for your {value.size}-byte file named {value.name}
                </div>
              )}
            </FileUpload>
          </FormGroup>
          <FormGroup label="버전" isRequired fieldId="simple-form-version-01">
            <TextInput isRequired type="text" id="simple-form-version-01" name="simple-form-version-01" value={version} onChange={handleVersionChange} />
          </FormGroup>
          <FormGroup label="설명" fieldId="simple-form-description-01">
            <TextInput isRequired type="text" id="simple-form-description-01" name="simple-form-description-01" value={description} onChange={handleDescriptionChange} />
          </FormGroup>
          <FormGroup label="레플리카 수" isRequired fieldId="simple-form-replica-01">
            <TextInput isRequired type="text" id="simple-form-replica-01" name="simple-form-replica-01" value={replica} onChange={handleReplicaChange} />
          </FormGroup>
          <FormGroup label="타겟 워커 노드 풀" isRequired fieldId="simple-form-version-03">
            <FormSelect value={target} onChange={handleTargetChange} id="horizontal-form-title" name="horizontal-form-title" aria-label="Your title">
              {targetOptions.map((option, index) => (
                <FormSelectOption isDisabled={option.disabled} key={index} value={option.value} label={option.label} />
              ))}
            </FormSelect>
          </FormGroup>
          <ActionGroup>
            <Button variant="primary" onClick={submit}>
              생성
            </Button>
            <Button variant="link" onClick={cancel}>
              취소
            </Button>
          </ActionGroup>
        </Form>
      </div>
    </div>
  );
};
