import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';

import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage, Table, TableRow, TableData } from '../factory';
import { Kebab, KebabAction, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading, DetailsItem } from '../utils';
import { ClusterRegistrationModel } from '../../models';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';

const { details, editResource } = navFactory;
export const menuActions: KebabAction[] = [...Kebab.factory.common];
const kind = ClusterRegistrationModel.kind;
const tableColumnClasses = [
  '', // NAME
  classNames('pf-m-hidden', 'pf-m-visible-on-lg'), // OWNER
  classNames('pf-m-hidden', 'pf-m-visible-on-lg'), // CREATED
  Kebab.columnClass,
];

const ClusterRegistrationTableHeader = (t?: TFunction) => {
  return [
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_1'),
      sortField: 'metadata.name',
      transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_11'),
      sortFunc: 'metadata.annotations.creator',
      transforms: [sortable],
      props: { className: tableColumnClasses[1] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_12'),
      sortFunc: 'metadata.creationTimestamp',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[3] },
    },
  ];
};
ClusterRegistrationTableHeader.displayName = 'ClusterRegistrationTableHeader';

const ClusterRegistrationTableRow = ({ obj, index, key, style }) => {
  return (
    <TableRow id={obj.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
      </TableData>
      <TableData className={tableColumnClasses[1]}>{obj.metadata?.annotations?.creator}</TableData>
      <TableData className={tableColumnClasses[2]}>
        <Timestamp timestamp={obj.metadata.creationTimestamp} />
      </TableData>
      <TableData className={tableColumnClasses[3]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={obj} />
      </TableData>
    </TableRow>
  );
};

export const ClusterRegistrations: React.FC = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="Cluster Registrations" Header={ClusterRegistrationTableHeader.bind(null, t)} Row={ClusterRegistrationTableRow} virtualize />;
};

export const ClusterRegistrationsPage: React.FC<ClusterRegistrationsPageProps> = props => {
  const { t } = useTranslation();
  const pages = [
    {
      href: 'clustermanagers',
      name: t('COMMON:MSG_LNB_MENU_84'),
    },
    {
      href: 'clusterclaims',
      name: t('COMMON:MSG_LNB_MENU_105'),
    },
    {
      href: 'clusterregistrations',
      name: t('COMMON:MSG_MAIN_TAB_3'),
    },
  ];
  return <ListPage canCreate={true} multiNavPages={pages} ListComponent={ClusterRegistrations} kind={kind} {...props} />;
};

const ClusterRegistrationDetails: React.FC<ClusterRegistrationDetailsProps> = ({ obj: clr }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(clr, t) })} />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={clr} showOwner={false} />
            <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_44')} obj={clr} path="metadata.annotations.creator" />
          </div>
          <div className="col-lg-6"></div>
        </div>
      </div>
    </>
  );
};

export const ClusterRegistrationsDetailsPage: React.FC<ClusterRegistrationsDetailsPageProps> = props => {
  return <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={[details(ClusterRegistrationDetails), editResource()]} />;
};

type ClusterRegistrationDetailsProps = {
  obj: K8sResourceKind;
};

type ClusterRegistrationsPageProps = {
  namespace: string;
};

type ClusterRegistrationsDetailsPageProps = {
  match: any;
};
