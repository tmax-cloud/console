import * as React from 'react';
import * as _ from 'lodash';
import { Helmet } from 'react-helmet';
import { match as RMatch } from 'react-router';
import { useTranslation, Trans } from 'react-i18next';
import { safeDump } from 'js-yaml';
import { Link } from 'react-router-dom';
import NamespacedPage from '@console/dev-console/src/components/NamespacedPage';
import { HelmReleaseStatusReducer } from '@console/dev-console/src/utils/hc-status-reducers';
import { ingressUrlWithLabelSelector } from '@console/internal/components/hypercloud/utils/ingress-utils';
import { Section } from '@console/internal/components/hypercloud/utils/section';
import { PageHeading, SectionHeading, Timestamp, ButtonBar, ResourceLink, Kebab, KebabOption, ActionsMenu, Dropdown } from '@console/internal/components/utils';
import { ErrorMessage } from '@console/internal/components/utils/button-bar';
import { NavBar } from '@console/internal/components/utils/horizontal-nav';
import { history } from '@console/internal/components/utils/router';
import { LoadingInline } from '@console/internal/components/utils/status-box';
import { getIdToken } from '@console/internal/hypercloud/auth';
import { coFetchJSON } from '@console/internal/co-fetch';
import { modelFor } from '@console/internal/module/k8s';
import { Status } from '@console/shared';
import YAMLEditor from '@console/shared/src/components/editor/YAMLEditor';
import { Button, Modal, Badge } from '@patternfly/react-core';

const capitalize = (text: string) => { return text.charAt(0).toUpperCase() + text.slice(1); }

const defaultHost = 'console.tmaxcloud.org';

const SelectNamespacePage = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className="odc-empty-state__title" style={{ background: 'white', height: '100%' }}>
        <PageHeading title={t('SINGLE:MSG_ADD_CREATFORM_1')} />
        <div className="co-catalog-page__description odc-empty-state__hint-block">{t('SINGLE:MSG_ADD_CREATFORM_2')}</div>
      </div>
    </>
  );
};

export interface HelmReleasePageProps {
  match: RMatch<{
    ns?: string;
    name?: string;
  }>;
}

export const HelmReleasePage: React.FC<HelmReleasePageProps> = ({ match }) => {
  const { t } = useTranslation();
  const namespace = match.params.ns;
  const [loading, setLoading] = React.useState(false);
  const [helmReleases, setHelmReleases] = React.useState([]);

  React.useEffect(() => {
    const fetchHelmChart = async () => {
      let serverURL = '';
      await coFetchJSON(ingressUrlWithLabelSelector({
        'ingress.tmaxcloud.org/name': 'helm-apiserver',
      })).then((res) => {
        const { items } = res;
        if (items?.length > 0) {
          const ingress = items[0];
          const host = ingress.spec?.rules?.[0]?.host;
          if (!!host) {
            serverURL = (namespace) ? `https://${host}/helm/ns/${namespace}/releases` : `https://${host}/helm/all-namespaces/releases`;
          }
        }
      });
      await coFetchJSON(serverURL !== '' ? serverURL : (namespace) ? `https://${defaultHost}/helm/ns/${namespace}/releases` : `https://${defaultHost}/helm/all-namespaces/releases`)
        .then((res) => {
          setHelmReleases(_.get(res, 'release') || []);
          setLoading(true);
        });
    }
    fetchHelmChart();
  }, [namespace]);

  return (
    <>
      <Helmet>
        <title>{t('COMMON:MSG_LNB_MENU_203')}</title>
      </Helmet>
      <NamespacedPage>
        <div style={{ background: 'white', height: '100%' }}>
          <div style={{ padding: '30px 15px 0', display: 'flex', justifyContent: 'space-between' }}>
            <h1 style={{ margin: '0 0 30px' }}>{t('COMMON:MSG_LNB_MENU_203')}</h1>
            <Link to={`/helmreleases/ns/${namespace}/~new`}>
              <Button type="button" variant="primary" id="create" style={{ alignSelf: 'letf' }}>{t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('COMMON:MSG_LNB_MENU_203') })}</Button>
            </Link>
          </div>
          <div style={{ padding: '0px 30px 30px' }}>
            {loading ? <HelmReleasesTable helmReleases={helmReleases} /> : <LoadingInline />}
          </div>
        </div>
      </NamespacedPage>
    </>
  );
};

