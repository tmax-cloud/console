import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary } from './utils';
import { fromNow } from './utils/datetime';
import { kindForReference } from '../module/k8s';
import { breadcrumbsForOwnerRefs } from './utils/breadcrumbs';
import { useTranslation } from 'react-i18next';
const menuActions = [Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit, Cog.factory.Delete];

const UserHeader = props => {
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

const UserRow = () =>
  // eslint-disable-next-line no-shadow
  function UserRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-6 col-sm-6 co-resource-link-wrapper">
          <ResourceCog actions={menuActions} kind="User" resource={obj} />
          <ResourceLink kind="User" name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
        </div>
        <div className="col-xs-6 col-sm-6 hidden-xs">{fromNow(obj.metadata.creationTimestamp)}</div>
      </div>
    );
  };

const DetailsForKind = kind =>
  function DetailsForKind_({ obj }) {
    return (
      <React.Fragment>
        <div className="co-m-pane__body">
          <SectionHeading text={`${kindForReference(kind)} Overview`} />
          <ResourceSummary resource={obj} podSelector="spec.podSelector" showNodeSelector={false} />
        </div>
      </React.Fragment>
    );
  };

export const UserList = props => {
  const { kinds } = props;
  const Row = UserRow(kinds[0]);
  Row.displayName = 'UserRow';
  return <List {...props} Header={UserHeader} Row={Row} />;
};
UserList.displayName = UserList;

export const UsersPage = props => <ListPage {...props} ListComponent={UserList} canCreate={true} kind="User" />;
UsersPage.displayName = 'UsersPage';

export const UsersDetailsPage = props => (
  <DetailsPage
    {...props}
    breadcrumbsFor={obj =>
      breadcrumbsForOwnerRefs(obj).concat({
        name: 'User Details',
        path: props.match.url,
      })
    }
    kind="User"
    menuActions={menuActions}
    pages={[navFactory.details(DetailsForKind(props.kind)), navFactory.editYaml()]}
  />
);

UsersDetailsPage.displayName = 'UsersDetailsPage';
