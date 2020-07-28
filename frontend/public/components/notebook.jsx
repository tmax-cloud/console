import * as _ from 'lodash-es';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { PodsPage } from './pod';
import { StatefulSetsPage } from './stateful-set';
import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary, ScrollToTopOnMount, kindObj, ResourceIcon, Overflow, VolumeIcon } from './utils';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';
import { getVolumeType, getVolumeLocation, getVolumeMountPermissions, getVolumeMountsByPermissions, getRestartPolicyLabel, podPhase, podPhaseFilterReducer, podReadiness } from '../module/k8s/pods';
const menuActions = [...Cog.factory.common, Cog.factory.Connect];
const NotebookHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-xs-2 col-sm-2" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead {...props} className="col-xs-2 col-sm-2" sortField="metadata.namespace">
        {t('CONTENT:NAMESPACE')}
      </ColHead>
      <ColHead {...props} className="col-xs-5 col-sm-5" sortField="spec.template.spec.containers[0].image">
        {t('CONTENT:IMAGE')}
      </ColHead>
    </ListHeader>
  );
};

const NotebookRow = () =>
  // eslint-disable-next-line no-shadow
  function NotebookRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-2 col-sm-2 co-resource-link-wrapper">
          <ResourceCog actions={menuActions} kind="Notebook" resource={obj} />
          <ResourceLink kind="Notebook" name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
        </div>
        <div className="col-xs-2 col-sm-2 co-break-word">{obj.metadata.namespace}</div>
        <div className="col-xs-5 col-sm-5 co-break-word">{obj.spec.template.spec.containers[0].image}</div>
      </div>
    );
  };

const Details = ({ obj }) => {
  const { t } = useTranslation();
  return (
    <React.Fragment>
      <ScrollToTopOnMount />
      <div className="co-m-pane__body">
        <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('Notebook', t) })} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={obj} />
          </div>
          <div className="col-sm-6">
            <dl className="co-m-pane__details">
              <dt>{t('CONTENT:STATUS')}</dt>
              {obj.status && <dd>{obj.status.status}</dd>}
              <dt>{t('CONTENT:IMAGE')}</dt>
              <dd>{obj.spec.template.spec.containers[0].image}</dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text={t('CONTENT:VOLUMES')} />
        <div className="row">
          <div className="co-m-table-grid co-m-table-grid--bordered">
            <div className="row co-m-table-grid__head">
              <div className="col-sm-3 col-xs-4">{t('CONTENT:NAME')}</div>
              <div className="col-sm-3 col-xs-4">{t('CONTENT:TYPE')}</div>
              <div className="col-sm-3 hidden-xs">{t('CONTENT:PERMISSIONS')}</div>
              <div className="col-sm-3 col-xs-4">{t('CONTENT:UTILIZEDBY')}</div>
            </div>
            <div className="co-m-table-grid__body">
              {getVolumeMountsByPermissions(obj).map((v, i) => (
                <Volume key={i} pod={obj} volume={v} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
const ContainerLink = ({ pod, name }) => (
  <span className="co-resource-link co-resource-link--inline">
    <ResourceIcon kind="Container" />
    {name}
    {/* <Link to={`/k8s/ns/${pod.metadata.namespace}/pods/${pod.metadata.name}/containers/${name}`}>{name}</Link> */}
  </span>
);

const Volume = ({ pod, volume }) => {
  const kind = _.get(getVolumeType(volume.volume), 'id', '');
  const loc = getVolumeLocation(volume.volume);
  const mountPermissions = getVolumeMountPermissions(volume);

  return (
    <div className="row">
      <Overflow className="col-sm-3 col-xs-4 co-truncate" value={volume.name} />
      <div className="col-sm-3 col-xs-4">
        <VolumeIcon kind={kind} />
        <span className="co-break-word">{loc && ` (${loc})`}</span>
      </div>
      <div className="col-sm-3 hidden-xs">{mountPermissions}</div>
      <div className="col-sm-3 col-xs-4">
        {volume.mounts.map((m, i) => (
          <React.Fragment key={i}>
            <ContainerLink pod={pod} name={m.container} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
export const NotebookList = props => {
  const { kinds } = props;
  const Row = NotebookRow(kinds[0]);
  Row.displayName = 'NotebookRow';
  return <List {...props} Header={NotebookHeader} Row={Row} />;
};
NotebookList.displayName = NotebookList;

export const NotebookPage = props => {
  const { t } = useTranslation();
  return <ListPage {...props} ListComponent={NotebookList} createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} canCreate={true} kind="Notebook" />;
};
NotebookPage.displayName = 'NotebookPage';

export const NotebookDetailsPage = detailProps => {
  const { t } = useTranslation();
  const statefultSetComponent = props => {
    // let selector = { matchLabels: { 'notebook-name': props.match.params.name } };
    return <StatefulSetsPage obj={props.obj} showTitle={false} namespace={props.match.params.ns} canCreate={false} fieldSelector={`metadata.name=${props.obj.metadata.name}`} />;
  };
  const podComponent = props => {
    let selector = { matchLabels: { 'notebook-name': props.match.params.name } };
    return <PodsPage obj={props.obj} showTitle={false} namespace={props.match.params.ns} selector={selector} canCreate={false} />;
  };
  return <DetailsPage {...detailProps} kind="Notebook" menuActions={menuActions} pages={[navFactory.details(Details, t('CONTENT:OVERVIEW')), navFactory.editYaml(), navFactory.statefulsets(t('RESOURCE:STATEFULSET'), statefultSetComponent), navFactory.pods(t('RESOURCE:POD'), podComponent)]} />;
};

NotebookDetailsPage.displayName = 'NotebookDetailsPage';
