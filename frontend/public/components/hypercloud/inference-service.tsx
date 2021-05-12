import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

import { Status } from '@console/shared';
import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage, Table, TableRow, TableData, RowFunction } from '../factory';
import { DetailsItem, Kebab, KebabAction, detailsPage, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading } from '../utils';
import { InferenceServiceModel } from '../../models';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';

export const menuActions: KebabAction[] = [...Kebab.getExtensionsActionsForKind(InferenceServiceModel), ...Kebab.factory.common];

const kind = InferenceServiceModel.kind;

const tableColumnClasses = ['', '', classNames('pf-m-hidden', 'pf-m-visible-on-sm', 'pf-u-w-16-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), Kebab.columnClass];

const InferenceServicePhase = instance => {
  let phase = '';
  if (instance.status) {
    instance.status.conditions.forEach(cur => {
      if (cur.type === 'Ready') {
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
      title: 'STATUS',
      sortField: 'phase',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: 'FRAMEWORK',
      sortField: 'framework',
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
    {
      title: 'URL',
      sortField: 'isvc.status.url',
      transforms: [sortable],
      props: { className: tableColumnClasses[4] },
    },
    {
      title: 'MULTIMODEL',
      sortField: 'multimodel',
      transforms: [sortable],
      props: { className: tableColumnClasses[5] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_12'),
      sortField: 'metadata.creationTimestamp',
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
  const phase = InferenceServicePhase(isvc);
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
      <TableData className={tableColumnClasses[2]}><Status status={phase} /></TableData>
      <TableData className={tableColumnClasses[3]}>{framework}</TableData>
      <TableData className={tableColumnClasses[4]}>{isvc.status.url}</TableData>
      <TableData className={tableColumnClasses[5]}>{(isvc.spec.predictor[framework]?.storageUri) ? 'N' : 'Y'}</TableData>
      <TableData className={tableColumnClasses[6]}>
        <Timestamp timestamp={isvc.metadata.creationTimestamp} />
      </TableData>
      <TableData className={tableColumnClasses[7]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={isvc} />
      </TableData>
    </TableRow>
  );
};
//{isvc.status.canary && Object.keys(isvc.status.canary).length === 0 ? 'N' : 'Y'}
//{isvc.spec.predictor[framework]?.storageUri}

export const InferenceServiceDetailsList: React.FC<InferenceServiceDetailsListProps> = ({ ds }) => {
  const { t } = useTranslation();

  //const time = readyCondition?.lastTransitionTime?.replace('T', ' ').replaceAll('-', '.').replace('Z', '');
  const phase = InferenceServicePhase(ds);

  const frameworkList = ['tensorflow', 'onnx', 'sklearn', 'xgboost', 'pytorch', 'tensorrt', 'triton'];
  let framework;
  Object.keys(ds.spec.predictor).forEach(curPredictor => {
    if (frameworkList.some(curFramework => curFramework === curPredictor)) {
      framework = curPredictor;
    }
  });

  return (
    <dl className="co-m-pane__details">
      <DetailsItem label={`${t('COMMON:MSG_COMMON_TABLEHEADER_2')}`} obj={ds} path="status.result">
        <Status status={phase} />
      </DetailsItem>
      <DetailsItem label={'INFERENCEURL'} obj={ds} path="status.url">
        {ds.status.url}
      </DetailsItem>
      <DetailsItem label={'PREDICTOR'} obj={ds} path="spec.predictor">
        {framework}
      </DetailsItem>
      <DetailsItem label={'TRANSFOMER'} obj={ds} path="spec.transformer">
        {(ds.spec.transformer) ? 'Y' : 'N'}
      </DetailsItem>
      <DetailsItem label={'EXPLAINER'} obj={ds} path="spec.explainer">
        {(ds.spec.explainer) ? 'Y' : 'N'}
      </DetailsItem>
    </dl>
  );
}

//<DetailsItem label={`${t('COMMON:STORAGEURI')}`} obj={ds} path="spec.predictor[framework]?.storageUri">
//       {ds.spec.predictor[framework]?.storageUri}
//      </DetailsItem>
//<DetailsItem label={`${t('COMMON:PREDICTOR')}`} obj={ds} path="spec.predictor">
//        framework : {ds.spec.predictor[framework]}
//        image : {ds.spec.image}
//      </DetailsItem>
//<DetailsItem label={`${t('COMMON:TRANSFOMER')}`} obj={ds} path="spec.transformer">
//        {ds.spec.tranfomer}
//      </DetailsItem>
//      <DetailsItem label={`${t('COMMON:EXPLAINER')}`} obj={ds} path="spec.explainer">
//        {ds.spec.explainer}
//      </DetailsItem>  

const InferenceServiceDetails: React.FC<InferenceServiceDetailsProps> = ({ obj: isvc }) => {
  const { t } = useTranslation();
  const frameworkList = ['tensorflow', 'onnx', 'sklearn', 'xgboost', 'pytorch', 'tensorrt', 'triton'];
  let framework;
  Object.keys(isvc.spec.predictor).forEach(curPredictor => {
    if (frameworkList.some(curFramework => curFramework === curPredictor)) {
      framework = curPredictor;
    }
  });

  const multiModelToggle = (isvc.spec.predictor[framework]?.storageUri) ? false : true;

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
      {multiModelToggle === true &&
        <div className="co-m-pane__body">
          <SectionHeading text="Models" />
          <div className="row">

          </div>
        </div>
      }
    </>
  );  
};
//<Table aria-label="InferenceServices" Header={ModelTableHeader.bind(null, t)} Row={ModelTableRow} virtualize />
const { details, editYaml } = navFactory;
export const InferenceServices: React.FC = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="InferenceServices" Header={InferenceServiceTableHeader.bind(null, t)} Row={InferenceServiceTableRow} virtualize />;
};
/*
const ModelTableHeader = (t?: TFunction) => {
  return [
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_1'),
      sortField: 'metadata.name',
      transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: t('COMMON:STORAGEURI'),
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
      title: t('COMMON:MEMORY'),
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },    
  ];
};
ModelTableHeader.displayName = 'ModelTableHeader';

const ModelTableRow: RowFunction<K8sResourceKind> = ({ obj: model, index, key, style }) => {
  const frameworkList = ['tensorflow', 'onnx', 'sklearn', 'xgboost', 'pytorch', 'tensorrt', 'triton'];
  let framework;
  Object.keys(model.spec.predictor).forEach(curPredictor => {
    if (frameworkList.some(curFramework => curFramework === curPredictor)) {
      framework = curPredictor;
    }
  });
  return (
    <TableRow id={model.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>{model.metadata.name}</TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>{model.spec.predictor[framework]?.storageUri}</TableData>
      <TableData className={tableColumnClasses[2]}>{framework}</TableData>
      <TableData className={tableColumnClasses[3]}>{"memory"}</TableData>      
    </TableRow>
  );
};
*/

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
