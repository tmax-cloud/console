import * as React from 'react';
import * as _ from 'lodash-es';
import * as classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { sortable, compoundExpand } from '@patternfly/react-table';
import { SectionHeading, Timestamp, detailsPage, navFactory, Kebab, KebabOption, KebabAction, ResourceLink } from '@console/internal/components/utils';
import { DetailsPage, ListPage, DetailsPageProps, Table } from '../factory';
import { deleteModal, helmrepositoryUpdateModal } from '../modals';
import { TFunction } from 'i18next';
import { ExpandableInnerTable } from './utils/expandable-inner-table';
import { HelmRepositoryModel, HelmChartModel } from '@console/internal/models/hypercloud/helm-model';
import { helmAPI } from '@console/internal/actions/utils/nonk8s-utils';
import { ChartListPage } from './helmchart';

const kind = HelmRepositoryModel.kind;

type HelmrepositoryPageProps = {
  match?: any;
};
export const HelmrepositoryPage: React.FC<HelmrepositoryPageProps> = props => {
  return <ListPage {...props} canCreate={true} ListComponent={HelmRepositoriesList} kind={kind} createProps={{ to: '/helmrepositories/~new', items: [] }} hideLabelFilter={true} customData={{ nonK8sResource: true, kindObj: HelmRepositoryModel }} isK8sResource={false} />;
};

const tableColumnClasses = [
  '', // name
  '', // url
  classNames('pf-m-hidden', 'pf-m-visible-on-sm'), // charts
  classNames('pf-m-hidden', 'pf-m-visible-on-lg'), // updated
  Kebab.columnClass, // MENU ACTIONS
];

