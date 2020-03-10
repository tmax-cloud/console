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
  referenceForModel
} from '../module/k8s';
import { TemplateInstanceModel } from '../models';

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
const templateInstancePhase = pod => {
  let phase = '';
  pod.status.conditions.forEach(cur => {
    if (cur.type === 'Phase') {
      phase = cur.status;
    }
  });
  return phase;
};

const TemplateInstanceRow = kind =>
  function TemplateInstanceRow({ obj }) {
    let phase = templateInstancePhase(obj);

    return (
      <div className="row co-resource-list__item">
        <div className="col-lg-2 col-md-3 col-sm-4 col-xs-6 co-resource-link-wrapper">
          <ResourceCog
            actions={menuActions}
            kind={referenceForModel(TemplateInstanceModel)}
            resource={obj}
          />
          <ResourceLink
            kind={referenceForModel(TemplateInstanceModel)}
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
          {(obj.spec.template && obj.spec.template.parameters.length) || 'None'}
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
            {/* </ResourceSummary> */}
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
  )
}

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

export const TemplateInstanceList = props => {
  const { kinds } = props;
  const Row = TemplateInstanceRow(kinds[0]);
  Row.displayName = 'TemplateInstanceRow';
  return <List {...props} Header={TemplateInstanceHeader} Row={Row} />;
};
TemplateInstanceList.displayName = TemplateInstanceList;

export const TemplateInstancesPage = props => (
  <ListPage
    {...props}
    ListComponent={TemplateInstanceList}
    canCreate={true}
    kind={referenceForModel(TemplateInstanceModel)}
  />
);
TemplateInstancesPage.displayName = 'TemplateInstancesPage';

export const TemplateInstancesDetailsPage = props => {
  const pages = [
    // navFactory.details(DetailsForKind(props.kind)),
    navFactory.details(Details),
    navFactory.editYaml()
  ];
  return <DetailsPage {...props} menuActions={menuActions} pages={pages} />;
};

TemplateInstancesDetailsPage.displayName = 'TemplateInstancesDetailsPage';