type HelmReleasesTableProps = {
  helmReleases: any[];
};
const HelmReleasesTable: React.FC<HelmReleasesTableProps> = props => {
  const { t } = useTranslation();
  const { helmReleases } = props;
  const [deleteNamesapce, setDeleteNamespace] = React.useState('');
  const [deleteName, setDeleteName] = React.useState('');
  const [open, setOpen] = React.useState(false);

  type DeleteModalProps = {
    namespace: string,
    name: string,
  };
  const DeleteModal: React.FC<DeleteModalProps> = props => {
    const { namespace, name } = props;
    const { t } = useTranslation();
    const [loading, setLoading] = React.useState(false);
    const [host, setHost] = React.useState(defaultHost);
    const ResourceName = () => <strong key={'ResourceName' + name} className="co-break-word">{name}</strong>;
    const Namespace = () => <strong key={'Namespace' + namespace} >{namespace}</strong>;
    const [inProgress, setProgress] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');

    React.useEffect(() => {
      const fetchHelmChart = async () => {
        await coFetchJSON(ingressUrlWithLabelSelector({
          'ingress.tmaxcloud.org/name': 'helm-apiserver',
        })).then((res) => {
          const { items } = res;
          const ingress = items[0];
          setHost(ingress.spec?.rules?.[0]?.host);
          setLoading(true);
        });
      }
      fetchHelmChart();
    }, []);

    const handleModalToggle = () => {
      setOpen(!open);
    };
    const deleteAction = () => {
      setProgress(true);
      const deleteHelmreleases = () => {
        const url = `https://${host}/helm/ns/${namespace}/releases/${name}`;
        coFetchJSON.delete(url)
          .then(() => { setOpen(!open); location.reload(); })
          .catch((e) => {
            setProgress(false);
            setErrorMessage(`error : ${e.json.error}\ndescription : ${e.json.description}`);
          });
      }
      deleteHelmreleases();
    };

    return (
      <React.Fragment>
        <Modal
          isSmall={true}
          title={t('COMMON:MSG_MAIN_ACTIONBUTTON_16', { 0: t('COMMON:MSG_LNB_MENU_203') })}
          isOpen={open}
          onClose={handleModalToggle}
          actions={[
            <Button key="cancel" variant="secondary" onClick={handleModalToggle}>
              {t('COMMON:MSG_COMMON_BUTTON_COMMIT_2')}
            </Button>,
            <Button key="delete" variant="danger" onClick={deleteAction} isActive={loading} >
              {t('COMMON:MSG_COMMON_BUTTON_COMMIT_13')}
            </Button>
          ]}
        >
          <div>
            {inProgress && <LoadingInline />}
            {errorMessage && errorMessage !== '' && <ErrorMessage message={errorMessage} />}
          </div>
          <Trans i18nKey="COMMON:MSG_MAIN_POPUP_DESCRIPTION_6">{[<ResourceName key={name} />, <Namespace key={namespace} />]}</Trans>
        </Modal>
      </React.Fragment>
    );
  }

  return (
    <>{helmReleases.length === 0 ? <div style={{ textAlign: 'center' }}>{t('COMMON:MSG_COMMON_ERROR_MESSAGE_22', { something: t('COMMON:MSG_LNB_MENU_203') })}</div> :
      <div key={'table'}>
        {/*<div>filter</div>*/}
        {/*<div>search</div>*/}
        <table className='pf-c-table' >
          <thead>
            <tr>
              <th style={{ padding: '5px' }} >{t('COMMON:MSG_MAIN_TABLEHEADER_1')}</th>
              <th style={{ padding: '5px' }} >{t('COMMON:MSG_MAIN_TABLEHEADER_2')}</th>
              <th style={{ padding: '5px' }} >{t('COMMON:MSG_MAIN_TABLEHEADER_112')}</th>
              <th style={{ padding: '5px' }} >{t('COMMON:MSG_MAIN_TABLEHEADER_110')}</th>
              <th style={{ padding: '5px' }} >{t('COMMON:MSG_MAIN_TABLEHEADER_132')}</th>
              <th style={{ padding: '5px' }} >{t('COMMON:MSG_MAIN_TABLEHEADER_12')}</th>
              <th style={{ padding: '5px' }} ></th>
            </tr>
          </thead>
          <tbody>
            {helmReleases.map((helmRelease) => {
              const { name, namespace, info, objects, version } = helmRelease;
              const options: KebabOption[] = [
                {
                  label: 'COMMON:MSG_MAIN_ACTIONBUTTON_15**COMMON:MSG_LNB_MENU_203',
                  callback: () => { location.href = `/helmreleases/ns/${namespace}/${name}/edit` },
                },
                {
                  label: 'COMMON:MSG_MAIN_ACTIONBUTTON_16**COMMON:MSG_LNB_MENU_203',
                  callback: () => { setDeleteNamespace(namespace); setDeleteName(name); setOpen(true) },
                },
              ];
              return (
                <tr key={'row-' + name}>
                  <td style={{ padding: '5px' }} >
                    <Link key={'link' + name} to={`/helmreleases/ns/${namespace}/${name}`}>
                      {name}
                    </Link>
                  </td>
                  <td style={{ padding: '5px' }} ><ResourceLink kind="Namespace" name={namespace} /></td>
                  <td style={{ padding: '5px' }} ><Status status={capitalize(HelmReleaseStatusReducer(helmRelease))} /></td>
                  <td style={{ padding: '5px' }} >{Object.keys(objects).map(k => { return <div key={'resource-' + k}>{t(modelFor(k).i18nInfo.label)}</div> })}</td>
                  <td style={{ padding: '5px' }} >{version}</td>
                  <td style={{ padding: '5px' }} ><Timestamp timestamp={info.first_deployed} /></td>
                  <td style={{ padding: '5px' }} ><Kebab options={options} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <DeleteModal namespace={deleteNamesapce} name={deleteName} />
      </div>
    }</>
  );
}

export const HelmReleaseDetailsPage: React.FC<HelmReleasePageProps> = ({ match }) => {
  const namespace = match.params.ns;
  const name = match.params.name;
  const { t } = useTranslation();

  const [loading, setLoading] = React.useState(false);
  const [helmReleases, setHelmReleases] = React.useState([]);

  React.useEffect(() => {
    const fetchHelmChart = async () => {
      let serverURL = '';
      await coFetchJSON(ingressUrlWithLabelSelector({
        'ingress.tmaxcloud.org/name': 'helm-apiserver',
      })).then((res) => {
        const { items } = res;
        if (items?.length > 0) {
          const ingress = items[0];
          const host = ingress.spec?.rules?.[0]?.host;
          if (!!host) {
            serverURL = `https://${host}/helm/ns/${namespace}/releases/${name}`;
          }
        }
      });
      await coFetchJSON(serverURL !== '' ? serverURL : `https://${defaultHost}/helm/ns/${namespace}/releases/${name}`)
        .then((res) => {
          setHelmReleases(_.get(res, 'release') || []);
          setLoading(true);
        });
    }
    fetchHelmChart();
  }, [namespace]);
  return (
    <>
      <Helmet>
        <title>{t('COMMON:MSG_LNB_MENU_203')}</title>
      </Helmet>
      <NamespacedPage>
        {namespace ? (
          <div style={{ background: 'white', height: '100%' }}>
            <HelmreleasestDetailsHeader namespace={namespace} name={name} helmrelease={loading ? helmReleases[0] : null} />
            <NavBar pages={allPages} baseURL={`/helmreleases/ns/${namespace}/${name}`} basePath='' />
            {loading ?
              (<>
                {helmReleases.length === 0 ? <div style={{ textAlign: 'center' }}>{t('COMMON:MSG_COMMON_ERROR_MESSAGE_22', { something: t('COMMON:MSG_LNB_MENU_203') })}</div> :
                  <ReleasesDetailsTapPage helmRelease={helmReleases[0]} />
                }
              </>) : (<LoadingInline />)
            }
          </div>
        ) : (
          <SelectNamespacePage />
        )}
      </NamespacedPage>
    </>
  );
};

type ReleasesDetailsTapPageProps = {
  helmRelease?: any;
  match?: any;
}
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
          <dd><ResourceLink kind='Namespace' name={helmRelease.namespace} /></dd>
          <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_43')}</dt>
          <dd><Timestamp timestamp={helmRelease.info.first_deployed} /></dd>
        </div>
        <div className="col-lg-6">
          <dl className="co-m-pane__details">
            <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_45')}</dt>
            <dd><Status status={capitalize(HelmReleaseStatusReducer(helmRelease))} /></dd>
            <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_10')}</dt>
            <dd>{helmRelease.chart.metadata.description}</dd>
            <dt>{t('SINGLE:MSG_HELMRELEASES_HELMRELEASEDETAILS_TABDETAILS_1')}</dt>
            <dd>
              <Link to={`/helmcharts/${helmRelease.chart.metadata.name}`}>
                {helmRelease.chart.metadata.name}
              </Link>
            </dd>
            <dt>{t('SINGLE:MSG_HELMRELEASES_HELMRELEASEDETAILS_TABDETAILS_2')}</dt>
            <dd>{helmRelease.version}</dd>
          </dl>
        </div>
      </div>
      <div className="row">
        <div style={{ paddingTop: '30px' }}>
          <h1>{t('COMMON:MSG_MAIN_TABLEHEADER_110')}</h1>
          <table className='pf-c-table'>
            <thead>
              <tr>
                <th style={{ padding: '5px' }} >{t('SINGLE:MSG_HELMRELEASES_HELMRELEASEDETAILS_TABDETAILS_4')}</th>
                <th style={{ padding: '5px' }} >{t('SINGLE:MSG_HELMRELEASES_HELMRELEASEDETAILS_TABDETAILS_5')}</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(helmRelease.objects).map((k) => {
                return (
                  <tr key={'row-' + k}>
                    <td style={{ padding: '5px' }} >{t(modelFor(k).i18nInfo.label)}</td>
                    <td style={{ padding: '5px' }} ><ResourceLink kind={k} name={helmRelease.objects[k] as string} namespace={helmRelease.namespace} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
};

type HelmreleasestDetailsHeaderProps = {
  namespace: string;
  name: string;
  helmrelease?: any;
};
export const HelmreleasestDetailsHeader: React.FC<HelmreleasestDetailsHeaderProps> = props => {
  const { namespace, name, helmrelease } = props
  const { t } = useTranslation();
  const showActions = true;
  const hasMenuActions = true;
  const [deleteNamesapce, setDeleteNamespace] = React.useState('');
  const [deleteName, setDeleteName] = React.useState('');
  const [open, setOpen] = React.useState(false);

  const options: KebabOption[] = [
    {
      label: 'COMMON:MSG_MAIN_ACTIONBUTTON_15**COMMON:MSG_LNB_MENU_203',
      callback: () => { location.href = `/helmreleases/ns/${namespace}/${name}/edit` },
    },
    {
      label: 'COMMON:MSG_MAIN_ACTIONBUTTON_16**COMMON:MSG_LNB_MENU_203',
      callback: () => { setDeleteNamespace(namespace); setDeleteName(name); setOpen(true) },
    },
  ];

  type DeleteModalProps = {
    namespace: string,
    name: string,
  };
  const DeleteModal: React.FC<DeleteModalProps> = props => {
    const { namespace, name } = props;
    const { t } = useTranslation();
    const [loading, setLoading] = React.useState(false);
    const [host, setHost] = React.useState(defaultHost);
    const ResourceName = () => <strong key={'ResourceName' + name} className="co-break-word">{name}</strong>;
    const Namespace = () => <strong key={'Namespace' + namespace} >{namespace}</strong>;
    const [inProgress, setProgress] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');

    React.useEffect(() => {
      const fetchHelmChart = async () => {
        await coFetchJSON(ingressUrlWithLabelSelector({
          'ingress.tmaxcloud.org/name': 'helm-apiserver',
        })).then((res) => {
          const { items } = res;
          const ingress = items[0];
          setHost(ingress.spec?.rules?.[0]?.host);
          setLoading(true);
        });
      }
      fetchHelmChart();
    }, []);

    const handleModalToggle = () => {
      setOpen(!open);
    };
    const deleteAction = () => {
      setProgress(true);
      const deleteHelmreleases = () => {
        const url = `https://${host}/helm/ns/${namespace}/releases/${name}`;
        coFetchJSON.delete(url)
          .then(() => { setOpen(!open); })
          .catch((e) => {
            setProgress(false);
            setErrorMessage(`error : ${e.json.error}\ndescription : ${e.json.description}`);
          });
      }
      deleteHelmreleases();
    };

    return (
      <React.Fragment>
        <Modal
          isSmall={true}
          title={t('COMMON:MSG_MAIN_ACTIONBUTTON_16', { 0: t('COMMON:MSG_LNB_MENU_203') })}
          isOpen={open}
          onClose={handleModalToggle}
          actions={[
            <Button key="cancel" variant="secondary" onClick={handleModalToggle}>
              {t('COMMON:MSG_COMMON_BUTTON_COMMIT_2')}
            </Button>,
            <Button key="delete" variant="danger" onClick={deleteAction} isActive={loading} >
              {t('COMMON:MSG_COMMON_BUTTON_COMMIT_13')}
            </Button>
          ]}
        >
          <div>
            {inProgress && <LoadingInline />}
            {errorMessage && errorMessage !== '' && <ErrorMessage message={errorMessage} />}
          </div>
          <Trans i18nKey="COMMON:MSG_MAIN_POPUP_DESCRIPTION_6">{[<ResourceName key={name} />, <Namespace key={namespace} />]}</Trans>
        </Modal>
      </React.Fragment>
    );
  }

  return (
    <div style={{ padding: '30px', borderBottom: '1px solid #ccc' }}>
      <div style={{ display: 'inline-block' }}>
        <Link to={`/helmreleases/ns/${namespace}`}>
          {t('COMMON:MSG_LNB_MENU_203')}
        </Link>
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
            {hasMenuActions && (
              <ActionsMenu
                actions={options}
              />
            )}
          </div>
        )}
      </div>
      <DeleteModal namespace={deleteNamesapce} name={deleteName} />
    </div>
  );
};

type HelmreleasesFromProps = {
  namespace: string;
  defaultValue?: any;
};
export const HelmreleasesFrom: React.FC<HelmreleasesFromProps> = props => {
  const { t } = useTranslation();
  const { defaultValue, namespace } = props;
  const chartName = defaultValue ? defaultValue.chart.metadata.name : '';
  const releaseName = defaultValue ? defaultValue.name : '';
  const version = defaultValue ? defaultValue.chart.metadata.version : '';
  const values = defaultValue ? defaultValue.chart.values : null;

  const [loading, setLoading] = React.useState(false);
  const [host, setHost] = React.useState(defaultHost);
  const [selectChartName, setSelectChartName] = React.useState(chartName);
  const [postPackageURL, setPostPackageURL] = React.useState('');
  const [postReleaseName, setPostReleaseName] = React.useState(releaseName);
  const [postVersion, setPostVersion] = React.useState(version);
  const [postValues, setPostValues] = React.useState(safeDump(values));
  const [inProgress, setProgress] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [entries, setEntries] = React.useState([]);
  const [chartNameList, setChartNameList] = React.useState({});

  React.useEffect(() => {
    const fetchHelmChart = async () => {
      let serverURL = '';
      await coFetchJSON(ingressUrlWithLabelSelector({
        'ingress.tmaxcloud.org/name': 'helm-apiserver',
      })).then((res) => {
        const { items } = res;
        if (items?.length > 0) {
          const ingress = items[0];          
          if (!!ingress.spec?.rules?.[0]?.host) {
            serverURL = `https://${ingress.spec?.rules?.[0]?.host}/helm/charts`;
            setHost(ingress.spec?.rules?.[0]?.host);
          }
        }
      });

      await coFetchJSON(serverURL !== '' ? serverURL : `https://${defaultHost}/helm/charts`)
        .then((res) => {
          let tempEntriesList = [];
          let tempChartObject = {};
          let entriesvalues = Object.values(_.get(res, 'indexfile.entries'));
          entriesvalues.map((entries: any) => {
            entries.map((e) => {
              tempEntriesList.push(e);
              let tempObject = { [e.name]: e.name };
              _.merge(tempChartObject, tempObject);
            })
          });
          if (defaultValue) {
            setPostPackageURL(tempEntriesList.filter((e) => { if (e.name === tempChartObject[chartName]) return true; })[0].urls[0]);
          }
          setEntries(tempEntriesList);
          setChartNameList(tempChartObject);
          setLoading(true);
        });
    }
    fetchHelmChart();
  }, []);

  const onClick = () => {
    setProgress(true);
    const putHelmChart = () => {
      const url = `https://${host}/helm/ns/${namespace}/releases`;
      const payload = {
        releaseRequestSpec: {
          packageURL: postPackageURL,
          releaseName: postReleaseName,
          version: postVersion,
        },
        values: postValues,
      };
      coFetchJSON.post(url, payload, { headers: { "user-token": getIdToken() } })
        .then(() => { history.goBack() })
        .catch((e) => {
          setProgress(false);
          setErrorMessage(`error : ${e.json.error}\ndescription : ${e.json.description}`);
        });
    }
    putHelmChart();
  };
  const updatePostReleaseName = (e) => {
    setPostReleaseName(e.target.value);
  };
  const updatePostValues = (newValue, event) => {
    setPostValues(newValue);
    return {};
  };
  const updateChartName = (selection: string) => {
    setSelectChartName(selection);
    setPostVersion(entries.filter((e) => { if (e.name === chartNameList[selection]) return true; })[0].version);
    setPostPackageURL(entries.filter((e) => { if (e.name === chartNameList[selection]) return true; })[0].urls[0]);
  };

  return (
    <div style={{ padding: '30px' }}>
      {loading &&
        <ButtonBar inProgress={inProgress} errorMessage={errorMessage}>
          <form className="co-m-pane__body-group co-m-pane__form" method='post' action={`https://${host}/helm/repos`}>
            <Section label={t('COMMON:MSG_LNB_MENU_223')} id="chartName" isRequired={true}>
              <Dropdown
                name="chartName"
                className="btn-group"
                items={chartNameList} // (필수)
                required={true}
                placeholder={t('COMMON:MSG_LNB_MENU_223')}
                onChange={updateChartName}
                buttonClassName="dropdown-btn" // 선택된 아이템 보여주는 button (title) 부분 className
                itemClassName="dropdown-item" // 드롭다운 아이템 리스트 전체의 className - 각 row를 의미하는 것은 아님
              />
              <Section label={t('SINGLE:MSG_HELMCHARTS_HELMCHARTDETAILS_TABDETAILS_2')} id="chartName" >
                <div>{selectChartName}</div>
              </Section>
              <Section label='Package URL' id="Package URL" >
                <div>{postPackageURL}</div>
              </Section>
              <Section label={t('SINGLE:MSG_HELMCHARTS_HELMCHARTDETAILS_TABDETAILS_3')} id="version" >
                <div>{postVersion}</div>
              </Section>
            </Section>
            <Section label={t('COMMON:MSG_LNB_MENU_203')} id="releaseName" isRequired={true}>
              <input className="pf-c-form-control" id="releaseName" name="releaseName" defaultValue={releaseName} onChange={updatePostReleaseName} disabled={defaultValue} />
            </Section>
            <Section label='values' id="values" isRequired={true}>
              <YAMLEditor value={postValues} minHeight="300px" onChange={updatePostValues} />
            </Section>
            <Button type="button" variant="primary" id="save" onClick={onClick}>{defaultValue ? t('COMMON:MSG_DETAILS_TAB_18') : t('COMMON:MSG_COMMON_BUTTON_COMMIT_1')}</Button>
            <Button style={{ marginLeft: '10px' }} type="button" variant="secondary" id="cancel" onClick={() => { history.goBack(); }}>{t('COMMON:MSG_COMMON_BUTTON_COMMIT_2')}</Button>
          </form>
        </ButtonBar>
      }
    </div>
  );
}

export const HelmReleaseCreatePage: React.FC<HelmReleasePageProps> = ({ match }) => {
  const namespace = match.params.ns;
  const { t } = useTranslation();
  return (
    <>
      <Helmet>
        <title>{t('COMMON:MSG_LNB_MENU_203')}</title>
      </Helmet>
      <NamespacedPage>
        {namespace ? (
          <div style={{ background: 'white', height: '100%' }}>
            <h1>{t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('COMMON:MSG_LNB_MENU_203') })}</h1>
            <HelmreleasesFrom namespace={namespace} />
          </div>
        ) : (
          <SelectNamespacePage />
        )}
      </NamespacedPage>
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
      let serverURL = '';
      await coFetchJSON(ingressUrlWithLabelSelector({
        'ingress.tmaxcloud.org/name': 'helm-apiserver',
      })).then((res) => {
        const { items } = res;
        if (items?.length > 0) {
          const ingress = items[0];
          const host = ingress.spec?.rules?.[0]?.host;
          if (!!host) {
            serverURL = `https://${host}/helm/ns/${namespace}/releases/${name}`;
          }
        }
      });
      await coFetchJSON(serverURL !== '' ? serverURL : `https://${defaultHost}/helm/ns/${namespace}/releases/${name}`)
        .then((res) => {
          setHelmReleases(_.get(res, 'release') || []);
          setLoading(true);
        });
    }
    fetchHelmChart();
  }, [namespace]);

  return (
    <>
      <Helmet>
        <title>{t('COMMON:MSG_LNB_MENU_203')}</title>
      </Helmet>
      <NamespacedPage>
        {namespace ? (
          <div style={{ background: 'white', height: '100%' }}>
            <HelmreleasestDetailsHeader namespace={namespace} name={name} helmrelease={loading ? helmReleases[0] : null} />
            <NavBar pages={allPages} baseURL={`/helmreleases/ns/${namespace}/${name}`} basePath='' />
            {loading ? <HelmreleasesFrom namespace={namespace} defaultValue={helmReleases[0]} /> : <LoadingInline />}
          </div>
        ) : (
          <SelectNamespacePage />
        )}
      </NamespacedPage>
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
  }
];