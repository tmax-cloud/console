import * as React from 'react';
import { Button, FormSelect, FormSelectOption, Modal } from '@patternfly/react-core';
import * as _ from 'lodash';
import { FileUpload } from '@patternfly/react-core';
import FileUploadIcon from '@patternfly/react-icons/dist/esm/icons/file-upload-icon';
import { Form, FormGroup, TextInput } from '@patternfly/react-core';

export const ModalPage = ({ isModalOpen, handleModalToggle, titleModal, InnerPage, submit }) => {
  const actions = [
    <Button key="cancel" variant="primary" onClick={handleModalToggle}>
      취소
    </Button>,
    <Button key="confirm" variant="secondary" onClick={submit}>
      {titleModal[1]}
    </Button>,
  ];
  return (
    <Modal width={600} title={titleModal[0]} isOpen={isModalOpen} onClose={handleModalToggle} actions={actions}>
      {InnerPage}
    </Modal>
  );
};

export const AddVersionModal = ({ appName, setSubmitData }) => {
  const [value, setValue] = React.useState(null);
  const [filename, setFilename] = React.useState('');
  const [version, setVersion] = React.useState('');
  const [description, setDescription] = React.useState('');
  React.useEffect(() => {
    setSubmitData({ modal: 'AddVersionModal', value, filename, version, description });
  }, [value, filename, version, description]);
  const handleUpload = files => {
    const file = files[0];
    setValue(file);
    setFilename(file.name);
  };
  const handleVersionChange = (name: string) => {
    setVersion(name);
  };

  const handleDescriptionChange = (email: string) => {
    setDescription(email);
  };

  return (
    <>
      <Form isHorizontal={false}>
        <div>앱 이름</div>
        <div>{appName}</div>
        <FormGroup label="jar 파일" isRequired fieldId="simple-form-jar-02">
          <FileUpload clearButtonText={''} id="customized-preview-file" value={value} filename={filename} filenamePlaceholder="Drag and drop a file or upload one" onLoad={handleUpload} hideDefaultPreview browseButtonText="검색...">
            {value && (
              <div className="pf-u-m-md">
                <FileUploadIcon size="lg" /> Custom preview here for your {value.size}-byte file named {value.name}
              </div>
            )}
          </FileUpload>
        </FormGroup>
        <FormGroup label="버전" isRequired fieldId="simple-form-version-03">
          <TextInput value={version} isRequired type="text" id="horizontal-form-name" aria-describedby="horizontal-form-name-helper" name="horizontal-form-name" onChange={handleVersionChange} />
        </FormGroup>
        <FormGroup label="설명" fieldId="simple-form-description-02">
          <TextInput value={description} isRequired type="text" id="horizontal-form-name" aria-describedby="horizontal-form-name-helper" name="horizontal-form-name" onChange={handleDescriptionChange} />
        </FormGroup>
      </Form>
    </>
  );
};

export const AppDeployModal = ({ appData, setSubmitData }) => {
  const [version, setVersion] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [replica, setReplica] = React.useState('');
  const [target, setTarget] = React.useState('');
  const versionOptions = [];
  appData.VERSIONS.map(version => {
    versionOptions.push({ value: version.DESCRIPTION, label: version.VERSION, disabled: false });
  });
  React.useEffect(() => {
    setDescription(appData?.VERSIONS[0]?.DESCRIPTION);
  }, []);
  const targetOptions = [{ value: appData.POOL_ID, label: appData.POOL_ID, disabled: false }];

  React.useEffect(() => {
    setSubmitData({ modal: 'AppDeployModal', version, description, replica, target });
  }, [version, description, replica, target]);
  const handleReplicaChange = (name: string) => {
    setReplica(name);
  };

  const handleTargetChange = (value: string, _event: React.FormEvent<HTMLSelectElement>) => {
    setTarget(value);
  };

  const handleOptionChange = (value: string, _event: React.FormEvent<HTMLSelectElement>) => {
    setVersion(value);
    setDescription(value);
  };

  return (
    <>
      <Form isHorizontal={false}>
        <div>앱 이름</div>
        <div>{appData.APP_NAME}</div>
        <FormGroup label="버전" fieldId="simple-form-version-03">
          <FormSelect value={version} onChange={handleOptionChange} id="horizontal-form-title" name="horizontal-form-title" aria-label="Your title">
            {versionOptions.map((option, index) => (
              <FormSelectOption isDisabled={option.disabled} key={index} value={option.value} label={option.label} />
            ))}
          </FormSelect>
        </FormGroup>
        <FormGroup label="설명" fieldId="simple-form-description-02">
          <div>{description}</div>
        </FormGroup>
        <FormGroup label="레플리카 수" isRequired fieldId="simple-form-version-03">
          <TextInput value={replica} isRequired type="text" id="horizontal-form-name" aria-describedby="horizontal-form-name-helper" name="horizontal-form-name" onChange={handleReplicaChange} />
        </FormGroup>
        <FormGroup label="타겟 워커 노드 풀" fieldId="simple-form-version-03">
          <FormSelect value={target} onChange={handleTargetChange} id="horizontal-form-title" name="horizontal-form-title" aria-label="Your title">
            {targetOptions.map((option, index) => (
              <FormSelectOption isDisabled={option.disabled} key={index} value={option.value} label={option.label} />
            ))}
          </FormSelect>
        </FormGroup>
      </Form>
    </>
  );
};

