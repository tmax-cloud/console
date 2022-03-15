import * as React from 'react';
import * as _ from 'lodash-es';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { SectionHeading, Timestamp } from '../utils';
import { NavBar } from '../utils/horizontal-nav';
import { coFetchJSON } from '@console/internal/co-fetch';
import { Link } from 'react-router-dom';
import { ingressUrlWithLabelSelector } from '@console/internal/components/hypercloud/utils/ingress-utils';
import { history } from '@console/internal/components/utils/router';
import { Button } from '@patternfly/react-core';
import { ButtonBar } from '@console/internal/components/utils';
import { Section } from '@console/internal/components/hypercloud/utils/section';

const defaultServerURL = 'https://console.tmaxcloud.org/helm/charts';

export const HelmchartPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = React.useState(false);
  const [entries, setEntries] = React.useState([]);

  React.useEffect(() => {
    let ignore = false;
    const fetchHelmChart = async () => {
      let res;
      try {
        res = await coFetchJSON(ingressUrlWithLabelSelector({
          'ingress.tmaxcloud.org/name': 'helm-apiserver',
        }))
      } catch { }
      let serverURL = '';
      const { items } = res;
      if (items?.length > 0) {
        const ingress = items[0];
        const host = ingress.spec?.rules?.[0]?.host;
        if (!!host) {
          serverURL = `https://${host}/helm/charts`;
        }
      }
      try {
        res = await coFetchJSON(serverURL !== '' ? serverURL : defaultServerURL);
      } catch { }
      if (ignore) return;
      let tempList = [];
      let entriesvalues = Object.values(_.get(res, 'indexfile.entries'));
      entriesvalues.map((value) => { tempList.push(value); });

      setEntries(tempList);
      setLoading(true);
    }
    fetchHelmChart();
  }, []);
  return (
    <>
      <Helmet>
        <title>{t('COMMON:MSG_LNB_MENU_223')}</title>
      </Helmet>
      <div style={{ padding: '30px 15px 0', display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ margin: '0 0 30px' }}>{t('COMMON:MSG_LNB_MENU_223')}</h1>
        <Link to={`/helmchart/~new`}>
          <Button type="button" variant="primary" id="create" style={{ alignSelf: 'letf' }}>{t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('COMMON:MSG_LNB_MENU_223') })}</Button>
        </Link>
      </div>
      <div style={{ padding: '0px 30px 30px' }}>
        {loading && <EntriesTable entries={entries} />}
      </div>
    </>
  );
}

type EntriesTableProps = {
  entries: any[];
};
const EntriesTable: React.FC<EntriesTableProps> = props => {
  const { t } = useTranslation();
  const { entries } = props;
  
  return (
    <div>
      {/*<div>filter</div>*/}
      {/*<div>search</div>*/}      
      <table >
        <thead>
          <tr>
            <th style={{padding: '5px'}} >{t('COMMON:MSG_MAIN_TABLEHEADER_1')}</th>
            <th style={{padding: '5px'}} >{t('COMMON:MSG_MAIN_TABLEHEADER_130')}</th>
            <th style={{padding: '5px'}} >{t('COMMON:MSG_MAIN_TABLEHEADER_131')}</th>
            <th style={{padding: '5px'}} >{t('COMMON:MSG_MAIN_TABLEHEADER_53')}</th>
            <th style={{padding: '5px'}} >{t('COMMON:MSG_MAIN_TABLEHEADER_12')}</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            return entry.map((e) => {
              const { name, repo, version, created } = e;
              return (
                <tr key={'row-' + name}>
                  <td style={{padding: '5px'}} >
                    <Link key={'link' + name} to={`/helmchart/${name}`}>
                      {name}
                    </Link>
                  </td>
                  <td style={{padding: '5px'}} >{repo.name}</td>
                  <td style={{padding: '5px'}} >{repo.url}</td>
                  <td style={{padding: '5px'}} >{version}</td>
                  <td style={{padding: '5px'}} ><Timestamp timestamp={created} /></td>
                </tr>
              )
            });
          })}
        </tbody>
      </table>
    </div>
  );
}

