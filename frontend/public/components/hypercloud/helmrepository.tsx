import * as React from 'react';
import * as _ from 'lodash-es';
import * as classNames from 'classnames';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { coFetchJSON } from '@console/internal/co-fetch';
import { Link } from 'react-router-dom';
import { history } from '@console/internal/components/utils/router';
import { Button, Radio } from '@patternfly/react-core';
import { sortable, compoundExpand } from '@patternfly/react-table';
import { SectionHeading, Timestamp, ButtonBar, detailsPage, navFactory, Kebab, KebabOption, KebabAction, Page } from '@console/internal/components/utils';
import { Section } from '@console/internal/components/hypercloud/utils/section';
import { TableProps } from './utils/default-list-component';
import { DetailsPage, ListPage, DetailsPageProps, Table } from '../factory';
import { CustomMenusMap } from '@console/internal/hypercloud/menu/menu-types';
import { LoadingBox } from '../utils';
import { getIngressUrl } from './utils/ingress-utils';
import { deleteModal, helmrepositoryUpdateModal } from '../modals';
import { TFunction } from 'i18next';
import { ExpandableInnerTable } from './utils/expandable-inner-table';
import { HelmRepositoryModel, HelmChartModel } from '@console/internal/models/hypercloud/helm-model';

const kind = HelmRepositoryModel.kind;

const getHost = async () => {
  const mapUrl = (CustomMenusMap as any).Helm.url;
  return mapUrl !== '' ? mapUrl : await getIngressUrl('helm-apiserver');
};

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

const HelmRepositoryExtendTableRow = data => {
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
              title: <ExpandableInnerTable aria-label="Helm Chart Table" header={InnerTableHeader} Row={InnerTableRow(item.name)} data={innerItemsDataResult}></ExpandableInnerTable>,
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
      title: <Link to={`/helmrepositories/${obj.name}`}>{obj.name}</Link>,
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

const InnerTableHeader = [
  {
    title: '이름',
    transforms: [sortable],
  },
  {
    title: '최신버전',
    transforms: [sortable],
  },
];

const InnerTableRow = repoName => {
  return obj => {
    return [
      {
        title: <Link to={`/helmcharts/${repoName}/${obj.name}`}>{obj.name}</Link>,
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
  return <Table {...props} aria-label="Helm Repository" Header={HelmRepositoryTableHeader.bind(null, t)} virtualize={false} expandable={true} expandableRows={HelmRepositoryExtendTableRow} />;
};
HelmRepositoriesList.displayName = 'HelmRepositoriesList';

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
  const [postID, setPostID] = React.useState('');
  const [postPassword, setPostPassword] = React.useState('');
  const [inProgress, setProgress] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [host, setHost] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [isPrivate, setIsPrivate] = React.useState(false);

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
      const payload = isPrivate
        ? {
            name: postName,
            repoURL: postRepoURL,
            is_private: isPrivate,
            id: postID,
            password: postPassword,
          }
        : { name: postName, repoURL: postRepoURL };
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
  const updatePostID = e => {
    setPostID(e.target.value);
  };
  const updatePostPassword = e => {
    setPostPassword(e.target.value);
  };
  const handleTypeChangePublic = () => {
    setIsPrivate(false);
  };
  const handleTypeChangePrivate = () => {
    setIsPrivate(true);
  };

  return (
    <div style={{ padding: '30px' }}>
      {loading ? (
        <ButtonBar inProgress={inProgress} errorMessage={errorMessage}>
          <form className="co-m-pane__body-group co-m-pane__form" method="post" action={`${host}/helm/repos`}>
            <div className="co-form-section__label">{t('SINGLE:MSG_HELMCHARTS_CREATEFORM_DIV2_1')}</div>
            <div className="co-form-subsection">
              <Section label={'리포지터리 타입'} id="repositorytype">
                <div className={classNames('co-radio-group', { 'co-radio-group--inline': true })}>
                  <div className="radio">
                    <Radio isChecked={isPrivate === false} onChange={handleTypeChangePublic} id="radio-1" label="Public" name="repository-type" />
                    <Radio isChecked={isPrivate === true} onChange={handleTypeChangePrivate} id="radio-2" label="Private" name="repository-type" />
                  </div>
                </div>
              </Section>
              <Section label={t('SINGLE:MSG_HELMCHARTS_CREATEFORM_DIV2_2')} id="name" isRequired={true}>
                <input className="pf-c-form-control" id="name" name="name" defaultValue={name} onChange={updatePostName} />
              </Section>
              <Section label={t('SINGLE:MSG_HELMCHARTS_CREATEFORM_DIV2_3')} id="repoURL" isRequired={true}>
                <input className="pf-c-form-control" id="repoURL" name="repoURL" defaultValue={repoURL} onChange={updatePostRepoURL} />
              </Section>
              {isPrivate && (
                <>
                  <Section label={t('SINGLE:MSG_VIRTUALMACHINES_CREATEFORM_STEP4_DIV2_5')} id="id" isRequired={true}>
                    <input className="pf-c-form-control" id="id" name="id" defaultValue={postID} onChange={updatePostID} />
                  </Section>
                  <Section label={t('SINGLE:MSG_VIRTUALMACHINES_CREATEFORM_STEP4_DIV2_6')} id="password" isRequired={true}>
                    <input className="pf-c-form-control" id="password" name="password" defaultValue={postPassword} onChange={updatePostPassword} />
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
