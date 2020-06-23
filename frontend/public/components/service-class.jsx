import * as _ from 'lodash-es';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { ResourcePlural } from './utils/lang/resource-plural';
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

const ServiceClassHeader = props => {
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
        sortField="spec.bindable"
      >
        {t('CONTENT:BINDABLE')}
      </ColHead>
      <ColHead
        {...props}
        className="col-sm-2 hidden-xs"
        sortField="spec.externalName"
      >
        {t('CONTENT:EXTERNALNAME')}
      </ColHead>
      <ColHead
        {...props}
        className="col-sm-2 hidden-xs"
        sortField="spec.serviceBrokerName"
      >
        {t('RESOURCE:SERVICEBROKER')}
      </ColHead>
      <ColHead
        {...props}
        className="col-sm-2 hidden-xs"
        sortField="metadata.creationTimestamp"
      >
        {t('CONTENT:CREATED')}
      </ColHead>
    </ListHeader>
  )
};

const ServiceClassRow = () =>
  // eslint-disable-next-line no-shadow
  function ServiceClassRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-2 col-sm-2 co-resource-link-wrapper">
          <ResourceLink
            kind="ServiceClass"
            name={obj.metadata.name}
            namespace={obj.metadata.namespace}
            title={obj.metadata.name}
          />
        </div>
        <div className="col-xs-2 col-sm-2 co-break-word">
          {obj.metadata.namespace}
        </div>
        <div className="col-xs-2 col-sm-2 co-break-word">
          {obj.spec.bindable ? 'True' : 'False'}
        </div>
        <div className="col-xs-2 col-sm-2 co-break-word">
          {obj.spec.externalName}
        </div>
        <div className="col-xs-2 col-sm-2 co-break-word">
          {obj.spec.serviceBrokerName}
        </div>
        <div className="col-xs-2 col-sm-2 hidden-xs">
          {fromNow(obj.metadata.creationTimestamp)}
        </div>
      </div>
    );
  };

const Details = ({ obj: serviceclass }) => {
  const { t } = useTranslation();
  return (
    <React.Fragment>
      <ScrollToTopOnMount />
      <div className="co-m-pane__body">
        <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('SERVICECLASS', t) })} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={serviceclass} />
          </div>
          <div className="col-sm-6">
            <dl className="co-m-pane__details">
              <dt>{t('CONTENT:BINDABLE')}</dt>
              <dd>{serviceclass.spec.bindable ? 'True' : 'False'}</dd>
              <dt>{t('CONTENT:EXTERNALNAME')}</dt>
              <dd>{serviceclass.spec.externalName}</dd>
              <dt> {t('RESOURCE:SERVICEBROKER')}</dt>
              <dd>{serviceclass.spec.serviceBrokerName}</dd>
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

export const ServiceClassList = props => {
  const { kinds } = props;
  const Row = ServiceClassRow(kinds[0]);
  Row.displayName = 'ServiceClassRow';
  return <List {...props} Header={ServiceClassHeader} Row={Row} />;
};
ServiceClassList.displayName = ServiceClassList;

export const ServiceClassesPage = props => (
  <ListPage
    {...props}
    ListComponent={ServiceClassList}
    canCreate={false}
    kind="ServiceClass"
  />
);
ServiceClassesPage.displayName = 'ServiceClassesPage';

export const ServiceClassesDetailsPage = props => (
  <DetailsPage
    {...props}
    // breadcrumbsFor={obj =>
    //   breadcrumbsForOwnerRefs(obj).concat({
    //     name: 'ServiceClass Details',
    //     path: props.match.url
    //   })
    // }
    kind="ServiceClass"
    //  menuActions={menuActions}
    pages={[
      navFactory.details(Details)
    ]}
  />
);

ServiceClassesDetailsPage.displayName = 'ServiceClassesDetailsPage';
