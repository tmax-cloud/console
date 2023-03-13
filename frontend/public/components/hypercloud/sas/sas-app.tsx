import * as React from 'react';
import { Helmet } from 'react-helmet';
import { compoundExpand } from '@patternfly/react-table';
import { AwxStatusReducer } from '@console/dev-console/src/utils/hc-status-reducers';
import { Status } from '@console/shared';
import { useTranslation } from 'react-i18next';
// import { TFunction } from 'i18next';
import { DetailsItem, detailsPage, Kebab, KebabAction, navFactory, ResourceLink, ResourceSummary, SectionHeading, Timestamp } from '../../utils';
import { K8sResourceKind } from '../../../module/k8s';
import { DetailsPage, DetailsPageProps } from '../../factory';
import { SingleExpandableTable } from '../utils/expandable-table';
import { WebSocketContext } from '../../app';
import { Button, FormSelect, FormSelectOption, Modal } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import '../utils/help.scss';
import * as _ from 'lodash';
import { FilterIcon } from '@patternfly/react-icons';
import { DropdownToggle, DropdownToggleCheckbox } from '@patternfly/react-core';
import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import { FileUpload } from '@patternfly/react-core';
import FileUploadIcon from '@patternfly/react-icons/dist/esm/icons/file-upload-icon';
import { Form, FormGroup, TextInput } from '@patternfly/react-core';

const menuActions: KebabAction[] = [...Kebab.factory.common];
const kind = 'SasApp';

export const InnerRow = ({ innerData }) => {
  return (
    <div className="row">
      <div className="col-lg-2 col-md-3 col-sm-4 col-xs-5 ">{innerData.VERSION}</div>
      <div className="col-lg-2 col-md-3 col-sm-5 inner-table">{innerData.DESCRIPTION || '-'}</div>
      <div className="col-lg-2 col-md-2 col-sm-3 hidden-xs ">{innerData.JAR_NAME}</div>
      <div className="col-lg-2 col-md-2 hidden-sm hidden-xs">{innerData.CREATED_AT || '-'}</div>
    </div>
  );
};

export const InnerTable = ({ innerDatas, data }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-table-grid co-m-table-grid--bordered">
        <div className="row co-m-table-grid__head">
          <div className="col-lg-2 col-md-3 col-sm-4 col-xs-5">{t('SINGLE:MSG_HELMRELEASES_CREATEFORM_DIV2_6')}</div>
          <div className="col-lg-2 col-md-3 col-sm-5 inner-table">{t('COMMON:MSG_DETAILS_TABDETAILS_10')}</div>
          <div className="col-lg-2 col-md-2 col-sm-3 hidden-xs">{t('jar 파일명')}</div>
          <div className="col-lg-2 col-md-2 hidden-sm hidden-xs">{t('생성 일시')}</div>
        </div>
        <div className="co-m-table-grid__body">
          {innerDatas.map((m: any, i: number) => (
            <InnerRow key={i} innerData={m} />
          ))}
        </div>
      </div>
    </>
  );
};

const SasKebab = ({ status, handleModalToggle, data }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const onToggle = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  const onFocus = () => {
    const element = document.getElementById('toggle-kebab');
    element.focus();
  };

  const onSelect = () => {
    setIsOpen(false);
    onFocus();
  };

  const dropdownItemsReady = [
    <DropdownItem
      key="add-version"
      component="button"
      onClick={() => {
        handleModalToggle(data, 'addversion');
      }}
    >
      버전 추가
    </DropdownItem>,
    <DropdownItem
      key="app-deploy"
      component="button"
      onClick={() => {
        handleModalToggle(data, 'appdeploy');
      }}
    >
      앱 배포
    </DropdownItem>,
    <DropdownItem
      key="app-delete"
      component="button"
      onClick={() => {
        handleModalToggle(data, 'appdelete');
      }}
    >
      앱 삭제
    </DropdownItem>,
  ];
  const dropdownItemsRunnung = [
    <DropdownItem
      key="addversion"
      component="button"
      onClick={() => {
        handleModalToggle(data, 'addversion');
      }}
    >
      버전 추가
    </DropdownItem>,
    <DropdownItem
      key="version-select"
      component="button"
      onClick={() => {
        handleModalToggle(data, 'versionselect');
      }}
    >
      버전 선택
    </DropdownItem>,
    <DropdownItem
      key="replica"
      component="button"
      onClick={() => {
        handleModalToggle(data, 'replica');
      }}
    >
      레플리카 수 수정
    </DropdownItem>,
    <DropdownItem
      key="app-stop"
      component="button"
      onClick={() => {
        handleModalToggle(data, 'appstop');
      }}
    >
      앱 중지
    </DropdownItem>,
  ];
  const dropdownItems = status === 'Archived' ? dropdownItemsReady : dropdownItemsRunnung;
  return <Dropdown className="my-dropdown" onSelect={onSelect} toggle={<KebabToggle className="sas-kebab-min" onToggle={onToggle} />} isOpen={isOpen} isPlain dropdownItems={dropdownItems} position={'right'} />;
};

