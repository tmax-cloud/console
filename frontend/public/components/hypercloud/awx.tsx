import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage, Table, TableRow, TableData, RowFunction, DetailsPageProps } from '../factory';
import { awxStatusReducer } from '../factory/table-filters';
import { DetailsItem, Kebab, KebabAction, detailsPage, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading } from '../utils';
import { Status } from '@console/shared';
import { AWXModel } from '../../models';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

export const menuActions: KebabAction[] = [...Kebab.getExtensionsActionsForKind(AWXModel), ...Kebab.factory.common, Kebab.factory.Connect];

const kind = AWXModel.kind;

const tableColumnClasses = ['', '', classNames('pf-m-hidden', 'pf-m-visible-on-sm', 'pf-u-w-16-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), Kebab.columnClass];

const AWXTableHeader = (t?: TFunction) => {
  return [
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_1'),
      sortField: 'metadata.name',
      transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_2'),
      sortField: 'metadata.namespace',
      transforms: [sortable],
      props: { className: tableColumnClasses[1] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_3'),
      sortFunc: 'awxStatusReducer',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_12'),
      sortField: 'metadata.creationTimestamp',
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[4] },
    },
  ];
};
AWXTableHeader.displayName = 'AWXTableHeader';

const AWXTableRow: RowFunction<K8sResourceKind> = ({ obj: awx, index, key, style }) => {
  const url = awx.spec?.tower_hostname ? `https://${awx.spec?.tower_hostname}` : null;
  return (
    <TableRow id={awx.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={awx.metadata.name} namespace={awx.metadata.namespace} title={awx.metadata.uid} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={awx.metadata.namespace} title={awx.metadata.namespace} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[2], 'co-break-word')}>
        <Status status={awxStatusReducer(awx)} />
      </TableData>
      <TableData className={tableColumnClasses[3]}>
        <Timestamp timestamp={awx.metadata.creationTimestamp} />
      </TableData>
      <TableData className={tableColumnClasses[4]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={awx} customData={{ label: 'URL', url }} />
      </TableData>
    </TableRow>
  );
};

const ImageSummary: React.FC<ImageSummaryProps> = ({ obj }) => {
  const images = [obj.spec?.tower_image, ...(obj.spec?.tower_ee_images?.map(item => item.image) || []), obj.spec?.tower_redis_image, obj.spec?.tower_postgres_image].filter(item => !!item);

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

export const AWXDetailsList: React.FC<AWXDetailsListProps> = ({ obj: awx }) => {
  const { t } = useTranslation();
  return (
    <dl className="co-m-pane__details">
      <DetailsItem label={t('MULTI:MSG_MULTI_AWXINSTANCES_AWXINSTANCEDETAILS_1')} obj={awx}></DetailsItem>
      <DetailsItem label={t('MULTI:MSG_MULTI_AWXINSTANCES_AWXINSTANCEDETAILS_2')} obj={awx} path="spec.tower_hostname">
        {awx.spec?.tower_hostname ? (
          <a href={`https://${awx.spec?.tower_hostname}`} target="_blank">
            {awx.spec.tower_hostname}
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

const AWXDetails: React.FC<AWXDetailsProps> = ({ obj: awx }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(awx, t) })} />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={awx} showOwner={false} />
          </div>
          <div className="col-lg-6">
            <AWXDetailsList obj={awx} />
          </div>
        </div>
      </div>
    </>
  );
};

const { details, editResource } = navFactory;

export const AWXs: React.FC = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="AWX Instances" Header={AWXTableHeader.bind(null, t)} Row={AWXTableRow} virtualize />;
};

const filters = t => [
  {
    filterGroupName: t('COMMON:MSG_COMMON_FILTER_10'),
    type: 'awx-status',
    reducer: awxStatusReducer,
    items: [
      { id: 'Succeeded', title: 'Succeeded' },
      { id: 'Deploying', title: 'Deploying' },
      { id: 'Failed', title: 'Failed' },
    ],
  },
];

export const AWXsPage: React.FC = props => {
  const { t } = useTranslation();
  return <ListPage title={t('COMMON:MSG_LNB_MENU_199')} createButtonText={t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('COMMON:MSG_LNB_MENU_199') })} canCreate={true} ListComponent={AWXs} kind={kind} rowFilters={filters.bind(null, t)()} {...props} />;
};

export const AWXsDetailsPage: React.FC<DetailsPageProps> = props => {
  const [url, setUrl] = React.useState(null);
  return <DetailsPage {...props} kind={kind} menuActions={menuActions} customData={{ label: 'URL', url: url ? `https://${url}` : null }} customStatePath="spec.tower_hostname" setCustomState={setUrl} getResourceStatus={awxStatusReducer} pages={[details(detailsPage(AWXDetails)), editResource()]} />;
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
