import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import { sortable, compoundExpand } from '@patternfly/react-table';

import { K8sResourceKind } from '../../module/k8s';
// import { DetailsPage, ListPage, Table, TableRow, TableData, RowFunction } from '../factory';
import { DetailsPage, ListPage, Table } from '../factory';
import { Kebab, KebabAction, detailsPage, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading } from '../utils';
import { SignerPolicyModel } from '../../models';
import { Status } from '@console/shared';
import { ImageSignersPage } from './image-signer';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { coFetchJSON } from '../../co-fetch';
import { ExpandableInnerTable } from './utils/expandable-inner-table';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';

export const menuActions: KebabAction[] = [...Kebab.getExtensionsActionsForKind(SignerPolicyModel), ...Kebab.factory.common];

const kind = SignerPolicyModel.kind;

const tableColumnClasses = ['', classNames('pf-m-hidden', 'pf-m-visible-on-sm', 'pf-u-w-16-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), Kebab.columnClass];

const SignerPolicyTableHeader = (t?: TFunction) => {
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
      title: t('COMMON:MSG_MAIN_TABLEHEADER_74'),
      sortField: 'status.imageSignResponse.result',
      transforms: [sortable],
      cellTransforms: [compoundExpand],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_12'),
      sortField: 'metadata.creationTimestamp',
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[4] },
    },
  ];
};

SignerPolicyTableHeader.displayName = 'SignerPolicyTableHeader';

// const SignerPolicyTableRow: RowFunction<K8sResourceKind> = ({ obj: signerpolicy, index, key, style }) => {
//   return (
//     <TableRow id={signerpolicy.metadata.uid} index={index} trKey={key} style={style}>
//       <TableData className={tableColumnClasses[0]}>
//         <ResourceLink kind={kind} name={signerpolicy.metadata.name} namespace={signerpolicy.metadata.namespace} title={signerpolicy.metadata.uid} />
//       </TableData>
//       <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
//         <ResourceLink kind="Namespace" name={signerpolicy.metadata.namespace} title={signerpolicy.metadata.namespace} />
//       </TableData>
//       <TableData className={tableColumnClasses[2]}>{signerpolicy?.spec?.signers?.length}</TableData>
//       <TableData className={tableColumnClasses[3]}>
//         <Timestamp timestamp={signerpolicy.metadata.creationTimestamp} />
//       </TableData>
//       <TableData className={tableColumnClasses[4]}>
//         <ResourceKebab actions={menuActions} kind={kind} resource={signerpolicy} />
//       </TableData>
//     </TableRow>
//   );
// };

export const SignerPolicyStatus: React.FC<SignerPolicyStatusStatusProps> = ({ result }) => <Status status={result} />;

const SignerPolicyDetails: React.FC<SignerPolicyDetailsProps> = ({ obj: signerpolicy }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(signerpolicy, t) })} />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={signerpolicy} />
          </div>
        </div>
      </div>
      <div className="co-m-pane__body" style={{ paddingLeft: '0px' }}>
        <ImageSignersPage isDetailPage={true} />
      </div>
    </>
  );
};

const { details, editResource } = navFactory;

const SignerTableHeader = [
  {
    title: '이름',
    transforms: [sortable],
  },
  {
    title: '소속',
    transforms: [sortable],
  },
  {
    title: '이메일',
    transforms: [sortable],
  },
  {
    title: '연락처',
    transforms: [sortable],
  },
];
const SignerTableRow = obj => {
  return [
    {
      title: <div>{obj.metadata?.name}</div>,
      textValue: obj.spec?.name,
    },
    {
      title: <div>{obj.spec?.team}</div>,
      textValue: obj.spec?.team,
    },
    {
      title: <div>{obj.spec?.email}</div>,
      textValue: obj.spec?.email,
    },
    {
      title: <div>{obj.spec?.phone}</div>,
      textValue: obj.spec?.phone,
    },
  ];
};
const rowRenderer = (obj, itemCount) => {
  return [
    {
      title: <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.uid} />,
      textValue: obj?.metadata?.name,
    },
    {
      title: <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />,
      textValue: obj?.metadata?.namespace,
    },
    {
      title: <a href="#">{obj?.spec?.signers?.length}</a>,
      props: {
        isOpen: false,
      },
      textValue: obj?.spec?.signers?.length,
    },
    {
      title: <Timestamp timestamp={obj.metadata.creationTimestamp} />,
      textValue: obj.metadata.creationTimestamp,
    },
    {
      title: <ResourceKebab actions={menuActions} kind={kind} resource={obj} />,
    },
  ];
};
const expandableRow = data => {
  const url = `/api/kubernetes/apis/tmax.io/v1/imagesigners`;
  return coFetchJSON(url).then(innerRes => {
    const preDataResult = data.reduce((preData, item, index) => {
      const innerItemsDataResult = innerRes.items.reduce((innerItemsData, innerItem) => {
        _.forEach(item.spec?.signers, signer => {
          innerItemsData.push(innerItem);
        });
        return innerItemsData;
      }, []);
      if (innerItemsDataResult.length > 0) {
        preData.push({
          isOpen: false,
          cells: rowRenderer(item, innerItemsDataResult.length),
        });
        let parentValue = index * 2;
        preData.push({
          parent: parentValue,
          compoundParent: 2,
          cells: [
            {
              title: <ExpandableInnerTable aria-label="Singer Table" header={SignerTableHeader} Row={SignerTableRow} data={innerItemsDataResult}></ExpandableInnerTable>,
              props: { colSpan: 5, className: 'pf-m-no-padding' },
            },
          ],
        });
      } else {
        preData.push({
          isOpen: false,
          cells: rowRenderer(item, innerItemsDataResult.length),
        });
        let parentValue = index * 2;
        preData.push({
          parent: parentValue,
          compoundParent: 2,
          cells: [
            {
              title: <div>No data</div>,
              props: { colSpan: 5, className: 'pf-m-no-padding' },
            },
          ],
        });
      }
      return preData;
    }, []);
    return preDataResult;
  });
};
export const SignerPolicies: React.FC<SignerPoliciesProps> = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="SignerPolicies" Header={SignerPolicyTableHeader.bind(null, t)} virtualize={false} expandable={true} expandableRows={expandableRow} />;
};

type SignerPoliciesProps = {
  data: any[];
};

export const SignerPoliciesPage: React.FC<SignerPoliciesPageProps> = props => {
  const { t } = useTranslation();

  return <ListPage title={t('COMMON:MSG_LNB_MENU_96')} createButtonText={t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('COMMON:MSG_LNB_MENU_96') })} canCreate={true} ListComponent={SignerPolicies} kind={kind} {...props} />;
};

export const SignerPoliciesDetailsPage: React.FC<SignerPoliciesDetailsPageProps> = props => <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={[details(detailsPage(SignerPolicyDetails)), editResource()]} />;

type SignerPoliciesPageProps = {
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
};

type SignerPolicyDetailsProps = {
  obj: K8sResourceKind;
};

type SignerPoliciesDetailsPageProps = {
  match: any;
};
type SignerPolicyStatusStatusProps = {
  result: string;
};
