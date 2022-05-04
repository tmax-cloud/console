import * as React from 'react';
import * as _ from 'lodash-es';
import * as classNames from 'classnames';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { NavBar } from '@console/internal/components/utils/horizontal-nav';
import { coFetchJSON } from '@console/internal/co-fetch';
import { Link } from 'react-router-dom';
import { ingressUrlWithLabelSelector } from '@console/internal/components/hypercloud/utils/ingress-utils';
import { history } from '@console/internal/components/utils/router';
import { Button } from '@patternfly/react-core';
import { SectionHeading, Timestamp, ButtonBar } from '@console/internal/components/utils';
import { Section } from '@console/internal/components/hypercloud/utils/section';
import { Table, TableRow, TableData, RowFunction } from '../factory';
import { NonK8SListPage } from '../factory/nonk8s-list-page';
import { sortable } from '@patternfly/react-table';
import { TFunction } from 'i18next';

const defaultHost = 'console.tmaxcloud.org';

export const HelmchartPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = React.useState(false);
  const [entries, setEntries] = React.useState([]);

  React.useEffect(() => {
    const fetchHelmChart = async () => {
      let serverURL = '';
      await coFetchJSON(
        ingressUrlWithLabelSelector({
          'ingress.tmaxcloud.org/name': 'helm-apiserver',
        }),
      ).then(res => {
        const { items } = res;
        if (items?.length > 0) {
          const ingress = items[0];
          const host = ingress.spec?.rules?.[0]?.host;
          if (!!host) {
            serverURL = `https://${host}/helm/charts`;
          }
        }
      });

      let tempList = [];
      await coFetchJSON(serverURL !== '' ? serverURL : `https://${defaultHost}/helm/charts`).then(res => {
        let entriesvalues = Object.values(_.get(res, 'indexfile.entries'));
        entriesvalues.map(value => {
          tempList.push(value[0]);
        });
      });

      setEntries(tempList);
      setLoading(true);
    };
    fetchHelmChart();
  }, []);
  return <>{loading && <NonK8SListPage title={t('COMMON:MSG_LNB_MENU_223')} clusterScope={true} createButtonText={t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('COMMON:MSG_LNB_MENU_223') })} canCreate={true} items={entries} kind="helmrcharts" ListComponent={Helmcharts} createProps={{ to: '/helmcharts/~new', items: [] }} />}</>;
};

const tableColumnClasses = ['', '', classNames('pf-m-hidden', 'pf-m-visible-on-sm', 'pf-u-w-16-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg')];

const HelmchartTableHeader = (t?: TFunction) => {
  return [
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_1'),
      sortField: 'name',
      transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_130'),
      sortField: 'repo.name',
      transforms: [sortable],
      props: { className: tableColumnClasses[1] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_131'),
      sortField: 'repo.url',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_53'),
      sortField: 'version',
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_12'),
      sortField: 'created',
      transforms: [sortable],
      props: { className: tableColumnClasses[4] },
    },
  ];
};
HelmchartTableHeader.displayName = 'HelmchartTableHeader';

const HelmchartTableRow: RowFunction<any> = ({ obj: helmchart, index, key, style }) => {
  return (
    <TableRow id={helmchart.name} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <Link key={'link' + helmchart.name} to={`/helmcharts/${helmchart.name}`}>
          {helmchart.name}
        </Link>
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>{helmchart.repo.name}</TableData>
      <TableData className={classNames(tableColumnClasses[2], 'co-break-word')}>{helmchart.repo.url}</TableData>
      <TableData className={classNames(tableColumnClasses[3], 'co-break-word')}>{helmchart.version}</TableData>
      <TableData className={classNames(tableColumnClasses[4], 'co-break-word')}>
        <Timestamp timestamp={helmchart.created} />
      </TableData>
    </TableRow>
  );
};
export const Helmcharts: React.FC = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label={t('COMMON:MSG_LNB_MENU_223')} Header={HelmchartTableHeader.bind(null, t)} Row={HelmchartTableRow} virtualize />;
};

