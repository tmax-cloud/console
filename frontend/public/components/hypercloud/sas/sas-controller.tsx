import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Status } from '@console/shared';
import { useTranslation } from 'react-i18next';
import { detailsPage, Kebab, NavBar, navFactory, PageHeading, ResourceLink, SectionHeading, Timestamp } from '../../utils';
import { DetailsPageProps } from '../../factory';
import { WebSocketContext } from '../../app';
import { Button } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import '../utils/help.scss';
import * as _ from 'lodash';
import { FilterIcon } from '@patternfly/react-icons';
import { DropdownToggle, DropdownToggleCheckbox } from '@patternfly/react-core';
import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import { SingleSasTable } from './sas-single-table';
import { CONTROLLER_SOCKET } from './sas-string';
import { ControllerDeleteModal, ModalPage } from './sas-modal';

const kind = 'SasController';

const SasKebab = ({ status, handleModalToggle, data }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const onToggle = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  const onFocus = () => {
    const element = document.getElementById('toggle-kebab');
    element?.focus();
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
        console.log('controllerstart', data);
      }}
    >
      컨트롤러 실행
    </DropdownItem>,
    <DropdownItem
      key="app-deploy"
      component="button"
      onClick={() => {
        handleModalToggle(data, 'controllerdelete');
      }}
    >
      컨트롤러 삭제
    </DropdownItem>,
  ];
  const dropdownItemsRunnung = [
    <DropdownItem
      key="addversion"
      component="button"
      onClick={() => {
        console.log('controllerstop', data);
      }}
    >
      컨트롤러 중지
    </DropdownItem>,
  ];
  const dropdownItems = status === 'Archived' ? dropdownItemsReady : dropdownItemsRunnung;
  return <Dropdown className="my-dropdown" onSelect={onSelect} toggle={<KebabToggle className="sas-kebab-min" onToggle={onToggle} />} isOpen={isOpen} isPlain dropdownItems={dropdownItems} position={'right'} />;
};

const SasControllerTable = props => {
  const { t } = useTranslation();
  const SasControllerList = props.data;
  // KafkaMirrorMaker2Table테이블의 outer table header columns 정의
  const SasControllerColumns = [
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_1'),
      sortField: 'CONTROLLER_NAME',
      data: 'CONTROLLER_NAME',
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_3'),
      sortField: 'STATUS',
      data: 'STATUS',
    },
    {
      title: t('타입'),
      sortField: 'TYPE',
      data: 'TYPE',
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
        title: <ResourceLink kind={kind} name={obj.CONTROLLER_NAME} namespace={obj.STATUS} title={obj.CONTROLLER_NAME} manualPath={`/sas-controller/${obj.CONTROLLER_NAME}`} />,
        index: index,
      },
      {
        className: 'co-break-word',
        title: <Status status={obj.STATUS} />,
      },
      {
        title: obj.TYPE,
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
  return <SingleSasTable header={SasControllerColumns} itemList={SasControllerList} rowRenderer={rowRenderer} />;
};

export const SasControllerPage = () => {
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
      case 'controllerdelete':
        setTitleModal(['컨트롤러 삭제', '삭제']);
        setInnerPage(<ControllerDeleteModal appData={selectedData} setSubmitData={setSubmitData} />);

      default:
        break;
    }
    setIsModalOpen(!isModalOpen);
  };

  React.useEffect(() => {
    webSocket.ws?.send(CONTROLLER_SOCKET);
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
              컨트롤러
            </span>
            <Link className="co-m-primary-action" to="/sas-controller/~new">
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
        <SasControllerTable data={data} handleModalToggle={handleModalToggle} />
      </div>
    </>
  );
};

export default SasControllerPage;

const SasControllerDetails: React.FC = () => {
  return <></>;
};

const { details } = navFactory;

export const SasControllersDetailsPage: React.FC<DetailsPageProps> = props => {
  const { name } = props.match.params;
  const [appName, setAppName] = React.useState(name);
  const webSocket = React.useContext(WebSocketContext);
  const [data, setData] = React.useState([]);
  const [singleData, setSingleData] = React.useState(null);
  React.useEffect(() => {
    webSocket.ws?.send(CONTROLLER_SOCKET);
  }, [webSocket]);
  webSocket.ws &&
    webSocket.ws.onmessage(msg => {
      // eslint-disable-next-line no-console
      console.log('Message from server~!', msg);
      setData(msg.body.formattedBody.items);
    });

  React.useEffect(() => {
    setAppName(name);
  }, [name]);
  React.useEffect(() => {
    data.map(item => {
      if (item.CONTROLLER_NAME === appName) {
        setSingleData(item);
      }
    });
  }, [data, name]);

  return (
    <div>
      <PageHeading detail={true} title={appName} badge={props.badge} icon={props.icon}></PageHeading>
      <div className={'co-m-page__body'}>
        <div className="co-m-horizontal-nav">{<NavBar pages={[details(detailsPage(SasControllerDetails))]} baseURL={props.match.url} basePath={props.match.path} />}</div>
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text={'앱 상세'} />
        <div className="row">
          <div className="col-lg-6">
            <dt>이름</dt>
            <dd>{appName}</dd>
            <dt>생성 일시</dt>
            <dd>{singleData?.CREATED_AT}</dd>
          </div>
          <div className="col-lg-6">
            <dt>상태</dt>
            <Status status={singleData?.STATUS} />
            <dt>타입</dt>
            <dd>{singleData?.TYPE}</dd>
          </div>
        </div>
      </div>
    </div>
  );
};
