import * as React from 'react';
import * as _ from 'lodash-es';
import { Helmet } from 'react-helmet';
import { safeLoad } from 'js-yaml';

import { PropertyItem } from '@patternfly/react-catalog-view-extension';
import { ANNOTATIONS, FLAGS, APIError } from '@console/shared';
import { CatalogTileViewPage, Item } from './catalog-items';
import { k8sListPartialMetadata, referenceForModel, serviceClassDisplayName, K8sResourceCommon, K8sResourceKind, PartialObjectMetadata, TemplateKind, k8sList } from '../../module/k8s';
import { withStartGuide } from '../start-guide';
import { connectToFlags, flagPending, FlagsObject } from '../../reducers/features';
import { Firehose, LoadError, PageHeading, skeletonCatalog, StatusBox, FirehoseResult, Box, MsgBox, Timestamp } from '../utils';
import { getAnnotationTags, getMostRecentBuilderTag, isBuilder } from '../image-stream';
import { getImageForIconClass, getImageStreamIcon, getServiceClassIcon, getServiceClassImage, getTemplateIcon, getTemplateCatalogIcon, getTemplateImage } from './catalog-item-icon';
import { ClusterServiceClassModel, TemplateModel, ClusterTemplateModel } from '../../models';
import * as plugins from '../../plugins';
import { coFetch, coFetchJSON } from '../../co-fetch';
import { useTranslation, withTranslation } from 'react-i18next';
import * as noResourceImg from '../../imgs/hypercloud/img_no_resource.svg';
import { Link } from 'react-router-dom';
import { CustomMenusMap } from '@console/internal/hypercloud/menu/menu-types';

export const CatalogPageType = {
  SERVICE_INSTANCE: 'ServiceInstance',
  DEVELOPER: 'Developer',
};

export const getCatalogPageType = () => {
  if (window.location.href.indexOf('/serviceinstance') > 0 && window.location.href.indexOf('/serviceinstance/') < 0) {
    return CatalogPageType.SERVICE_INSTANCE;
  } else {
    return CatalogPageType.DEVELOPER;
  }
};

