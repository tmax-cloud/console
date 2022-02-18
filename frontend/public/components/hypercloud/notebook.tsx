import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { k8sList } from '@console/internal/module/k8s';
import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage, DetailsPageProps } from '../factory';
import { DetailsItem, Kebab, KebabAction, detailsPage, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading } from '../utils';
import { NotebookModel } from '../../models';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { Status } from '@console/shared';
import { NotebookStatusReducer } from '@console/dev-console/src/utils/hc-status-reducers';
import { TableProps } from './utils/default-list-component';
import * as classNames from 'classnames';
import { coFetchJSON } from '@console/internal/co-fetch';

export const menuActions: KebabAction[] = [...Kebab.getExtensionsActionsForKind(NotebookModel), ...Kebab.factory.common, Kebab.factory.Connect];

//const id = NotebookModel.id;
const kind = NotebookModel.kind;

const DoneMessage = 'done';

const initializeMenuUrl = (urlsMap, name) => {
  const ingressQuery = `&${encodeURIComponent('labelSelector')}=${encodeURIComponent('ingress.tmaxcloud.org/name=' + name)}`;  
  const ingressQeuryURL = `${document.location.origin}/api/console/apis/networking.k8s.io/v1/ingresses?&${ingressQuery}`;
  return new Promise((resolve, reject) => {
    coFetchJSON(ingressQeuryURL)
      .then(res => {
        const { items } = res;
        if (items?.length > 0) {
          const ingress = items[0];
          const host = ingress.spec?.rules?.[0]?.host;
          if (!!host) {
            urlsMap.set(name, `https://${host}`);
          }
        }
        resolve(DoneMessage);
      })
      .catch(err => {
        resolve(DoneMessage);
      });
  });
};

const getNotebookURLMap = async (URLMap) => {
  const notebooks = await k8sList(NotebookModel);
  if (notebooks.length !== 0) notebooks.map(notebook => initializeMenuUrl(URLMap, notebook.metadata.name));
};

const notebookURLMap = new Map();
getNotebookURLMap(notebookURLMap);

const tableProps: TableProps = {
  header: [
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_1',
      sortField: 'metadata.name',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_2',
      sortField: 'metadata.namespace',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_61',
      sortField: 'status.conditions[0].type',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_38',
      sortField: 'spec.template.spec.containers[0].image',
    },
    {
      title: '',
      transforms: null,
      props: { className: Kebab.columnClass },
    },
  ],
  row: (obj: K8sResourceKind) => {
    //const url = `/api/kubeflow/${id}/${obj.metadata.namespace}/${obj.metadata.name}/`;
    const url = notebookURLMap.get(obj.metadata.name);
    return [
      {
        children: <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.uid} />,
      },
      {
        className: 'co-break-word',
        children: <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />,
      },
      {
        className: classNames('pf-m-hidden', 'pf-m-visible-on-sm', 'co-break-word'),
        children: <Status status={NotebookStatusReducer(obj)} />,
      },
      {
        className: classNames('pf-m-hidden', 'pf-m-visible-on-lg', 'co-break-word'),
        children: obj.spec?.template.spec.containers[0].image || '-',
      },
      {
        className: Kebab.columnClass,
        children: <ResourceKebab actions={menuActions} kind={kind} resource={obj} customData={{ label: 'Connect', url }} />,
      },
    ];
  },
};

export const NotebookDetailsList: React.FC<NotebookDetailsListProps> = ({ notebook }) => {
  const { t } = useTranslation();
  return (
    <dl className="co-m-pane__details">
      <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_45')}</dt>
      <dd>
        <Status status={NotebookStatusReducer(notebook)} />
      </dd>
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_5')} obj={notebook} path="spec.template.spec.containers[0].image" />
    </dl>
  );
};

const NotebookDetails: React.FC<NotebookDetailsProps> = ({ obj: notebook }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(notebook, t) })} />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={notebook} />
          </div>
          <div className="col-lg-6">
            <NotebookDetailsList notebook={notebook} />
          </div>
        </div>
      </div>
    </>
  );
};

const { details, editResource } = navFactory;

export const NotebooksPage: React.FC<NotebooksPageProps> = props => <ListPage canCreate={true} tableProps={tableProps} kind={kind} {...props} />;

export const NotebooksDetailsPage: React.FC<DetailsPageProps> = props => {
  //const url = props?.namespace && props?.name ? `/api/kubeflow/${id}/${props.namespace}/${props.name}/` : null;
  const url = notebookURLMap.get(props.name);
  return <DetailsPage {...props} kind={kind} menuActions={menuActions} customData={{ label: 'Connect', url }} pages={[details(detailsPage(NotebookDetails)), editResource()]} />;
};

type NotebookDetailsListProps = {
  notebook: K8sResourceKind;
};

type NotebookDetailsProps = {
  obj: K8sResourceKind;
};

type NotebooksPageProps = {
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
};
