import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage, Table, TableRow, TableData, RowFunction } from '../factory';
import { Kebab, KebabAction, detailsPage, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading } from '../utils';
import { InferenceServiceModel } from '../../models';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';

export const menuActions: KebabAction[] = [...Kebab.getExtensionsActionsForKind(InferenceServiceModel), ...Kebab.factory.common];

const kind = InferenceServiceModel.kind;

const tableColumnClasses = ['', '', classNames('pf-m-hidden', 'pf-m-visible-on-sm', 'pf-u-w-16-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), Kebab.columnClass];

const InferenceServiceTableHeader = (t?: TFunction) => {
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
      title: t('COMMON:FRAMEWORK'),
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: t('COMMON:STORAGEURI'),
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
    {
      title: t('COMMON:URL'),
      transforms: [sortable],
      props: { className: tableColumnClasses[4] },
    },
    {
      title: t('COMMON:CANARY'),
      transforms: [sortable],
      props: { className: tableColumnClasses[5] },
    },
    {
      title: t('COMMON:STATUS'),
      transforms: [sortable],
      props: { className: tableColumnClasses[6] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[7] },
    },
  ];
};
InferenceServiceTableHeader.displayName = 'InferenceServiceTableHeader';

const InferenceServiceTableRow: RowFunction<K8sResourceKind> = ({ obj: isvc, index, key, style }) => {
  const frameworkList = ['tensorflow', 'onnx', 'sklearn', 'xgboost', 'pytorch', 'tensorrt'];
  console.log(Object.keys(isvc.spec.predictor)[0]);
  let framework = frameworkList.includes(Object.keys(isvc.spec.predictor)[0]) ? Object.keys(isvc.spec.predictor)[0] : Object.keys(isvc.spec.predictor)[1];
  return (
    <TableRow id={isvc.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={isvc.metadata.name} namespace={isvc.metadata.namespace} title={isvc.metadata.uid} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={isvc.metadata.namespace} title={isvc.metadata.namespace} />
      </TableData>
      <TableData className={tableColumnClasses[2]}>{framework}</TableData>
      <TableData className={tableColumnClasses[3]}>{isvc.spec.predictor[framework]?.storageUri}</TableData>
      <TableData className={tableColumnClasses[4]}>{isvc.status.url}</TableData>
      <TableData className={tableColumnClasses[5]}>{isvc.status.canary && Object.keys(isvc.status.canary).length === 0 ? 'N' : 'Y'}</TableData>
      <TableData className={tableColumnClasses[6]}>{isvc.status.conditions.length ? isvc.status.conditions[isvc.status.conditions.length - 1].status : ''}</TableData>
      <TableData className={tableColumnClasses[7]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={isvc} />
      </TableData>
    </TableRow>
  );
};

const InferenceServiceDetails: React.FC<InferenceServiceDetailsProps> = ({ obj: isvc }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(isvc, t) })} />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={isvc} />
          </div>
        </div>
      </div>
    </>
  );
};

const { details, editYaml } = navFactory;
export const InferenceServices: React.FC = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="InferenceServices" Header={InferenceServiceTableHeader.bind(null, t)} Row={InferenceServiceTableRow} virtualize />;
};

export const InferenceServicesPage: React.FC<InferenceServicesPageProps> = props => <ListPage canCreate={true} ListComponent={InferenceServices} kind={kind} {...props} />;

export const InferenceServicesDetailsPage: React.FC<InferenceServicesDetailsPageProps> = props => <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={[details(detailsPage(InferenceServiceDetails)), editYaml()]} />;

type InferenceServiceDetailsProps = {
  obj: K8sResourceKind;
};

type InferenceServicesPageProps = {
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
};

type InferenceServicesDetailsPageProps = {
  match: any;
};
