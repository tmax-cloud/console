import * as React from 'react';
import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage, DetailsPageProps } from '../factory';
import { DetailsItem, Kebab, KebabAction, detailsPage, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading } from '../utils';
import { NodeConfigModel } from '../../models';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from '@patternfly/react-core';
import { TableProps } from './utils/default-list-component';
import { CopyToClipboard } from '../utils'

const kind = NodeConfigModel.kind;

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
      children: <ResourceKebab actions={menuActions} kind={kind} resource={obj} />,
    },
  ],
};

export const NodeConfigDetailsList: React.FC<NodeConfigDetailsListProps> = ({ obj: nc }) => {
  const { t } = useTranslation();
  let commands = '';
  nc.spec?.cloudInitCommands.map((command) => {
    commands = commands + command + '\n';
  })
  const CloudInitCommandsModal = () => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const handleModalToggle = () => {
      setIsModalOpen(!isModalOpen);
    };
    return (
      <React.Fragment>
        <Button isInline variant="link" onClick={handleModalToggle}>
          {t('MULTI:MSG_BAREMETAL_NODECONFIGS_NODECONFIGDETAILS_TABDETAILS_6')}
        </Button>
        <Modal
          isSmall={true}
          title={t('MULTI:MSG_BAREMETAL_NODECONFIGS_NODECONFIGDETAILS_TABDETAILS_5')}
          isOpen={isModalOpen}
          onClose={handleModalToggle}
          actions={[
            <Button key="confirm" variant="primary" onClick={handleModalToggle}>
              {t('MULTI:MSG_BAREMETAL_NODECONFIGS_NODECONFIGDETAILS_TABDETAILS_7')}
            </Button>
          ]}
        >
          <CopyToClipboard value={commands} />
        </Modal>
      </React.Fragment>
    );
  }

  return (
    <dl className="co-m-pane__details">
      <DetailsItem label={t('MULTI:MSG_BAREMETAL_NODECONFIGS_NODECONFIGDETAILS_TABDETAILS_1')} obj={nc}>
        {nc.spec?.image.url}
      </DetailsItem>
      <DetailsItem label={t('MULTI:MSG_BAREMETAL_NODECONFIGS_NODECONFIGDETAILS_TABDETAILS_2')} obj={nc}>        
        {nc.spec?.users.map((user, index)  => { return <div key={`user-${index}`}>{user.name}</div> })}
      </DetailsItem>
      <DetailsItem label={t('MULTI:MSG_BAREMETAL_NODECONFIGS_NODECONFIGDETAILS_TABDETAILS_3')} obj={nc}>
        {nc.spec?.files.map((file, index)  => { return <div key={`file-${index}`}>{file.path}</div> })}
      </DetailsItem>
      <DetailsItem label={t('MULTI:MSG_BAREMETAL_NODECONFIGS_NODECONFIGDETAILS_TABDETAILS_4')} obj={nc}>
        <CloudInitCommandsModal />
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
  return <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={[details(detailsPage(NodeConfigDetails)), editResource()]} />;
};

type NodeConfigDetailsListProps = {
  obj: K8sResourceKind;
};

type NodeConfigDetailsProps = {
  obj: K8sResourceKind;
};
