import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
import { DetailsPage, ListPage } from './factory';
import { SecretData } from './configmap-and-secret-data';
import { Kebab, SectionHeading, ResourceKebab, ResourceLink, ResourceSummary, Timestamp, detailsPage, navFactory, resourceObjPath } from './utils';
import { SecretType } from './secrets/create-secret';
import { configureAddSecretToWorkloadModal } from './modals/add-secret-to-workload';
import { useTranslation } from 'react-i18next';
import { ResourceLabel } from '../models/hypercloud/resource-plural';
import { SecretModel } from '../models';
import Memo, { memoColumnClass } from './hypercloud/utils/memo';

export const WebHookSecretKey = 'WebHookSecretKey';

export const addSecretToWorkload = (kindObj, secret) => {
  const { t } = useTranslation();
  const { name: secretName, namespace } = secret.metadata;

  return {
    callback: () => configureAddSecretToWorkloadModal({ secretName, namespace, blocking: true }),
    label: t('SINGLE:MSG_SECRETS_SECRETDETAILS_DIV1_BUTTON_1'),
  };
};

const actionButtons = [addSecretToWorkload];

const menuActions = [Kebab.factory.ModifyLabels, Kebab.factory.ModifyAnnotations, Kebab.factory.EditSecret, Kebab.factory.Delete];

const kind = SecretModel.kind;

const memoColumnClass = 'col-lg-1 co-text-center';

const tableProps = {
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
      title: 'COMMON:MSG_MAIN_TABLEHEADER_17',
      sortField: 'type',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_18',
      sortFunc: 'dataSize',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_12',
      sortField: 'metadata.creationTimestamp',
    },
    {
      title: '메모',
      transforms: null,
      props: { className: memoColumnClass },
    },
    {
      title: '',
      transforms: null,
      props: { className: Kebab.columnClass },
    },
  ],
  row: obj => [
    {
      children: <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.uid} />,
    },
    {
      classNames: 'co-break-word',
      children: <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />,
    },
    {
      className: classNames('pf-m-hidden', 'pf-m-visible-on-sm', 'co-break-word'),
      children: obj.type,
    },
    {
      children: _.size(obj.data),
    },
    {
      children: <Timestamp timestamp={obj.metadata.creationTimestamp} />,
    },
    {
      className: memoColumnClass,
      children: <Memo model={SecretModel} resource={obj} />,
    },
    {
      className: Kebab.columnClass,
      children: <ResourceKebab actions={menuActions} kind={kind} resource={obj} />,
    },
  ],
};

const SecretDetails = ({ obj: secret }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(secret, t) })} />
        <ResourceSummary resource={secret} />
      </div>
      <div className="co-m-pane__body">
        <SecretData data={secret.data} type={secret.type} />
      </div>
    </>
  );
};

const IMAGE_FILTER_VALUE = 'Image';
const SOURCE_FILTER_VALUE = 'Source';
const TLS_FILTER_VALUE = 'TLS';
const SA_TOKEN_FILTER_VALUE = 'Service Account Token';
const OPAQUE_FILTER_VALUE = 'Opaque';

const secretTypeFilterValues = [IMAGE_FILTER_VALUE, SOURCE_FILTER_VALUE, TLS_FILTER_VALUE, SA_TOKEN_FILTER_VALUE, OPAQUE_FILTER_VALUE];

export const secretTypeFilterReducer = secret => {
  switch (secret.type) {
    case SecretType.dockercfg:
    case SecretType.dockerconfigjson:
      return IMAGE_FILTER_VALUE;

    case SecretType.basicAuth:
    case SecretType.sshAuth:
      return SOURCE_FILTER_VALUE;

    case SecretType.tls:
      return TLS_FILTER_VALUE;

    case SecretType.serviceAccountToken:
      return SA_TOKEN_FILTER_VALUE;

    default:
      // This puts all unrecognized types under "Opaque". Since unrecognized types should be uncommon,
      // it avoids an "Other" category that is usually empty.
      return OPAQUE_FILTER_VALUE;
  }
};

const SecretsPage = props => {
  const { t } = useTranslation();

  const filters = [
    {
      filterGroupName: t('COMMON:MSG_DETAILS_TABDETAILS_SECRETS_TABLEHEADER_3'),
      type: 'secret-type',
      reducer: secretTypeFilterReducer,
      items: secretTypeFilterValues.map(filterValue => ({ id: filterValue, title: filterValue })),
    },
  ];

  const createItems = {
    generic: t('SINGLE:MSG_SECRETS_MAIN_BUTTON_1'),
    image: t('SINGLE:MSG_SECRETS_MAIN_BUTTON_2'),
    source: t('SINGLE:MSG_SECRETS_MAIN_BUTTON_3'),
    webhook: t('SINGLE:MSG_SECRETS_MAIN_BUTTON_4'),
    /*yaml: t('SINGLE:MSG_SECRETS_MAIN_BUTTON_5'), 폼뷰만 사용함 */
  };

  const createProps = {
    items: createItems,
    createLink: type => `/k8s/ns/${props.namespace || 'default'}/secrets/~new/${type !== 'yaml' ? type : ''}`,
  };

  return <ListPage tableProps={tableProps} canCreate={true} rowFilters={filters} createProps={createProps} {...props} />;
};

const SecretsDetailsPage = props => <DetailsPage {...props} buttonActions={actionButtons} menuActions={menuActions} pages={[navFactory.details(detailsPage(SecretDetails)), navFactory.editResource()]} />;

export { SecretsPage, SecretsDetailsPage };
