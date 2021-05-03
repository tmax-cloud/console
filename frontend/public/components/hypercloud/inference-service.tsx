import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

import { Status } from '@console/shared';
import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage, Table, TableRow, TableData, RowFunction } from '../factory';
import { DetailsItem, Kebab, KebabAction, detailsPage, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading } from '../utils';
import { InferenceServiceModel } from '../../models';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';

export const menuActions: KebabAction[] = [...Kebab.getExtensionsActionsForKind(InferenceServiceModel), ...Kebab.factory.common];

const kind = InferenceServiceModel.kind;

const tableColumnClasses = ['', '', classNames('pf-m-hidden', 'pf-m-visible-on-sm', 'pf-u-w-16-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), Kebab.columnClass];

const InferenceServicePhase = instance => {
  let phase = '';
  if (instance.status) {
    instance.status.conditions.forEach(cur => {
      if (cur.type === 'ready') {
        if (cur.status === 'True') {
          phase = 'Ready';
        } else {
          phase = 'UnReady';
        }
      }
    });
    return phase;
  }
};


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
  const frameworkList = ['tensorflow', 'onnx', 'sklearn', 'xgboost', 'pytorch', 'tensorrt', 'triton'];
  let framework;
  Object.keys(isvc.spec.predictor).forEach(curPredictor => {
    if (frameworkList.some(curFramework => curFramework === curPredictor)) {
      framework = curPredictor;
    }
  });
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

export const InferenceServiceDetailsList: React.FC<InferenceServiceDetailsListProps> = ({ ds }) => {
  const { t } = useTranslation();

  const readyCondition = ds.status.conditions.find(obj => _.lowerCase(obj.type) === 'ready');
  const time = readyCondition?.lastTransitionTime?.replace('T', ' ').replaceAll('-', '.').replace('Z', '');
  const phase = InferenceServicePhase(ds);

  return (
    <dl className="co-m-pane__details">
      <DetailsItem label={`${t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_109')}`} obj={ds} path="status.transitionTime">
        {time}
      </DetailsItem>
      <DetailsItem label={`${t('COMMON:MSG_COMMON_TABLEHEADER_2')}`} obj={ds} path="status.result">
        <Status status={phase} />
      </DetailsItem>
    </dl>
  );
}



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
          <div className="col-lg-6">
            <InferenceServiceDetailsList ds={isvc} />
          </div>
        </div>
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text="Models" />
        <div className="row">
          
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

export const InferenceServicesPage: React.FC<InferenceServicesPageProps> = props => {
  const { t } = useTranslation();

  return (
    <ListPage
      title={t('COMMON:MSG_LNB_MENU_192')}
      createButtonText={t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('COMMON:MSG_LNB_MENU_192') })}
      canCreate={true}
      ListComponent={InferenceServices}
      kind={kind} {...props}
    />
  );
};




export const InferenceServicesDetailsPage: React.FC<InferenceServicesDetailsPageProps> = props => {
  return (
    <DetailsPage
      {...props}
      kind={kind}
      menuActions={menuActions}
      pages={[details(detailsPage(InferenceServiceDetails)), editYaml()]}
    />
  );
};


type InferenceServiceDetailsListProps = {
  ds: K8sResourceKind;
};

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
