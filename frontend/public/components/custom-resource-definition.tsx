import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import { sortable, SortByDirection, Table as PFTable, TableBody, TableHeader, TableVariant } from '@patternfly/react-table';

import { BanIcon } from '@patternfly/react-icons';

import { DetailsPage, ListPage, Table, TableRow, TableData, RowFunction } from './factory';
import { AsyncComponent, DetailsItem, EmptyBox, Kebab, KebabAction, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading } from './utils';
import { apiVersionCompare, CRDVersion, referenceForModel, CustomResourceDefinitionKind, getLatestVersionForCRD, K8sKind, referenceForCRD, referenceForCRD_, modelFor } from '../module/k8s';
import { CustomResourceDefinitionModel } from '../models';
import { Conditions } from './conditions';
import { resourceListPages } from './resource-pages';
import { DefaultPage } from './default-resource';
import { GreenCheckCircleIcon } from '@console/shared';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { ResourceLabel } from '../models/hypercloud/resource-plural';

const { common } = Kebab.factory;

// TODO: replace referenceForCRD_ to referenceForCRD without side effect
const crdInstancesPath = (crd: CustomResourceDefinitionKind) => {
  const kind = modelFor(crd.spec.names.kind);
  if (kind === undefined) {
    return _.get(crd, 'spec.scope') === 'Namespaced' ? `/k8s/all-namespaces/${referenceForCRD_(crd)}` : `/k8s/cluster/${referenceForCRD_(crd)}`;
  } else {
    if (kind.crd === true) {
      return _.get(crd, 'spec.scope') === 'Namespaced' ? `/k8s/all-namespaces/${referenceForCRD_(crd)}` : `/k8s/cluster/${referenceForCRD_(crd)}`;
    } else {
      return _.get(crd, 'spec.scope') === 'Namespaced' ? `/k8s/all-namespaces/${crd.spec.names.plural}` : `/k8s/cluster/${crd.spec.names.plural}`;
    }
  }
};

const instances = (kind: K8sKind, obj: CustomResourceDefinitionKind) => {
  const { t } = useTranslation();
  return {
    label: t('COMMON:MSG_MAIN_ACTIONBUTTON_21'),
    href: crdInstancesPath(obj),
  };
};

const menuActions: KebabAction[] = [instances, ...Kebab.getExtensionsActionsForKind(CustomResourceDefinitionModel), ...common];

const tableColumnClasses = [classNames('col-lg-3', 'col-md-4', 'col-sm-4', 'col-xs-6'), classNames('col-lg-3', 'col-md-4', 'col-sm-4', 'col-xs-6'), classNames('col-lg-2', 'col-md-2', 'col-sm-4', 'hidden-xs'), classNames('col-lg-2', 'col-md-2', 'hidden-sm', 'hidden-xs'), classNames('col-lg-2', 'hidden-md', 'hidden-sm', 'hidden-xs'), Kebab.columnClass];

const CRDTableHeader = (t?: TFunction) => {
  return [
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_1'),
      sortField: 'spec.names.kind',
      transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_52'),
      sortField: 'spec.group',
      transforms: [sortable],
      props: { className: tableColumnClasses[1] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_53'),
      sortField: 'spec.version',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_94'),
      sortField: 'spec.scope',
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_55'),
      props: { className: tableColumnClasses[4] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[5] },
    },
  ];
};
CRDTableHeader.displayName = 'CRDTableHeader';

const isEstablished = (conditions: any[]) => {
  const condition = _.find(conditions, c => c.type === 'Established');
  return condition && condition.status === 'True';
};

const Established: React.FC<{ crd: CustomResourceDefinitionKind }> = ({ crd }) => {
  return crd.status && isEstablished(crd.status.conditions) ? (
    <span>
      <GreenCheckCircleIcon alt="true" />
    </span>
  ) : (
    <span>
      <BanIcon alt="false" />
    </span>
  );
};

const EmptyVersionsMsg: React.FC<{}> = () => <EmptyBox label="CRD Versions" />;

const CRDVersionTable: React.FC<CRDVersionProps> = ({ versions }) => {
  const [sortBy, setSortBy] = React.useState<PFSortState>({});
  const { t } = useTranslation();

  const compare = (a, b) => {
    const aVal = a?.[sortBy.index] ?? '';
    const bVal = b?.[sortBy.index] ?? '';
    return sortBy.index === 0 ? apiVersionCompare(aVal, bVal) : aVal.localeCompare(bVal);
  };
  const crdVersionTableHeaders = [
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_1'),
      transforms: [sortable],
    },
    {
      title: t('COMMON:MSG_DETAILS_TABDETAILS_VERSIONS_TABLEHEADER_1'),
      transforms: [sortable],
    },
    {
      title: t('COMMON:MSG_DETAILS_TABDETAILS_VERSIONS_TABLEHEADER_2'),
      transforms: [sortable],
    },
  ];

  const versionRows = _.map(versions, (version: CRDVersion) => [version.name, version.served.toString(), version.storage.toString()]);

  sortBy.direction === SortByDirection.asc ? versionRows.sort(compare) : versionRows.sort(compare).reverse();

  const onSort = (_event, index, direction) => {
    setSortBy({ index, direction });
  };

  return versionRows.length > 0 ? (
    <PFTable variant={TableVariant.compact} aria-label="CRD Versions" cells={crdVersionTableHeaders} rows={versionRows} onSort={onSort} sortBy={sortBy}>
      <TableHeader />
      <TableBody />
    </PFTable>
  ) : (
    <EmptyVersionsMsg />
  );
};

