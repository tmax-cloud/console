import * as React from 'react';
import * as _ from 'lodash-es';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { coFetchJSON } from '@console/internal/co-fetch';
import { Link } from 'react-router-dom';
import { history } from '@console/internal/components/utils/router';
import { Button } from '@patternfly/react-core';
import { SectionHeading, Timestamp, ButtonBar, detailsPage, navFactory, Kebab, KebabOption, KebabAction, Page } from '@console/internal/components/utils';
import { Section } from '@console/internal/components/hypercloud/utils/section';
import { TableProps } from './utils/default-list-component';
import { DetailsPage, ListPage, DetailsPageProps } from '../factory';
import { CustomMenusMap } from '@console/internal/hypercloud/menu/menu-types';
import { LoadingBox } from '../utils';
import { getIngressUrl } from './utils/ingress-utils';
import { NonK8sKind } from '../../module/k8s';
import { MenuLinkType } from '@console/internal/hypercloud/menu/menu-types';
import { deleteModal, helmrepositoryUpdateModal } from '../modals';
import { Radio } from '@patternfly/react-core';

export const HelmRepositoryModel: NonK8sKind = {
  kind: 'HelmRepository',
  label: 'Helm Repository',
  labelPlural: 'Helm Repositories',
  abbr: 'HR',
  namespaced: false,
  plural: 'helmrepositories',
  menuInfo: {
    visible: true,
    type: MenuLinkType.HrefLink,
    isMultiOnly: false,
    href: '/helmrepositories',
  },
  i18nInfo: {
    label: 'COMMON:MSG_LNB_MENU_241',
    labelPlural: 'COMMON:MSG_LNB_MENU_240',
  },
  nonK8SResource: true,
};

const kind = HelmRepositoryModel.kind;

const getHost = async () => {
  const mapUrl = (CustomMenusMap as any).Helm.url;
  return mapUrl !== '' ? mapUrl : await getIngressUrl('helm-apiserver');
};

type HelmrepositoryPageProps = {
  match?: any;
};
export const HelmrepositoryPage: React.FC<HelmrepositoryPageProps> = props => {
  return <ListPage {...props} canCreate={true} tableProps={tableProps} kind={kind} createProps={{ to: '/helmrepositories/~new', items: [] }} hideLabelFilter={true} customData={{ nonK8sResource: true, kindObj: HelmRepositoryModel }} isK8sResource={false} />;
};

const tableProps: TableProps = {
  header: [
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_1',
      sortField: 'name',
    },
    {
      title: 'SINGLE:MSG_HELMREPOSITORIES_HELMREPOSITORYDETAILS_TABDETAILS_1',
      sortField: 'url',
    },
    {
      title: 'SINGLE:MSG_HELMREPOSITORIES_HELMREPOSITORYDETAILS_TABHELMCHARTS_1',
      sortField: 'charts.length',
    },
    {
      title: 'SINGLE:MSG_HELMREPOSITORIES_HELMREPOSITORYDETAILS_TABDETAILS_2',
      sortField: 'lastupdated',
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
        label: 'COMMON:MSG_MAIN_ACTIONBUTTON_51**COMMON:MSG_LNB_MENU_241',
        callback: async () => {
          const host = await getHost();
          helmrepositoryUpdateModal({
            updateServiceURL: `${host}/helm/repos/${obj.name}`,
            stringKey: 'COMMON:MSG_LNB_MENU_241',
            name: obj.name,
          });
        },
      },
      {
        label: 'COMMON:MSG_MAIN_ACTIONBUTTON_16**COMMON:MSG_LNB_MENU_241',
        callback: async () => {
          const host = await getHost();
          deleteModal({
            nonk8sProps: {
              deleteServiceURL: `${host}/helm/repos/${obj.name}`,
              stringKey: 'COMMON:MSG_LNB_MENU_241',
              name: obj.name,
            },
          });
        },
      },
    ];
    return [
      {
        children: <Link to={`/helmrepositories/${obj.name}`}>{obj.name}</Link>,
      },
      {
        children: obj.url,
      },
      {
        children: obj.charts?.map(chart => {
          return <div key={chart.name}>{chart.name}</div>;
        }),
      },
      {
        children: <Timestamp timestamp={obj.lastupdated} />,
      },
      {
        className: Kebab.columnClass,
        children: <Kebab options={options} />,
      },
    ];
  },
};

