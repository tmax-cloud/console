import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage, ResourceRow } from './factory';
import { SecretData } from './configmap-and-secret-data';
import { Cog, SectionHeading, ResourceCog, ResourceLink, ResourceSummary, detailsPage, navFactory, resourceObjPath, kindObj } from './utils';
import { fromNow } from './utils/datetime';
import { SecretType } from './secrets/create-secret';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';

export const WebHookSecretKey = 'WebHookSecretKey';

// Edit in YAML if not editing:
// - source secrets
// - webhook secret with one key.
const editInYaml = obj => {
  switch (obj.type) {
    case SecretType.basicAuth:
    case SecretType.sshAuth:
      return false;
    case SecretType.opaque:
      return !_.has(obj, ['data', WebHookSecretKey]) || _.size(obj.data) !== 1;
    default:
      return true;
  }
};

const menuActions = [
  Cog.factory.ModifyLabels,
  Cog.factory.ModifyAnnotations,
  (kind, obj) => {
    const { t } = useTranslation();
    return {
      label: t('ADDITIONAL:EDIT', { something: t('RESOURCE:SECRET') }),
      href: editInYaml(obj) ? `${resourceObjPath(obj, kind.kind)}/edit-yaml` : `${resourceObjPath(obj, kind.kind)}/edit`,
    };
  },
  Cog.factory.Delete,
];

const SecretHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-md-3 col-sm-4 col-xs-6" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead {...props} className="col-md-3 col-sm-4 col-xs-6" sortField="metadata.namespace">
        {t('CONTENT:NAMESPACE')}
      </ColHead>
      <ColHead {...props} className="col-md-3 col-sm-4 hidden-xs" sortField="type">
        {t('CONTENT:TYPE')}
      </ColHead>
      <ColHead {...props} className="col-md-1 hidden-sm hidden-xs" sortFunc="dataSize">
        {t('CONTENT:SIZE')}
      </ColHead>
      <ColHead {...props} className="col-md-2 hidden-sm hidden-xs" sortField="metadata.creationTimestamp">
        {t('CONTENT:CREATED')}
      </ColHead>
    </ListHeader>
  );
};

const SecretRow = ({ obj: secret }) => {
  const data = _.size(secret.data);
  const age = fromNow(secret.metadata.creationTimestamp);

  return (
    <ResourceRow obj={secret}>
      <div className="col-md-3 col-sm-4 col-xs-6 co-resource-link-wrapper">
        <ResourceCog actions={menuActions} kind="Secret" resource={secret} />
        <ResourceLink kind="Secret" name={secret.metadata.name} namespace={secret.metadata.namespace} title={secret.metadata.uid} />
      </div>
      <div className="col-md-3 col-sm-4 col-xs-6 co-break-word">
        <ResourceLink kind="Namespace" name={secret.metadata.namespace} title={secret.metadata.namespace} />
      </div>
      <div className="col-md-3 col-sm-4 hidden-xs co-break-word">{secret.type}</div>
      <div className="col-md-1 hidden-sm hidden-xs">{data}</div>
      <div className="col-md-2 hidden-sm hidden-xs">{age}</div>
    </ResourceRow>
  );
};

const SecretDetails = ({ obj: secret }) => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <div className="co-m-pane__body">
        <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('Secret', t) })} />
        <ResourceSummary resource={secret} showPodSelector={false} showNodeSelector={false} />
      </div>
      <div className="co-m-pane__body">
        <SecretData data={secret.data} type={secret.type} t={t} title={t('CONTENT:DATA')} />
      </div>
    </React.Fragment>
  );
};

const SecretsList = props => <List {...props} Header={SecretHeader} Row={SecretRow} />;
SecretsList.displayName = 'SecretsList';

const IMAGE_FILTER_VALUE = 'Image';
const SOURCE_FILTER_VALUE = 'Source';
const TLS_FILTER_VALUE = 'TLS';
const SA_TOKEN_FILTER_VALUE = 'Service Account Token';
const OPAQUE_FILTER_VALUE = 'Opaque';

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
  const createItems = {
    // image: 'Create Image Pull Secret',
    // generic: 'Create Key/Value Secret',
    source: t('CONTENT:SOURCESECRET'),
    webhook: t('CONTENT:WEBHOOKSECRET'),
    yaml: t('CONTENT:SECRETFROMYAML'),
  };

  const secretTypeFilterValues = [t('CONTENT:IMAGE'), t('CONTENT:SOURCE'), t('CONTENT:TLS'), t('CONTENT:SERVICEACCOUNTTOKEN'), t('CONTENT:OPAQUE')];

  const filters = [
    {
      type: 'secret-type',
      selected: secretTypeFilterValues,
      reducer: secretTypeFilterReducer,
      items: secretTypeFilterValues.map(filterValue => ({ id: filterValue, title: filterValue })),
    },
  ];

  const createProps = {
    items: createItems,
    createLink: type => `/k8s/ns/${props.namespace || 'default'}/secrets/new/${type !== 'yaml' ? type : ''}`,
  };

  return <ListPage ListComponent={SecretsList} canCreate={true} rowFilters={filters} createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} createProps={createProps} {...props} />;
};

const SecretsDetailsPage = props => {
  const { t } = useTranslation();
  return <DetailsPage {...props} menuActions={menuActions} pages={[navFactory.details(detailsPage(SecretDetails), t('CONTENT:OVERVIEW')), navFactory.editYaml()]} />;
};

export { SecretsList, SecretsPage, SecretsDetailsPage };
