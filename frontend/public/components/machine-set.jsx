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

const MachineSetHeader = props => {
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

const MachineSetRow = () =>
  // eslint-disable-next-line no-shadow
  function MachineSetRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-6 col-sm-6 co-resource-link-wrapper">
          {!HDCModeFlag && <ResourceCog actions={menuActions} kind="MachineSet" resource={obj} />}
          <ResourceLink kind="MachineSet" name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
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
          <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('MachineSet', t) })} />
          <ResourceSummary resource={obj} podSelector="spec.podSelector" showNodeSelector={false} />
        </div>
      </React.Fragment>
    );
  };

export const MachineSetList = props => {
  const { kinds } = props;
  const Row = MachineSetRow(kinds[0]);
  Row.displayName = 'MachineSetRow';
  return <List {...props} Header={MachineSetHeader} Row={Row} />;
};
MachineSetList.displayName = MachineSetList;

export const MachineSetsPage = props => {
  const { t } = useTranslation();
  return HDCModeFlag ? <ListPage {...props} ListComponent={MachineSetList} canCreate={false} kind="MachineSet" /> : <ListPage {...props} ListComponent={MachineSetList} createButtonText={t('ADDITIONAL:CREATEBUTTON', { something: ResourcePlural(props.kind, t) })} canCreate={false} kind="MachineSet" />;
};
MachineSetsPage.displayName = 'MachineSetsPage';

export const MachineSetsDetailsPage = props => {
  const { t } = useTranslation();
  let menu = HDCModeFlag ? null : menuActions;
  let page = HDCModeFlag ? [navFactory.details(DetailsForKind(props.kind), t('CONTENT:OVERVIEW'))] : [navFactory.details(DetailsForKind(props.kind), t('CONTENT:OVERVIEW')), navFactory.editYaml()];
  return <DetailsPage {...props} kind="MachineSet" menuActions={menu} pages={page} />;
};

MachineSetsDetailsPage.displayName = 'MachineSetsDetailsPage';
