import * as _ from 'lodash-es';
import * as React from 'react';

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
import {
  referenceFor,
  kindForReference,
} from '../module/k8s';
import { breadcrumbsForOwnerRefs } from './utils/breadcrumbs';

const menuActions = [
  Cog.factory.ModifyLabels,
  Cog.factory.ModifyAnnotations,
  Cog.factory.Edit,
  Cog.factory.Delete
];

const TemplateInstanceHeader = props => (
  <ListHeader>
    <ColHead
      {...props}
      className="col-lg-2 col-md-3 col-sm-4 col-xs-6"
      sortField="metadata.name"
    >
      Name
    </ColHead>
    <ColHead
      {...props}
      className="col-lg-2 col-md-3 col-sm-4 col-xs-6"
      sortField="metadata.namespace"
    >
      Namespace
    </ColHead>
    <ColHead {...props} className="col-lg-3 col-md-4 col-sm-4 hidden-xs">
      Parameter Count
    </ColHead>
    <ColHead
      {...props}
      className="col-lg-2 col-md-2 hidden-sm hidden-xs"
      sortField="templateInstancePhase"
    >
      Status
    </ColHead>
    <ColHead
      {...props}
      className="col-lg-3 hidden-md hidden-sm hidden-xs"
      sortField="metadata.creationTimestamp"
    >
      Created
    </ColHead>
  </ListHeader>
);

// template-instance status 값
const templateInstancePhase = instance => {
  let phase = '';
  if (instance.status) {
    instance.status.conditions.forEach(cur => {
      if (cur.type === 'Phase') {
        phase = cur.status;
      }
    });
    return phase;
  }

};

const TemplateInstanceRow = kind =>
  function TemplateInstanceRow({ obj }) {
    let phase = templateInstancePhase(obj);
    return (
      <div className="row co-resource-list__item">
        <div className="col-lg-2 col-md-3 col-sm-4 col-xs-6 co-resource-link-wrapper">
          <ResourceCog
            actions={menuActions}
            kind="TemplateInstance"
            resource={obj}
          />
          <ResourceLink
            kind="TemplateInstance"
            name={obj.metadata.name}
            namespace={obj.metadata.namespace}
            title={obj.metadata.name}
          />
        </div>
        <div className="col-lg-2 col-md-3 col-sm-4 col-xs-6 co-break-word">
          {obj.metadata.namespace ? (
            <ResourceLink
              kind="Namespace"
              name={obj.metadata.namespace}
              title={obj.metadata.namespace}
            />
          ) :
            'None'
          }
        </div>
        <div className="col-lg-3 col-md-4 col-sm-4 hidden-xs co-break-word">
          {(obj.spec && obj.spec.template && obj.spec.template.parameters.length) || 'None'}
        </div>
        <div className="col-lg-2 col-md-2 hidden-sm hidden-xs hidden-xs">
          {phase}
        </div>
        <div className="col-lg-3 hidden-md hidden-sm hidden-xs hidden-xs">
          {fromNow(obj.metadata.creationTimestamp)}
        </div>
      </div>
    );
  };

const Details = ({ obj: templateinstance }) => {
  return (
    <React.Fragment>
      <ScrollToTopOnMount />
      <div className="co-m-pane__body">
        <SectionHeading text="Pod Overview" />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={templateinstance} />
          </div>
          <div className="col-sm-6">
            <dl className="co-m-pane__details">
              <dt>Status</dt>
              <dd>{templateInstancePhase(templateinstance)}</dd>
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

export const TemplateInstanceList = props => {

  const { kinds } = props;
  const Row = TemplateInstanceRow(kinds[0]);
  Row.displayName = 'TemplateInstanceRow';
  return <List {...props} Header={TemplateInstanceHeader} Row={Row} />;
};
TemplateInstanceList.displayName = TemplateInstanceList;
const TemplateInstancesPage = props => {
  const createItems = {
    form: 'Service Instance (Form Editor)',
    yaml: 'Service Instance (YAML Editor)'
  };

  const createProps = {
    items: createItems,
    createLink: (type) => `/k8s/ns/${props.namespace || 'default'}/templateinstances/new${type !== 'yaml' ? '/' + type : ''}`
  };
  return <ListPage ListComponent={TemplateInstanceList} canCreate={true} createButtonText="Create" createProps={createProps} {...props} />;
};
export { TemplateInstancesPage };

TemplateInstancesPage.displayName = 'TemplateInstancesPage';

export const TemplateInstancesDetailsPage = props => (
  <DetailsPage
    {...props}
    breadcrumbsFor={obj =>
      breadcrumbsForOwnerRefs(obj).concat({
        name: 'Template Instances Details',
        path: props.match.url
      })
    }
    kind="TemplateInstance"
    menuActions={menuActions}
    pages={[
      navFactory.details(Details),
      navFactory.editYaml()
    ]}
  />
);

TemplateInstancesDetailsPage.displayName = 'TemplateInstancesDetailsPage';