type HelmchartFrom = {
  defaultValue?: any
};
export const HelmchartFrom: React.FC<HelmchartFrom> = props => {
  const { t } = useTranslation();
  const { defaultValue } = props;
  const name = defaultValue ? Object.values(defaultValue?.indexfile.entries)[0][0].repo.name : '';
  const repoURL = defaultValue ? Object.values(defaultValue?.indexfile.entries)[0][0].repo.url : '';

  const [loading, setLoading] = React.useState(false);
  const [host, setHost] = React.useState(defaultServerURL);
  const [postName, setPostName] = React.useState(name);
  const [postRepoURL, setPostRepoURL] = React.useState(repoURL);

  React.useEffect(() => {
    let ignore = false;
    const fetchHelmChart = async () => {
      let res;
      try {
        res = await coFetchJSON(ingressUrlWithLabelSelector({
          'ingress.tmaxcloud.org/name': 'helm-apiserver',
        }))
      } catch { }
      if (ignore) return;
      const { items } = res;
      const ingress = items[0];
      setHost(ingress.spec?.rules?.[0]?.host);
      setLoading(true);
    }
    fetchHelmChart();
  }, []);

  const [inProgress, setProgress] = React.useState(false);
  const [errorMessage, setError] = React.useState('');

  const onClick = () => {
    setProgress(true);
    let ignore = false;
    const putHelmChart = async () => {
      const url = `https://${host}/helm/repos`;
      const payload = {
        name: postName,
        repoURL: postRepoURL,
      };
      try {
        await coFetchJSON.post(url, payload);
        history.goBack();
      } catch (e) {
        setProgress(false);
        setError("error : " + e.json.error + '\ndescription : ' + e.json.description);
      }
      if (ignore) return;
    }
    putHelmChart();
  };
  const updatePostName = (e) => {
    setPostName(e.target.value);
  };
  const updatePostRepoURL = (e) => {
    setPostRepoURL(e.target.value);
  };

  return (
    <div style={{ padding: '30px' }}>
      {loading &&
        <ButtonBar inProgress={inProgress} errorMessage={errorMessage}>
          <form className="co-m-pane__body-group co-m-pane__form" method='post' action={`https://${host}/helm/repos`}>
            <Section label={t('COMMON:MSG_MAIN_TABLEHEADER_130')} id="name" isRequired={true}>
              <input className="pf-c-form-control" id="name" name="name" defaultValue={name} onChange={updatePostName} />
            </Section>
            <Section label={t('COMMON:MSG_MAIN_TABLEHEADER_131')} id="repoURL" isRequired={true}>
              <input className="pf-c-form-control" id="repoURL" name="repoURL" defaultValue={repoURL} onChange={updatePostRepoURL} />
            </Section>
            <Button type="button" variant="primary" id="save" onClick={onClick}>{defaultValue ? t('COMMON:MSG_DETAILS_TAB_18') : t('COMMON:MSG_COMMON_BUTTON_COMMIT_1')}</Button>
            <Button type="button" variant="secondary" id="cancel" onClick={() => { history.goBack(); }}>{t('COMMON:MSG_COMMON_BUTTON_COMMIT_2')}</Button>
          </form>
        </ButtonBar>
      }
    </div>
  );
}
export const HelmchartCratePage = () => {
  const { t } = useTranslation();
  return (
    <>
      <Helmet>
        <title>{t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('COMMON:MSG_LNB_MENU_223') })}</title>
      </Helmet>
      <h1>{t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('COMMON:MSG_LNB_MENU_223') })}</h1>
      <HelmchartFrom />
    </>
  );
}

type HelmchartDetailsPagetProps = {
  match?: any;
}
export const HelmchartDetailsPage: React.FC<HelmchartDetailsPagetProps> = props => {
  const name = props.match.params.name;
  const [loading, setLoading] = React.useState(false);
  const [chart, setChart] = React.useState({
    indexfile: {},
    values: {}
  });
  React.useEffect(() => {
    let ignore = false;
    const fetchHelmChart = async () => {
      let res;
      try {
        res = await coFetchJSON(ingressUrlWithLabelSelector({
          'ingress.tmaxcloud.org/name': 'helm-apiserver',
        }))
      } catch { }
      let serverURL = '';
      const { items } = res;
      if (items?.length > 0) {
        const ingress = items[0];
        const host = ingress.spec?.rules?.[0]?.host;
        if (!!host) {
          serverURL = `https://${host}/helm/charts/${name}`;
        }
      }
      try {
        res = await coFetchJSON(serverURL !== '' ? serverURL : defaultServerURL);
      } catch { }
      if (ignore) return;
      setChart((prevState) => { return { ...prevState, indexfile: res.indexfile, values: res.values } });
      setLoading(true);
    }
    fetchHelmChart();
  }, []);

  return (
    <>
      <HelmchartDetailsHeader name={name} />
      <NavBar pages={allPages} baseURL={`/helmchart/${name}`} basePath='' />
      <div>
        {loading && <ChartDetailsTapPage chart={chart} />}
      </div>
    </>
  );
}

