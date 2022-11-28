import * as React from 'react';
import * as _ from 'lodash';
import { Helmet } from 'react-helmet';
import { match as RMatch } from 'react-router';
import { Firehose, FirehoseResource, HintBlock, PageHeading } from '@console/internal/components/utils';
import { K8sResourceKind, referenceForModel } from '@console/internal/module/k8s';
import { ServiceModel } from '@console/knative-plugin';
import ODCEmptyState from './EmptyState';
import NamespacedPage from './NamespacedPage';
import ProjectsExistWrapper from './ProjectsExistWrapper';
// import CreateProjectListPage from './projects/CreateProjectListPage';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import * as restrictedSignImg from '../../../../public/imgs/img_no selected resource.svg';

export interface AddPageProps {
  match: RMatch<{
    ns?: string;
  }>;
}

interface ResourcesType {
  deploymentConfigs?: K8sResourceKind;
  deployments?: K8sResourceKind;
  daemonSets?: K8sResourceKind;
  statefulSets?: K8sResourceKind;
  knativeService?: K8sResourceKind;
}
interface EmptyStateLoaderProps {
  resources?: ResourcesType;
  loaded?: boolean;
  loadError?: string;
}

// const handleProjectCreate = (project: K8sResourceKind) => history.push(`/add/ns/${project.metadata.name}`);

const EmptyStateLoader: React.FC<EmptyStateLoaderProps> = ({ resources, loaded, loadError }) => {
  const [noWorkloads, setNoWorkloads] = React.useState(false);
  const daemonSets = resources?.daemonSets?.data;
  const deploymentConfigs = resources?.deploymentConfigs?.data;
  const deployments = resources?.deployments?.data;
  const statefulSets = resources?.statefulSets?.data;
  const knativeService = resources?.knativeService?.data;
  const { t } = useTranslation();

  React.useEffect(() => {
    if (loaded) {
      setNoWorkloads(_.isEmpty(daemonSets) && _.isEmpty(deploymentConfigs) && _.isEmpty(deployments) && _.isEmpty(statefulSets) && _.isEmpty(knativeService));
    } else if (loadError) {
      setNoWorkloads(false);
    }
  }, [loaded, loadError, daemonSets, deploymentConfigs, deployments, statefulSets, knativeService]);
  return noWorkloads ? (
    <ODCEmptyState
      title={t('SINGLE:MSG_ADD_CREATEFORM_TABDETAILS_1')}
      hintBlock={
        <HintBlock title={t('SINGLE:MSG_ADD_CREATFORM_3')}>
          <p>{t('SINGLE:MSG_ADD_CREATFORM_4')}</p>
        </HintBlock>
      }
    />
  ) : (
    <ODCEmptyState title={t('SINGLE:MSG_ADD_CREATEFORM_TABDETAILS_1')} hintBlock={t('SINGLE:MSG_ADD_CREATEFORM_TABDETAILS_2')} />
  );
};

const RenderEmptyState = ({ namespace }) => {
  const resources: FirehoseResource[] = [
    {
      isList: true,
      kind: 'DeploymentConfig',
      namespace,
      prop: 'deploymentConfigs',
      limit: 1,
    },
    {
      isList: true,
      kind: 'Deployment',
      namespace,
      prop: 'deployments',
      limit: 1,
    },
    {
      isList: true,
      kind: 'DaemonSet',
      namespace,
      prop: 'daemonSets',
      limit: 1,
    },
    {
      isList: true,
      kind: 'StatefulSet',
      namespace,
      prop: 'statefulSets',
      limit: 1,
    },
    {
      isList: true,
      kind: referenceForModel(ServiceModel),
      namespace,
      prop: 'knativeService',
      optional: true,
      limit: 1,
    },
  ];
  return (
    <Firehose resources={resources}>
      <EmptyStateLoader />
    </Firehose>
  );
};

const AddComponent: React.SFC<AddComponentProps> = ({ title, message, errMessage, img, link, linkText }) => {
  return (
    <>
      <div className="co-m-pane__body" data-test-id="error-page">
        {img && <img className="co-m-pane__heading-img" src={img} />}
        <h1 className="co-m-pane__heading co-m-pane__heading--center co-m-pane__heading-error-h1">{title}</h1>
        {message && <div className="text-center">{message}</div>}
        {errMessage && <div className="text-center text-muted">{errMessage}</div>}
        {link && (
          <h2 className="text-center">
            <Link to={link} className="text-center">
              {linkText}
            </Link>
          </h2>
        )}
      </div>
    </>
  );
};

const SelectNamespacePage = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className="odc-empty-state__title">
        <PageHeading title={t('COMMON:MSG_LNB_MENU_217')} />
        <div className="co-catalog-page__description odc-empty-state__hint-block">{t('SINGLE:MSG_ADD_CREATEFORM_TABDETAILS_2')}</div>
        <div>
          <Helmet>
            <title>{t('COMMON:MSG_COMMON_ERROR_MESSAGE_66').split('\n')[0]}</title>
          </Helmet>
          <AddComponent title={t('COMMON:MSG_COMMON_ERROR_MESSAGE_49')} message={t('COMMON:MSG_COMMON_ERROR_MESSAGE_50')} img={restrictedSignImg} link="/k8s/cluster/namespaces/~new" linkText={t('COMMON:MSG_COMMON_ERROR_MESSAGE_68')} />
        </div>
      </div>
    </>
  );
};

export const AddPage: React.FC<AddPageProps> = ({ match }) => {
  const namespace = match.params.ns;
  const { t } = useTranslation();
  return (
    <>
      <Helmet>
        <title>{t('COMMON:MSG_LNB_MENU_217')}</title>
      </Helmet>
      <NamespacedPage>
        <Firehose resources={[{ kind: 'Namespace', prop: 'projects', isList: true }]}>
          <ProjectsExistWrapper title={t('SINGLE:MSG_ADD_CREATEFORM_TABDETAILS_1')}>{namespace ? <RenderEmptyState namespace={namespace} /> : <SelectNamespacePage />}</ProjectsExistWrapper>
        </Firehose>
      </NamespacedPage>
    </>
  );
};

export default AddPage;
export type AddComponentProps = {
  title: string;
  message?: string;
  errMessage?: string;
  img?: any;
  link?: string;
  linkText?: string;
};
