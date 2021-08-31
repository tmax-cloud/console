import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
import { Tooltip, Popover } from '@patternfly/react-core';
// import { Link, withRouter } from 'react-router-dom';

import { DetailsPage, ListPage, Table, TableRow, TableData, RowFunction } from '../factory';
import { Kebab, detailsPage, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading } from '../utils';
import { TFApplyClaimModel } from '../../models';
import { Status } from '@console/shared';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { Dropdown } from '../utils';
import { K8sResourceKind } from '@console/internal/module/k8s';
import { TerraformClaimStatusReducer } from '@console/dev-console/src/utils/hc-status-reducers';

import './terraform-apply-claim.scss';

import '../../../packages/dev-console/src/components/pipelineruns/detail-page-tabs/PipelineRunLogs.scss';
import '../../../packages/dev-console/src/components/pipelineruns/logs/MultiStreamLogs.scss';

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
      title: 'Git URL',
      sortField: 'spec.url',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
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

const setClaimStatus = status => {
  let menuActions;
  switch (status) {
    case 'Approved':
      menuActions = [...Kebab.getExtensionsActionsForKind(TFApplyClaimModel), ...Kebab.factory.common, Kebab.factory.TerraformPlan, Kebab.factory.TerraformApply];
      break;
    case 'Awaiting':
      menuActions = [...Kebab.getExtensionsActionsForKind(TFApplyClaimModel), ...Kebab.factory.common, Kebab.factory.ModifyStatus];
      break;
    case 'Planned':
      menuActions = [...Kebab.getExtensionsActionsForKind(TFApplyClaimModel), ...Kebab.factory.common, Kebab.factory.TerraformApply];
      break;
    case 'Applied':
      menuActions = [...Kebab.getExtensionsActionsForKind(TFApplyClaimModel), ...Kebab.factory.common, Kebab.factory.TerraformDestroy];
      break;
    case 'Rejected':
      menuActions = [...Kebab.getExtensionsActionsForKind(TFApplyClaimModel), ...Kebab.factory.common, Kebab.factory.ModifyStatus];
      break;
    default:
      menuActions = [...Kebab.getExtensionsActionsForKind(TFApplyClaimModel), ...Kebab.factory.common];
  }
  return menuActions;
};

