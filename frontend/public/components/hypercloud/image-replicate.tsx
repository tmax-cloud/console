import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';

import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage, Table, TableRow, TableData, RowFunction } from '../factory';
import { Kebab, KebabAction, detailsPage, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading } from '../utils';
import { ImageReplicateModel, ExternalRegistryModel, RegistryModel } from '../../models';
import { Status } from '@console/shared';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';

import './IR.scss';

export const menuActions: KebabAction[] = [...Kebab.getExtensionsActionsForKind(ImageReplicateModel), ...Kebab.factory.common];

const kind = ImageReplicateModel.kind;
const tableColumnClasses = ['', '', '', classNames('pf-m-hidden', 'pf-m-visible-on-lg', 'IR__button'), classNames('pf-m-hidden', 'pf-m-visible-on-lg', 'IR__button'), classNames('pf-m-hidden', 'pf-m-visible-on-lg', 'IR__button'), classNames('pf-m-hidden', 'pf-m-visible-on-lg', 'IR__button'), classNames('pf-m-hidden', 'pf-m-visible-on-lg', 'IR__button'), Kebab.columnClass];

const ImageReplicateTableHeader = (t?: TFunction) => {
  return [
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_1'),
      sortField: 'metadata.name',
      transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_2'),
      sortField: 'metadata.namespace',
      transforms: [sortable],
      props: { className: tableColumnClasses[1] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_3'),
      sortField: 'status.status',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_75'),
      sortField: 'spec.fromImage.registryType',
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_89'),
      sortField: 'spec.fromImage.registryName',
      transforms: [sortable],
      props: { className: tableColumnClasses[4] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_76'),
      sortField: 'spec.toImage.registryType',
      transforms: [sortable],
      props: { className: tableColumnClasses[5] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_90'),
      sortField: 'spec.toImage.registryName',
      transforms: [sortable],
      props: { className: tableColumnClasses[6] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_12'),
      sortField: 'metadata.creationTimestamp',
      transforms: [sortable],
      props: { className: tableColumnClasses[7] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[8] },
    },
  ];
};

const ImageReplicateTableRow: RowFunction<K8sResourceKind> = ({ obj: imagereplicate, index, key, style }) => {
  let FROM_NAMESPACE_NAME = `${imagereplicate.spec.fromImage.registryName}(${imagereplicate.spec.fromImage.registryNamespace})`;
  let TO_NAMESPACE_NAME = `${imagereplicate.spec.toImage.registryName}(${imagereplicate.spec.toImage.registryNamespace})`;
  return (
    <TableRow id={imagereplicate.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={imagereplicate.metadata.name} namespace={imagereplicate.metadata.namespace} title={imagereplicate.metadata.uid} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={imagereplicate.metadata.namespace} title={imagereplicate.metadata.namespace} />
      </TableData>
      <TableData className={tableColumnClasses[2]}>
        <Status status={imagereplicate?.status?.state} />
      </TableData>
      {/* 소스 레지스트리 타입 */}
      <TableData className={tableColumnClasses[3]}>{imagereplicate.spec.fromImage.registryType}</TableData>
      {/* 소스 레지스트리 (네임스페이스/이름) */}
      <TableData className={tableColumnClasses[4]}>
        <ResourceLink kind={imagereplicate.spec.fromImage.registryType === 'HpcdRegistry' ? RegistryModel.kind : ExternalRegistryModel.kind} name={imagereplicate.spec.fromImage.registryName} displayName={FROM_NAMESPACE_NAME} namespace={imagereplicate.spec.fromImage.registryNamespace} />
      </TableData>
      {/* 타겟 레지스트리 타입 */}
      <TableData className={tableColumnClasses[5]}>{imagereplicate.spec.toImage.registryType}</TableData>
      {/* 타겟 레지스트리 (네임스페이스/이름) */}
      <TableData className={tableColumnClasses[6]}>
        <ResourceLink kind={imagereplicate.spec.toImage.registryType === 'HpcdRegistry' ? RegistryModel.kind : ExternalRegistryModel.kind} name={imagereplicate.spec.toImage.registryName} displayName={TO_NAMESPACE_NAME} namespace={imagereplicate.spec.toImage.registryNamespace} />
      </TableData>
      <TableData className={tableColumnClasses[7]}>
        <Timestamp timestamp={imagereplicate.metadata.creationTimestamp} />
      </TableData>
      <TableData className={tableColumnClasses[8]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={imagereplicate} />
      </TableData>
    </TableRow>
  );
};

export const ImageReplicateStatus: React.FC<ImageReplicateStatusStatusProps> = ({ result }) => <Status status={result} />;

export const ImageReplicateImageTable: React.FC<ResourcesProps> = ({ ds }) => {
  const { t } = useTranslation();

  const rows = (
    <div className="row">
      <div className="col-xs-6 col-sm-4 col-md-4">{ds.spec.fromImage.image}</div>
      <div className="col-xs-6 col-sm-4 col-md-4">{ds.spec.toImage.image}</div>
    </div>
  );

  return (
    <div className="co-m-table-grid co-m-table-grid--bordered">
      <div className="row co-m-table-grid__head">
        <div className="col-xs-6 col-sm-4 col-md-4">{t('COMMON:MSG_DETAILS_TABDETAILS_11')}</div>
        <div className="col-xs-6 col-sm-4 col-md-4">{t('COMMON:MSG_DETAILS_TABDETAILS_13')}</div>
      </div>
      <div className="co-m-table-grid__body">{rows}</div>
    </div>
  );
};

export type ResourcesProps = {
  ds: any;
};

export const ImageReplicateDetailsList: React.FC<ImageReplicateDetailsListProps> = ({ ds }) => {
  const { t } = useTranslation();
  let FROM_NAMESPACE_NAME = `${ds.spec.fromImage.registryName}(${ds.spec.fromImage.registryNamespace})`;
  let TO_NAMESPACE_NAME = `${ds.spec.toImage.registryName}(${ds.spec.toImage.registryNamespace})`;
  let isSigner = ds.spec?.signer;

  return (
    <dl className="co-m-pane__details">
      {/* 상태 */}
      <dt>{t('COMMON:MSG_MAIN_TABLEHEADER_3')}</dt>
      <dd>
        <ImageReplicateStatus result={ds?.status?.state} />
      </dd>
      {/* 소스 레지스트리 타입 */}
      <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_49')}</dt>
      <dd style={{ display: 'flex', flexDirection: 'column' }}>{ds.spec.fromImage.registryType}</dd>
      {/* 소스 레지스트리 (네임스페이스/이름) */}
      <dt>{t('COMMON:MSG_MAIN_TABLEHEADER_89')}</dt>
      <dd style={{ display: 'flex', flexDirection: 'column' }}>{<ResourceLink kind={ds.spec.fromImage.registryType === 'HpcdRegistry' ? RegistryModel.kind : ExternalRegistryModel.kind} name={ds.spec.fromImage.registryName} displayName={FROM_NAMESPACE_NAME} title={FROM_NAMESPACE_NAME} namespace={ds.spec.fromImage.registryNamespace} />}</dd>
      {/* 타겟 레지스트리 타입 */}
      <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_51')}</dt>
      <dd style={{ display: 'flex', flexDirection: 'column' }}>{ds.spec.toImage.registryType}</dd>
      {/* 타겟 레지스트리 (네임스페이스/이름) */}
      <dt>{t('COMMON:MSG_MAIN_TABLEHEADER_90')}</dt>
      <dd style={{ display: 'flex', flexDirection: 'column' }}>
        <ResourceLink kind={ds.spec.toImage.registryType === 'HpcdRegistry' ? RegistryModel.kind : ExternalRegistryModel.kind} name={ds.spec.toImage.registryName} displayName={TO_NAMESPACE_NAME} title={TO_NAMESPACE_NAME} namespace={ds.spec.toImage.registryNamespace} />
      </dd>
      {/* 서명자 */}
      {isSigner && (
        <>
          <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_SIGNERS_1')}</dt>
          <dd style={{ display: 'flex', flexDirection: 'column' }}>{ds.spec?.signer}</dd>
        </>
      )}
    </dl>
  );
};

const ImageReplicateDetails: React.FC<ImageReplicateDetailsProps> = ({ obj: imagereplicate }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(imagereplicate, t) })} />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={imagereplicate} />
          </div>
          <div className="col-lg-6">
            <ImageReplicateDetailsList ds={imagereplicate} />
          </div>
        </div>
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text={`${t('COMMON:MSG_DETAILS_TABDETAILS_5')}`} />
        <ImageReplicateImageTable ds={imagereplicate} />
      </div>
    </>
  );
};

const { details, editResource } = navFactory;

ImageReplicateTableHeader.displayName = 'ImageReplicateTableHeader';

export const ImageReplicates: React.FC = props => {
  const { t } = useTranslation();

  return <Table {...props} aria-label="ImageReplicates" Header={ImageReplicateTableHeader.bind(null, t)} Row={ImageReplicateTableRow} virtualize />;
};

export const ImageReplicatesPage: React.FC<ImageReplicatesPageProps> = props => {
  const { t } = useTranslation();

  return <ListPage title={t('COMMON:MSG_LNB_MENU_93')} createButtonText={t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('COMMON:MSG_LNB_MENU_93') })} canCreate={true} ListComponent={ImageReplicates} kind={kind} {...props} />;
};

export const ImageReplicatesDetailsPage: React.FC<ImageReplicatesDetailsPageProps> = props => <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={[details(detailsPage(ImageReplicateDetails)), editResource()]} />;

type ImageReplicateDetailsListProps = {
  ds: K8sResourceKind;
};

type ImageReplicatesPageProps = {
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
};

type ImageReplicateDetailsProps = {
  obj: K8sResourceKind;
};

type ImageReplicatesDetailsPageProps = {
  match: any;
};
type ImageReplicateStatusStatusProps = {
  result: string;
};
