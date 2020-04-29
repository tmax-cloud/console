import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary } from './utils';
import { fromNow } from './utils/datetime';
import { kindForReference } from '../module/k8s';
import { breadcrumbsForOwnerRefs } from './utils/breadcrumbs';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';

const menuActions = [Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit, Cog.factory.Delete];
const HDCModeFlag = window.SERVER_FLAGS.HDCModeFlag;

const Metal3MachineHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-xs-6 col-sm-6" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>

      <ColHead {...props} className="col-sm-6 hidden-xs" sortField="metadata.creationTimestamp">
        {t('CONTENT:CREATED')}
      </ColHead>
    </ListHeader>
  );
};

const Metal3MachineRow = () =>
  // eslint-disable-next-line no-shadow
  function Metal3MachineRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-6 col-sm-6 co-resource-link-wrapper">
          {!HDCModeFlag && <ResourceCog actions={menuActions} kind="Metal3Machine" resource={obj} />}
          <ResourceLink kind="Metal3Machine" name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
        </div>
        <div className="col-xs-6 col-sm-6 hidden-xs">{fromNow(obj.metadata.creationTimestamp)}</div>
      </div>
    );
  };

const DetailsForKind = kind =>
  function DetailsForKind_({ obj }) {
    const { t } = useTranslation();
    return (
      <React.Fragment>
        <div className="co-m-pane__body">
          <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('Metal3Machine', t) })} />
          <ResourceSummary resource={obj} podSelector="spec.podSelector" showNodeSelector={false} />
        </div>
      </React.Fragment>
    );
  };

export const Metal3MachineList = props => {
  const { kinds } = props;
  const Row = Metal3MachineRow(kinds[0]);
  Row.displayName = 'Metal3MachineRow';
  return <List {...props} Header={Metal3MachineHeader} Row={Row} />;
};
Metal3MachineList.displayName = Metal3MachineList;

export const Metal3MachinesPage = props => {
  const { t } = useTranslation();
  return HDCModeFlag ? <ListPage {...props} ListComponent={Metal3MachineList} canCreate={false} kind="Metal3Machine" /> : <ListPage {...props} ListComponent={Metal3MachineList} createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} canCreate={false} kind="Metal3Machine" />;
};
Metal3MachinesPage.displayName = 'Metal3MachinesPage';

export const Metal3MachinesDetailsPage = props => {
  const { t } = useTranslation();
  let menu = HDCModeFlag ? null : menuActions;
  let page = HDCModeFlag ? [navFactory.details(DetailsForKind(props.kind), t('CONTENT:OVERVIEW'))] : [navFactory.details(DetailsForKind(props.kind), t('CONTENT:OVERVIEW')), navFactory.editYaml()];
  return <DetailsPage {...props} kind="Metal3Machine" menuActions={menu} pages={page} />;
};

Metal3MachinesDetailsPage.displayName = 'Metal3MachinesDetailsPage';
