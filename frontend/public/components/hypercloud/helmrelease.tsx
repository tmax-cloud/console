import * as React from 'react';
import * as _ from 'lodash';
import * as fuzzy from 'fuzzysearch';
import { Helmet } from 'react-helmet';
import { match as RMatch } from 'react-router';
import { useTranslation } from 'react-i18next';
import { safeDump } from 'js-yaml';
import { Link } from 'react-router-dom';
import { HelmReleaseStatusReducer } from '@console/dev-console/src/utils/hc-status-reducers';
import { Section } from '@console/internal/components/hypercloud/utils/section';
import { SectionHeading, Timestamp, ButtonBar, ResourceLink, Kebab, KebabOption, ActionsMenu, Dropdown } from '@console/internal/components/utils';
import { NavBar } from '@console/internal/components/utils/horizontal-nav';
import { history } from '@console/internal/components/utils/router';
import { getIdToken } from '@console/internal/hypercloud/auth';
import { coFetchJSON } from '@console/internal/co-fetch';
import { ResourceLabel } from '@console/internal/models/hypercloud/resource-plural';
import { modelFor } from '@console/internal/module/k8s';
import { Status } from '@console/shared';
import YAMLEditor from '@console/shared/src/components/editor/YAMLEditor';
import { Button, Badge } from '@patternfly/react-core';
import { deleteModal } from '../modals';
// import { TableProps } from './utils/default-list-component';
import { ListPage } from '../factory';
import { CustomMenusMap } from '@console/internal/hypercloud/menu/menu-types';
import { getQueryArgument } from '../utils';
import { LoadingBox } from '../utils';

const helmHost: string = (CustomMenusMap as any).Helm.url;

const capitalize = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
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
    type: 'helmReleases-status',
    reducer: HelmReleaseStatusReducer,
    items: [
      { id: 'unknown', title: 'Unknown' },
      { id: 'deployed', title: 'Deployed' },
      { id: 'failed', title: 'Failed' },
      { id: 'pending', title: 'Pending' },
    ],
  },
];

export const HelmReleasePage: React.FC<HelmReleasePageProps> = ({ match }) => {
  const { t } = useTranslation();
  const namespace = match.params.ns;
  const [loading, setLoading] = React.useState(false);
  const [helmReleases, setHelmReleases] = React.useState([]);
  const [isRefresh, setIsRefresh] = React.useState(true);

  React.useEffect(() => {
    const updateHelmReleases = async () => {
      await coFetchJSON(namespace ? `${helmHost}/helm/ns/${namespace}/releases` : `${helmHost}/helm/all-namespaces/releases`).then(res => {
        setHelmReleases(_.get(res, 'release') || []);
        setLoading(true);
        setIsRefresh(true);
      });
    };
    updateHelmReleases();
  }, [namespace, isRefresh]);

  return <>{loading ? <ListPage title={t('COMMON:MSG_LNB_MENU_203')} createButtonText={t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('COMMON:MSG_LNB_MENU_203') })} canCreate={true} items={helmReleases} rowFilters={filters.bind(null, t)()} kind="helmreleases" tableProps={tableProps(setIsRefresh)} namespace={namespace} createProps={{ to: `/helmreleases/ns/${namespace}/~new`, items: [] }} isK8SResource={false} /> : <LoadingBox />}</>;
};

const resourceSortFunction = (resource: string) => {
  return resource.length;
};

const ResourceKind: React.FC<ResourceKindProps> = ({ kind }) => {
  const { t } = useTranslation();
  return <p>{modelFor(kind) ? ResourceLabel(modelFor(kind), t) : kind}</p>;
};
type ResourceKindProps = {
  kind: string;
};

const tableProps = (setIsRefresh: Function) => {
  return {
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
            deleteModal({
              nonk8sProps: {
                deleteServiceURL: `${helmHost}/helm/ns/${obj.namespace}/releases/${obj.name}`,
                stringKey: 'COMMON:MSG_LNB_MENU_203',
                namespace: obj.namespace,
                name: obj.name,
                setIsRefresh: setIsRefresh,
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
          children: Object.keys(obj.objects)
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
          children: <Timestamp timestamp={obj.info.first_deployed} />,
        },
        {
          className: Kebab.columnClass,
          children: <Kebab options={options} />,
        },
      ];
    },
  };
};

