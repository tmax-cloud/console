import * as _ from 'lodash';
import * as React from 'react';
import * as classNames from 'classnames';
import * as fuzzy from 'fuzzysearch';
import { Button, Dropdown, DropdownToggle, DropdownItem, TextInput } from '@patternfly/react-core';
import { EmptyBox, SectionHeading /*Kebab,*/ } from '../utils';
import { Table, TableHeader, TableBody, sortable, SortByDirection, IRow } from '@patternfly/react-table';
import { CaretDownIcon, UsersIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { getId, getUserGroup } from '../../hypercloud/auth';
import { coFetchJSON } from '../../co-fetch';

const ownerData = (owner, t?: TFunction) => [
  {
    cells: [`${owner.MemberName} (${t('MULTI:MSG_MULTI_CLUSTERS_MAILFORM_7')})`, owner.MemberId, 'admin'],
    obj: owner,
  },
];

const tableColumnClasses = ['', '', classNames('pf-m-hidden', 'pf-m-visible-on-sm', 'pf-u-w-16-on-lg') /*Kebab.columnClass*/];

const MemberTableRows = (members): ITableRow[] => {
  const data = [];
  _.forEach(members, member => {
    const memberName = !!member.MemberName ? member.MemberName : member.MemberId?.split('@')[0];
    data.push({
      cells: [
        member.Attribute === 'user' ? (
          memberName
        ) : (
          <>
            <UsersIcon className="hc-member__group-icon" />
            {memberName}
          </>
        ),
        member.MemberId,
        member.Status === 'pending' ? `${member.Role}(수락 대기)` : member.Role,
      ],
      obj: member,
    });
  });
  return data;
};

const MemberTableHeader = (t?: TFunction) => {
  return [
    {
      title: t('COMMON:MSG_DETAILS_TABACCESSPERMISSIONS_TABLEHEADER_2'),
      transforms: [sortable],
      props: { className: tableColumnClasses[0] },
      data: 'MemberName',
    },
    {
      title: t('COMMON:MSG_DETAILS_TABACCESSPERMISSIONS_TABLEHEADER_1'),
      transforms: [sortable],
      props: { className: tableColumnClasses[1] },
      data: 'MemberId',
    },
    {
      title: t('COMMON:MSG_DETAILS_TABACCESSPERMISSIONS_TABLEHEADER_3'),
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
      data: 'Role',
    },
    /* {
      title: '',
      props: { className: tableColumnClasses[3] },
    }, */
  ];
};
MemberTableHeader.displayName = 'UserTableHeader';

export const UsersTable = props => {
  const { isOwner, owner, members, heading, searchType, searchKey, rerenderPage } = props;

  const { t } = useTranslation();
  const ownerRow = owner ? ownerData.bind(null, owner, t)() : [];

  const [rows, setRows] = React.useState([]);
  const [sortBy, setSortBy] = React.useState({ index: 0, sortField: 'MemberName', direction: SortByDirection.asc });
  const [filteredRows, setFilteredRows] = React.useState([]);

  const sortRows = ({ sortField, direction }, rows) => {
    const sortedRows = rows.sort((a, b) => {
      const compA = typeof a.obj[sortField] === 'string' ? (a.obj[sortField] as string).toLowerCase() : a.obj[sortField],
        compB = typeof b.obj[sortField] === 'string' ? (b.obj[sortField] as string).toLowerCase() : b.obj[sortField];
      return compA < compB ? -1 : compA > compB ? 1 : 0;
    });

    setRows(direction === SortByDirection.asc ? _.concat(ownerRow, sortedRows) : _.concat(ownerRow, sortedRows.reverse()));
  };

  React.useEffect(() => {
    sortRows(sortBy, MemberTableRows(members));
  }, [members]);

  React.useEffect(() => {
    const filteredResult = rows.filter(row => fuzzy(_.toLower(searchKey), _.toLower(row.obj[searchType])));
    setFilteredRows(filteredResult);
  }, [rows, searchType, searchKey]);

  const onSort = (_event, index, direction, extraData) => {
    const sortField = extraData.column.data;
    sortRows({ sortField, direction }, rows.slice(1));
    setSortBy({
      index,
      sortField,
      direction,
    });
  };

  const actionResolver = (t: TFunction, rowData, { rowIndex }) => {
    if (rowData.obj.Status === 'owner' || rowData.obj.Status === 'pending') {
      return null;
    }

    return [
      {
        title: t('COMMON:MSG_DETAILS_TABACCESSPERMISSIONS_ACTIONBUTTON_1'),
        onClick: (event, rowId, rowData, extra) => {
          modifyMemberModal({ modalClassName: 'modal-lg', member: rowData.obj, rerenderPage: rerenderPage });
        },
      },
      {
        title: t('COMMON:MSG_DETAILS_TABACCESSPERMISSIONS_ACTIONBUTTON_2'),
        onClick: (event, rowId, rowData, extra) => {
          removeMemberModal({ modalClassName: 'modal-lg', member: rowData.obj, rerenderPage: rerenderPage });
        },
      },
    ];
  };

  return (
    <div className="hc-members__users">
      {heading && <SectionHeading text={heading} />}
      {_.isEmpty(filteredRows) ? (
        <EmptyBox label="Users" />
      ) : (
        <Table aria-label="Users" sortBy={sortBy} onSort={onSort} cells={MemberTableHeader.bind(null, t)()} rows={filteredRows} actionResolver={isOwner ? actionResolver.bind(null, t) : null}>
          <TableHeader />
          <TableBody />
        </Table>
      )}
    </div>
  );
};

export const inviteMemberModal = props => import('./modals/invite-member-modal' /* webpackChunkName: "members-modal" */).then(m => m.inviteMemberModal(props));

export const modifyMemberModal = props => import('./modals/modify-member-modal' /* webpackChunkName: "modify-member-modal" */).then(m => m.modifyMemberModal(props));

export const removeMemberModal = props => import('./modals/remove-member-modal' /* webpackChunkName: "remove-member-modal" */).then(m => m.removeMemberModal(props));

export const MembersPage = props => {
  const defaultOwnerData = {
    Cluster: props.clusterName,
    MemberId: props.owner,
    MemberName: '',
    Attribute: 'user',
    Role: 'admin',
    Status: 'owner',
  };

  const [owner, setOwner] = React.useState(defaultOwnerData);
  const [members, setMembers] = React.useState([]);
  const [searchType, setSearchType] = React.useState('MemberName');
  const [searchKey, setSearchKey] = React.useState('');
  const [isOpen, setOpen] = React.useState(false);
  const [shouldRerender, setShouldRerender] = React.useState(false);

  const onToggle = (open: boolean) => setOpen(open);
  const onSelect = event => {
    const selectedName = event.currentTarget.id;
    setSearchType(selectedName);
    setSearchKey('');
    setOpen(!isOpen);
  };
  const handleTextInputChange = value => {
    setSearchKey(value);
  };

  const dropdownItems = (t?: TFunction) => [
    <DropdownItem key="name" id="MemberName" component="button">
      {t('Name')}
    </DropdownItem>,
    <DropdownItem key="email" id="MemberId" component="button">
      {t('Email')}
    </DropdownItem>,
  ];

  React.useEffect(() => {
    shouldRerender === true && setShouldRerender(false);
    coFetchJSON(`/api/multi-hypercloud/namespaces/${props.namespace}/clustermanagers/${props.clusterName}/member?userId=${getId()}${getUserGroup()}`, 'GET')
      .then(res => {
        let idx = _.findIndex(res, (mem: RowMemberData) => mem.Status === 'owner');
        idx >= 0 && setOwner(res[idx]);
        res.splice(idx, 1);
        setMembers(res);
      })
      .catch(err => {
        console.log('Fail to get member list. ' + err);
      });
  }, [shouldRerender]);

  const isOwner = props.owner === getId();
  const { t } = useTranslation();
  return (
    <>
      <div className="hc-members__header">
        <Dropdown
          onSelect={onSelect}
          toggle={
            <DropdownToggle id="toggle-id" onToggle={onToggle} iconComponent={CaretDownIcon}>
              {searchType === 'MemberId' ? t('Email') : t('Name')}
            </DropdownToggle>
          }
          isOpen={isOpen}
          dropdownItems={dropdownItems.bind(null, t)()}
        />
        <TextInput className="hc-members__search" value={searchKey} onChange={handleTextInputChange} placeholder={searchType === 'MemberId' ? t('search by email') : t('search by name')}></TextInput>
        {isOwner && (
          <div className="co-m-primary-action">
            <Button variant="primary" id="yaml-create" onClick={() => inviteMemberModal({ namespace: props.namespace, clusterName: props.clusterName, modalClassName: 'hc-invite-modal__container', existMembers: members, rerenderPage: setShouldRerender })}>
              {t('MULTI:MSG_MULTI_CLUSTERS_INVITEPEOPLEPOPUP_BUTTON_1')}
            </Button>
          </div>
        )}
      </div>
      <div className="hc-members__body">
        <UsersTable clusterName={props.clusterName} isOwner={isOwner} owner={owner} members={members} searchType={searchType} searchKey={searchKey} rerenderPage={setShouldRerender} />
      </div>
    </>
  );
};

export type RowMemberData = {
  Id?: number;
  Namespace?: string;
  Cluster?: string;
  MemberId: string;
  MemberName: string;
  Attribute: 'group' | 'user';
  Role: 'guest' | 'developer' | 'admin';
  Status?: 'invited' | 'owner';
  CreatedTime?: string;
  UpdatedTime?: string;
};

export interface ITableRow extends IRow {
  obj: RowMemberData;
}
