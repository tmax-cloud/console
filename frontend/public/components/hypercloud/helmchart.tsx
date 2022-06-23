import * as React from 'react';
import * as _ from 'lodash-es';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { NavBar } from '@console/internal/components/utils/horizontal-nav';
import { coFetchJSON } from '@console/internal/co-fetch';
import { Link } from 'react-router-dom';
import { history } from '@console/internal/components/utils/router';
import { Button } from '@patternfly/react-core';
import { SectionHeading, Timestamp, ButtonBar, detailsPage, navFactory } from '@console/internal/components/utils';
import { Section } from '@console/internal/components/hypercloud/utils/section';
import { TableProps } from './utils/default-list-component';
import { DetailsPage, ListPage, DetailsPageProps } from '../factory';
import { CustomMenusMap } from '@console/internal/hypercloud/menu/menu-types';
import { LoadingBox } from '../utils';
import { getIngressUrl } from './utils/ingress-utils';
import { HelmChartModel } from '@console/internal/models/hypercloud';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { kindObj } from '../utils';

const kind = HelmChartModel.kind;

const getHost = async () => {
  const mapUrl = (CustomMenusMap as any).Helm.url;
  return mapUrl !== '' ? mapUrl : await getIngressUrl('helm-apiserver');
};

type HelmchartPagetProps = {
  match?: any;
};
export const HelmchartPage: React.FC<HelmchartPagetProps> = props => {
  const { t } = useTranslation();
  return <ListPage {...props} canCreate={true} tableProps={tableProps} kind={kind} createButtonText={t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('SINGLE:MSG_HELMCHARTS_HELMCHARTDETAILS_TABDETAILS_1') })} createProps={{ to: '/helmcharts/~new', items: [] }} hideLabelFilter={true} />;
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
        children: obj.repo?.name,
      },
      {
        children: obj.repo?.url,
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
  const [host, setHost] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const updateHost = async () => {
      const tempHost = await getHost();
      if (!tempHost || tempHost === '') {
        setErrorMessage('Helm Server is not found');
      }
      setHost(tempHost);
      setLoading(true);
    };
    updateHost();
  }, []);

  const onClick = () => {
    setProgress(true);
    const putHelmChart = () => {
      const url = `${host}/helm/repos`;
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
      {loading ? (
        <ButtonBar inProgress={inProgress} errorMessage={errorMessage}>
          <form className="co-m-pane__body-group co-m-pane__form" method="post" action={`${host}/helm/repos`}>
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
            <Button type="button" variant="primary" id="save" onClick={onClick} isDisabled={!host}>
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
      ) : (
        <LoadingBox />
      )}
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

const { details } = navFactory;
export const HelmchartDetailsPage: React.FC<DetailsPageProps> = props => {
  const helmChartKindObj: any = kindObj(kind);
  return <DetailsPage {...props} kind={kind} pages={[details(detailsPage(HelmChartDetails))]} customData={{ helmRepo: props.match?.params?.repo }} name={props.match?.params?.name} kindObj={helmChartKindObj} />;
};
const HelmChartDetails: React.FC<HelmChartDetailsProps> = ({ obj: entry }) => {
  const { t } = useTranslation();
  return (
    <div className="co-m-pane__body">
      <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(entry, t) })} />
      <div className="row">
        <div className="col-lg-6">
          <dl data-test-id="resource-summary" className="co-m-pane__details">
            <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_5')}</dt>
            <dd>{entry.name}</dd>
          </dl>
        </div>
        <div className="col-lg-6">
          <HelmChartDetailsList entry={entry} />
        </div>
      </div>
    </div>
  );
};
type HelmChartDetailsProps = {
  obj: any;
};
export const HelmChartDetailsList: React.FC<HelmChartDetailsListProps> = ({ entry }) => {
  const { t } = useTranslation();
  return (
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
  );
};
type HelmChartDetailsListProps = {
  entry: any;
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
  const [isRefresh, setIsRefresh] = React.useState(true);

  React.useEffect(() => {
    const fetchHelmChart = async () => {
      const host = await getHost();
      await coFetchJSON(`${host}/helm/charts/${name}`)
        .then(res => {
          setChart(prevState => {
            return { ...prevState, indexfile: res.indexfile, values: res.values };
          });
          setLoading(true);
        })
        .catch(e => {
          setIsRefresh(false);
        });
    };
    fetchHelmChart();
  }, [isRefresh]);

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
  // {
  //   name: 'COMMON:MSG_DETAILS_TAB_18',
  //   href: 'edit',
  //   component: HelmchartEditPage,
  // },
];