type ChartDetailsTapPageProps = {
  chart?: any;
  match?: any;
}
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
          <dd>
            {entry.name}
          </dd>
        </div>
        <div className="col-lg-6">
          <dl className="co-m-pane__details">
            <dt>{t('SINGLE:MSG_HELMCHARTS_HELMCHARTDETAILS_TABDETAILS_1')}</dt>
            <dd>
              <div>{t('SINGLE:MSG_HELMCHARTS_HELMCHARTDETAILS_TABDETAILS_2') + ' : ' + entry.repo.name}</div>
              <div>{'URL : ' + entry.repo.url}</div>
            </dd>
            <dt>{t('SINGLE:MSG_HELMCHARTS_HELMCHARTDETAILS_TABDETAILS_3')}</dt>
            <dd>
              {entry.version}
            </dd>
            <dt>{t('SINGLE:MSG_HELMCHARTS_HELMCHARTDETAILS_TABDETAILS_4')}</dt>
            <dd>
              <a href={entry.home} target='_blank'>
                {entry.home}
              </a>
            </dd>
            <dt>{t('SINGLE:MSG_HELMCHARTS_HELMCHARTDETAILS_TABDETAILS_5')}</dt>
            <dd>
              <Timestamp timestamp={entry.created} />
            </dd>
            <dt>{t('SINGLE:MSG_HELMCHARTS_HELMCHARTDETAILS_TABDETAILS_6')}</dt>
            <dd>
              {entry.maintainers.map((m) => { return (<div key={'mainatainer-key-' + m.name}>{m.name}</div>) })}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  )
};

type HelmchartEditPagetProps = {
  match?: any;
}
export const HelmchartEditPage: React.FC<HelmchartEditPagetProps> = props => {
  const name = props.match.params.name;
  const [loading, setLoading] = React.useState(false);
  const [chart, setChart] = React.useState({
    indexfile: {},
    values: {}
  });
  React.useEffect(() => {
    let ignore = false;
    const fetchHelmChart = async () => {
      let res;
      try {
        res = await coFetchJSON(ingressUrlWithLabelSelector({
          'ingress.tmaxcloud.org/name': 'helm-apiserver',
        }))
      } catch { }
      let serverURL = '';
      const { items } = res;
      if (items?.length > 0) {
        const ingress = items[0];
        const host = ingress.spec?.rules?.[0]?.host;
        if (!!host) {
          serverURL = `https://${host}/helm/charts/${name}`;
        }
      }
      try {
        res = await coFetchJSON(serverURL !== '' ? serverURL : defaultServerURL);
      } catch { }
      if (ignore) return;
      setChart((prevState) => { return { ...prevState, indexfile: res.indexfile, values: res.values } });
      setLoading(true);
    }
    fetchHelmChart();
  }, []);

  return (
    <>
      <HelmchartDetailsHeader name={name} />
      <NavBar pages={allPages} baseURL={`/helmchart/${name}`} basePath='' />
      {/*<HorizontalNav pages={allPages} match={props.match} />*/}
      {loading && <HelmchartFrom defaultValue={chart} />}
    </>
  );
}

type HelmchartDetailsHeaderProps = {
  name: string;
};
export const HelmchartDetailsHeader: React.FC<HelmchartDetailsHeaderProps> = props => {
  const { name } = props
  const { t } = useTranslation();
  return (
    <div style={{ padding: '30px', borderBottom: '1px solid #ccc' }}>
      <div style={{ display: 'inline-block' }}>
        <Link to={'/helmchart'}>
          {t('COMMON:MSG_LNB_MENU_223')}
        </Link>
        {' > ' + t('COMMON:MSG_LNB_MENU_223') + ' ' + t('SINGLE:MSG_NODES_NODEDETAILS_TABOVERVIEW_1')}
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
  }
];