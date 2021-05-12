import * as React from 'react';
import * as _ from 'lodash-es';
import { useState } from 'react';
import { Button } from '@patternfly/react-core';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
import { ClusterServicePlanModel } from '../../models';
import { K8sResourceKind, modelFor } from '../../module/k8s';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { DetailsPage, ListPage, Table, TableData, TableRow } from '../factory';
import { navFactory, SectionHeading, ResourceSummary, Timestamp } from '../utils';
import { ResourceSidebar } from '../sidebars/resource-sidebar';

const kind = ClusterServicePlanModel.kind;

const ClusterServicePlanDetails: React.FC<ClusterServicePlanDetailsProps> = ({ obj: clusterServicePlan }) => {
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text="Cluster Service Plan Details" />
        <div className="row">
          <div className="col-md-6">
            <ResourceSummary resource={clusterServicePlan} showPodSelector showNodeSelector></ResourceSummary>
          </div>
          <div className="col-md-6">
            <dl className="co-m-pane__details">
              <dt>BINDABLE</dt>
              <dd>{clusterServicePlan.spec.bindable ? 'Available' : 'Unavailable'}</dd>
              <dt>EXTERNAL NAME</dt>
              <dd>{clusterServicePlan.spec.externalName}</dd>
              <dt> SERVICE BROKER</dt>
              <dd>{clusterServicePlan.spec.clusterServiceBrokerName}</dd>
              <dt> SERVICE CLASS</dt>
              <dd>{clusterServicePlan.spec.clusterServiceClassRef.name}</dd>
            </dl>
          </div>
        </div>
      </div>
    </>
  );
};

type ClusterServicePlanDetailsProps = {
  obj: K8sResourceKind;
};

const { details } = navFactory;
const ClusterServicePlansDetailsPage: React.FC<ClusterServicePlansDetailsPageProps> = props => <DetailsPage {...props} kind={kind} pages={[details(ClusterServicePlanDetails)]} />;
ClusterServicePlansDetailsPage.displayName = 'ClusterServicePlansDetailsPage';

const tableColumnClasses = [
  '', // NAME
  '', // BINDABLE
  '', // EXTERNALNAME
  classNames('pf-m-hidden', 'pf-m-visible-on-xl'), // CREATED
];

const ClusterServicePlanTableHeader = (t?: TFunction) => {
  return [
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_1'),
      sortField: 'metadata.name',
      transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_SIDEPANEL_13'),
      sortField: 'spec.bindable',
      transforms: [sortable],
      props: { className: tableColumnClasses[1] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_6'),
      sortField: 'spec.externalName',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_12'),
      sortField: 'metadata.creationTimestamp',
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
  ];
};
ClusterServicePlanTableHeader.displayName = 'ClusterServicePlanTableHeader';

const ClusterServicePlanTableRow = (setSidebarDetails, setShowSidebar, setSidebarTitle, props) => {
  const { obj, index, key, style } = props;
  const SidebarLink = ({ name, kind, obj }) => {
    return (
      <Button
        type="button"
        variant="link"
        isInline
        onClick={() => {
          setShowSidebar(true);
          setSidebarDetails(obj);
          setSidebarTitle(obj.spec?.externalName);
        }}
      >
        {name}
      </Button>
    );
  };

  return (
    <TableRow id={obj.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <SidebarLink kind={kind} name={obj.metadata.name} obj={obj} />
      </TableData>
      <TableData className={tableColumnClasses[1]}>{obj.spec.bindable ? 'Available' : 'Unavailable'}</TableData>
      <TableData className={tableColumnClasses[2]}>{obj.spec?.externalName}</TableData>
      <TableData className={tableColumnClasses[3]}>
        <Timestamp timestamp={obj.metadata.creationTimestamp} />
      </TableData>
    </TableRow>
  );
};
const ClusterServicePlansList: React.FC<ClusterServicePlansListProps> = props => {
  const { t } = useTranslation();
  const { setSidebarDetails, setShowSidebar, setSidebarTitle } = props;
  return <Table {...props} aria-label="Cluster Service Plan" Header={ClusterServicePlanTableHeader.bind(null, t)} Row={ClusterServicePlanTableRow.bind(null, setSidebarDetails, setShowSidebar, setSidebarTitle)} />;
};
ClusterServicePlansList.displayName = 'ClusterServicePlansList';

const ClusterServicePlansPage: React.FC<ClusterServicePlansPageProps> = props => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [clusterServicePlan, setSidebarDetails] = useState({});
  const [sidebarTitle, setSidebarTitle] = useState('');
  return (
    <>
      <div className="co-p-has-sidebar">
        <div className="co-m-pane__body co-m-pane__body--no-top-margin">
          <ListPage showTitle={false} canCreate={false} kind={kind} ListComponent={ClusterServicePlansList} setSidebarTitle={setSidebarTitle} setShowSidebar={setShowSidebar} setSidebarDetails={setSidebarDetails} {...props} />
        </div>
        <ResourceSidebar
          resource={clusterServicePlan}
          kindObj={modelFor('ClusterServicePlan')}
          toggleSidebar={() => {
            setShowSidebar(!showSidebar);
            window.dispatchEvent(new Event('sidebar_toggle'));
          }}
          title={sidebarTitle}
          isFloat={true}
          showName={true}
          showID={false}
          showDescription={true}
          showPodSelector={false}
          showNodeSelector={false}
          showOwner={false}
          showAnnotations={false}
          showSidebar={showSidebar}
          samples={[]}
          isCreateMode={true}
          showDetails={true}
          noTabsOnlyDetails={false}
        />
      </div>
    </>
  );
};
ClusterServicePlansPage.displayName = 'ClusterServicePlansPage';

export { ClusterServicePlansList, ClusterServicePlansPage, ClusterServicePlansDetailsPage };

type ClusterServicePlansPageProps = {
  showTitle?: boolean;
  canCreate?: boolean;
  fieldSelector?: string;
  filters?: any;
  selector?: any;
};

type ClusterServicePlansListProps = {
  setShowSidebar: any;
  setSidebarDetails: any;
  setSidebarTitle: any;
};

type ClusterServicePlansDetailsPageProps = {
  match: any;
};