export const AppDeleteModal = ({ appData, setSubmitData }) => {
  React.useEffect(() => {
    setSubmitData({ modal: 'AppDeleteModal' });
  }, []);

  return (
    <>
      <Form isHorizontal={false}>
        <div>앱 삭제</div>
        <div>{`${appData.APP_NAME} 앱을 삭제하시겠습니까?`}</div>
      </Form>
    </>
  );
};

export const VersionSelectModal = ({ appData, setSubmitData }) => {
  const [version, setVersion] = React.useState('');
  const [description, setDescription] = React.useState('');
  const versionOptions = [];
  appData.VERSIONS.map(version => {
    versionOptions.push({ value: version.DESCRIPTION, label: version.VERSION, disabled: false });
  });
  React.useEffect(() => {
    setDescription(appData?.VERSIONS[0]?.DESCRIPTION);
  }, []);

  React.useEffect(() => {
    setSubmitData({ modal: 'VersionSelectModal', version, description });
  }, [version, description]);

  const handleOptionChange = (value: string, _event: React.FormEvent<HTMLSelectElement>) => {
    setVersion(value);
    setDescription(value);
  };

  return (
    <>
      <Form isHorizontal={false}>
        <div>앱 이름</div>
        <div>{appData.APP_NAME}</div>
        <FormGroup label="버전" fieldId="simple-form-version-03">
          <FormSelect value={version} onChange={handleOptionChange} id="horizontal-form-title" name="horizontal-form-title" aria-label="Your title">
            {versionOptions.map((option, index) => (
              <FormSelectOption isDisabled={option.disabled} key={index} value={option.value} label={option.label} />
            ))}
          </FormSelect>
        </FormGroup>
        <FormGroup label="설명" fieldId="simple-form-description-02">
          <div>{description}</div>
        </FormGroup>
      </Form>
    </>
  );
};
export const ReplicaModal = ({ appData, setSubmitData }) => {
  const [inputValue, setInputValue] = React.useState(parseInt(appData.REPLICAS));

  React.useEffect(() => {
    setSubmitData({ modal: 'ReplicaModal', inputValue });
  }, [inputValue]);

  const handleInputChange = event => {
    let newValue = event.target.value;
    newValue = parseInt(newValue);
    setInputValue(newValue);
  };

  const handleIncrement = () => {
    setInputValue(inputValue + 1);
  };

  const handleDecrement = () => {
    setInputValue(inputValue - 1);
  };

  return (
    <div>
      <button onClick={handleIncrement}>+</button>
      <input type="number" value={inputValue} onChange={handleInputChange} />
      <button onClick={handleDecrement}>-</button>
    </div>
  );
};
export const AppStopModal = ({ appData, setSubmitData }) => {
  React.useEffect(() => {
    setSubmitData({ modal: 'AppStopModal' });
  }, []);

  return (
    <>
      <Form isHorizontal={false}>
        <div>앱 중지</div>
        <div>{`${appData.APP_NAME} 앱의 배포를 중지하시겠습니까?`}</div>
      </Form>
    </>
  );
};
export const VersionDeleteModal = ({ appData, setSubmitData }) => {
  React.useEffect(() => {
    setSubmitData({ modal: 'VersionDeleteModal' });
  }, []);
  console.log(123, appData);
  return (
    <>
      <Form isHorizontal={false}>
        <div>{`${appData.VERSION} 버전을 삭제하시겠습니까?`}</div>
      </Form>
    </>
  );
};
