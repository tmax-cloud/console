import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Button, Flex, FlexItem } from '@patternfly/react-core';
import { WSFactory } from '@console/internal/module/ws-factory';
import { compoundExpand } from '@patternfly/react-table';
import { AwxStatusReducer } from '@console/dev-console/src/utils/hc-status-reducers';
import { Status } from '@console/shared';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { DetailsItem, detailsPage, Kebab, KebabAction, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading, Timestamp } from '../../utils';
import { K8sResourceKind } from '../../../module/k8s';
import { DetailsPage, DetailsPageProps, ListPage } from '../../factory';
import { SingleExpandableTable } from '../utils/expandable-table';
import { SasAppModel } from './sas-model';

const menuActions: KebabAction[] = [...Kebab.factory.common, Kebab.factory.Connect];
const kind = 'SasApp';

export const MirrorRow = ({ mirror, km2 }) => {
  const connectors = km2.status?.connectors || [];
  const connector = connectors.find(obj => {
    return obj.name.indexOf(mirror.sourceCluster) !== -1 && obj.name.indexOf(mirror.targetCluster) !== -1;
  });

  const clusters = km2.spec.clusters;
  const sourceClusterBootstrapServerObj = clusters.find(obj => {
    return obj.alias.indexOf(mirror.sourceCluster) !== -1;
  });
  const targetClusterBootstrapServerObj = clusters.find(obj => {
    return obj.alias.indexOf(mirror.targetCluster) !== -1;
  });
  return (
    <div className="row">
      <div className="col-lg-2 col-md-3 col-sm-4 col-xs-5 ">{sourceClusterBootstrapServerObj?.bootstrapServers}</div>
      <div className="col-lg-2 col-md-3 col-sm-5 col-xs-7">{mirror.sourceCluster || '-'}</div>
      <div className="col-lg-2 col-md-2 col-sm-3 hidden-xs ">{targetClusterBootstrapServerObj?.bootstrapServers}</div>
      <div className="col-lg-2 col-md-2 hidden-sm hidden-xs">{mirror.targetCluster || '-'}</div>
      <div className="col-lg-2 col-md-2 hidden-sm hidden-xs ">{connector?.name || '-'}</div>
      <div className="col-lg-1 hidden-md hidden-sm hid den-xs ">
        <Status status={connector?.connector?.state || '-'} />
      </div>
    </div>
  );
};

export const MirrorTable = ({ data, km2 }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-table-grid co-m-table-grid--bordered">
        <div className="row co-m-table-grid__head">
          <div className="col-lg-2 col-md-3 col-sm-4 col-xs-5">{t('MULTI:MSG_DEVELOPER_KAFKAMIRRORMAKER2_KAFKAMIRRORMAKER2DETAILS_TABDETAILS_5')}</div>
          <div className="col-lg-2 col-md-3 col-sm-5 col-xs-7">{t('MULTI:MSG_DEVELOPER_KAFKAMIRRORMAKER2_KAFKAMIRRORMAKER2DETAILS_TABDETAILS_6')}</div>
          <div className="col-lg-2 col-md-2 col-sm-3 hidden-xs">{t('MULTI:MSG_DEVELOPER_KAFKAMIRRORMAKER2_KAFKAMIRRORMAKER2DETAILS_TABDETAILS_7')}</div>
          <div className="col-lg-2 col-md-2 hidden-sm hidden-xs">{t('MULTI:MSG_DEVELOPER_KAFKAMIRRORMAKER2_KAFKAMIRRORMAKER2DETAILS_TABDETAILS_8')}</div>
          <div className="col-lg-2 col-md-2 hidden-sm hidden-xs">{t('MULTI:MSG_DEVELOPER_KAFKAMIRRORMAKER2_KAFKAMIRRORMAKER2DETAILS_TABDETAILS_9')}</div>
          <div className="col-lg-1 hidden-md hidden-sm hidden-xs">{t('MULTI:MSG_DEVELOPER_KAFKAMIRRORMAKER2_KAFKAMIRRORMAKER2DETAILS_TABDETAILS_10')}</div>
        </div>
        <div className="co-m-table-grid__body">
          {data.map((m: any, i: number) => (
            <MirrorRow key={i} mirror={m} km2={km2} />
          ))}
        </div>
      </div>
    </>
  );
};

