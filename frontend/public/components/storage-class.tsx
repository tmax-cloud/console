import * as React from 'react';
import * as _ from 'lodash-es';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, detailsPage, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary } from './utils';
// eslint-disable-next-line no-unused-vars
import { K8sResourceKind, K8sResourceKindReference } from '../module/k8s';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';

export const StorageClassReference: K8sResourceKindReference = 'StorageClass';

const menuActions = [Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit, Cog.factory.Delete];

const defaultClassAnnotation = 'storageclass.kubernetes.io/is-default-class';
const isDefaultClass = (storageClass: K8sResourceKind) => _.get(storageClass, ['metadata', 'annotations', defaultClassAnnotation], 'false');

const StorageClassHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-sm-4 col-xs-6" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead {...props} className="col-sm-4 col-xs-6" sortField="provisioner">
        {t('CONTENT:PROVISIONER')}
      </ColHead>
      <ColHead {...props} className="col-sm-2 hidden-xs" sortField="reclaimPolicy">
        {t('CONTENT:RECLAIMPOLICY')}
      </ColHead>
      <ColHead {...props} className="col-sm-2 hidden-xs" sortField={`metadata.annotations['${defaultClassAnnotation}']`}>
        {t('CONTENT:DEFAULTCLASS')}
      </ColHead>
    </ListHeader>
  );
};

const StorageClassRow: React.SFC<StorageClassRowProps> = ({ obj }) => {
  return (
    <div className="row co-resource-list__item">
      <div className="col-sm-4 col-xs-6 co-break-word co-resource-link-wrapper">
        <ResourceCog actions={menuActions} kind={StorageClassReference} resource={obj} />
        <ResourceLink kind={StorageClassReference} name={obj.metadata.name} namespace={undefined} title={obj.metadata.name} />
      </div>
      <div className="col-sm-4 col-xs-6 co-break-word">{obj.provisioner}</div>
      <div className="col-sm-2 hidden-xs">{obj.reclaimPolicy || '-'}</div>
      <div className="col-sm-2 hidden-xs">{isDefaultClass(obj)}</div>
    </div>
  );
};

const StorageClassDetails: React.SFC<StorageClassDetailsProps> = ({ obj }) => {
  const { t } = useTranslation();
  return (
    <React.Fragment>
      <div className="co-m-pane__body">
        <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('StorageClass', t) })} />
        <ResourceSummary resource={obj} showNodeSelector={false} showPodSelector={false}>
          <dt>{t('CONTENT:PROVISIONER')}</dt>
          <dd>{obj.provisioner || '-'}</dd>
          <dt>{t('CONTENT:RECLAIMPOLICY')}</dt>
          <dd>{obj.reclaimPolicy || '-'}</dd>
          <dt>{t('CONTENT:DEFAULTCLASS')}</dt>
          <dd>{isDefaultClass(obj)}</dd>
        </ResourceSummary>
      </div>
    </React.Fragment>
  );
};

export const StorageClassList: React.SFC = props => <List {...props} Header={StorageClassHeader} Row={StorageClassRow} />;
StorageClassList.displayName = 'StorageClassList';

export const StorageClassPage: React.SFC<StorageClassPageProps> = props => {
  const { t } = useTranslation();
  return <ListPage {...props} title={ResourcePlural('StorageClass', t)} kind={StorageClassReference} ListComponent={StorageClassList} canCreate={true} createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural('StorageClass', t) })} filterLabel={props.filterLabel} />;
};
StorageClassPage.displayName = 'StorageClassListPage';

export const StorageClassDetailsPage: React.SFC<StorageClassDetailsPageProps> = props => {
  const { t } = useTranslation();
  return <DetailsPage {...props} kind={StorageClassReference} menuActions={menuActions} pages={[navFactory.details(detailsPage(StorageClassDetails), t('CONTENT:OVERVIEW')), navFactory.editYaml()]} />;
};
StorageClassDetailsPage.displayName = 'StorageClassDetailsPage';

/* eslint-disable no-undef */
export type StorageClassRowProps = {
  obj: any;
};

export type StorageClassDetailsProps = {
  obj: any;
};

export type StorageClassPageProps = {
  filterLabel: string;
};

export type StorageClassDetailsPageProps = {
  match: any;
};
/* eslint-enable no-undef */