type HelmchartFormProps = {
  defaultValue?: any;
};
export const HelmchartForm: React.FC<HelmchartFormProps> = props => {
  const { t } = useTranslation();
  const { defaultValue } = props;
  const name = defaultValue ? Object.values(defaultValue?.indexfile.entries)[0][0].repo.name : '';
  const repoURL = defaultValue ? Object.values(defaultValue?.indexfile.entries)[0][0].repo.url : '';

  const [loading, setLoading] = React.useState(false);
  const [host, setHost] = React.useState(defaultHost);
  const [postName, setPostName] = React.useState(name);
  const [postRepoURL, setPostRepoURL] = React.useState(repoURL);
  const [inProgress, setProgress] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  React.useEffect(() => {
    const fetchHelmChart = async () => {
      await coFetchJSON(
        ingressUrlWithLabelSelector({
          'ingress.tmaxcloud.org/name': 'helm-apiserver',
        }),
      ).then(res => {
        const { items } = res;
        const ingress = items[0];
        setHost(ingress.spec?.rules?.[0]?.host);
        setLoading(true);
      });
    };
    fetchHelmChart();
  }, []);

  const onClick = () => {
    setProgress(true);
    const putHelmChart = () => {
      const url = `https://${host}/helm/repos`;
      const payload = {
        name: postName,
        repoURL: postRepoURL,
      };
      coFetchJSON
        .post(url, payload)
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
  const updatePostName = e => {
    setPostName(e.target.value);
  };
  const updatePostRepoURL = e => {
    setPostRepoURL(e.target.value);
  };

  return (
    <div style={{ padding: '30px' }}>
      {loading && (
        <ButtonBar inProgress={inProgress} errorMessage={errorMessage}>
          <form className="co-m-pane__body-group co-m-pane__form" method="post" action={`https://${host}/helm/repos`}>
            <div className="co-form-section__label">{t('SINGLE:MSG_HELMCHARTS_CREATEFORM_DIV2_1')}</div>
            <div className="co-form-subsection">
              <Section label={t('SINGLE:MSG_HELMCHARTS_CREATEFORM_DIV2_2')} id="name" isRequired={true}>
                <input className="pf-c-form-control" id="name" name="name" defaultValue={name} onChange={updatePostName} />
              </Section>
              <Section label={t('SINGLE:MSG_HELMCHARTS_CREATEFORM_DIV2_3')} id="repoURL" isRequired={true}>
                <input className="pf-c-form-control" id="repoURL" name="repoURL" defaultValue={repoURL} onChange={updatePostRepoURL} />
              </Section>
            </div>
            <div className="co-form-section__separator" />
            <Button type="button" variant="primary" id="save" onClick={onClick}>
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
          </form>
        </ButtonBar>
      )}
    </div>
  );
};
export const HelmchartCreatePage = () => {
  const { t } = useTranslation();
  return (
    <>
      <Helmet>
        <title>{t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('COMMON:MSG_LNB_MENU_223') })}</title>
      </Helmet>
      <div style={{ marginLeft: '15px' }}>
        <h1>{t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('COMMON:MSG_LNB_MENU_223') })}</h1>
      </div>
      <HelmchartForm />
    </>
  );
};

type HelmchartDetailsPagetProps = {
  match?: any;
};
export const HelmchartDetailsPage: React.FC<HelmchartDetailsPagetProps> = props => {
  const name = props.match.params.name;
  const [loading, setLoading] = React.useState(false);
  const [chart, setChart] = React.useState({
    indexfile: {},
    values: {},
  });
  React.useEffect(() => {
    const fetchHelmChart = async () => {
      let serverURL = '';
      await coFetchJSON(
        ingressUrlWithLabelSelector({
          'ingress.tmaxcloud.org/name': 'helm-apiserver',
        }),
      ).then(res => {
        const { items } = res;
        if (items?.length > 0) {
          const ingress = items[0];
          const host = ingress.spec?.rules?.[0]?.host;
          if (!!host) {
            serverURL = `https://${host}/helm/charts/${name}`;
          }
        }
      });

      await coFetchJSON(serverURL !== '' ? serverURL : `https://${defaultHost}helm/charts/${name}`).then(res => {
        setChart(prevState => {
          return { ...prevState, indexfile: res.indexfile, values: res.values };
        });
        setLoading(true);
      });
    };
    fetchHelmChart();
  }, []);

  return (
    <>
      <HelmchartDetailsHeader name={name} />
      <NavBar pages={allPages} baseURL={`/helmcharts/${name}`} basePath="" />
      <div>{loading && <ChartDetailsTapPage chart={chart} />}</div>
    </>
  );
};