const TFApplyClaimTableRow: RowFunction<K8sResourceKind> = ({ obj: tfapplyclaim, index, key, style }) => {
  let menuActions = setClaimStatus(tfapplyclaim.status?.phase);
  return (
    <TableRow id={tfapplyclaim.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={tfapplyclaim.metadata.name} namespace={tfapplyclaim.metadata.namespace} title={tfapplyclaim.metadata.uid} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={tfapplyclaim.metadata.namespace} title={tfapplyclaim.metadata.namespace} />
      </TableData>
      <TableData className={tableColumnClasses[2]}> {tfapplyclaim.spec?.url}</TableData>
      <TableData className={tableColumnClasses[3]}>
        {tfapplyclaim?.status?.phase === 'Error' ? (
          <Popover headerContent={<div>에러 상세</div>} bodyContent={<div>{tfapplyclaim.status?.reason}</div>} maxWidth="30rem" position="right">
            <Status status={tfapplyclaim?.status?.phase} />
          </Popover>
        ) : (
          <Status status={tfapplyclaim?.status?.phase} />
        )}
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

export const TFApplyClaimStatus: React.FC<TFApplyClaimStatusStatusProps> = ({ result }) => <Status status={TerraformClaimStatusReducer(result)} />;

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
        <TFApplyClaimStatus result={ds} />
      </dd>
      <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_68')}</dt>
      <dd style={{ display: 'flex', flexDirection: 'column' }}>{ds.spec?.version}</dd>
      <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_69')}</dt>
      <dd style={{ display: 'flex', flexDirection: 'column' }}>
        <a href={ds.spec?.url}>{ds.spec?.url}</a>
      </dd>
      <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_70')}</dt>
      <dd style={{ display: 'flex', flexDirection: 'column' }}>{ds.spec?.secret}</dd>
      {ds.spec?.branch && (
        <>
          <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_71')}</dt>
          <dd style={{ display: 'flex', flexDirection: 'column' }}>{ds.spec?.branch}</dd>
        </>
      )}
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

const { details, editResource } = navFactory;

TFApplyClaimTableHeader.displayName = 'TfApplyClaimTableHeader';

export const TFApplyClaims: React.FC = props => {
  const { t } = useTranslation();

  return <Table {...props} aria-label="TFApplyClaims" Header={TFApplyClaimTableHeader.bind(null, t)} Row={TFApplyClaimTableRow} virtualize />;
};

export const TFApplyClaimsPage: React.FC<TFApplyClaimsPageProps> = props => {
  const { t } = useTranslation();

  return <ListPage title={t('COMMON:MSG_LNB_MENU_201')} createButtonText={t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('COMMON:MSG_LNB_MENU_201') })} canCreate={true} ListComponent={TFApplyClaims} kind={kind} {...props} />;
};

type TFLogsProps = {
  obj: any;
  match?: any;
};

const Convert = require('ansi-to-html');
const convert = new Convert();

const SimpleLogs = ({ content }) => {
  let innerContent;
  const { t } = useTranslation();

  if (content) {
    innerContent = <div className="tfac-logs__text-padding" dangerouslySetInnerHTML={{ __html: convert.toHtml(content) }}></div>;
  } else {
    innerContent = <div className="tfac-logs__not-found">{t('No Logs Found')}</div>;
  }

  return (
    <div className="odc-multi-stream-logs">
      <div className="odc-multi-stream-logs__container">
        <div className="odc-multi-stream-logs__container__logs">{innerContent}</div>
      </div>
    </div>
  );
};
export type HCK8sResourceKind = K8sResourceKind & {
  fakeMetadata?: any;
};

const GitInfo = ({ status: { url, commit }, spec: { branch } }) => {
  const { t } = useTranslation();
  return (
    <div>
      <div style={{ display: 'flex' }}>
        <span>{t('MULTI:MSG_MULTI_TERRAFORMCLAMS_TABLOGS_TABAPPLY_3', { 0: url })}</span>
      </div>
      {branch && (
        <div style={{ display: 'flex' }}>
          <span>{t('MULTI:MSG_MULTI_TERRAFORMCLAMS_TABLOGS_TABAPPLY_4', { 0: branch })}</span>
        </div>
      )}
      <div style={{ display: 'flex' }}>
        <span>{t('MULTI:MSG_MULTI_TERRAFORMCLAMS_TABLOGS_TABAPPLY_5', { 0: commit })}</span>
      </div>
    </div>
  );
};

const TFApplyLog: React.FC<TFLogsProps> = React.memo(({ obj }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="tfac-logs__contents__extra-space">
        <div className="tfac-logs__contents__extra-space__key">
          <span>{t('MULTI:MSG_MULTI_TERRAFORMCLAMS_TABLOGS_TABAPPLY_1')}</span>
        </div>
        <Tooltip content={GitInfo(obj)} maxWidth="30rem" position="top">
          <span>{obj.status?.commit}</span>
        </Tooltip>
      </div>
      <div className="tfac-logs__contents__rawlogs">
        <SimpleLogs content={obj.status?.apply} />
      </div>
    </>
  );
});

const TFPlanLogs: React.FC<TFLogsProps> = React.memo(props => {
  const [selectedItem, setSelectedItem] = React.useState(0);
  const { t } = useTranslation();

  const __setSelectedItem = (i: React.SetStateAction<number>) => {
    return setSelectedItem(i);
  };

  let items: any;
  if (props.obj.status?.plans) {
    items = Object.assign(
      {},
      props.obj.status?.plans.map((item: { lastexectiontime: any }) => item.lastexectiontime),
    );
  }

  return (
    <>
      <div className="tfac-logs__contents__extra-space">
        <div className="tfac-logs__contents__extra-space__key">
          <span>{t('MULTI:MSG_MULTI_TERRAFORMCLAMS_TABLOGS_TABPLAN_1')}</span>
        </div>
        {items && <Dropdown items={items} onChange={__setSelectedItem} selectedKey={selectedItem} />}
      </div>
      <div className="tfac-logs__contents__rawlogs">
        <SimpleLogs key={selectedItem} content={props.obj.status?.plans?.[selectedItem]?.log} />
      </div>
    </>
  );
});

