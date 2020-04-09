import * as _ from 'lodash-es';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import {
  Cog,
  navFactory,
  ResourceCog,
  SectionHeading,
  ResourceLink,
  ResourceSummary,
  ScrollToTopOnMount,
  kindObj
} from './utils';
import { fromNow } from './utils/datetime';
import { kindForReference } from '../module/k8s';
import { breadcrumbsForOwnerRefs } from './utils/breadcrumbs';

const menuActions = [
  Cog.factory.ModifyLabels,
  Cog.factory.ModifyAnnotations,
  Cog.factory.Edit,
  Cog.factory.Delete
];

const ServiceBindingHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-xs-2 col-sm-2" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead
        {...props}
        className="col-xs-2 col-sm-2"
        sortField="metadata.namespace"
      >
        {t('CONTENT:NAMESPACE')}
      </ColHead>
      <ColHead
        {...props}
        className="col-sm-2 hidden-xs"
        sortField="spec.instanceRef.name"
      >
        {t('RESOURCE:SERVICEINSTANCE')}
      </ColHead>
      <ColHead
        {...props}
        className="col-sm-2 hidden-xs"
        sortField="spec.secretName"
      >
        {t('RESOURCE:SECRET')}
      </ColHead>
      <ColHead
        {...props}
        className="col-sm-4 hidden-xs"
        sortField="metadata.creationTimestamp"
      >
        {t('CONTENT:CREATED')}
      </ColHead>
    </ListHeader>
  )
};

const ServiceBindingRow = () =>
  // eslint-disable-next-line no-shadow
  function ServiceBindingRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-2 col-sm-2 co-resource-link-wrapper">
          <ResourceCog
            actions={menuActions}
            kind="ServiceBinding"
            resource={obj}
          />
          <ResourceLink
            kind="ServiceBinding"
            name={obj.metadata.name}
            namespace={obj.metadata.namespace}
            title={obj.metadata.name}
          />
        </div>
        <div className="col-xs-2 col-sm-2 co-break-word">
          {obj.metadata.namespace ? (
            <ResourceLink
              kind="Namespace"
              name={obj.metadata.namespace}
              title={obj.metadata.namespace}
            />
          ) : (
              'None'
            )}
        </div>
        <div className="col-xs-2 col-sm-2 hidden-xs">
          {obj.spec.instanceRef.name}
        </div>
        <div className="col-xs-2 col-sm-2 hidden-xs">
          {obj.spec.secretName}
        </div>
        <div className="col-xs-4 col-sm-4 hidden-xs">
          {fromNow(obj.metadata.creationTimestamp)}
        </div>
      </div>
    );
  };

// const DetailsForKind = kind =>
//   function DetailsForKind_({ obj }) {
//     return (
//       <React.Fragment>
//         <div className="co-m-pane__body">
//           <SectionHeading text={`${kindForReference(kind)} Overview`} />
//           <ResourceSummary
//             resource={obj}
//             podSelector="spec.podSelector"
//             showNodeSelector={false}
//           />
//         </div>
//       </React.Fragment>
//     );
//   };

const Details = ({ obj: servicebinding }) => {
  const { t } = useTranslation();
  return (
    <React.Fragment>
      <ScrollToTopOnMount />

      <div className="co-m-pane__body">
        <SectionHeading text="Pod Overview" />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={servicebinding} />
          </div>
          <div className="col-sm-6">
            <dl className="co-m-pane__details">
              <dt>{t('RESOURCE:SERVICEINSTANCE')}</dt>
              <dd>{servicebinding.spec.instanceRef.name}</dd>
              <dt>{t('RESOURCE:SECRET')}</dt>
              <dd>{servicebinding.spec.secretName}</dd>
              {/* {activeDeadlineSeconds && (
                <React.Fragment>
                  <dt>Active Deadline</dt>
                  <dd>{formatDuration(activeDeadlineSeconds * 1000)}</dd>
                </React.Fragment>
              )} */}
            </dl>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export const ServiceBindingList = props => {
  const { kinds } = props;
  const Row = ServiceBindingRow(kinds[0]);
  Row.displayName = 'ServiceBindingRow';
  return <List {...props} Header={ServiceBindingHeader} Row={Row} />;
};
ServiceBindingList.displayName = ServiceBindingList;

export const ServiceBindingsPage = props => (
  <ListPage
    {...props}
    ListComponent={ServiceBindingList}
    canCreate={true}
    kind="ServiceBinding"
  />
);
ServiceBindingsPage.displayName = 'ServiceBindingsPage';

export const ServiceBindingsDetailsPage = props => (
  <DetailsPage
    {...props}
    breadcrumbsFor={obj =>
      breadcrumbsForOwnerRefs(obj).concat({
        name: 'ServiceBinding Details',
        path: props.match.url
      })
    }
    kind="ServiceBinding"
    menuActions={menuActions}
    pages={[
      navFactory.details(Details),
      navFactory.editYaml()
    ]}
  />
);

ServiceBindingsDetailsPage.displayName = 'ServiceBindingsDetailsPage';
