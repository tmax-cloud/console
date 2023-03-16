import * as React from 'react';
import { Helmet } from 'react-helmet';
import { compoundExpand } from '@patternfly/react-table';
import { Status } from '@console/shared';
import { useTranslation } from 'react-i18next';
import { detailsPage, Kebab, navFactory, PageHeading, ResourceLink, SectionHeading, Timestamp } from '../../utils';
import { SingleExpandableTable } from '../utils/expandable-table';
import { WebSocketContext } from '../../app';
import { Badge, Button } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import '../utils/help.scss';
import * as _ from 'lodash';
import { FilterIcon } from '@patternfly/react-icons';
import { DropdownToggle, DropdownToggleCheckbox } from '@patternfly/react-core';
import { Dropdown } from '@patternfly/react-core';
import { NavBar } from '../../utils';
import { Table, TableHeader, TableBody, TableProps } from '@patternfly/react-table';
import { APP_SOCKET, SERVICE_SOCKET } from './sas-string';
import { SasAppKebab } from './sas-kebab';
import { AddVersionModal, AppDeleteModal, AppDeployModal, AppStopModal, ReplicaModal, VersionDeleteModal, VersionSelectModal } from './sas-modal';
import { InlineEditCell, ModalPage } from './sas-utils';

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
        title: <ResourceLink kind={kind} name={obj.APP_NAME} namespace={obj.STATUS} title={obj.APP_NAME} manualPath={`/sas-app/${obj.APP_NAME}`} />,
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
        title: <SasAppKebab status={obj.STATUS} handleModalToggle={props.handleModalToggle} data={obj} />,
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

