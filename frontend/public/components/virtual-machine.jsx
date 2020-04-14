import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ScrollToTopOnMount, ResourceSummary } from './utils';
import { fromNow } from './utils/datetime';
import { kindForReference } from '../module/k8s';
import { breadcrumbsForOwnerRefs } from './utils/breadcrumbs';
import { useTranslation } from 'react-i18next';
import { ResourcePlural } from './utils/lang/resource-plural';

const menuActions = [Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit, Cog.factory.Delete];

const VirtualMachineHeader = props => {
  const { t } = useTranslation();
  return (
    <ListHeader>
      <ColHead {...props} className="col-xs-4 col-sm-4" sortField="metadata.name">
        {t('CONTENT:NAME')}
      </ColHead>
      <ColHead {...props} className="col-xs-4 col-sm-4" sortField="metadata.namespace">
        {t('CONTENT:NAMESPACE')}
      </ColHead>
      <ColHead {...props} className="col-sm-4 hidden-xs" sortField="metadata.creationTimestamp">
        {t('CONTENT:CREATED')}
      </ColHead>
    </ListHeader>
  );
};

const VirtualMachineRow = () =>
  // eslint-disable-next-line no-shadow
  function VirtualMachineRow({ obj }) {
    return (
      <div className="row co-resource-list__item">
        <div className="col-xs-4 col-sm-4 co-resource-link-wrapper">
          <ResourceCog actions={menuActions} kind="VirtualMachine" resource={obj} />
          <ResourceLink kind="VirtualMachine" name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
        </div>
        <div className="col-xs-4 col-sm-4 co-break-word">{obj.metadata.namespace ? <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} /> : 'None'}</div>
        <div className="col-xs-4 col-sm-4 hidden-xs">{fromNow(obj.metadata.creationTimestamp)}</div>
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

const Details = ({ obj: VirtualMachine }) => {
  const { t } = useTranslation();
  return (
    <React.Fragment>
      <ScrollToTopOnMount />
      <div className="co-m-pane__body">
        <SectionHeading text={t('ADDITIONAL:OVERVIEWTITLE', { something: ResourcePlural('VirtualMachine', t) })} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={VirtualMachine} />
          </div>
          {/* {activeDeadlineSeconds && (
                <React.Fragment>
                  <dt>Active Deadline</dt>
                  <dd>{formatDuration(activeDeadlineSeconds * 1000)}</dd>
                </React.Fragment>
              )} */}
        </div>
      </div>
    </React.Fragment>
  );
};

export const VirtualMachineList = props => {
  const { kinds } = props;
  const Row = VirtualMachineRow(kinds[0]);
  Row.displayName = 'VirtualMachineRow';
  return <List {...props} Header={VirtualMachineHeader} Row={Row} />;
};
VirtualMachineList.displayName = VirtualMachineList;

export const VirtualMachinesPage = props => <ListPage {...props} ListComponent={VirtualMachineList} canCreate={true} kind="VirtualMachine" />;
VirtualMachinesPage.displayName = 'VirtualMachinesPage';

// export const TemplatesDetailsPage = props => {
//   const pages = [
//     navFactory.details(DetailsForKind(props.kind)),
//     navFactory.editYaml()
//   ];
//   return <DetailsPage {...props} menuActions={menuActions} pages={pages} />;
// };

export const VirtualMachinesDetailsPage = props => {
  const { t } = useTranslation();
  return (
    <DetailsPage
      {...props}
      breadcrumbsFor={obj =>
        breadcrumbsForOwnerRefs(obj).concat({
          name: 'VirtualMachine Details',
          path: props.match.url,
        })
      }
      kind="VirtualMachine"
      menuActions={menuActions}
      pages={[navFactory.details(Details, t('CONTENT:OVERVIEW')), navFactory.editYaml()]}
    />
  );
};

VirtualMachinesDetailsPage.displayName = 'VirtualMachinesDetailsPage';
