import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';

import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage, Table, TableRow, TableData, RowFunction } from '../factory';
import { Kebab, KebabAction, detailsPage, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading } from '../utils';
import { TFApplyClaimModel } from '../../models';
import { Status } from '@console/shared';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { Dropdown } from '../utils';

// import './IR.scss';
import './terraform-apply-claim.scss';
// import { MultiStreamLogs } from './test-PipelineRunDetailsPage';

import '../../../packages/dev-console/src/components/pipelineruns/detail-page-tabs/PipelineRunLogs.scss';
import '../../../packages/dev-console/src/components/pipelineruns/logs/MultiStreamLogs.scss';

export const menuActions: KebabAction[] = [...Kebab.getExtensionsActionsForKind(TFApplyClaimModel), ...Kebab.factory.common];

const kind = TFApplyClaimModel.kind;
const tableColumnClasses = ['', '', '', classNames('pf-m-hidden', 'pf-m-visible-on-lg', 'IR__button'), classNames('pf-m-hidden', 'pf-m-visible-on-lg', 'IR__button'), classNames('pf-m-hidden', 'pf-m-visible-on-lg', 'IR__button'), Kebab.columnClass];

const TFApplyClaimTableHeader = (t?: TFunction) => {
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
      title: t('저장소'),
      sortField: 'spec.url',
      transforms: [sortable],
      props: { classname: tableColumnClasses[2] },
    },

    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_3'),
      sortField: 'status.phase',
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_57'),
      sortField: 'metadata.annotations.creator',
      transforms: [sortable],
      props: { className: tableColumnClasses[4] },
    },
    {
      title: t('COMMON:MSG_COMMON_TABLEHEADER_4'),
      sortField: 'metadata.annotations.createdTime',
      transforms: [sortable],
      props: { className: tableColumnClasses[5] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[6] },
    },
  ];
};

const TFApplyClaimTableRow: RowFunction<K8sResourceKind> = ({ obj: tfapplyclaim, index, key, style }) => {
  return (
    <TableRow id={tfapplyclaim.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={tfapplyclaim.metadata.name} namespace={tfapplyclaim.metadata.namespace} title={tfapplyclaim.metadata.uid} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={tfapplyclaim.metadata.namespace} title={tfapplyclaim.metadata.namespace} />
      </TableData>
      <TableData className={tableColumnClasses[2]}> {tfapplyclaim.spec.url}</TableData>
      <TableData className={tableColumnClasses[3]}>
        <Status status={tfapplyclaim?.status?.phase} />
      </TableData>
      <TableData className={tableColumnClasses[4]}>{tfapplyclaim.metadata.annotations.creator}</TableData>

      <TableData className={tableColumnClasses[5]}>
        <Timestamp timestamp={tfapplyclaim.metadata.annotations.createdTime} />
      </TableData>
      <TableData className={tableColumnClasses[6]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={tfapplyclaim} />
      </TableData>
    </TableRow>
  );
};

export const TFApplyClaimStatus: React.FC<TFApplyClaimStatusStatusProps> = ({ result }) => <Status status={result} />;

export type ResourcesProps = {
  ds: any;
};

export const TFApplyClaimDetailsList: React.FC<TFApplyClaimDetailsListProps> = ({ ds }) => {
  const { t } = useTranslation();

  return (
    <dl className="co-m-pane__details">
      {/* 상태 */}
      <dt>{t('COMMON:MSG_MAIN_TABLEHEADER_3')}</dt>
      <dd>
        <TFApplyClaimStatus result={ds?.status?.phase} />
      </dd>
      <dt>{t('테라폼 버전')}</dt>
      <dd style={{ display: 'flex', flexDirection: 'column' }}>{ds.spec.version}</dd>
      <dt>{t('저장소 주소')}</dt>
      <dd style={{ display: 'flex', flexDirection: 'column' }}>
        <a href={ds.spec.url}>{ds.spec.url}</a>
      </dd>
      <dt>{t('계정 시크릿')}</dt>
      <dd style={{ display: 'flex', flexDirection: 'column' }}>{ds.spec.secret}</dd>
    </dl>
  );
};

const TFApplyClaimDetails: React.FC<TFApplyClaimDetailsProps> = ({ obj: tfapplyclaim }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(tfapplyclaim, t) })} />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={tfapplyclaim} />
          </div>
          <div className="col-lg-6">
            <TFApplyClaimDetailsList ds={tfapplyclaim} />
          </div>
        </div>
      </div>
    </>
  );
};

const { details, editYaml } = navFactory;

TFApplyClaimTableHeader.displayName = 'TfApplyClaimTableHeader';