export const SasAppPage = () => {
  const webSocket = React.useContext(WebSocketContext);
  const [data, setData] = React.useState([]);
  const [rawData, setRawData] = React.useState([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [titleModal, setTitleModal] = React.useState(['', '']);
  const [InnerPage, setInnerPage] = React.useState(<></>);
  const [submitData, setSubmitData] = React.useState({});
  const [filterNumberState, setfilterNumberState] = React.useState([0, 0, 0]);
  let filterNumber = [0, 0, 0];
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
    webSocket.ws?.send(APP_SOCKET);
  }, [webSocket]);

  webSocket.ws &&
    webSocket.ws.onmessage(msg => {
      // eslint-disable-next-line no-console
      console.log('Message from server!! ', msg);
      setData(msg.body.formattedBody.items);
      msg.body.formattedBody.items.map(d => {
        if (d.STATUS === 'Archived') {
          filterNumber = [filterNumber[0] + 1, filterNumber[1], filterNumber[2]];
          console.log('a', filterNumber);
        } else if (d.STATUS === 'Deployed') {
          filterNumber = [filterNumber[0], filterNumber[1] + 1, filterNumber[2]];
          console.log('d', filterNumber);
        } else if (d.STATUS === 'Failed') {
          filterNumber = [filterNumber[0], filterNumber[1], filterNumber[2] + 1];
        }
      });
      setfilterNumberState(filterNumber);
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
            <Badge key={1} isRead>
              {filterNumberState[0]}
            </Badge>
          </DropdownToggleCheckbox>
          <DropdownToggleCheckbox className="filter-drop-down" id="my-dropdown-checkbox2" isChecked={toggle2Checkbox} aria-label="Dropdown checkbox example" onChange={() => onCheckboxChange(1)}>
            Deployed
            <Badge key={1} isRead>
              {filterNumberState[1]}
            </Badge>
          </DropdownToggleCheckbox>
          <DropdownToggleCheckbox className="filter-drop-down" id="my-dropdown-checkbox3" isChecked={toggle3Checkbox} aria-label="Dropdown checkbox example" onChange={() => onCheckboxChange(2)}>
            Failed
            <Badge key={1} isRead>
              {filterNumberState[2]}
            </Badge>
          </DropdownToggleCheckbox>
        </Dropdown>
      </div>
      <ModalPage isModalOpen={isModalOpen} handleModalToggle={handleModalToggle} InnerPage={InnerPage} titleModal={titleModal} submit={submit}></ModalPage>
      <div className="sas-main-table">
        <SasAppTable data={data} handleModalToggle={handleModalToggle} />
      </div>
    </>
  );
};

export default SasAppPage;

const SasAppDetails: React.FC = () => {
  return <></>;
};

const { details } = navFactory;

export const SasAppsDetailsPage = props => {
  const { name } = props.match.params;
  const [appName, setAppName] = React.useState(name);
  const webSocket = React.useContext(WebSocketContext);
  const [data, setData] = React.useState([]);
  const [singleData, setSingleData] = React.useState(null);
  const [servicedata, setServiceData] = React.useState(null);
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
      case 'versiondelete':
        setTitleModal(['버전 삭제', '삭제']);
        setInnerPage(<VersionDeleteModal appData={selectedData} setSubmitData={setSubmitData} />);
        break;
      case 'appdeploy':
        setTitleModal(['앱 배포', '배포']);
        setInnerPage(<AppDeployModal appData={selectedData} setSubmitData={setSubmitData} />);
        break;
      default:
        break;
    }

    setIsModalOpen(!isModalOpen);
  };

  React.useEffect(() => {
    webSocket.ws?.send(APP_SOCKET);
    webSocket.ws?.send(SERVICE_SOCKET);
  }, [webSocket]);
  webSocket.ws &&
    webSocket.ws.onmessage(msg => {
      // eslint-disable-next-line no-console
      console.log('Message from server~~!', msg);
      if (msg.header.targetServiceName === 'com.tmax.superobject.admin.master.GetService') {
        setServiceData(msg.body.formattedBody.items);
      } else setData(msg.body.formattedBody.items);
    });

  React.useEffect(() => {
    setAppName(name);
  }, [name]);
  React.useEffect(() => {
    data.map(item => {
      if (item.APP_NAME === appName) {
        setSingleData(item);
      }
    });
  }, [data, name]);
  const handleUpdateDescription = (index, newDescription) => {
    const updatedRows = [...singleData.VERSIONS];
    updatedRows[index].DESCRIPTION = newDescription;
    setSingleData({ ...singleData, VERSIONS: updatedRows });
  };
  const columns: TableProps['cells'] = ['버전', '설명', 'Jar 파일명', '생서일시', ''];
  const serviceColumns: TableProps['cells'] = ['이름', '앱', '크론 수', ''];
  const serviceRows: TableProps['rows'] = servicedata
    ?.filter(repo => {
      if (repo.APP_NAME === appName) return true;
      return false;
    })
    .map(repo => ({
      cells: [
        repo.SERVICE_PACKAGE,
        repo.APP_NAME,
        repo.CRON,
        <td className="td-in-kebab">
          <SasAppKebab status={'Service'} handleModalToggle={handleModalToggle} data={repo} />
        </td>,
      ],
    }));
  return (
    <div>
      <PageHeading detail={true} title={appName} badge={props.badge} icon={props.icon}></PageHeading>
      <div className={'co-m-page__body'}>
        <div className="co-m-horizontal-nav">{<NavBar pages={[details(detailsPage(SasAppDetails))]} baseURL={props.match.url} basePath={props.match.path} />}</div>
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
            <dt>배포버전</dt>
            <dd>{singleData?.ACTIVATE_VERSION}</dd>
            <dt>레플리카수</dt>
            <dd>{singleData?.REPLICAS}</dd>
            <dt>타겟 워커 노드 풀</dt>
            <dd>{singleData?.POOL_ID}</dd>
          </div>
        </div>
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text={'버전'} />
        {singleData && (
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                {columns.map((col, index) => (
                  <th key={index}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {singleData.VERSIONS.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td>{row.VERSION}</td>
                  <InlineEditCell value={row.DESCRIPTION} onUpdate={newDescription => handleUpdateDescription(rowIndex, newDescription)} />
                  <td>{row.JAR_NAME}</td>
                  <td>{row.CREATED_AT}</td>
                  <td className="td-in-kebab">
                    <SasAppKebab status={'Version'} handleModalToggle={handleModalToggle} data={row} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text={'서비스'} />
        {servicedata && serviceRows && serviceRows.length > 0 && (
          <Table aria-label="Simple Table2" cells={serviceColumns} rows={serviceRows}>
            <TableHeader />
            <TableBody />
          </Table>
        )}
      </div>
      <ModalPage isModalOpen={isModalOpen} handleModalToggle={handleModalToggle} InnerPage={InnerPage} titleModal={titleModal} submit={submit}></ModalPage>
    </div>
  );
};
