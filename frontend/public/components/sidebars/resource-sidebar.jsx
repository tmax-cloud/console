import * as _ from 'lodash-es';
import * as React from 'react';
import { Button } from '@patternfly/react-core';
import * as classNames from 'classnames';
import { CloseIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { ResourceSidebarSnippets, ResourceSidebarSamples } from './resource-sidebar-samples';
import { ExploreType } from './explore-type-sidebar';
import { SimpleTabNav, ResourceSummary } from '../utils';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { modelFor } from '@console/internal/module/k8s';

const sidebarScrollTop = () => {
  document.getElementsByClassName('co-p-has-sidebar__sidebar')[0].scrollTop = 0;
};

class ResourceSidebarWrapper extends React.Component {
  render() {
    const { label, children, showSidebar, toggleSidebar, isFloat = false, t } = this.props;

    if (!showSidebar) {
      return null;
    }

    return (
      <div className={classNames('co-p-has-sidebar__sidebar', 'co-p-has-sidebar__sidebar--bordered', 'hidden-sm hidden-xs', { sidebar__details: isFloat })}>
        {/* tabIndex is necessary to restore keyboard scrolling as a result of PatternFly's <Page> having a hard-coded tabIndex.  See https://github.com/patternfly/patternfly-react/issues/4180 */}
        <div className="co-m-pane__body co-p-has-sidebar__sidebar-body" tabIndex={-1}>
          <Button type="button" className="co-p-has-sidebar__sidebar-close" variant="plain" aria-label="Close" onClick={toggleSidebar}>
            <CloseIcon />
          </Button>
          <h2 className="co-p-has-sidebar__sidebar-heading">{label}</h2>
          {children}
        </div>
      </div>
    );
  }
}

const ResourceDetails = props => {
  const { showName, showID, showDescription, showPodSelector, showNodeSelector, showTolerations, showAnnotations, showOwner, resource, customPathId } = props;
  return <ResourceSummary resource={resource} showName={showName} showID={showID} showDescription={showDescription} showPodSelector={showPodSelector} showNodeSelector={showNodeSelector} showTolerations={showTolerations} showAnnotations={showAnnotations} showOwner={showOwner} customPathId={customPathId} />;
};

const ResourceSchema = (definition, { kindObj }) => <ExploreType kindObj={kindObj} scrollTop={sidebarScrollTop} definition={definition} />;

const ResourceSamples = ({ samples, kindObj, downloadSampleYaml, loadSampleYaml }) => <ResourceSidebarSamples samples={samples} kindObj={kindObj} downloadSampleYaml={downloadSampleYaml} loadSampleYaml={loadSampleYaml} />;

const ResourceSnippets = ({ snippets, kindObj, insertSnippetYaml }) => <ResourceSidebarSnippets snippets={snippets} kindObj={kindObj} insertSnippetYaml={insertSnippetYaml} />;

export const ResourceSidebar = props => {
  const { t } = useTranslation();
  const { definition, showName, showID, showDescription, showPodSelector, title, isFloat, showNodeSelector, showTolerations, showAnnotations, showOwner, downloadSampleYaml, kindObj, loadSampleYaml, insertSnippetYaml, isCreateMode, showDetails, toggleSidebar, showSidebar, samples, snippets, resource, showSchema, noTabsOnlyDetails, customPathId } = props;
  if (!kindObj || !showSidebar) {
    return null;
  }

  const label = title || ResourceLabel(kindObj, t);

  const showSamples = !_.isEmpty(samples) && isCreateMode;
  const showSnippets = !_.isEmpty(snippets);

  let tabs = [];
  if (showSamples) {
    tabs.push({
      name: t('COMMON:MSG_CREATEYAML_DIV3_TABSAMPLE_1'),
      component: ResourceSamples,
    });
  }
  if (showSnippets) {
    tabs.push({
      name: 'Snippets',
      component: ResourceSnippets,
    });
  }
  if (showSchema) {
    tabs = [
      {
        name: t('COMMON:MSG_CREATEYAML_DIV3_TABSCHEMA_1'),
        component: ResourceSchema.bind(null, definition),
      },
      ...tabs,
    ];
  }
  if (showDetails) {
    tabs = [{ name: t('COMMON:MSG_DETAILS_TAB_1'), component: ResourceDetails }];
  }

  return (
    <ResourceSidebarWrapper label={label} showSidebar={showSidebar} isFloat={isFloat} toggleSidebar={toggleSidebar} t={t}>
      {noTabsOnlyDetails ? <ResourceDetails {...props} /> : <>{tabs.length > 0 ? <SimpleTabNav tabs={tabs} tabProps={{ showName, showID, showDescription, showPodSelector, showNodeSelector, showTolerations, showAnnotations, showOwner, downloadSampleYaml, kindObj, loadSampleYaml, insertSnippetYaml, samples, snippets, resource, customPathId }} additionalClassNames="co-m-horizontal-nav__menu--within-sidebar" /> : <ResourceSchema kindObj={kindObj} definition={definition} />}</>}
    </ResourceSidebarWrapper>
  );
};
