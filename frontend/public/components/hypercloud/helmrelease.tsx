// 개발자 - 헬름 - 헬름 릴리스 에서 보여주는 화면 내용이 담긴 파일입니다.
import * as React from 'react';
import * as _ from 'lodash';
import { Helmet } from 'react-helmet';
import { match as RMatch } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { HelmReleaseStatusReducer } from '@console/dev-console/src/utils/hc-status-reducers';
import { SectionHeading, Timestamp, ResourceLink, Kebab, KebabOption, ActionsMenu, detailsPage, navFactory, KebabAction } from '@console/internal/components/utils';
import { NavBar } from '@console/internal/components/utils/horizontal-nav';
import { coFetchJSON } from '@console/internal/co-fetch';
import { ResourceLabel } from '@console/internal/models/hypercloud/resource-plural';
import { modelFor } from '@console/internal/module/k8s';
import { Status } from '@console/shared';
import { Badge } from '@patternfly/react-core';
import { deleteModal } from '../modals';
import { TableProps } from './utils/default-list-component';
import { DetailsPage, ListPage, DetailsPageProps } from '../factory';
import { CustomMenusMap } from '@console/internal/hypercloud/menu/menu-types';
import { LoadingBox } from '../utils';
import { resourceSortFunction } from './utils/resource-sort';
import { getIngressUrl } from './utils/ingress-utils';
import { HelmReleaseModel } from '@console/internal/models/hypercloud/helm-model';
import { HelmreleasesForm } from '@console/internal/components/hypercloud/form/helmreleases/create-helmrelease';
import { EditDefaultPage } from '../hypercloud/crd/edit-resource';
import { CreateHelmRelease } from '../hypercloud/form/helmreleases/create-helmrelease';

const kind = HelmReleaseModel.kind;
const getHost = async () => {
  const mapUrl = (CustomMenusMap as any).Helm.url;
  return mapUrl !== '' ? mapUrl : await getIngressUrl('helm-apiserver');
};

const capitalize = (text: string) => {
  return typeof text === 'string' ? text.charAt(0).toUpperCase() + text.slice(1) : text;
};
export interface HelmReleasePageProps {
  match: RMatch<{
    ns?: string;
    name?: string;
  }>;
}
const filters = t => [
  {
    filterGroupName: t('COMMON:MSG_COMMON_FILTER_10'),
    type: 'helmRelease-status',
    reducer: HelmReleaseStatusReducer,
    items: [
      { id: 'unknown', title: 'Unknown' },
      { id: 'deployed', title: 'Deployed' },
      { id: 'failed', title: 'Failed' },
      { id: 'pending', title: 'Pending' },
    ],
  },
];

export const HelmReleasePage: React.FC<HelmReleasePageProps> = props => {
  const { t } = useTranslation();
  const { match } = props;
  const namespace = match.params.ns;
  return <ListPage {...props} canCreate={true} tableProps={tableProps} kind={kind} rowFilters={filters.bind(null, t)()} createProps={{ to: `/helmreleases/ns/${namespace}/~new`, items: [] }} hideLabelFilter={true} customData={{ nonK8sResource: true, kindObj: HelmReleaseModel }} isK8sResource={false} />;
};

const ResourceKind: React.FC<ResourceKindProps> = ({ kind }) => {
  const { t } = useTranslation();
  return <p>{modelFor(kind) ? ResourceLabel(modelFor(kind), t) : kind}</p>;
};
type ResourceKindProps = {
  kind: string;
};

const tableProps: TableProps = {
  header: [
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_1',
      sortField: 'name',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_2',
      sortField: 'namespace',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_112',
      sortFunc: 'HelmReleaseStatusReducer',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_110',
      sortFunc: 'helmResourcesNumber',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_132',
      sortField: 'version',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_12',
      sortField: 'info.first_deployed',
    },
    {
      title: '',
      transforms: null,
      props: { className: Kebab.columnClass },
    },
  ],
  row: (obj: any) => {
    const options: KebabOption[] = [
      {
        label: 'COMMON:MSG_MAIN_ACTIONBUTTON_15**COMMON:MSG_LNB_MENU_203',
        href: `/helmreleases/ns/${obj.namespace}/${obj.name}/edit`,
      },
      {
        label: 'COMMON:MSG_MAIN_ACTIONBUTTON_16**COMMON:MSG_LNB_MENU_203',
        callback: async () => {
          const host = await getHost();
          deleteModal({
            nonk8sProps: {
              deleteServiceURL: `${host}/helm/ns/${obj.namespace}/releases/${obj.name}`,
              stringKey: 'COMMON:MSG_LNB_MENU_203',
              namespace: obj.namespace,
              name: obj.name,
            },
          });
        },
      },
    ];
    return [
      {
        children: <Link to={`/helmreleases/ns/${obj.namespace}/${obj.name}`}>{obj.name}</Link>,
      },
      {
        className: 'co-break-word',
        children: <ResourceLink kind="Namespace" name={obj.namespace} title={obj.namespace} />,
      },
      {
        children: <Status status={capitalize(HelmReleaseStatusReducer(obj))} />,
      },
      {
        children:
          obj.objects &&
          Object.keys(obj.objects)
            .sort((a, b) => {
              return resourceSortFunction(a) - resourceSortFunction(b);
            })
            .map(k => {
              return <ResourceKind key={'resource-' + k} kind={k} />;
            }),
      },
      {
        children: obj.version,
      },
      {
        children: obj.info?.first_deployed && <Timestamp timestamp={obj.info?.first_deployed} />,
      },
      {
        className: Kebab.columnClass,
        children: <Kebab options={options} />,
      },
    ];
  },
};

