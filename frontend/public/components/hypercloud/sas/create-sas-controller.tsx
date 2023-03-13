import * as React from 'react';
import { Form, FormGroup, TextInput, FileUpload, ActionGroup, Button } from '@patternfly/react-core';
import { WebSocketContext } from '../../app';
import FileUploadIcon from '@patternfly/react-icons/dist/esm/icons/file-upload-icon';

export const CreateSasController = () => {
  const webSocket = React.useContext(WebSocketContext);
  const [name, setName] = React.useState('');
  const [value, setValue] = React.useState(null);
  const [filename, setFilename] = React.useState('');

  const handleNameChange = (name: string) => {
    setName(name);
  };

  const handleFileInputChange = (file, _event) => {
    console.log(123, file, _event);
    setFilename(file.name);
    setValue(file);
  };

  const submit = () => {
    console.log(name, value, filename);
  };
  const cancel = () => {};
  return (
    <div>
      <div style={{ padding: '30px', borderBottom: '1px solid rgba(51, 51, 51, 0.5)' }}>
        <h1>{'컨트롤러 생성'}</h1>
      </div>
      <div className={'co-m-pane__body'}>
        <Form>
          <FormGroup label="컨트롤러 이름" isRequired fieldId="simple-form-name-01">
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