export const HelmReleaseDetailsPage: React.FC<HelmReleasePageProps> = ({ match }) => {
  const namespace = match.params.ns;
  const name = match.params.name;
  const { t } = useTranslation();

  const [loading, setLoading] = React.useState(false);
  const [helmReleases, setHelmReleases] = React.useState([]);

  React.useEffect(() => {
    const fetchHelmChart = async () => {
      await coFetchJSON(`${helmHost}/helm/ns/${namespace}/releases/${name}`).then(res => {
        setHelmReleases(_.get(res, 'release') || []);
        setLoading(true);
      });
    };
    fetchHelmChart();
  }, [namespace]);
  return (
    <>
      <Helmet>
        <title>{t('COMMON:MSG_LNB_MENU_203')}</title>
      </Helmet>

      <div style={{ background: 'white', height: '100%' }}>
        <HelmreleasestDetailsHeader namespace={namespace} name={name} helmrelease={loading ? helmReleases[0] : null} />
        <NavBar pages={allPages} baseURL={`/helmreleases/ns/${namespace}/${name}`} basePath="" />
        {loading ? <>{helmReleases.length === 0 ? <div style={{ textAlign: 'center' }}>{t('COMMON:MSG_COMMON_ERROR_MESSAGE_22', { something: t('COMMON:MSG_LNB_MENU_203') })}</div> : <ReleasesDetailsTapPage helmRelease={helmReleases[0]} />}</> : <LoadingBox />}
      </div>
    </>
  );
};