const SasAppTable = props => {
  const { t } = useTranslation();
  const SasAppList = props.data;
  // KafkaMirrorMaker2Table테이블의 outer table header columns 정의
  const SasAppColumns = [
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_1'),
      sortField: 'APP_NAME',
      data: 'APP_NAME',
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_3'),
      sortField: 'STATUS',
      data: 'STATUS',
    },
    {
      title: t('배포 버전'),
      sortField: 'ACTIVATE_VERSION',
      data: 'ACTIVATE_VERSION',
    },
    {
      title: t('버전 수'),
      sortField: 'VERSIONS',
      cellTransforms: [compoundExpand],
      data: 'VERSIONS.length',
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_139'),
      sortField: 'REPLICAS',
      data: 'REPLICAS',
    },
    {
      title: t('타겟 워커 노드 플'),
      sortField: 'POOL_ID',
      data: 'POOL_ID',
    },
    {
      title: t('생성 일시'),
      sortField: 'CREATED_AT',
      data: 'CREATED_AT',
    },
    {
      title: '',
      transforms: null,
      props: { className: Kebab.columnClass },
    },
  ];

  // outer table의 row renderer 정의
  const rowRenderer = (index, obj) => {
    return [
      {
        title: <ResourceLink kind={kind} name={obj.APP_NAME} namespace={obj.STATUS} title={obj.APP_NAME} />,
        index: index,
      },
      {
        className: 'co-break-word',
        title: <Status status={obj.STATUS} />,
      },
      {
        title: obj.ACTIVATE_VERSION,
      },
      {
        title: obj.VERSIONS.length,
        props: {
          isOpen: false,
        },
      },
      {
        title: obj.REPLICAS,
      },
      {
        title: obj.POOL_ID,
      },
      {
        title: <Timestamp timestamp={obj.CREATED_AT} />,
      },
      {
        className: Kebab.columnClass,
        title: <SasKebab status={obj.STATUS} handleModalToggle={props.handleModalToggle} data={obj} />,
      },
    ];
  };

  // outer table의 innerRenderer 정의
  const innerRenderer = data => {
    // inner renderer는 ExpandableInnerTable 컴포넌트를 반환한다.
    return <InnerTable key="InnerTable" innerDatas={data.VERSIONS} data={data.VERSIONS} />;
  };
  return <SingleExpandableTable header={SasAppColumns} itemList={SasAppList} rowRenderer={rowRenderer} innerRenderer={innerRenderer} compoundParent={3} />;
};
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