type HelmrepositoryFormProps = {
  defaultValue?: any;
};
export const HelmrepositoryForm: React.FC<HelmrepositoryFormProps> = props => {
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
  const [repositoryType, setRepositoryType] = React.useState('Public');

  const repositoryTypeItems = [
    {
      title: 'Public',
      value: 'Public',
    },
    {
      title: 'Private',
      value: 'Private',
    },
  ];

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
    const putHelmRepository = () => {
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
    putHelmRepository();
  };
  const updatePostName = e => {
    setPostName(e.target.value);
  };
  const updatePostRepoURL = e => {
    setPostRepoURL(e.target.value);
  };
  const handleModeChange = e => {
    setRepositoryType(e.target.value);
  };

  return (
    <div style={{ padding: '30px' }}>
      {loading ? (
        <ButtonBar inProgress={inProgress} errorMessage={errorMessage}>
          <form className="co-m-pane__body-group co-m-pane__form" method="post" action={`${host}/helm/repos`}>
            <div className="co-form-section__label">{t('SINGLE:MSG_HELMCHARTS_CREATEFORM_DIV2_1')}</div>
            <div className="co-form-subsection">
              <Section label={'리포지터리 타입'} id="repositorytype">
                <Radio value={repositoryType} isChecked={repositoryType === 'Private'} onChange={handleModeChange} id="radio-1" className="ceph-install--no-margin" label="Internal" name="repository-type" />
              </Section>
              <Section label={t('SINGLE:MSG_HELMCHARTS_CREATEFORM_DIV2_2')} id="name" isRequired={true}>
                <input className="pf-c-form-control" id="name" name="name" defaultValue={name} onChange={updatePostName} />
              </Section>
              <Section label={t('SINGLE:MSG_HELMCHARTS_CREATEFORM_DIV2_3')} id="repoURL" isRequired={true}>
                <input className="pf-c-form-control" id="repoURL" name="repoURL" defaultValue={repoURL} onChange={updatePostRepoURL} />
              </Section>
              {repositoryType === 'Private ' && (
                <>
                  <Section label={t('SINGLE:MSG_HELMCHARTS_CREATEFORM_DIV2_3')} id="repoURL" isRequired={true}>
                    <input className="pf-c-form-control" id="repoURL" name="repoURL" defaultValue={repoURL} onChange={updatePostRepoURL} />
                  </Section>
                  <Section label={t('SINGLE:MSG_HELMCHARTS_CREATEFORM_DIV2_3')} id="repoURL" isRequired={true}>
                    <input className="pf-c-form-control" id="repoURL" name="repoURL" defaultValue={repoURL} onChange={updatePostRepoURL} />
                  </Section>
                </>
              )}
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
export const HelmrepositoryCreatePage = () => {
  const { t } = useTranslation();
  return (
    <>
      <Helmet>
        <title>{t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('SINGLE:MSG_HELMCHARTS_HELMCHARTDETAILS_TABDETAILS_1') })}</title>
      </Helmet>
      <div style={{ marginLeft: '15px' }}>
        <h1>{t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('SINGLE:MSG_HELMCHARTS_HELMCHARTDETAILS_TABDETAILS_1') })}</h1>
      </div>
      <HelmrepositoryForm />
    </>
  );
};

const { details } = navFactory;
const chartsPage: (c?: React.ComponentType<any>) => Page = component => ({
  href: 'charts',
  name: 'COMMON:MSG_MAIN_TABLEHEADER_142',
  component,
});

export const HelmChartModel: NonK8sKind = {
  kind: 'HelmChart',
  label: 'Helm Chart',
  labelPlural: 'Helm Charts',
  abbr: 'HC',
  namespaced: false,
  plural: 'helmcharts',
  menuInfo: {
    visible: true,
    type: MenuLinkType.HrefLink,
    isMultiOnly: false,
    href: '/helmcharts',
  },
  i18nInfo: {
    label: 'COMMON:MSG_LNB_MENU_224',
    labelPlural: 'COMMON:MSG_LNB_MENU_223',
  },
  nonK8SResource: true,
};
const chartTableProps = (repoName: string): TableProps => {
  return {
    header: [
      {
        title: 'COMMON:MSG_MAIN_TABLEHEADER_1',
        sortField: 'name',
      },
      {
        title: 'COMMON:MSG_MAIN_TABLEHEADER_141',
        sortField: 'version',
      },
    ],
    row: (obj: any) => {
      return [
        {
          children: <Link to={`/helmcharts/${repoName}/${obj.name}`}>{obj.name}</Link>,
        },
        {
          children: obj.version,
        },
      ];
    },
  };
};

type ChartListPageProps = {
  name: string;
};
export const ChartListPage: React.FC<ChartListPageProps> = props => {
  const { name } = props;
  return <ListPage tableProps={chartTableProps(name)} kind={HelmChartModel.kind} hideLabelFilter={true} customData={{ nonK8sResource: true, kindObj: HelmChartModel, helmRepo: name }} isK8sResource={false} />;
};

export const HelmrepositoryDetailsPage: React.FC<DetailsPageProps> = props => {
  const { t } = useTranslation();
  const name = props.match?.params?.name;
  const menuActions: KebabAction[] = [
    () => ({
      label: 'COMMON:MSG_MAIN_ACTIONBUTTON_51**COMMON:MSG_LNB_MENU_241',
      callback: async () => {
        const host = await getHost();
        helmrepositoryUpdateModal({
          updateServiceURL: `${host}/helm/repos/${name}`,
          stringKey: 'COMMON:MSG_LNB_MENU_241',
          name: name,
        });
      },
    }),
    () => ({
      label: 'COMMON:MSG_MAIN_ACTIONBUTTON_16**COMMON:MSG_LNB_MENU_241',
      callback: async () => {
        const host = await getHost();
        deleteModal({
          nonk8sProps: {
            deleteServiceURL: `${host}/helm/repos/${name}`,
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
      pages={[details(detailsPage(HelmRepositoryDetails)), chartsPage(() => ChartListPage({ name }))]}
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