export const TFApplyClaims: React.FC = props => {
  const { t } = useTranslation();

  return <Table {...props} aria-label="TFApplyClaims" Header={TFApplyClaimTableHeader.bind(null, t)} Row={TFApplyClaimTableRow} virtualize />;
};

export const TFApplyClaimsPage: React.FC<TFApplyClaimsPageProps> = props => {
  const { t } = useTranslation();

  return <ListPage title={t('테라폼 클레임')} createButtonText={t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('테라폼 클레임') })} canCreate={true} ListComponent={TFApplyClaims} kind={kind} {...props} />;
};

type TFLogsProps = {
  obj: any;
};

const MultiStreamLogs = ({ children }) => {
  let content;
  const { t } = useTranslation();
  if (children) {
    content = <div className="tfac-logs__text-padding">{children}</div>;
  } else {
    content = <div className="tfac-logs__not-found">{t('No Logs Found')}</div>;
  }
  return (
    <div className="odc-multi-stream-logs">
      <div className="odc-multi-stream-logs__container">
        <div className="odc-multi-stream-logs__container__logs">{content}</div>
      </div>
    </div>
  );
};
export type HCK8sResourceKind = K8sResourceKind & {
  fakeMetadata?: any;
};
const TFApplyLogs: React.FC<TFLogsProps> = props => {
  return (
    <>
      <div className="tfac-logs__extra-space">{props.obj.status.commit}</div>
      <div className="tfac-logs__rawlogs">
        <MultiStreamLogs>
          <div>{props.obj.status.apply}</div>
        </MultiStreamLogs>
      </div>
    </>
  );
};

const TFPlanLogs: React.FC<TFLogsProps> = React.memo(props => {
  const [selectedItem, setSelectedItem] = React.useState(0);

  const __setSelectedItem = (i: React.SetStateAction<number>) => {
    return setSelectedItem(i);
  };

  let items: any;
  if (props.obj.status.plans) {
    items = Object.assign(
      {},
      props.obj.status.plans.map((item: { lastexectiontime: any }) => item.lastexectiontime),
    );
  }

  return (
    <>
      <div className="tfac-logs__extra-space">{items && <Dropdown items={items} onChange={__setSelectedItem} selectedKey={selectedItem} />}</div>
      <div className="tfac-logs__rawlogs">
        <MultiStreamLogs key={selectedItem}>{props.obj.status?.plans?.[selectedItem]?.log}</MultiStreamLogs>
      </div>
    </>
  );
});

const TFDestroyLogs: React.FC<TFLogsProps> = React.memo(({ obj }) => {
  return (
    <>
      <div className="tfac-logs__extra-space"></div>
      <div className="tfac-logs__rawlogs">
        <MultiStreamLogs>
          <div>{obj.status.destroy}</div>
        </MultiStreamLogs>
      </div>
    </>
  );
});

const TFStatusLogs: React.FC<TFLogsProps> = React.memo(({ obj }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="tfac-logs__extra-space"></div>
      <div className="tfac-logs__status">
        <MultiStreamLogs>
          <div>{obj.status.state}</div>
        </MultiStreamLogs>
        <div className="tfac-logs__status__spec">
          <div className="tfac-logs__status__spec__title">{t('변경 상태 내역')}</div>
          <div className="tfac-logs__status__spec__num">
            <span style={{ color: 'green' }}>+{obj.status.resource?.added || 0}</span>
            <span style={{ color: 'blue' }}>~{obj.status.resource?.updated || 0}</span>
            <span style={{ color: 'red' }}>-{obj.status.resource?.deleted || 0}</span>
          </div>
        </div>
      </div>
    </>
  );
});

export const TFApplyClaimsDetailsPage: React.FC<TFApplyClaimsDetailsPageProps> = props => (
  <DetailsPage
    {...props}
    kind={kind}
    menuActions={menuActions}
    pages={[
      details(detailsPage(TFApplyClaimDetails)),
      {
        href: 'plan',
        name: '플랜',
        component: TFPlanLogs,
      },
      {
        href: 'apply',
        name: '어플라이',
        component: TFApplyLogs,
      },
      {
        href: 'destroy',
        name: '디스트로이',
        component: TFDestroyLogs,
      },
      {
        href: 'state',
        name: '상태',
        component: TFStatusLogs,
      },
      editYaml(),
    ]}
  />
);

type TFApplyClaimDetailsListProps = {
  ds: K8sResourceKind;
};

type TFApplyClaimsPageProps = {
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
};

type TFApplyClaimDetailsProps = {
  obj: K8sResourceKind;
};

type TFApplyClaimsDetailsPageProps = {
  match: any;
};
type TFApplyClaimStatusStatusProps = {
  result: string;
};