const AddVersionModal = ({ appName, setSubmitData }) => {
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
const AppDeployModal = ({ appData, setSubmitData }) => {
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
const AppDeleteModal = ({ appData, setSubmitData }) => {
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
const VersionSelectModal = ({ appData, setSubmitData }) => {
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
const ReplicaModal = ({ appData, setSubmitData }) => {
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
const AppStopModal = ({ appData, setSubmitData }) => {
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

export const SasAppPage = () => {
  const webSocket = React.useContext(WebSocketContext);
  const [data, setData] = React.useState([]);
  const [rawData, setRawData] = React.useState([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [titleModal, setTitleModal] = React.useState(['', '']);
  const [InnerPage, setInnerPage] = React.useState(<></>);
  const [submitData, setSubmitData] = React.useState({});

  const submit = () => {
    console.log(123, submitData);
    setIsModalOpen(!isModalOpen);
  };
  const handleModalToggle = (selectedData, type) => {
    switch (type) {
      case 'addversion':
        setTitleModal(['버전 추가', '저장']);
        setInnerPage(<AddVersionModal appName={selectedData.APP_NAME} setSubmitData={setSubmitData} />);
        break;
      case 'appdeploy':
        setTitleModal(['앱 배포', '배포']);
        setInnerPage(<AppDeployModal appData={selectedData} setSubmitData={setSubmitData} />);
        break;
      case 'appdelete':
        setTitleModal(['앱 삭제', '삭제']);
        setInnerPage(<AppDeleteModal appData={selectedData} setSubmitData={setSubmitData} />);
        break;
      case 'versionselect':
        setTitleModal(['버전 선택', '배포']);
        setInnerPage(<VersionSelectModal appData={selectedData} setSubmitData={setSubmitData} />);
        break;
      case 'replica':
        setTitleModal(['레플리카 수 수정', '저장']);
        setInnerPage(<ReplicaModal appData={selectedData} setSubmitData={setSubmitData} />);
        break;
      case 'appstop':
        setTitleModal(['앱 중지', '중지']);
        setInnerPage(<AppStopModal appData={selectedData} setSubmitData={setSubmitData} />);
        break;
      default:
        break;
    }

    setIsModalOpen(!isModalOpen);
  };

  React.useEffect(() => {
    webSocket.ws?.send(`{ header: { targetServiceName: 'com.tmax.superobject.admin.master.GetApplicationConsole', messageType: 'REQUEST', contentType: 'TEXT' }, body: {poolId : 'default', getAll : 'true', describe : 'true'} }`);
  }, [webSocket]);

  webSocket.ws &&
    webSocket.ws.onmessage(msg => {
      // eslint-disable-next-line no-console
      console.log('Message from server!! ', msg);
      setData(msg.body.formattedBody.items);
      // setData([{ APP_NAME: 'simple', BINARY_ID: '45cf706', CREATED_AT: '-', DESCRIPTION: 'simple app for testing', HOST: '-', JAR_NAME: 'simple.jar', POOL_ID: '-', REPLICAS: 0, STATUS: 'Archived', VERSION: 'v1', index: 0, VERSIONS: [0, 1] }]);
    });
  const [isOpen, setIsOpen] = React.useState(false);
  const [checkboxes, setCheckboxes] = React.useState([false, false, false]);
  const onToggle = () => {
    setIsOpen(!isOpen);
  };

  const onCheckboxChange = async index => {
    const newCheckboxes = [...checkboxes];
    newCheckboxes[index] = !newCheckboxes[index];
    setCheckboxes(newCheckboxes);
    let checked = ['Archived', 'Deployed', 'Failed'];
    if (newCheckboxes.includes(true)) {
      checked = [];
      newCheckboxes.map((bool, idx) => {
        if (bool && idx === 0) {
          checked.push('Archived');
        } else if (bool && idx === 1) {
          checked.push('Deployed');
        } else if (bool && idx === 2) {
          checked.push('Failed');
        }
      });
    }
    if (rawData.length === 0) {
      setRawData(data);
      const newData = data.filter(d => checked.includes(d.STATUS));
      setData(newData);
    } else {
      const newData = rawData.filter(d => checked.includes(d.STATUS));
      setData(newData);
    }
  };

  const toggle1Checkbox = checkboxes[0];
  const toggle2Checkbox = checkboxes[1];
  const toggle3Checkbox = checkboxes[2];
  return (
    <>
      <Helmet>
        <title>SAS</title>
      </Helmet>
      <div className="co-m-nav-title">
        <h1 className="co-m-pane__heading">
          <div className="co-m-pane__name co-resource-item co-status-card__alert-item-text ">
            <span data-test-id="resource-title" className="co-resource-item__resource-name">
              앱
            </span>
            <Link className="co-m-primary-action" to="/sas-app/~new">
              <Button variant="primary" id="yaml-create">
                앱 생성
              </Button>
            </Link>
          </div>
        </h1>
        <Dropdown
          toggle={
            <DropdownToggle id="my-dropdown" onToggle={onToggle}>
              <FilterIcon className="span--icon__right-margin" />
              필터
            </DropdownToggle>
          }
          isOpen={isOpen}
        >
          <div className="filter-drop-down">상태</div>
          <DropdownToggleCheckbox className="filter-drop-down" id="my-dropdown-checkbox1" isChecked={toggle1Checkbox} aria-label="Dropdown checkbox example" onChange={() => onCheckboxChange(0)}>
            Archived
          </DropdownToggleCheckbox>
          <DropdownToggleCheckbox className="filter-drop-down" id="my-dropdown-checkbox2" isChecked={toggle2Checkbox} aria-label="Dropdown checkbox example" onChange={() => onCheckboxChange(1)}>
            Deployed
          </DropdownToggleCheckbox>
          <DropdownToggleCheckbox className="filter-drop-down" id="my-dropdown-checkbox3" isChecked={toggle3Checkbox} aria-label="Dropdown checkbox example" onChange={() => onCheckboxChange(2)}>
            Failed
          </DropdownToggleCheckbox>
        </Dropdown>
      </div>
      <ModalPage isModalOpen={isModalOpen} handleModalToggle={handleModalToggle} InnerPage={InnerPage} titleModal={titleModal} submit={submit}></ModalPage>
      <div className="sas-main-table">
        <SasAppTable data={data} handleModalToggle={handleModalToggle} />
      </div>

      {/* <ListPage {...props} canCreate={true} kind={kind} rowFilters={filters.bind(null, t)()} customData={{ nonK8sResource: true, sas: 'app', kindObj: SasAppModel }} ListComponent={KafkaMirrorMaker2Table.bind(null, t)} isK8sResource={false} />; */}
    </>
  );
};

export default SasAppPage;

const ImageSummary: React.FC<ImageSummaryProps> = ({ obj }) => {
  const images = [obj.spec?.image, ...(obj.spec?.ee_images?.map(item => item.image) || []), obj.spec?.redis_image, obj.spec?.postgres_image].filter(item => !!item);

  if (images.length === 0) {
    images.push('-');
  }

  return (
    <>
      {images.map((image, index) => {
        return <div key={`image-${index}`}>{image}</div>;
      })}
    </>
  );
};

export const SasAppDetailsList: React.FC<AWXDetailsListProps> = ({ obj: awx }) => {
  const { t } = useTranslation();
  return (
    <dl className="co-m-pane__details">
      <DetailsItem label={t('MULTI:MSG_MULTI_AWXINSTANCES_AWXINSTANCEDETAILS_1')} obj={awx}>
        <Status status={AwxStatusReducer(awx)} />
      </DetailsItem>
      <DetailsItem label={t('MULTI:MSG_MULTI_AWXINSTANCES_AWXINSTANCEDETAILS_2')} obj={awx} path="spec.hostname">
        {awx.spec?.hostname ? (
          <a href={`https://${awx.spec?.hostname}`} target="_blank">
            {awx.spec.hostname}
          </a>
        ) : (
          <div>-</div>
        )}
      </DetailsItem>
      <DetailsItem label={t('MULTI:MSG_MULTI_AWXINSTANCES_AWXINSTANCEDETAILS_3')} obj={awx}>
        <ImageSummary obj={awx} />
      </DetailsItem>
    </dl>
  );
};

const SasAppDetails: React.FC<AWXDetailsProps> = ({ obj: awx }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1')} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={awx} showOwner={false} />
          </div>
        </div>
      </div>
    </>
  );
};

const { details, editResource } = navFactory;

export const SasAppsDetailsPage: React.FC<DetailsPageProps> = props => {
  const [url, setUrl] = React.useState(null);
  return <DetailsPage {...props} kind={kind} menuActions={menuActions} customData={{ label: 'URL', url: url ? `https://${url}` : null }} customStatePath="spec.hostname" setCustomState={setUrl} getResourceStatus={AwxStatusReducer} pages={[details(detailsPage(SasAppDetails)), editResource()]} />;
};

type ImageSummaryProps = {
  obj: K8sResourceKind;
};

type AWXDetailsListProps = {
  obj: K8sResourceKind;
};

type AWXDetailsProps = {
  obj: K8sResourceKind;
};