const HelmRepositoryExtendTableRow = (t, data) => {
  const returnPromis: any = new Promise(resolve => {
    const preDataResult = data.reduce((preData, item, index) => {
      const innerItemsDataResult = item.charts.reduce((innerItemsData, innerItem) => {
        innerItemsData.push(innerItem);
        return innerItemsData;
      }, []);

      if (innerItemsDataResult.length > 0) {
        preData.push({
          isOpen: false,
          cells: HelmRepositoryTableRow(item, innerItemsDataResult.length),
        });
        let parentValue = index * 2;
        preData.push({
          parent: parentValue,
          compoundParent: 2,
          cells: [
            {
              title: <ExpandableInnerTable aria-label="Helm Chart Table" header={InnerTableHeader(t)} Row={InnerTableRow(item.name)} data={innerItemsDataResult}></ExpandableInnerTable>,
              props: { colSpan: 5, className: 'pf-m-no-padding' },
            },
          ],
        });
      } else {
        preData.push({
          isOpen: false,
          cells: HelmRepositoryTableRow(item, innerItemsDataResult.length),
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
    resolve(preDataResult);
  });
  return returnPromis;
};

const HelmRepositoryTableRow = (obj, itemCount) => {
  const options: KebabOption[] = [
    {
      label: 'COMMON:MSG_MAIN_ACTIONBUTTON_51**COMMON:MSG_LNB_MENU_241',
      callback: async () => {
        helmrepositoryUpdateModal({
          updateServiceURL: `${helmAPI}/repos/${obj.name}`,
          stringKey: 'COMMON:MSG_LNB_MENU_241',
          name: obj.name,
        });
      },
    },
    {
      label: 'COMMON:MSG_MAIN_ACTIONBUTTON_16**COMMON:MSG_LNB_MENU_241',
      callback: async () => {
        deleteModal({
          nonk8sProps: {
            deleteServiceURL: `${helmAPI}/repos/${obj.name}`,
            stringKey: 'COMMON:MSG_LNB_MENU_241',
            name: obj.name,
          },
        });
      },
    },
  ];
  return [
    {
      title: <ResourceLink manualPath={`/helmrepositories/${obj.name}`} kind={HelmRepositoryModel.kind} name={obj.name} />,
      textValue: obj?.name,
    },
    {
      title: obj?.url,
      textValue: obj?.url,
    },
    {
      title: <a>{obj?.charts?.length}</a>,
      textValue: obj?.charts?.length,
      props: {
        isOpen: false,
      },
    },
    {
      title: <Timestamp timestamp={obj.lastupdated} />,
      textValue: obj?.lastupdated,
    },
    {
      title: <Kebab options={options} />,
    },
  ];
};

const InnerTableHeader = t => {
  return [
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_1'),
      transforms: [sortable],
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_141'),
      transforms: [sortable],
    },
  ];
};

const InnerTableRow = repoName => {
  return obj => {
    return [
      {
        title: <ResourceLink manualPath={`/helmcharts/${repoName}/${obj.name}`} kind={HelmChartModel.kind} name={obj.name} />,
        textValue: obj?.name,
      },
      {
        title: obj.version,
        textValue: obj.version,
      },
    ];
  };
};

const HelmRepositoryTableHeader = (t?: TFunction) => {
  return [
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_1'),
      sortField: 'name',
      transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: t('SINGLE:MSG_HELMREPOSITORIES_HELMREPOSITORYDETAILS_TABDETAILS_1'),
      sortFunc: 'url',
      transforms: [sortable],
      props: { className: tableColumnClasses[1] },
    },
    {
      title: t('SINGLE:MSG_HELMREPOSITORIES_HELMREPOSITORYDETAILS_TABHELMCHARTS_1'),
      sortField: 'charts.length',
      transforms: [sortable],
      cellTransforms: [compoundExpand],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: t('SINGLE:MSG_HELMREPOSITORIES_HELMREPOSITORYDETAILS_TABDETAILS_2'),
      sortField: 'lastupdated',
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[4] },
    },
  ];
};
HelmRepositoryTableHeader.displayName = 'HelmRepositoryTableHeader';

const HelmRepositoriesList: React.FC = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="Helm Repository" Header={HelmRepositoryTableHeader.bind(null, t)} virtualize={false} expandable={true} expandableRows={HelmRepositoryExtendTableRow.bind(null, t)} />;
};
HelmRepositoriesList.displayName = 'HelmRepositoriesList';

const { details } = navFactory;

export const HelmrepositoryDetailsPage: React.FC<DetailsPageProps> = props => {
  const { t } = useTranslation();
  const name = props.match?.params?.name;
  const menuActions: KebabAction[] = [
    () => ({
      label: 'COMMON:MSG_MAIN_ACTIONBUTTON_51**COMMON:MSG_LNB_MENU_241',
      callback: async () => {
        helmrepositoryUpdateModal({
          updateServiceURL: `${helmAPI}/repos/${name}`,
          stringKey: 'COMMON:MSG_LNB_MENU_241',
          name: name,
        });
      },
    }),
    () => ({
      label: 'COMMON:MSG_MAIN_ACTIONBUTTON_16**COMMON:MSG_LNB_MENU_241',
      callback: async () => {
        deleteModal({
          nonk8sProps: {
            deleteServiceURL: `${helmAPI}/repos/${name}`,
            stringKey: 'COMMON:MSG_LNB_MENU_241',
            name: name,
            listPath: '/helmrepositories',
          },
        });
      },
    }),
  ];
  return (
    <DetailsPage
      {...props}
      kind={kind}
      pages={[
        details(detailsPage(HelmRepositoryDetails)),
        {
          href: 'charts',
          name: 'COMMON:MSG_MAIN_TABLEHEADER_142',
          component: ChartListPage,
        },
      ]}
      customData={{ helmRepo: props.match?.params?.repo, nonK8sResource: true, kindObj: HelmRepositoryModel }}
      name={props.match?.params?.name}
      isK8sResource={false}
      menuActions={menuActions}
      breadcrumbsFor={() => {
        return [
          { name: t(HelmRepositoryModel.i18nInfo.labelPlural), path: '/helmrepositories' },
          { name: t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: t(HelmRepositoryModel.i18nInfo.label) }), path: '' },
        ];
      }}
    />
  );
};
const HelmRepositoryDetails: React.FC<HelmRepositoryDetailsProps> = ({ obj: helmrepository }) => {
  const { t } = useTranslation();
  return (
    <div className="co-m-pane__body">
      <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: t(HelmRepositoryModel.i18nInfo.label) })} />
      <div className="row">
        <div className="col-lg-6">
          <dl data-test-id="resource-summary" className="co-m-pane__details">
            <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_5')}</dt>
            <dd>{helmrepository.name}</dd>
          </dl>
        </div>
        <div className="col-lg-6">
          <HelmRepositoryDetailsList helmrepository={helmrepository} />
        </div>
      </div>
    </div>
  );
};
type HelmRepositoryDetailsProps = {
  obj: any;
};
export const HelmRepositoryDetailsList: React.FC<HelmRepositoryDetailsListProps> = ({ helmrepository }) => {
  const { t } = useTranslation();
  return (
    <dl className="co-m-pane__details">
      <dt>{t('SINGLE:MSG_HELMREPOSITORIES_HELMREPOSITORYDETAILS_TABDETAILS_1')}</dt>
      <dd>
        <div>{helmrepository.url}</div>
      </dd>
      <dt>{t('SINGLE:MSG_HELMREPOSITORIES_HELMREPOSITORYDETAILS_TABDETAILS_2')}</dt>
      <dd>
        <Timestamp timestamp={helmrepository.lastupdated} />
      </dd>
    </dl>
  );
};
type HelmRepositoryDetailsListProps = {
  helmrepository: any;
};