const { details } = navFactory;
export const HelmReleaseDetailsPage: React.FC<DetailsPageProps> = props => {
  const { t } = useTranslation();
  const name = props.match?.params?.name;
  const menuActions: KebabAction[] = [
    () => ({
      label: 'COMMON:MSG_MAIN_ACTIONBUTTON_15**COMMON:MSG_LNB_MENU_203',
      href: `/helmreleases/ns/${props.namespace}/${name}/edit`,
    }),
    () => ({
      label: 'COMMON:MSG_MAIN_ACTIONBUTTON_16**COMMON:MSG_LNB_MENU_203',
      callback: async () => {
        const host = await getHost();
        deleteModal({
          nonk8sProps: {
            deleteServiceURL: `${host}/helm/ns/${props.namespace}/releases/${name}`,
            stringKey: 'COMMON:MSG_LNB_MENU_203',
            namespace: props.namespace,
            name: name,
            listPath: `/helmreleases/ns/${props.namespace}`,
          },
        });
      },
    }),
  ];
  const capitalizeHelmReleaseStatusReducer = release => {
    return capitalize(HelmReleaseStatusReducer(release));
  };
  return (
    <DetailsPage
      {...props}
      kind={kind}
      pages={[
        details(detailsPage(HelmReleaseDetails)),
        // editResource(),
        {
          name: 'COMMON:MSG_DETAILS_TAB_18',
          href: 'edit',
          component: CreateHelmRelease,
        },
      ]}
      name={props.match?.params?.name}
      menuActions={menuActions}
      getResourceStatus={capitalizeHelmReleaseStatusReducer}
      customData={{ nonK8sResource: true, kindObj: HelmReleaseModel }}
      isK8sResource={false}
      breadcrumbsFor={() => {
        return [
          { name: t(HelmReleaseModel.i18nInfo.labelPlural), path: props.namespace ? `/helmreleases/ns/${props.namespace}` : '/helmreleases/all-namespaces' },
          { name: t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: t(HelmReleaseModel.i18nInfo.label) }), path: '' },
        ];
      }}
    />
  );
};
const HelmReleaseDetails: React.FC<HelmReleaseDetailsProps> = ({ obj: release }) => {
  const { t } = useTranslation();
  return (
    <div className="co-m-pane__body">
      <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: t(HelmReleaseModel.i18nInfo.label) })} />
      <div className="row">
        <div className="col-lg-6">
          <dl data-test-id="resource-summary" className="co-m-pane__details">
            <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_5')}</dt>
            <dd>{release.name}</dd>
            <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_6')}</dt>
            <dd>
              <ResourceLink kind="Namespace" name={release.namespace} />
            </dd>
            <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_43')}</dt>
            <dd>
              <Timestamp timestamp={release.info?.first_deployed} />
            </dd>
          </dl>
        </div>
        <div className="col-lg-6">
          <HelmReleaseDetailsList release={release} />
        </div>
      </div>
      <div className="row">
        <div style={{ paddingTop: '30px' }}>
          <h1>{t('COMMON:MSG_MAIN_TABLEHEADER_110')}</h1>
          <table className="pf-c-table">
            <thead>
              <tr>
                <th style={{ padding: '5px' }}>{t('SINGLE:MSG_HELMRELEASES_HELMRELEASEDETAILS_TABDETAILS_4')}</th>
                <th style={{ padding: '5px' }}>{t('SINGLE:MSG_HELMRELEASES_HELMRELEASEDETAILS_TABDETAILS_5')}</th>
              </tr>
            </thead>
            <tbody>
              {release.objects &&
                Object.keys(release.objects)
                  .sort((a, b) => {
                    return resourceSortFunction(a) - resourceSortFunction(b);
                  })
                  .map(k => {
                    return (
                      <tr key={'row-' + k}>
                        <td style={{ padding: '5px' }}>{t(modelFor(k).i18nInfo.label)}</td>
                        <td style={{ padding: '5px' }}>
                          <ResourceLink kind={k} name={release.objects[k] as string} namespace={release.namespace} />
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
type HelmReleaseDetailsProps = {
  obj: any;
};

export const HelmReleaseDetailsList: React.FC<HelmReleaseDetailsListProps> = ({ release }) => {
  const { t } = useTranslation();
  return (
    <dl className="co-m-pane__details">
      <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_45')}</dt>
      <dd>
        <Status status={capitalize(HelmReleaseStatusReducer(release))} />
      </dd>
      <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_10')}</dt>
      <dd>{release.chart?.metadata?.description}</dd>
      <dt>{t('SINGLE:MSG_HELMRELEASES_HELMRELEASEDETAILS_TABDETAILS_1')}</dt>
      <dd>{release.chart?.metadata?.repo ? <Link to={`/helmcharts/${release.chart?.metadata?.repo}/${release.chart?.metadata?.name}`}>{release.chart?.metadata?.name}</Link> : release.chart?.metadata?.name}</dd>
      <dt>{t('SINGLE:MSG_HELMRELEASES_HELMRELEASEDETAILS_TABDETAILS_2')}</dt>
      <dd>{release.version}</dd>
    </dl>
  );
};
type HelmReleaseDetailsListProps = {
  release: any;
};

type HelmreleasestDetailsHeaderProps = {
  namespace: string;
  name: string;
  helmrelease?: any;
};
export const HelmreleasestDetailsHeader: React.FC<HelmreleasestDetailsHeaderProps> = props => {
  const { namespace, name, helmrelease } = props;
  const { t } = useTranslation();
  const showActions = true;
  const hasMenuActions = true;

  const options: KebabOption[] = [
    {
      label: 'COMMON:MSG_MAIN_ACTIONBUTTON_15**COMMON:MSG_LNB_MENU_203',
      href: `/helmreleases/ns/${namespace}/${name}/edit`,
    },
    {
      label: 'COMMON:MSG_MAIN_ACTIONBUTTON_16**COMMON:MSG_LNB_MENU_203',
      callback: async () => {
        const host = await getHost();
        deleteModal({
          nonk8sProps: {
            deleteServiceURL: `${host}/helm/ns/${namespace}/releases/${name}`,
            stringKey: 'COMMON:MSG_LNB_MENU_203',
            namespace: namespace,
            name: name,
            listPath: `/helmreleases/ns/${namespace}`,
          },
        });
      },
    },
  ];

  return (
    <div style={{ padding: '30px', borderBottom: '1px solid #ccc' }}>
      <div style={{ display: 'inline-block' }}>
        <Link to={`/helmreleases/ns/${namespace}`}>{t('COMMON:MSG_LNB_MENU_203')}</Link>
        {' > ' + t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: t('COMMON:MSG_LNB_MENU_203') })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex' }}>
          <h1>{name}</h1>
          <div style={{ paddingTop: '25px', paddingLeft: '5px' }}>
            <Badge className="co-resource-item__resource-status-badge" isRead>
              <Status status={capitalize(HelmReleaseStatusReducer(helmrelease))} />
            </Badge>
          </div>
        </div>
        {showActions && (
          <div className="co-actions" data-test-id="details-actions" style={{ paddingTop: '25px' }}>
            {hasMenuActions && <ActionsMenu actions={options} />}
          </div>
        )}
      </div>
    </div>
  );
};

export const HelmReleaseEditPage: React.FC<HelmReleasePageProps> = ({ match }) => {
  const namespace = match.params.ns;
  const name = match.params.name;
  const { t } = useTranslation();

  const [loading, setLoading] = React.useState(false);
  const [helmReleases, setHelmReleases] = React.useState([]);
  const [isRefresh, setIsRefresh] = React.useState(true);

  React.useEffect(() => {
    const fetchHelmChart = async () => {
      const host = await getHost();
      await coFetchJSON(`${host}/helm/ns/${namespace}/releases/${name}`)
        .then(res => {
          setHelmReleases(_.get(res, 'release') || []);
          setLoading(true);
        })
        .catch(e => {
          setIsRefresh(false);
        });
    };
    fetchHelmChart();
  }, [namespace, isRefresh]);

  return (
    <>
      <Helmet>
        <title>{t('COMMON:MSG_LNB_MENU_203')}</title>
      </Helmet>
      <div style={{ background: 'white', height: '100%' }}>
        <HelmreleasestDetailsHeader namespace={namespace} name={name} helmrelease={loading ? helmReleases[0] : null} />
        <NavBar pages={allPages} baseURL={`/helmreleases/ns/${namespace}/${name}`} basePath="" />
        {loading ? <HelmreleasesForm namespace={namespace} defaultValue={helmReleases[0]} /> : <LoadingBox />}
      </div>
    </>
  );
};

export default HelmReleasePage;

const allPages = [
  {
    name: 'COMMON:MSG_DETAILS_TAB_1',
    href: '',
  },
  {
    name: 'COMMON:MSG_DETAILS_TAB_18',
    href: 'edit',
    component: EditDefaultPage,
  },
  {
    name: 'COMMON:MSG_DETAILS_TAB_18',
    href: 'edit',
    component: CreateHelmRelease,
  },
];