const CRDTableRow: RowFunction<CustomResourceDefinitionKind> = ({ obj: crd, index, key, style }) => {
  return (
    <TableRow id={crd.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <span className="co-resource-item">
          <ResourceLink kind="CustomResourceDefinition" name={crd.metadata.name} namespace={crd.metadata.namespace} displayName={_.get(crd, 'spec.names.kind')} />
        </span>
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>{crd.spec.group}</TableData>
      <TableData className={tableColumnClasses[2]}>{getLatestVersionForCRD(crd)}</TableData>
      {/* <TableData className={tableColumnClasses[3]}>{namespaced(crd) ? 'Yes' : 'No'}</TableData> */}
      <TableData className={tableColumnClasses[3]}>{crd.spec.scope}</TableData>
      <TableData className={tableColumnClasses[4]}>
        <Established crd={crd} />
      </TableData>
      <TableData className={tableColumnClasses[5]}>
        <ResourceKebab actions={menuActions} kind="CustomResourceDefinition" resource={crd} />
      </TableData>
    </TableRow>
  );
};

const Details: React.FC<{ obj: CustomResourceDefinitionKind }> = ({ obj: crd }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(crd, t) })} />
        <div className="co-m-pane__body-group">
          <div className="row">
            <div className="col-sm-6">
              <ResourceSummary showPodSelector={false} showNodeSelector={false} resource={crd} />
            </div>
            <div className="col-sm-6">
              <dl className="co-m-pane__details">
                <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_91')}</dt>
                <dd>
                  <Established crd={crd} />
                </dd>
                <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_92')} obj={crd} path="spec.group" />
                <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_93')} obj={crd} path="spec.version" />
                <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_94')} obj={crd} path="spec.scope" />
              </dl>
            </div>
          </div>
        </div>
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_CONDITIONS_1')} />
        <Conditions conditions={crd.status.conditions} />
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_93')} />
        <CRDVersionTable versions={crd.spec.versions} />
      </div>
    </>
  );
};

const Instances: React.FC<InstancesProps> = ({ obj, namespace }) => {
  let crdKind;

  const kind = modelFor(obj.spec.names.kind);
  if (kind === undefined) {
    crdKind = referenceForCRD(obj);
  } else {
    if (kind.crd === true) {
      crdKind = referenceForCRD(obj);
    } else {
      crdKind = obj.spec.names.kind;
    }
  }

  const componentLoader = resourceListPages.get(referenceForModel(kind || crdKind), () => Promise.resolve(DefaultPage));

  return <AsyncComponent loader={componentLoader} namespace={namespace ? namespace : undefined} kind={crdKind} showTitle={false} autoFocus={false} />;
};

export const CustomResourceDefinitionsList: React.FC<CustomResourceDefinitionsListProps> = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="Custom Resource Definitions" Header={CRDTableHeader.bind(null, t)} Row={CRDTableRow} defaultSortField="spec.names.kind" virtualize />;
};

export const CustomResourceDefinitionsPage: React.FC<CustomResourceDefinitionsPageProps> = props => <ListPage {...props} ListComponent={CustomResourceDefinitionsList} kind="CustomResourceDefinition" canCreate={true} />;
export const CustomResourceDefinitionsDetailsPage: React.FC<CustomResourceDefinitionsDetailsPageProps> = props => <DetailsPage {...props} kind="CustomResourceDefinition" menuActions={menuActions} pages={[navFactory.details(Details), navFactory.editResource(), { name: 'COMMON:MSG_DETAILS_TAB_15', href: 'instances', component: Instances }]} />;

export type CustomResourceDefinitionsListProps = {};

export type CustomResourceDefinitionsPageProps = {};

type InstancesProps = {
  obj: CustomResourceDefinitionKind;
  namespace: string;
};

CustomResourceDefinitionsList.displayName = 'CustomResourceDefinitionsList';
CustomResourceDefinitionsPage.displayName = 'CustomResourceDefinitionsPage';

type CustomResourceDefinitionsDetailsPageProps = {
  match: any;
};

export type CRDVersionProps = {
  versions: CRDVersion[];
};

type PFSortState = {
  index?: number;
  direction?: SortByDirection;
};
