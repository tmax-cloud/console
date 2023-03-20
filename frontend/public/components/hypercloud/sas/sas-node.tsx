import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Status } from '@console/shared';
import { useTranslation } from 'react-i18next';
import { detailsPage, Kebab, NavBar, navFactory, PageHeading, ResourceLink, SectionHeading, Timestamp } from '../../utils';
import { DetailsPageProps } from '../../factory';
import { WebSocketContext } from '../../app';
import '../utils/help.scss';
import * as _ from 'lodash';
import { FilterIcon } from '@patternfly/react-icons';
import { DropdownToggle, DropdownToggleCheckbox } from '@patternfly/react-core';
import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import { SingleSasTable } from './sas-single-table';
import { NODE_SOCKET } from './sas-string';
import { ModalPage, NodeDeleteModal } from './sas-modal';
import { Badge } from '@patternfly/react-core';
import { InputGroupWithDropdown } from './sas-utils';
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
        handleModalToggle(data, 'nodedelete');
      }}
    >
      노드 삭제
    </DropdownItem>,
  ];
  const dropdownItems = dropdownItemsReady;
  return <Dropdown className="my-dropdown" onSelect={onSelect} toggle={<KebabToggle className="sas-kebab-min" onToggle={onToggle} />} isOpen={isOpen} isPlain dropdownItems={dropdownItems} position={'right'} />;
};

const SasControllerTable = props => {
  const { t } = useTranslation();
  const SasControllerList = props.data;
  // KafkaMirrorMaker2Table테이블의 outer table header columns 정의
  const SasControllerColumns = [
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_1'),
      sortField: 'HOSTNAME',
      data: 'HOSTNAME',
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
      title: t('워커 노드 풀'),
      sortField: 'POOL_ID',
      data: 'POOL_ID',
    },
    {
      title: t('생성 일시'),
      sortField: 'AGE',
      data: 'AGE',
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
        title: <ResourceLink kind={kind} name={obj.HOSTNAME} namespace={obj.HOSTNAME} title={obj.HOSTNAME} manualPath={`/sas-node/${obj.HOSTNAME}`} />,
        index: index,
      },
      {
        className: 'co-break-word',
        title: <Status status={obj.STATUS} />,
      },
      {
        title: '워커',
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
  return <SingleSasTable header={SasControllerColumns} itemList={SasControllerList} rowRenderer={rowRenderer} />;
};

export const SasNodePage = () => {
  const webSocket = React.useContext(WebSocketContext);
  const [data, setData] = React.useState([]);
  const [rawData, setRawData] = React.useState([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [titleModal, setTitleModal] = React.useState(['', '']);
  const [InnerPage, setInnerPage] = React.useState(<></>);
  const [submitData, setSubmitData] = React.useState({});
  const [filterName, setFilterName] = React.useState('');
  const [filterNumberState, setfilterNumberState] = React.useState([0, 0, 0]);
  let filterNumber = [0, 0, 0];

  const submit = () => {
    console.log(submitData);
    setIsModalOpen(!isModalOpen);
  };

  const handleModalToggle = (selectedData, type) => {
    switch (type) {
      case 'nodedelete':
        setTitleModal(['노드 삭제', '삭제']);
        setInnerPage(<NodeDeleteModal appData={selectedData} setSubmitData={setSubmitData} />);

        break;
      default:
        break;
    }

    setIsModalOpen(!isModalOpen);
  };

  React.useEffect(() => {
    webSocket.ws?.send(NODE_SOCKET);
  }, [webSocket]);

  webSocket.ws &&
    webSocket.ws.onmessage(msg => {
      // eslint-disable-next-line no-console
      console.log('Message from server!! ', msg);
      setData(msg.body.formattedBody.items);
      setRawData(msg.body.formattedBody.items);
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
    const newData = rawData.filter(d => checked.includes(d.STATUS));
    setData(newData);
  };
  React.useEffect(() => {
    const newData = rawData.filter(d => d.HOSTNAME.includes(filterName));
    setData(newData);
  }, [filterName]);

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
              노드
            </span>
          </div>
        </h1>
        <div className={'sas-app-filter'}>
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
          <InputGroupWithDropdown setSearchName={setFilterName} />
        </div>
      </div>
      <ModalPage isModalOpen={isModalOpen} handleModalToggle={handleModalToggle} InnerPage={InnerPage} titleModal={titleModal} submit={submit}></ModalPage>{' '}
      <div className="sas-main-table">
        <SasControllerTable data={data} handleModalToggle={handleModalToggle} />
      </div>
    </>
  );
};

export default SasNodePage;

const SasNodeDetails: React.FC = () => {
  return <></>;
};

const { details } = navFactory;

export const SasNodeDetailsPage: React.FC<DetailsPageProps> = props => {
  const { name } = props.match.params;
  const [appName, setAppName] = React.useState(name);
  const webSocket = React.useContext(WebSocketContext);
  const [data, setData] = React.useState([]);
  const [singleData, setSingleData] = React.useState(null);
  React.useEffect(() => {
    webSocket.ws?.send(NODE_SOCKET);
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
      if (item.HOSTNAME === appName) {
        setSingleData(item);
      }
    });
  }, [data, name]);

  return (
    <div>
      <PageHeading detail={true} title={appName} badge={props.badge} icon={props.icon}></PageHeading>
      <div className={'co-m-page__body'}>
        <div className="co-m-horizontal-nav">{<NavBar pages={[details(detailsPage(SasNodeDetails))]} baseURL={props.match.url} basePath={props.match.path} />}</div>
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
            <dt>워커 노드 풀</dt>
            <dd>{singleData?.POOL_ID}</dd>
          </div>
        </div>
      </div>
    </div>
  );
};
