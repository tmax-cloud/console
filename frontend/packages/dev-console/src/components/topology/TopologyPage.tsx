import * as React from 'react';
import { Helmet } from 'react-helmet';
import { matchPath, match as RMatch, Redirect } from 'react-router-dom';
import { Popover, Button } from '@patternfly/react-core';
import { QuestionCircleIcon } from '@patternfly/react-icons';
import { StatusBox, Firehose, HintBlock, AsyncComponent, removeQueryArgument, PageHeading } from '@console/internal/components/utils';

import EmptyState from '../EmptyState';
import NamespacedPage, { NamespacedPageVariants } from '../NamespacedPage';
import ProjectsExistWrapper from '../ProjectsExistWrapper';
//import ProjectListPage from '../projects/ProjectListPage';
import ConnectedTopologyDataController, { RenderProps } from './TopologyDataController';
import Topology from './Topology';
import TopologyShortcuts from './TopologyShortcuts';
import { LAST_TOPOLOGY_VIEW_LOCAL_STORAGE_KEY } from './components/const';

import './TopologyPage.scss';
import { TOPOLOGY_SEARCH_FILTER_KEY } from './filters';
import { useTranslation } from 'react-i18next';

export interface TopologyPageProps {
  match: RMatch<{
    name?: string;
  }>;
}

const setTopologyActiveView = (id: string) => {
  localStorage.setItem(LAST_TOPOLOGY_VIEW_LOCAL_STORAGE_KEY, id);
};

const getTopologyActiveView = () => {
  return localStorage.getItem(LAST_TOPOLOGY_VIEW_LOCAL_STORAGE_KEY);
};

const EmptyMsg = () => {
  const { t } = useTranslation();
  return (
    <EmptyState
      title={t('COMMON:MSG_LNB_MENU_191')}
      hintBlock={
        <HintBlock title={t('SINGLE:MSG_ADD_CREATFORM_3')}>
          <p>{t('SINGLE:MSG_ADD_CREATFORM_4')}</p>
        </HintBlock>
      }
    />
  );
};

export function renderTopology({ loaded, loadError, data, namespace }: RenderProps) {
  return (
    <StatusBox data={data ? data.graph.nodes : null} label="Topology" loaded={loaded} loadError={loadError} EmptyMsg={EmptyMsg}>
      <div className="odc-topology">
        <Topology data={data} namespace={namespace} />
      </div>
    </StatusBox>
  );
}

const SelectNamespacePage = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className="odc-empty-state__title">
        <PageHeading title={t('COMMON:MSG_LNB_MENU_191')} />
        <div className="co-catalog-page__description odc-empty-state__hint-block">{t('COMMON:MSG_LNB_MENU_DESCRIPTION_1')}</div>
      </div>
    </>
  );
};

export const TopologyPage: React.FC<TopologyPageProps> = ({ match }) => {
  const namespace = match.params.name;
  const showListView = !!matchPath(match.path, {
    path: '*/list',
    exact: true,
  });
  const showGraphView = !!matchPath(match.path, {
    path: '*/graph',
    exact: true,
  });

  const handleNamespaceChange = (ns: string) => {
    if (ns !== namespace) {
      removeQueryArgument(TOPOLOGY_SEARCH_FILTER_KEY);
    }
  };

  React.useEffect(() => setTopologyActiveView(showListView && !showGraphView ? 'list' : 'graph'), [showListView, showGraphView]);

  if (!showGraphView && !showListView) {
    return <Redirect to={`/topology/${namespace ? `ns/${namespace}` : 'all-namespaces'}/${getTopologyActiveView() === 'list' ? 'list' : 'graph'}`} />;
  }

  return (
    <>
      <Helmet>
        <title>Topology</title>
      </Helmet>
      <NamespacedPage
        variant={showListView ? NamespacedPageVariants.light : NamespacedPageVariants.default}
        hideApplications={showListView}
        onNamespaceChange={handleNamespaceChange}
        toolbar={
          <>
            {!showListView && namespace && (
              <Popover aria-label="Shortcuts" bodyContent={TopologyShortcuts} position="left" maxWidth="100vw">
                <Button type="button" variant="link" className="odc-topology__shortcuts-button" icon={<QuestionCircleIcon />} data-test-id="topology-view-shortcuts">
                  View shortcuts
                </Button>
              </Popover>
            )}
            {/* <Tooltip position="left" content={showListView ? 'Topology View' : 'List View'}>
              <Link className="pf-c-button pf-m-plain" to={`/topology/${namespace ? `ns/${namespace}` : 'all-namespaces'}${showListView ? '/graph' : '/list'}`}>
                {showListView ? <TopologyIcon size="md" /> : <ListIcon size="md" />}
              </Link>
            </Tooltip> */}
          </>
        }
      >
        <Firehose resources={[{ kind: 'Namespace', prop: 'projects', isList: true }]}>
          <ProjectsExistWrapper title="Topology">
            {namespace ? showListView ? <AsyncComponent mock={false} match={match} title="" EmptyMsg={EmptyMsg} emptyBodyClass="odc-namespaced-page__content" loader={() => import('@console/internal/components/overview' /* webpackChunkName: "topology-overview" */).then(m => m.Overview)} /> : <ConnectedTopologyDataController match={match} render={renderTopology} /> : <SelectNamespacePage />}
          </ProjectsExistWrapper>
        </Firehose>
      </NamespacedPage>
    </>
  );
};

export default TopologyPage;