export const CatalogListPage = withTranslation()(
  class CatalogListPage extends React.Component<any, CatalogListPageState> {
    constructor(props: CatalogListPageProps) {
      super(props);

      const items = this.getItems();
      this.state = { items };
    }

    componentDidUpdate(prevProps) {
      const { templates, clusterTemplates, serviceClasses, clusterServiceClasses, templateMetadata, projectTemplateMetadata, imageStreams, helmCharts, namespace, loaded, t } = this.props;
      if (
        (!prevProps.loaded && loaded) ||
        !_.isEqual(namespace, prevProps.namespace) ||
        !_.isEqual(clusterTemplates, prevProps.clusterTemplates) ||
        !_.isEqual(templates, prevProps.templates) ||
        !_.isEqual(serviceClasses, prevProps.serviceClasses) ||
        !_.isEqual(clusterServiceClasses, prevProps.clusterServiceClasses) ||
        !_.isEqual(templateMetadata, prevProps.templateMetadata) ||
        !_.isEqual(projectTemplateMetadata, prevProps.projectTemplateMetadata) ||
        !_.isEqual(imageStreams, prevProps.imageStreams) ||
        !_.isEqual(helmCharts, prevProps.helmCharts) ||
        !_.isEqual(t, prevProps.t)
      ) {
        const items = this.getItems();
        this.setState({ items });
      }
    }

    getItems(): Item[] {
      const { templates, clusterTemplates, serviceClasses, imageStreams, templateMetadata, projectTemplateMetadata, helmCharts, loaded, t } = this.props;
      // MEMO : getDevCatalogModels로 DevCatalogModel가져와서 normalize실행해주면 dev-catalog.ts에 정의된 normalizeClusterServiceVersions 함수가 실행됨.
      // normalizeClusterServiceVersions함수에서 t함수를 쓰기위해 bind시켜줌.
      const extensionItems = _.flatten(
        plugins.registry
          .getDevCatalogModels()
          .filter(({ properties }) => _.get(this.props, referenceForModel(properties.model)))
          .map(({ properties }) => properties.normalize.bind(null, t)(_.get(this.props, [referenceForModel(properties.model), 'data']))),
      ) as Item[];

      let serviceClassItems: Item[] = [];
      let clusterServiceClassItems: Item[] = [];
      let imageStreamItems: Item[] = [];
      let templateMetadataItems: Item[] = [];
      let projectTemplateItems: Item[] = [];
      let helmChartMetadataItems: Item[] = [];
      let templateItems: Item[] = [];
      let clusterTemplateItems: Item[] = [];

      if (!loaded) {
        return [];
      }

      if (serviceClasses) {
        serviceClassItems = this.normalizeServiceClasses(serviceClasses.data);
      }

      if (templates) {
        templateItems = this.normalizeCatalogTemplates(templates);
      }

      if (clusterTemplates) {
        clusterTemplateItems = this.normalizeClusterTemplates(clusterTemplates.data);
      }

      if (imageStreams) {
        imageStreamItems = this.normalizeImageStreams(imageStreams.data);
      }

      // Templates are not passed as a Firehose item since we only request template metadata.
      if (templateMetadata) {
        templateMetadataItems = this.normalizeTemplates(templateMetadata);
      }

      // Templates are not passed as a Firehose item since we only request template metadata.
      if (projectTemplateMetadata) {
        projectTemplateItems = this.normalizeTemplates(projectTemplateMetadata);
      }

      if (helmCharts) {
        helmChartMetadataItems = this.normalizeHelmCharts(helmCharts);
      }

      const items: Item[] = [...serviceClassItems, ...clusterServiceClassItems, ...imageStreamItems, ...templateMetadataItems, ...extensionItems, ...projectTemplateItems, ...helmChartMetadataItems, ...templateItems, ...clusterTemplateItems];

      return _.sortBy(items, 'tileName');
    }

    normalizeServiceClasses(serviceClasses: K8sResourceKind[]) {
      // MEMO : tileDescription 정보들 기획임시처리로 공백으로 설정해놓음.

      // TODO : namespace가 없을 경우(all-namespace로 선택된 경우) 일단 default로 namespace설정되게 해놨는데 어떻게 처리할지 정해지면 수정하기
      const { namespace = 'default', t } = this.props;
      return _.reduce(
        serviceClasses,
        (acc, serviceClass) => {
          const iconClass = getServiceClassIcon(serviceClass);
          const tileImgUrl = getServiceClassImage(serviceClass);

          // TODO : service class를 사용한 service instance 기획이 나오면 해당 페이지로 이동시켜주도록 href 수정하기
          acc.push({
            obj: serviceClass,
            kind: 'ServiceClass',
            tileName: serviceClassDisplayName(serviceClass),
            tileIconClass: tileImgUrl ? null : iconClass,
            tileImgUrl: tileImgUrl == 'example.com/example.gif' ? null : tileImgUrl, // MEMO : example주소엔 이미지 없어서 기본아이콘으로 뜨게하려고 임시로 조건문 넣어놓음
            tileDescription: serviceClass.spec.description,
            tileProvider: _.get(serviceClass, 'spec.externalMetadata.providerDisplayName'),
            tags: serviceClass.spec.tags,
            categories: serviceClass.spec.externalMetadata.categories,
            createLabel: t('SINGLE:MSG_TEMPLATEINSTANCES_CREATEFORM_DIV2_38'),
            // href: `/catalog/create-service-instance?service-class=${serviceClass.metadata.name}&preselected-ns=${namespace}`,
            href: `/k8s/ns/${namespace}/templateinstances/~new?`,
            supportUrl: _.get(serviceClass, 'spec.externalMetadata.supportUrl'),
            longDescription: _.get(serviceClass, 'spec.externalMetadata.longDescription'),
            documentationUrl: _.get(serviceClass, 'spec.externalMetadata.urlDescription'),
          });
          return acc;
        },
        [] as Item[],
      );
    }

    normalizeTemplates(templates: Array<TemplateKind | PartialObjectMetadata>): Item[] {
      return _.reduce(
        templates,
        (acc, template) => {
          const { name, namespace, annotations = {} } = template.metadata;
          const tags = (annotations.tags || '').split(/\s*,\s*/);
          if (tags.includes('hidden')) {
            return acc;
          }
          const iconClass = getTemplateIcon(template);
          const tileImgUrl = getImageForIconClass(iconClass);
          const tileIconClass = tileImgUrl ? null : iconClass;
          acc.push({
            obj: template,
            kind: 'Template',
            tileName: annotations[ANNOTATIONS.displayName] || name,
            tileIconClass,
            tileImgUrl,
            // tileDescription: annotations.description,
            tileDescription: '',
            tags,
            createLabel: 'Instantiate Template',
            tileProvider: annotations[ANNOTATIONS.providerDisplayName],
            documentationUrl: annotations[ANNOTATIONS.documentationURL],
            supportUrl: annotations[ANNOTATIONS.supportURL],
            href: `/catalog/instantiate-template?template=${name}&template-ns=${namespace}&preselected-ns=${this.props.namespace || ''}`,
          });
          return acc;
        },
        [] as Item[],
      );
    }

    normalizeHelmCharts(chartEntries: HelmChartEntries): Item[] {
      const { namespace: currentNamespace = '', t } = this.props;

      return _.reduce(
        chartEntries,
        (normalizedCharts, charts) => {
          charts.forEach((chart: HelmChart) => {
            const tags = chart.keywords;
            const chartName = chart.name;
            const chartVersion = chart.version;
            const appVersion = chart.appVersion;
            const tileName = `${_.startCase(chartName)} v${chart.version}`;
            const tileImgUrl = chart.icon || getImageForIconClass('icon-helm');
            const chartURL = _.get(chart, 'urls.0');
            // const encodedChartURL = encodeURIComponent(chartURL);
            const markdownDescription = async () => {
              let chartData;
              try {
                chartData = await coFetchJSON(`/api/helm/chart?url=${chartURL}`);
              } catch {
                return null;
              }
              const readmeFile = chartData?.files?.find(file => file.name === 'README.md');
              const readmeData = readmeFile?.data && atob(readmeFile?.data);
              return readmeData && `## README\n${readmeData}`;
            };

            const maintainers = chart.maintainers?.length > 0 && (
              <>
                {chart.maintainers?.map(maintainer => (
                  <>
                    {maintainer.name}
                    <br />
                    <a href={`mailto:${maintainer.email}`}>{maintainer.email}</a>
                    <br />
                  </>
                ))}
              </>
            );

            const customProperties = t => {
              return (
                <>
                  <PropertyItem label={t('MULTI:MSG_DEVELOPER_ADD_CREATEFORM_SIDEPANEL_2')} value={chartVersion} />
                  <PropertyItem label={t('MULTI:MSG_DEVELOPER_ADD_CREATEFORM_SIDEPANEL_3')} value={appVersion} />
                  {chart.sources && <PropertyItem label={t('MULTI:MSG_DEVELOPER_ADD_CREATEFORM_SIDEPANEL_4')} value={chart.sources.join()} />}
                  {chart.repo.name && <PropertyItem label={t('MULTI:MSG_DEVELOPER_ADD_CREATEFORM_SIDEPANEL_5')} value={chart.repo.name} />}
                  {maintainers && <PropertyItem label={t('MULTI:MSG_DEVELOPER_ADD_CREATEFORM_SIDEPANEL_6')} value={maintainers} />}
                  {chart.created && <PropertyItem label={t('MULTI:MSG_DEVELOPER_ADD_CREATEFORM_SIDEPANEL_7')} value={<Timestamp timestamp={chart.created} />} />}
                </>
              );
            };

            const obj = {
              ...chart,
              ...{ metadata: { uid: chart.digest } },
            };

            normalizedCharts.push({
              obj,
              kind: 'HelmChart',
              tileName,
              tileIconClass: null,
              tileImgUrl,
              tileDescription: chart.description,
              tags,
              createLabel: t('MULTI:MSG_DEVELOPER_ADD_CREATEFORM_SIDEPANEL_1'),
              markdownDescription,
              customProperties: customProperties(t),
              // hypercloud
              href: `/helmreleases/ns/${currentNamespace}/~new?chartName=${chartName}&chartRepo=${chart.repo.name}`,
              // openshift
              // href: `/catalog/helm-install?chartName=${chartName}&chartURL=${encodedChartURL}&preselected-ns=${currentNamespace}`,
              documentationUrl: chart.home,
            });
          });
          return normalizedCharts;
        },
        [] as Item[],
      );
    }

    normalizeImageStreams(imageStreams: K8sResourceKind[]): Item[] {
      const builderimageStreams = _.filter(imageStreams, isBuilder);
      return _.map(builderimageStreams, imageStream => {
        const { namespace: currentNamespace = '' } = this.props;
        const { name, namespace } = imageStream.metadata;
        const tag = getMostRecentBuilderTag(imageStream);
        const tileName = _.get(imageStream, ['metadata', 'annotations', ANNOTATIONS.displayName]) || name;
        const iconClass = getImageStreamIcon(tag);
        const tileImgUrl = getImageForIconClass(iconClass);
        const tileIconClass = tileImgUrl ? null : iconClass;
        const tileDescription = _.get(tag, 'annotations.description');
        const tags = getAnnotationTags(tag);
        const createLabel = 'Create Application';
        const tileProvider = _.get(tag, ['annotations', ANNOTATIONS.providerDisplayName]);
        const href = `/catalog/source-to-image?imagestream=${name}&imagestream-ns=${namespace}&preselected-ns=${currentNamespace}`;
        const builderImageTag = _.head(_.get(imageStream, 'spec.tags'));
        const sampleRepo = _.get(builderImageTag, 'annotations.sampleRepo');
        return {
          obj: imageStream,
          kind: 'ImageStream',
          tileName,
          tileIconClass,
          tileImgUrl,
          tileDescription,
          tags,
          createLabel,
          tileProvider,
          href,
          sampleRepo,
        };
      });
    }

    normalizeCatalogTemplates(templates): Item[] {
      const { namespace = 'default', t } = this.props;
      return _.reduce(
        templates,
        (acc, template) => {
          const iconClass = getTemplateCatalogIcon(template);
          const tileImgUrl = getTemplateImage(template);

          // TODO : service class를 사용한 service instance 기획이 나오면 해당 페이지로 이동시켜주도록 href 수정하기
          acc.push({
            obj: template,
            kind: 'Template',
            tileName: template.metadata.name,
            tileIconClass: tileImgUrl ? null : iconClass,
            tileImgUrl: tileImgUrl == 'example.com/example.gif' ? null : tileImgUrl, // MEMO : example주소엔 이미지 없어서 기본아이콘으로 뜨게하려고 임시로 조건문 넣어놓음
            tileDescription: template.shortDescription,
            tileProvider: template.provider,
            tags: template.tags,
            createLabel: t('SINGLE:MSG_TEMPLATEINSTANCES_CREATEFORM_DIV2_38'),
            // href: `/catalog/create-service-instance?service-class=${serviceClass.metadata.name}&preselected-ns=${namespace}`,
            href: `/k8s/ns/${namespace}/templateinstances/~new?type=Template&templateName=${template.metadata.name}`,
            supportUrl: template.metadata.selfLink,
            longDescription: template.longDescription,
            documentationUrl: template.urlDescription,
          });
          return acc;
        },
        [] as Item[],
      );
    }

    normalizeClusterTemplates(clusterTemplates): Item[] {
      const { namespace = 'default', t } = this.props;
      return _.reduce(
        clusterTemplates,
        (acc, clusterTemplate) => {
          const iconClass = getTemplateCatalogIcon(clusterTemplate);
          const tileImgUrl = getTemplateImage(clusterTemplate);

          // TODO : service class를 사용한 service instance 기획이 나오면 해당 페이지로 이동시켜주도록 href 수정하기
          acc.push({
            obj: clusterTemplate,
            kind: 'ClusterTemplate',
            tileName: clusterTemplate.metadata.name,
            tileIconClass: tileImgUrl ? null : iconClass,
            tileImgUrl: tileImgUrl == 'example.com/example.gif' ? null : tileImgUrl, // MEMO : example주소엔 이미지 없어서 기본아이콘으로 뜨게하려고 임시로 조건문 넣어놓음
            tileDescription: clusterTemplate.shortDescription,
            tileProvider: clusterTemplate.provider,
            categories: clusterTemplate.categories,
            createLabel: t('SINGLE:MSG_TEMPLATEINSTANCES_CREATEFORM_DIV2_38'),
            // href: `/catalog/create-service-instance?cluster-service-class=${clusterServiceClass.metadata.name}&preselected-ns=${namespace}`,
            href: `/k8s/ns/${namespace}/templateinstances/~new?type=ClusterTemplate&templateName=${clusterTemplate.metadata.name}`,
            // cluster-service-class=${clusterServiceClass.metadata.name}
            supportUrl: clusterTemplate.metadata.selfLink,
            longDescription: clusterTemplate.longDescription,
            documentationUrl: clusterTemplate.urlDescription,
          });
          return acc;
        },
        [] as Item[],
      );
    }

    render() {
      const { loaded, loadError, namespace = 'default', t } = this.props;
      const { items } = this.state;
      const label = 'Resources';

      const ServiceInstanceEmptyPage = () => {
        return (
          <div>
            <Box className="text-center">
              <img className="cos-status-box__access-denied-icon" src={noResourceImg} />
              <MsgBox title="" detail={t('SINGLE:MSG_SERVICEINSTANCES_CREATEFORM_DIV1_ERROR_1')} />
            </Box>
            <Box className="text-center">
              <Link to={`/k8s/ns/${namespace}/serviceinstances`}>{t('SINGLE:MSG_SERVICEINSTANCES_CREATEFORM_DIV2_ERROR_1')}</Link>
            </Box>
          </div>
        );
      };

      const EmptyPage = getCatalogPageType() === CatalogPageType.SERVICE_INSTANCE ? ServiceInstanceEmptyPage : null;

      return (
        <StatusBox skeleton={skeletonCatalog} data={items} loaded={loaded} loadError={loadError} label={label} EmptyMsg={EmptyPage}>
          <CatalogTileViewPage items={items} />
        </StatusBox>
      );
    }
  },
);
export const Catalog = connectToFlags<CatalogProps>(
  FLAGS.OPENSHIFT,
  FLAGS.SERVICE_CATALOG,
  ...plugins.registry.getDevCatalogModels().map(({ properties }) => properties.flag),
)(props => {
  const { flags, mock, namespace } = props;
  flags[FLAGS.OPENSHIFT] = false; // MEMO: 임시처리...
  flags[FLAGS.SERVICE_CATALOG] = false; // MEMO: 임시처리...
  const openshiftFlag = flags[FLAGS.OPENSHIFT];
  const serviceCatalogFlag = flags[FLAGS.SERVICE_CATALOG];
  const [templateMetadata, setTemplateMetadata] = React.useState<K8sResourceCommon>();
  const [templateError, setTemplateError] = React.useState<APIError>();
  const [projectTemplateMetadata, setProjectTemplateMetadata] = React.useState<K8sResourceCommon[]>(null);
  const [projectTemplateError, setProjectTemplateError] = React.useState<APIError>();
  const [helmCharts, setHelmCharts] = React.useState<HelmChartEntries>();
  const [templates, setTemplates] = React.useState<any[]>();
  const [clusterTemplates, setClusterTemplates] = React.useState<any[]>();

  const loadTemplates = openshiftFlag && !mock;

  // Load templates from the shared `openshift` namespace. Don't use Firehose
  // for templates so that we can request only metadata. This keeps the request
  // much smaller.
  React.useEffect(() => {
    if (!loadTemplates) {
      return;
    }
    k8sListPartialMetadata(TemplateModel, { ns: 'openshift' })
      .then(metadata => {
        setTemplateMetadata(metadata);
        setTemplateError(null);
      })
      .catch(setTemplateError);
  }, [loadTemplates]);

  // Load templates for the current project.
  React.useEffect(() => {
    if (!loadTemplates) {
      return;
    }
    // Don't load templates from the `openshift` namespace twice if it's the current namespace
    if (!namespace || namespace === 'openshift') {
      setProjectTemplateMetadata([]);
      setProjectTemplateError(null);
    } else {
      k8sListPartialMetadata(TemplateModel, { ns: namespace })
        .then(metadata => {
          setProjectTemplateMetadata(metadata);
          setProjectTemplateError(null);
        })
        .catch(setTemplateError);
    }
  }, [loadTemplates, namespace]);

  React.useEffect(() => {
    const fetchHelmChart = async () => {
      const serverURL = (CustomMenusMap as any).Helm.url + '/helm/v1/charts';
      await coFetch(serverURL).then(async res => {
        const yaml = await res.text();
        const json = safeLoad(yaml);
        setHelmCharts(json.indexfile.entries);
      });
    };
    fetchHelmChart();
  }, []);

  React.useEffect(() => {
    k8sList(TemplateModel, { ns: namespace }).then(list => {
      setTemplates(list);
    });
  }, [namespace]);

  React.useEffect(() => {
    k8sList(ClusterTemplateModel).then(list => {
      setClusterTemplates(list);
    });
  }, []);

  const error = templateError || projectTemplateError;
  if (error) {
    return <LoadError message={error.message} label="Templates" className="loading-box loading-box__errored" />;
  }

  if (_.some(flags, flag => flagPending(flag))) {
    return null;
  }

  const resources = [
    ...(serviceCatalogFlag
      ? [
          {
            isList: true,
            kind: referenceForModel(ClusterServiceClassModel),
            namespaced: false,
            prop: 'clusterServiceClasses',
          },
        ]
      : []),
    ...[
      {
        isList: true,
        kind: referenceForModel(ClusterTemplateModel),
        namespaced: false,
        prop: 'clusterTemplates',
      },
    ],
    ...(openshiftFlag
      ? [
          {
            isList: true,
            kind: 'ImageStream',
            namespace: 'openshift',
            prop: 'imageStreams',
          },
        ]
      : []),
    ...(getCatalogPageType() === CatalogPageType.DEVELOPER
      ? plugins.registry
          .getDevCatalogModels()
          .filter(({ properties }) => !properties.flag || flags[properties.flag])
          .map(({ properties }) => ({
            isList: true,
            kind: referenceForModel(properties.model),
            namespaced: properties.model.namespaced,
            namespace,
            prop: referenceForModel(properties.model),
          }))
      : []),
  ];
  return (
    <div className="co-catalog__body">
      <Firehose resources={mock ? [] : resources}>
        <CatalogListPage namespace={namespace} templateMetadata={templateMetadata} projectTemplateMetadata={projectTemplateMetadata} helmCharts={helmCharts} clusterTemplates={clusterTemplates} templates={templates} {...(props as any)} />
      </Firehose>
    </div>
  );
});

