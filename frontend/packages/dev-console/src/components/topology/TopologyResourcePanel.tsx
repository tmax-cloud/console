import * as React from 'react';
import { ResourceOverviewPage } from '@console/internal/components/overview/resource-overview-page';
import * as _ from 'lodash';
// import KnativeResourceOverviewPage from '@console/knative-plugin/src/components/overview/KnativeResourceOverviewPage';
import { KebabAction } from '@console/internal/components/utils';
import { TopologyDataObject } from './topology-types';
import { ModifyApplication } from '../../actions/modify-application';

export type TopologyResourcePanelProps = {
  item: TopologyDataObject;
};

const TopologyResourcePanel: React.FC<TopologyResourcePanelProps> = ({ item }) => {
  const resourceItemToShowOnSideBar = item && item.resources;

  // MEMO : Knative 리소스류에 대한 디테일페이지 띄워주는 부분 주석처리 (현재는 리소스종류 상관없이 kind기준으로 동일한 디테일뷰 띄워주고있어서)
  // adds extra check, custom sidebar for all knative resources excluding deployment
  // const itemKind = _.get(item, 'data.kind', null);
  // if (_.get(item, 'data.isKnativeResource', false) && itemKind && itemKind !== 'Deployment') {
  //   return <KnativeResourceOverviewPage item={item.resources} />;
  // }

  let customActions: KebabAction[] = null;
  if (!item.operatorBackedService) {
    customActions = [ModifyApplication];
  }

  return resourceItemToShowOnSideBar && <ResourceOverviewPage item={resourceItemToShowOnSideBar} kind={resourceItemToShowOnSideBar.obj.kind} customActions={customActions} />;
};

export default TopologyResourcePanel;