type ChartDetailsTapPageProps = {
  chart?: any;
  match?: any;
};
export const ChartDetailsTapPage: React.FC<ChartDetailsTapPageProps> = props => {
  const { t } = useTranslation();
  const { chart } = props;
  const entry: any = Object.values(chart.indexfile.entries)[0][0];
  return (
    <div className="co-m-pane__body">
      <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: t('COMMON:MSG_LNB_MENU_223') })} />
      <div className="row">
        <div className="col-lg-6">
          <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_5')}</dt>
          <dd>{entry.name}</dd>
        </div>
        <div className="col-lg-6">
          <dl className="co-m-pane__details">
            <dt>{t('MULTI:MSG_DEVELOPER_ADD_CREATEFORM_SIDEPANEL_2')}</dt>
            <dd>
              <div>{entry.version}</div>
            </dd>
            <dt>{t('MULTI:MSG_DEVELOPER_ADD_CREATEFORM_SIDEPANEL_3')}</dt>
            <dd>
              <div>{entry.appVersion}</div>
            </dd>
            {entry.sources && (
              <>
                <dt>{t('MULTI:MSG_DEVELOPER_ADD_CREATEFORM_SIDEPANEL_4')}</dt>
                <dd>
                  <div>
                    {entry.sources.map(source => {
                      return <p key={`source-${source}`}>{source}</p>;
                    })}
                  </div>
                </dd>
              </>
            )}
            <dt>{t('SINGLE:MSG_HELMCHARTS_HELMCHARTDETAILS_TABDETAILS_1')}</dt>
            <dd>
              <div>{t('SINGLE:MSG_HELMCHARTS_HELMCHARTDETAILS_TABDETAILS_2') + ' : ' + entry.repo.name}</div>
              <div>{'URL : ' + entry.repo.url}</div>
            </dd>
            <dt>{t('SINGLE:MSG_HELMCHARTS_HELMCHARTDETAILS_TABDETAILS_6')}</dt>
            <dd>
              {entry.maintainers.map(m => {
                return <div key={'mainatainer-key-' + m.name}>{m.name}</div>;
              })}
            </dd>
            <dt>{t('MULTI:MSG_DEVELOPER_ADD_CREATEFORM_SIDEPANEL_9')}</dt>
            <dd>
              <a href={entry.home} target="_blank">
                {entry.home}
              </a>
            </dd>
            <dt>{t('SINGLE:MSG_HELMCHARTS_HELMCHARTDETAILS_TABDETAILS_5')}</dt>
            <dd>
              <Timestamp timestamp={entry.created} />
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
};

type HelmchartEditPagetProps = {
  match?: any;
};
export const HelmchartEditPage: React.FC<HelmchartEditPagetProps> = props => {
  const name = props.match.params.name;
  const [loading, setLoading] = React.useState(false);
  const [chart, setChart] = React.useState({
    indexfile: {},
    values: {},
  });
  React.useEffect(() => {
    const fetchHelmChart = async () => {
      let serverURL = '';

      await coFetchJSON(
        ingressUrlWithLabelSelector({
          'ingress.tmaxcloud.org/name': 'helm-apiserver',
        }),
      ).then(res => {
        const { items } = res;
        if (items?.length > 0) {
          const ingress = items[0];
          const host = ingress.spec?.rules?.[0]?.host;
          if (!!host) {
            serverURL = `https://${host}/helm/charts/${name}`;
          }
        }
      });

      await coFetchJSON(serverURL !== '' ? serverURL : `https://${defaultHost}/helm/charts/${name}`).then(res => {
        setChart(prevState => {
          return { ...prevState, indexfile: res.indexfile, values: res.values };
        });
        setLoading(true);
      });
    };
    fetchHelmChart();
  }, []);

  return (
    <>
      <HelmchartDetailsHeader name={name} />
      <NavBar pages={allPages} baseURL={`/helmcharts/${name}`} basePath="" />
      {loading && <HelmchartForm defaultValue={chart} />}
    </>
  );
};

type HelmchartDetailsHeaderProps = {
  name: string;
};
export const HelmchartDetailsHeader: React.FC<HelmchartDetailsHeaderProps> = props => {
  const { name } = props;
  const { t } = useTranslation();
  return (
    <div style={{ padding: '30px', borderBottom: '1px solid #ccc' }}>
      <div style={{ display: 'inline-block' }}>
        <Link to={'/helmcharts'}>{t('COMMON:MSG_LNB_MENU_223')}</Link>
        {' > ' + t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: t('COMMON:MSG_LNB_MENU_223') })}
      </div>
      <h1>{name}</h1>
    </div>
  );
};
const allPages = [
  {
    name: 'COMMON:MSG_DETAILS_TAB_1',
    href: '',
    component: ChartDetailsTapPage,
  },
  {
    name: 'COMMON:MSG_DETAILS_TAB_18',
    href: 'edit',
    component: HelmchartEditPage,
  },
];
