import * as React from 'react';
import * as _ from 'lodash-es';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
import { K8sResourceKindReference, K8sResourceKind } from '../module/k8s';
import { LimitRangeModel } from '../models';
import { DetailsPage, ListPage, Table, TableRow, TableData, RowFunction } from './factory';
import { Kebab, navFactory, SectionHeading, ResourceKebab, ResourceLink, ResourceSummary, Timestamp } from './utils';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

const { common } = Kebab.factory;
const menuActions = [...Kebab.getExtensionsActionsForKind(LimitRangeModel), ...common];

const LimitRangeReference: K8sResourceKindReference = LimitRangeModel.kind;

const tableColumnClasses = [classNames('col-sm-4', 'col-xs-6'), classNames('col-sm-4', 'col-xs-6'), classNames('col-sm-4', 'hidden-xs'), Kebab.columnClass];

export const LimitRangeTableRow: RowFunction<K8sResourceKind> = ({ obj, index, key, style }) => {
  return (
    <TableRow id={obj.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={LimitRangeReference} name={obj.metadata.name} namespace={obj.metadata.namespace} />
      </TableData>
      <TableData className={tableColumnClasses[1]}>
        <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />
      </TableData>
      <TableData className={tableColumnClasses[2]}>
        <Timestamp timestamp={obj.metadata.creationTimestamp} />
      </TableData>
      <TableData className={tableColumnClasses[3]}>
        <ResourceKebab actions={menuActions} kind={LimitRangeReference} resource={obj} />
      </TableData>
    </TableRow>
  );
};

export const LimitRangeTableHeader = (t?: TFunction) => {
  console.log(t('COMMON:MSG_MAIN_TABLEHEADER_12'));
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
      title: t('COMMON:MSG_MAIN_TABLEHEADER_12'),
      sortField: 'metadata.creationTimestamp',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[3] },
    },
  ];
};
LimitRangeTableHeader.displayName = 'LimitRangeTableHeader';

export const LimitRangeList: React.SFC = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="Limit Ranges" Header={LimitRangeTableHeader.bind(null, t)} Row={LimitRangeTableRow} virtualize />;
};

export const LimitRangeListPage: React.SFC<LimitRangeListPageProps> = props => {
  const { t } = useTranslation();
  return <ListPage {...props} title={t('COMMON:MSG_LNB_MENU_81')} kind={LimitRangeReference} ListComponent={LimitRangeList} canCreate={true} />;
};

export const LimitRangeDetailsRow: React.SFC<LimitRangeDetailsRowProps> = ({ limitType, resource, limit }) => {
  return (
    <tr className="co-resource-list__item">
      <td>{limitType}</td>
      <td>{resource}</td>
      <td>{limit.min || '-'}</td>
      <td>{limit.max || '-'}</td>
      <td>{limit.defaultRequest || '-'}</td>
      <td>{limit.default || '-'}</td>
      <td>{limit.maxLimitRequestRatio || '-'}</td>
    </tr>
  );
};

const LimitRangeDetailsRows: React.SFC<LimitRangeDetailsRowsProps> = ({ limit }) => {
  const properties = ['max', 'min', 'default', 'defaultRequest', 'maxLimitRequestRatio'];
  const resources = {};
  _.each(properties, property => {
    _.each(limit[property], (value, resource) => _.set(resources, [resource, property], value));
  });

  return (
    <>
      {_.map(resources, (resourceLimit, resource) => (
        <LimitRangeDetailsRow key={resource} limitType={limit.type} resource={resource} limit={resourceLimit} />
      ))}
    </>
  );
};

export const LimitRangeDetailsList = resource => {
  const { t } = useTranslation();
  return (
    <div className="co-m-pane__body">
      <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_LIMITS_1')} />
      <div className="table-responsive">
        <table className="co-m-table-grid co-m-table-grid--bordered table">
          <thead className="co-m-table-grid__head">
            <tr>
              <td>{t('COMMON:MSG_DETAILS_TABDETAILS_LIMITS_TABLEHEADER_1')}</td>
              <td>{t('COMMON:MSG_DETAILS_TABDETAILS_LIMITS_TABLEHEADER_2')}</td>
              <td>{t('COMMON:MSG_DETAILS_TABDETAILS_LIMITS_TABLEHEADER_3')}</td>
              <td>{t('COMMON:MSG_DETAILS_TABDETAILS_LIMITS_TABLEHEADER_4')}</td>
              <td>{t('COMMON:MSG_DETAILS_TABDETAILS_LIMITS_TABLEHEADER_5')}</td>
              <td>{t('COMMON:MSG_DETAILS_TABDETAILS_LIMITS_TABLEHEADER_6')}</td>
              <td>{t('COMMON:MSG_DETAILS_TABDETAILS_LIMITS_TABLEHEADER_7')}</td>
            </tr>
          </thead>
          <tbody className="co-m-table-grid__body">
            {_.map(resource.resource.spec.limits, (limit, index) => (
              <LimitRangeDetailsRows limit={limit} key={index} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Details = ({ obj: rq }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: t('COMMON:MSG_LNB_MENU_81') })} />
        <ResourceSummary resource={rq} />
      </div>
      <LimitRangeDetailsList resource={rq} />
    </>
  );
};

export const LimitRangeDetailsPage = props => <DetailsPage {...props} menuActions={menuActions} pages={[navFactory.details(Details), navFactory.editResource()]} />;

export type LimitRangeProps = {
  obj: any;
};
export type LimitRangeListPageProps = {
  filterLabel: string;
};
export type LimitRangeDetailsRowsProps = {
  limit: any;
};
export type LimitRangeDetailsRowProps = {
  limitType: string;
  resource: string;
  limit: any;
};
export type LimitRangeHeaderProps = {
  obj: any;
};