export const CatalogPage = withStartGuide(({ match, noProjectsAvailable }) => {
  const { t } = useTranslation();
  const namespace = _.get(match, 'params.ns');

  const CatalogPageTitle = {
    ServiceInstance: t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('COMMON:MSG_LNB_MENU_111') }),
    Developer: 'Developer Catalog',
  };

  const CatalogPageDescription = {
    ServiceInstance: '',
    Developer: t('SINGLE:MSG_SERVICEINSTANCES_CREATEFORM_DIV1_2'),
  };

  const title = CatalogPageTitle[getCatalogPageType()] || 'Catalog';
  const description = CatalogPageDescription[getCatalogPageType()];

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <div className="co-m-page__body">
        <div className="co-catalog">
          <PageHeading title={title} />
          <p className="co-catalog-page__description">{description}</p>
          <Catalog namespace={namespace} mock={noProjectsAvailable} />
        </div>
      </div>
    </>
  );
});

export type CatalogListPageProps = {
  serviceClasses?: FirehoseResult<K8sResourceKind[]>;
  clusterServiceClasses?: FirehoseResult<K8sResourceKind[]>;
  imageStreams?: FirehoseResult<K8sResourceKind[]>;
  templateMetadata?: PartialObjectMetadata[];
  projectTemplateMetadata?: PartialObjectMetadata[];
  helmCharts?: HelmChartEntries;
  loaded: boolean;
  loadError?: string;
  namespace?: string;
};

export type CatalogListPageState = {
  items: Item[];
};

export type CatalogProps = {
  flags: FlagsObject;
  namespace?: string;
  mock: boolean;
};

export type HelmChartEntries = {
  [name: string]: Array<HelmChart>;
};

export type HelmChart = {
  apiVersion: string;
  appVersion: string;
  created: string;
  description: string;
  digest: string;
  home: string;
  icon: string;
  keywords: string[];
  maintainers: Array<{ email: string; name: string }>;
  name: string;
  tillerVersion: string;
  urls: string[];
  version: string;
  repo: { name: string; url: string };
  sources?: string[];
};

CatalogPage.displayName = 'CatalogPage';
Catalog.displayName = 'Catalog';