type ReleasesDetailsTapPageProps = {
  helmRelease?: any;
  match?: any;
};
export const ReleasesDetailsTapPage: React.FC<ReleasesDetailsTapPageProps> = props => {
  const { t } = useTranslation();
  const { helmRelease } = props;

  return (
    <div className="co-m-pane__body">
      <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: t('COMMON:MSG_LNB_MENU_203') })} />
      <div className="row">
        <div className="col-lg-6">
          <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_5')}</dt>
          <dd>{helmRelease.name}</dd>
          <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_6')}</dt>
          <dd>
            <ResourceLink kind="Namespace" name={helmRelease.namespace} />
          </dd>
          <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_43')}</dt>
          <dd>
            <Timestamp timestamp={helmRelease.info.first_deployed} />
          </dd>
        </div>
        <div className="col-lg-6">
          <dl className="co-m-pane__details">
            <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_45')}</dt>
            <dd>
              <Status status={capitalize(HelmReleaseStatusReducer(helmRelease))} />
            </dd>
            <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_10')}</dt>
            <dd>{helmRelease.chart.metadata.description}</dd>
            <dt>{t('SINGLE:MSG_HELMRELEASES_HELMRELEASEDETAILS_TABDETAILS_1')}</dt>
            <dd>
              <Link to={`/helmcharts/${helmRelease.chart.metadata.name}`}>{helmRelease.chart.metadata.name}</Link>
            </dd>
            <dt>{t('SINGLE:MSG_HELMRELEASES_HELMRELEASEDETAILS_TABDETAILS_2')}</dt>
            <dd>{helmRelease.version}</dd>
          </dl>
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
              {Object.keys(helmRelease.objects).map(k => {
                return (
                  <tr key={'row-' + k}>
                    <td style={{ padding: '5px' }}>{t(modelFor(k).i18nInfo.label)}</td>
                    <td style={{ padding: '5px' }}>
                      <ResourceLink kind={k} name={helmRelease.objects[k] as string} namespace={helmRelease.namespace} />
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
        deleteModal({
          nonk8sProps: {
            deleteServiceURL: `${helmHost}/helm/ns/${namespace}/releases/${name}`,
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

type HelmreleasesFormProps = {
  namespace: string;
  defaultValue?: any;
};
export const HelmreleasesForm: React.FC<HelmreleasesFormProps> = props => {
  const { t } = useTranslation();
  const { defaultValue, namespace } = props;
  const queryChartName = getQueryArgument('chartName');
  const queryChartRepo = getQueryArgument('chartRepo');
  const chartName = queryChartName ? queryChartName : defaultValue ? defaultValue.chart.metadata.name : '';
  const releaseName = defaultValue ? defaultValue.name : '';
  const version = defaultValue ? defaultValue.chart.metadata.version : '';
  const values = defaultValue ? defaultValue.chart.values : null;
  const repoName = queryChartRepo ? queryChartRepo : '';

  const [loading, setLoading] = React.useState(false);
  const [selectChartName, setSelectChartName] = React.useState(chartName);
  const [postPackageURL, setPostPackageURL] = React.useState('');
  const [postReleaseName, setPostReleaseName] = React.useState(releaseName);
  const [postVersion, setPostVersion] = React.useState(version);
  const [postValues, setPostValues] = React.useState(values ? safeDump(values) : '');
  const [inProgress, setProgress] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [entries, setEntries] = React.useState([]);
  const [chartNameList, setChartNameList] = React.useState({});
  const [versions, setVersions] = React.useState({});
  const [selectRepoName, setSelectRepoName] = React.useState(repoName);

  const noEntryMessageTest = 'This chart is not on the server';

  React.useEffect(() => {
    const fetchHelmChart = async () => {
      await coFetchJSON(`${helmHost}/helm/charts`).then(res => {
        let tempEntriesList = [];
        let tempChartObject = {};
        const entriesvalues = Object.values(_.get(res, 'indexfile.entries'));
        entriesvalues.map((entries: any) => {
          entries.map(e => {
            tempEntriesList.push(e);
            let tempObject = { [e.name]: e.name };
            _.merge(tempChartObject, tempObject);
          });
        });
        if (defaultValue) {
          const entry = tempEntriesList.filter(e => {
            if (e.name === tempChartObject[chartName]) return true;
          })[0];
          setPostPackageURL(entry ? entry.urls[0] : null);
        }
        setEntries(tempEntriesList);
        setChartNameList(tempChartObject);
        setLoading(true);
      });
    };
    fetchHelmChart();
  }, []);
  React.useEffect(() => {
    const getVersions = async () => {
      await coFetchJSON(`${helmHost}/helm/charts/${selectRepoName}_${selectChartName}`).then(res => {
        const tempVersionsList = _.get(res, 'versions');
        if (tempVersionsList) {
          let tempVersionsObject = {};
          tempVersionsList.map((version: any) => {
            let tempObject = { [version]: version };
            _.merge(tempVersionsObject, tempObject);
          });
          setVersions(tempVersionsList);
        }
      });
    };
    getVersions();
  }, [selectChartName]);

  const onClick = () => {
    setProgress(true);
    const putHelmChart = () => {
      const url = `${helmHost}/helm/ns/${namespace}/releases`;
      const payload = {
        releaseRequestSpec: {
          packageURL: postPackageURL,
          releaseName: postReleaseName,
          version: postVersion,
        },
        values: postValues,
      };
      coFetchJSON
        .post(url, payload, { headers: { 'user-token': getIdToken() } })
        .then(() => {
          history.goBack();
        })
        .catch(e => {
          setProgress(false);
          setErrorMessage(`error : ${e.json.error}\ndescription : ${e.json.description}`);
        });
    };
    putHelmChart();
  };
  const updatePostReleaseName = e => {
    setPostReleaseName(e.target.value);
  };
  const updatePostValues = (newValue, event) => {
    setPostValues(newValue);
    return {};
  };
  const updateChartName = (selection: string) => {
    setSelectChartName(selection);
    const selectedEntry = entries.filter(e => {
      if (e.name === chartNameList[selection]) return true;
    })[0];
    setSelectRepoName(selectedEntry.repo?.name);
  };
  const updateVersion = (selection: string) => {
    const selectedVersion = versions[selection];
    setPostVersion(selectedVersion ? selectedVersion : noEntryMessageTest);
    const setChartVersion = async () => {
      await coFetchJSON(`${helmHost}/helm/charts/${selectRepoName}_${selectChartName}/versions/${selectedVersion}`).then(res => {
        const entryValue = Object.values(_.get(res, 'indexfile.entries'))[0];
        setPostPackageURL(entryValue[0].urls[0]);
        setPostValues(safeDump(_.get(res, 'values')));
      });
    };
    setChartVersion();
  };

  return (
    <div style={{ padding: '30px' }}>
      {loading && (
        <ButtonBar inProgress={inProgress} errorMessage={errorMessage}>
          <form className="co-m-pane__body-group co-m-pane__form" method="post" action={`${helmHost}/helm/repos`}>
            <Section label={t('SINGLE:MSG_HELMRELEASES_CREATEFORM_DIV2_1')} id="releaseName" isRequired={true}>
              {defaultValue ? <p>{releaseName}</p> : <input className="pf-c-form-control" id="releaseName" name="releaseName" defaultValue={releaseName} onChange={updatePostReleaseName} disabled={defaultValue} />}
            </Section>
            <Section label={t('SINGLE:MSG_HELMRELEASES_CREATEFORM_DIV2_2')} id="chartName" isRequired={true}>
              {defaultValue ? (
                <p>{selectChartName}</p>
              ) : (
                <Dropdown
                  name="chartName"
                  className="btn-group"
                  title={selectChartName || t('SINGLE:MSG_HELMRELEASES_CREATEFORM_DIV2_3')}
                  items={chartNameList} // (필수)
                  required={true}
                  onChange={updateChartName}
                  buttonClassName="dropdown-btn" // 선택된 아이템 보여주는 button (title) 부분 className
                  itemClassName="dropdown-item" // 드롭다운 아이템 리스트 전체의 className - 각 row를 의미하는 것은 아님
                  disabled={defaultValue}
                  autocompleteFilter={fuzzy}
                />
              )}
            </Section>
            {selectChartName && (
              <>
                <Section label={t('SINGLE:MSG_HELMRELEASES_CREATEFORM_DIV2_6')} id="version">
                  {defaultValue ? (
                    <p>{postVersion}</p>
                  ) : (
                    <Dropdown
                      name="chartName"
                      className="btn-group"
                      title={t('SINGLE:MSG_HELMRELEASES_CREATEFORM_DIV2_6')}
                      items={versions} // (필수)
                      required={true}
                      onChange={updateVersion}
                      buttonClassName="dropdown-btn" // 선택된 아이템 보여주는 button (title) 부분 className
                      itemClassName="dropdown-item" // 드롭다운 아이템 리스트 전체의 className - 각 row를 의미하는 것은 아님
                      disabled={defaultValue}
                      autocompleteFilter={fuzzy}
                    />
                  )}
                </Section>
                {postPackageURL && (
                  <Section label={t('SINGLE:MSG_HELMRELEASES_CREATEFORM_DIV2_4')} id="Package URL">
                    <p>{postPackageURL}</p>
                  </Section>
                )}
              </>
            )}
            {postValues && <YAMLEditor value={postValues} minHeight="300px" onChange={updatePostValues} showShortcuts={true} />}
            <div style={{ marginTop: '10px' }}>
              <Button type="button" variant="primary" id="save" onClick={onClick} isDisabled={!postPackageURL}>
                {defaultValue ? t('COMMON:MSG_DETAILS_TAB_18') : t('COMMON:MSG_COMMON_BUTTON_COMMIT_1')}
              </Button>
              <Button
                style={{ marginLeft: '10px' }}
                type="button"
                variant="secondary"
                id="cancel"
                onClick={() => {
                  history.goBack();
                }}
              >
                {t('COMMON:MSG_COMMON_BUTTON_COMMIT_2')}
              </Button>
            </div>
          </form>
        </ButtonBar>
      )}
    </div>
  );
};

export const HelmReleaseCreatePage: React.FC<HelmReleasePageProps> = ({ match }) => {
  const namespace = match.params.ns;
  const { t } = useTranslation();
  return (
    <>
      <Helmet>
        <title>{t('COMMON:MSG_LNB_MENU_203')}</title>
      </Helmet>
      <div style={{ background: 'white', height: '100%' }}>
        <div style={{ marginLeft: '15px' }}>
          <h1>{t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('COMMON:MSG_LNB_MENU_203') })}</h1>
        </div>
        <HelmreleasesForm namespace={namespace} />
      </div>
    </>
  );
};
export const HelmReleaseEditPage: React.FC<HelmReleasePageProps> = ({ match }) => {
  const namespace = match.params.ns;
  const name = match.params.name;
  const { t } = useTranslation();

  const [loading, setLoading] = React.useState(false);
  const [helmReleases, setHelmReleases] = React.useState([]);

  React.useEffect(() => {
    const fetchHelmChart = async () => {
      await coFetchJSON(`${helmHost}/helm/ns/${namespace}/releases/${name}`).then(res => {
        setHelmReleases(_.get(res, 'release') || []);
        setLoading(true);
      });
    };
    fetchHelmChart();
  }, [namespace]);

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
    component: ReleasesDetailsTapPage,
  },
  {
    name: 'COMMON:MSG_DETAILS_TAB_18',
    href: 'edit',
    component: HelmReleaseEditPage,
  },
];