const KafkaMirrorMaker2Table = (t, props) => {
  const kafkaMirrorMaker2List = props.data;
  // KafkaMirrorMaker2Table테이블의 outer table header columns 정의
  const KafkaMirrorMaker2Columns = [
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_1'),
      sortField: 'metadata.name',
      data: 'name',
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_2'),
      sortField: 'metadata.name',
      data: 'namespace',
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_151'),
      sortField: 'spec.obj.spec.mirrors',
      tooltip: 'MSG_MAIN_TABLEHEADER_152',
      cellTransforms: [compoundExpand],
      data: 'mirrors.length',
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_12'),
      sortField: 'metadata.creationTimestamp',
      data: 'creationTimestamp',
    },
    {
      title: '',
      transforms: null,
      props: { className: Kebab.columnClass },
    },
  ];

  // outer table의 row renderer 정의
  const rowRenderer = (index, obj: K8sResourceKind) => {
    return [
      {
        title: <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.uid} />,
        index: index,
      },
      {
        className: 'co-break-word',
        title: <ResourceLink kind="Namespace" name={obj.metadata.namespace} namespace={obj.metadata.namespace} title={obj.metadata.namespace} />,
      },
      {
        title: obj.spec.mirrors.length,
        props: {
          isOpen: false,
        },
      },
      {
        title: <Timestamp timestamp={obj.metadata.creationTimestamp} creationTimestamp={obj.metadata.creationTimestamp} />,
      },
      {
        className: Kebab.columnClass,
        title: <ResourceKebab actions={menuActions} kind={kind} resource={obj} />,
      },
    ];
  };

  // outer table의 innerRenderer 정의
  const innerRenderer = km2 => {
    // inner renderer는 ExpandableInnerTable 컴포넌트를 반환한다.
    return <MirrorTable key="MirrorTable" data={km2.spec.mirrors} km2={km2} />;
  };

  return <SingleExpandableTable header={KafkaMirrorMaker2Columns} itemList={kafkaMirrorMaker2List} rowRenderer={rowRenderer} innerRenderer={innerRenderer} compoundParent={2} />;
};

const filters = (t: TFunction) => [
  {
    filterGroupName: t('COMMON:MSG_COMMON_FILTER_10'),
    type: 'awx-status',
    reducer: AwxStatusReducer,
    items: [
      { id: 'Succeeded', title: 'Succeeded' },
      { id: 'Deploying', title: 'Deploying' },
      { id: 'Failed', title: 'Failed' },
    ],
  },
];

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

export const SasAppPage = props => {
  const watchURL = 'wss://console.tmaxcloud.org/api/sas';
  const ws: WSFactory = new WSFactory('sas', {
    host: '',
    reconnect: true,
    path: watchURL,
    jsonParse: true,
  });
  ws.onopen(() => {
    // eslint-disable-next-line no-console
    console.log('연결완료');
  });
  ws.onmessage(msg => {
    // eslint-disable-next-line no-console
    console.log('Message from server ', msg);
  });

  const getResource = type => {
    switch (type) {
      case 'worker':
        ws.send(`{ header: { targetServiceName: 'com.tmax.superobject.admin.master.GetWorker', messageType: 'REQUEST', contentType: 'TEXT' }, body: {} }`);
        break;
      case 'binary':
        ws.send(`{ header: { targetServiceName: 'com.tmax.superobject.admin.master.GetBinary', messageType: 'REQUEST', contentType: 'TEXT' }, body: {} }`);
        break;
      case 'application':
        ws.send(`{ header: { targetServiceName: 'com.tmax.superobject.admin.master.GetApplication', messageType: 'REQUEST', contentType: 'TEXT' }, body: {} }`);
        break;
      case 'controller':
        ws.send(`{ header: { targetServiceName: 'com.tmax.superobject.admin.master.GetController', messageType: 'REQUEST', contentType: 'TEXT' }, body: {} }`);
        break;
      case 'service':
        ws.send(`{ header: { targetServiceName: 'com.tmax.superobject.admin.master.GetService', messageType: 'REQUEST', contentType: 'TEXT' }, body: {} }`);
        break;
      default:
        break;
    }
  };
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>SAS</title>
      </Helmet>
      <div className="co-m-nav-title">
        <h1 className="co-m-pane__heading">
          <div className="co-m-pane__name co-resource-item">
            <span data-test-id="resource-title" className="co-resource-item__resource-name">
              앱
            </span>
          </div>
        </h1>
      </div>
      <Flex>
        <FlexItem>
          <Button variant="secondary" onClick={() => getResource('worker')}>
            Get Worker
          </Button>
        </FlexItem>
        <FlexItem>
          <Button variant="secondary" onClick={() => getResource('binary')}>
            Get binary
          </Button>
        </FlexItem>
        <FlexItem>
          <Button variant="secondary" onClick={() => getResource('application')}>
            Get application
          </Button>
        </FlexItem>
        <FlexItem>
          <Button variant="secondary" onClick={() => getResource('controller')}>
            Get controller
          </Button>
        </FlexItem>
        <FlexItem>
          <Button variant="secondary" onClick={() => getResource('service')}>
            Get service
          </Button>
        </FlexItem>
      </Flex>
      <ListPage {...props} canCreate={true} kind={kind} rowFilters={filters.bind(null, t)()} customData={{ nonK8sResource: true, sas: 'app', kindObj: SasAppModel }} ListComponent={KafkaMirrorMaker2Table.bind(null, t)} isK8sResource={false} />;
    </>
  );
};

export default SasAppPage;
