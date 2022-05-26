import * as React from 'react';
import * as _ from 'lodash-es';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { NavBar } from '@console/internal/components/utils/horizontal-nav';
import { coFetchJSON } from '@console/internal/co-fetch';
import { Link } from 'react-router-dom';
import { history } from '@console/internal/components/utils/router';
import { Button } from '@patternfly/react-core';
import { SectionHeading, Timestamp, ButtonBar } from '@console/internal/components/utils';
import { Section } from '@console/internal/components/hypercloud/utils/section';
import { TableProps } from './utils/default-list-component';
import { ListPage } from '../factory';
import { CustomMenusMap } from '@console/internal/hypercloud/menu/menu-types';
import { LoadingBox } from '../utils';

const helmHost: string = (CustomMenusMap as any).Helm.url;

export const HelmchartPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = React.useState(false);
  const [entries, setEntries] = React.useState([]);

  React.useEffect(() => {
    const fetchHelmChart = async () => {
      let tempList = [];
      await coFetchJSON(`${helmHost}/helm/charts`).then(res => {
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
  return <>{loading ? <ListPage title={t('COMMON:MSG_LNB_MENU_223')} createButtonText={t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('SINGLE:MSG_HELMCHARTS_HELMCHARTDETAILS_TABDETAILS_1') })} canCreate={true} items={entries} kind="helmrcharts" createProps={{ to: '/helmcharts/~new', items: [] }} tableProps={tableProps} isK8SResource={false} isClusterScope={true} /> : <LoadingBox />}</>;
};

const tableProps: TableProps = {
  header: [
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_1',
      sortField: 'name',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_130',
      sortField: 'repo.name',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_131',
      sortField: 'repo.url',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_53',
      sortField: 'version',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_12',
      sortField: 'created',
    },
  ],
  row: (obj: any) => {
    return [
      {
        children: (
          <Link key={'link' + obj.name} to={`/helmcharts/${obj.repo?.name}/${obj.name}`}>
            {obj.name}
          </Link>
        ),
      },
      {
        children: obj.repo.name,
      },
      {
        children: obj.repo.url,
      },
      {
        children: obj.version,
      },
      {
        children: <Timestamp timestamp={obj.created} />,
      },
    ];
  },
};

type HelmchartFormProps = {
  defaultValue?: any;
};
export const HelmchartForm: React.FC<HelmchartFormProps> = props => {
  const { t } = useTranslation();
  const { defaultValue } = props;
  const name = defaultValue ? Object.values(defaultValue?.indexfile.entries)[0][0].repo.name : '';
  const repoURL = defaultValue ? Object.values(defaultValue?.indexfile.entries)[0][0].repo.url : '';
  const [postName, setPostName] = React.useState(name);
  const [postRepoURL, setPostRepoURL] = React.useState(repoURL);
  const [inProgress, setProgress] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const onClick = () => {
    setProgress(true);
    const putHelmChart = () => {
      const url = `${helmHost}/helm/repos`;
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
      <ButtonBar inProgress={inProgress} errorMessage={errorMessage}>
        <form className="co-m-pane__body-group co-m-pane__form" method="post" action={`${helmHost}/helm/repos`}>
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
    </div>
  );
};
export const HelmchartCreatePage = () => {
  const { t } = useTranslation();
  return (
    <>
      <Helmet>
        <title>{t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('SINGLE:MSG_HELMCHARTS_HELMCHARTDETAILS_TABDETAILS_1') })}</title>
      </Helmet>
      <div style={{ marginLeft: '15px' }}>
        <h1>{t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('SINGLE:MSG_HELMCHARTS_HELMCHARTDETAILS_TABDETAILS_1') })}</h1>
      </div>
      <HelmchartForm />
    </>
  );
};

type HelmchartDetailsPagetProps = {
  match?: any;
};
export const HelmchartDetailsPage: React.FC<HelmchartDetailsPagetProps> = props => {
  const repo = props.match.params.repo;
  const name = props.match.params.name;
  const [loading, setLoading] = React.useState(false);
  const [chart, setChart] = React.useState({
    indexfile: {},
    values: {},
  });
  React.useEffect(() => {
    const fetchHelmChart = async () => {
      await coFetchJSON(`${helmHost}/helm/charts/${repo}_${name}`).then(res => {
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
      <NavBar pages={allPages} baseURL={`/helmcharts/${repo}/${name}`} basePath="" />
      <div>{loading ? <ChartDetailsTapPage chart={chart} /> : <LoadingBox />}</div>
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
                    {entry.sources?.map(source => {
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
              {entry.maintainers?.map(m => {
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
      await coFetchJSON(`${helmHost}/helm/charts/${name}`).then(res => {
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
  // {
  //   name: 'COMMON:MSG_DETAILS_TAB_18',
  //   href: 'edit',
  //   component: HelmchartEditPage,
  // },
];