const TFDestroyLogs: React.FC<TFLogsProps> = React.memo(({ obj }) => {
  return (
    <>
      <div className="tfac-logs__contents__extra-space"></div>
      <div className="tfac-logs__contents__rawlogs">
        <SimpleLogs content={obj.status?.destroy} />
      </div>
    </>
  );
});
const TFLogs: React.FC<TFLogsProps> = ({ obj, match }) => {
  const { t } = useTranslation();
  let logs = [{ Planned: 'MSG_COMMON_STATUS_25' }, { Applied: 'MSG_COMMON_STATUS_26' }, { Destroyed: 'MSG_COMMON_STATUS_27' }];
  const selectedLogFunc = ({ phase, prephase }) => {
    if (phase === 'Planned' || phase === 'Applied' || phase === 'Destroyed') {
      return phase;
    } else if (prephase === 'Awaiting') {
      return 'Planned';
    } else {
      return prephase || 'Planned';
    }
  };
  const [selectedLog, setSelectedLog] = React.useState(selectedLogFunc(obj.status));

  const onClickItem = e => {
    let target = e.target.closest('li');
    setSelectedLog(target.dataset.item);
  };
  let component;
  switch (selectedLog) {
    case 'Applied':
      component = <TFApplyLog obj={obj} />;
      break;
    case 'Destroyed':
      component = <TFDestroyLogs obj={obj} />;
      break;
    case 'Planned':
      component = <TFPlanLogs obj={obj} />;
      break;
  }

  return (
    <>
      <div className="tfac-logs">
        <ul className="tfac-logs__vertical-nav">
          {logs.map((cur, idx) => (
            <li className={classNames({ 'tfac-logs__vertical-nav__item-selected': selectedLog === Object.keys(cur)[0], 'tfac-logs__vertical-nav__item': true })} key={idx} data-item={Object.keys(cur)[0]} onClick={onClickItem}>
              <span className={classNames({ ['tfac-logs__vertical-nav__item__font']: selectedLog === Object.keys(cur)[0] })}>{t(`COMMON:${Object.values(cur)[0]}`)}</span>
            </li>
          ))}
        </ul>
        <div className="tfac-logs__contents">{component}</div>
      </div>
    </>
  );
};

const ResourceStatus = props => {
  const { added, updated, deleted } = props || {};
  return (
    <div>
      <div style={{ display: 'flex' }}>
        <span>{`${added || '0'}  Added`}</span>
      </div>
      <div style={{ display: 'flex' }}>
        <span>{`${updated || '0'}  Updated`}</span>
      </div>
      <div style={{ display: 'flex' }}>
        <span>{`${deleted || '0'}  Deleted`}</span>
      </div>
    </div>
  );
};

const TFStatusLogs: React.FC<TFLogsProps> = React.memo(({ obj }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="tfac-logs__extra-space">
        <div className="tfac-logs__status__spec">
          <div className="tfac-logs__status__spec__title">{t('MULTI:MSG_MULTI_TERRAFORMCLAMS_TABRESOURCESTATUS_1')}</div>
          <Tooltip content={ResourceStatus(obj.status?.resource)} maxWidth="30rem" position="top">
            <div className="tfac-logs__status__spec__num">
              <span style={{ color: 'green' }}>+{obj.status?.resource?.added || 0}</span>
              <span style={{ color: 'blue' }}>~{obj.status?.resource?.updated || 0}</span>
              <span style={{ color: 'red' }}>-{obj.status?.resource?.deleted || 0}</span>
            </div>
          </Tooltip>
        </div>
      </div>
      <div className="tfac-logs__status">
        <SimpleLogs content={obj.status?.state} />
      </div>
    </>
  );
});

export const TFApplyClaimsDetailsPage: React.FC<TFApplyClaimsDetailsPageProps> = props => {
  const { t } = useTranslation();
  const [status, setStatus] = React.useState();
  let menuActions = setClaimStatus(status);

  return (
    <DetailsPage
      {...props}
      kind={kind}
      menuActions={menuActions}
      setCustomState={setStatus}
      customStatePath="status.phase"
      pages={[
        details(detailsPage(TFApplyClaimDetails)),
        editResource(),
        {
          href: 'logs',
          name: t('COMMON:MSG_DETAILS_TABLOGS_8'),
          component: TFLogs,
        },
        {
          href: 'state',
          name: t('COMMON:MSG_DETAILS_TAB_17'),
          component: TFStatusLogs,
        },
      ]}
    />
  );
};

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
  result: any;
};
