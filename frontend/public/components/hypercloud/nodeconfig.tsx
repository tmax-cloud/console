import * as React from 'react';
import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage, DetailsPageProps } from '../factory';
import { DetailsItem, Kebab, KebabAction, detailsPage, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading } from '../utils';
import { NodeConfig2Model } from '../../models';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { useTranslation } from 'react-i18next';
import { TableProps } from './utils/default-list-component';

const kind = NodeConfig2Model.kind;

const menuActions: KebabAction[] = [...Kebab.factory.common];

const tableProps: TableProps = {
  header: [
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_1',
      sortField: 'metadata.name',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_2',
      sortField: 'metadata.namespace',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_12',
      sortField: 'metadata.creationTimestamp',
    },
    {
      title: '',
      transforms: null,
      props: { className: Kebab.columnClass },
    },
  ],
  row: (obj: K8sResourceKind) => [
    {
      children: <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.uid} />,
    },
    {
      className: 'co-break-word',
      children: <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />,
    },  
    {
      children: <Timestamp timestamp={obj.metadata.creationTimestamp} />,
    },
    {
      className: Kebab.columnClass,
      children: <ResourceKebab actions={menuActions} kind={kind} resource={obj} customData={{ label: 'URL', url: obj.spec?.tower_hostname ? `https://${obj.spec?.tower_hostname}` : null }} />,
    },
  ],
};

const CloudInitCommands = ({ commands }) => {  
  return (
    <>
      {commands.map((command, index) => {
        return <div key={`command-${index}`}>{command}</div>;
      })}
    </>
  );
};

export const NodeConfigDetailsList: React.FC<NodeConfigDetailsListProps> = ({ obj: nc }) => {
  //const { t } = useTranslation();
  return (
    <dl className="co-m-pane__details">
      <DetailsItem label={"imageURL"} obj={nc}>
        {nc.spec?.image.url}
      </DetailsItem>
      <DetailsItem label={"users"} obj={nc}>        
        {nc.spec?.users.map((user, index)  => { return <div key={`user-${index}`}>{user.name}</div> })}
      </DetailsItem>
      <DetailsItem label={"files"} obj={nc}>
        {nc.spec?.files.map((file, index)  => { return <div key={`file-${index}`}>{file.path}</div> })}
      </DetailsItem>
      <DetailsItem label={"cloudInitCommands"} obj={nc}>
        <CloudInitCommands commands={nc.spec?.cloudInitCommands} />        
      </DetailsItem>      
    </dl>
  );
};

const NodeConfigDetails: React.FC<NodeConfigDetailsProps> = ({ obj: nc }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(nc, t) })} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={nc} showOwner={false} />
          </div>
          <div className="col-sm-6">
            <NodeConfigDetailsList obj={nc} />
          </div>
        </div>
      </div>
    </>
  );
};

const { details, editResource } = navFactory;

export const NodeConfigsPage: React.FC = props => {
  return <ListPage {...props} canCreate={true} kind={kind} tableProps={tableProps} />;
};

export const NodeConfigsDetailsPage: React.FC<DetailsPageProps> = props => {
  const [url, setUrl] = React.useState(null);
  return <DetailsPage {...props} kind={kind} menuActions={menuActions} customData={{ label: 'URL', url: url ? `https://${url}` : null }} customStatePath="spec.tower_hostname" setCustomState={setUrl} pages={[details(detailsPage(NodeConfigDetails)), editResource()]} />;
};

type NodeConfigDetailsListProps = {
  obj: K8sResourceKind;
};

type NodeConfigDetailsProps = {
  obj: K8sResourceKind;
};
