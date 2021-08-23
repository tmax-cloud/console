import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import * as _ from 'lodash-es';
import { RootState } from '../../redux';
import { setPinnedResources } from '../../actions/ui';
import { getActivePerspective, getPinnedResources } from '../../reducers/ui';
import { k8sGet } from '@console/internal/module/k8s';
import { ClusterMenuPolicyModel } from '@console/internal/models';
import { dynamicMenusFactory, basicMenusFactory } from './menus';
import './_perspective-nav.scss';
import { PerspectiveType } from '../../hypercloud/perspectives';

type StateProps = {
  perspective: string;
  pinnedResources: string[];
};

interface DispatchProps {
  onPinnedResourcesChange: (resources: string[]) => void;
}

const PerspectiveNav: React.FC<StateProps & DispatchProps> = ({ perspective }) => {
  const [cmp, setCmp] = React.useState(null);

  React.useEffect(() => {
    // MEMO : CMP에 대한 CR은 하나만 있어야 해서 'admincmp' 고정된 이름으로 CR 만들었을 때만 적용되도록 이름 고정.
    k8sGet(ClusterMenuPolicyModel, 'admincmp')
      .then(res => {
        setCmp(res);
      })
      .catch(err => {
        // MEMO : CMP CR이 없을 땐 기본메뉴들로 구성하도록 설정함. getNavItems에서 tabs 없을 시 기본메뉴 return함.
        setCmp({ tabs: [] });
      });
  }, [perspective]);

  return !!cmp ? getNavItems(perspective, cmp) : <></>;
};

const getNavItems = (perspective, cmp) => {
  const tabs = cmp.menuTabs;

  switch (perspective) {
    case PerspectiveType.MULTI: {
      const multiMenus = _.filter(tabs, { name: 'Multi' });
      if (multiMenus?.length > 0) {
        return dynamicMenusFactory(perspective, multiMenus[0]);
      } else {
        return basicMenusFactory(PerspectiveType.MULTI);
      }
    }
    case PerspectiveType.MASTER: {
      const masterMenus = _.filter(tabs, { name: 'Master' });
      if (masterMenus?.length > 0) {
        // MEMO : CR안에 Master메뉴에 대한 정의가 여러 개여도 0번째만 가져와서 반영 되도록.
        return dynamicMenusFactory(perspective, masterMenus[0]);
      } else {
        return basicMenusFactory(PerspectiveType.MASTER);
      }
    }
    case PerspectiveType.SINGLE: {
      const singleMenus = _.filter(tabs, { name: 'Single' });
      if (singleMenus?.length > 0) {
        return dynamicMenusFactory(perspective, singleMenus[0]);
      } else {
        return basicMenusFactory(PerspectiveType.SINGLE);
      }
    }
    case PerspectiveType.DEVELOPER: {
      const developerMenus = _.filter(tabs, { name: 'Developer' });
      if (developerMenus?.length > 0) {
        return dynamicMenusFactory(perspective, developerMenus[0]);
      } else {
        return basicMenusFactory(PerspectiveType.DEVELOPER);
      }
    }
    default:
      return <></>;
  }
};

const mapStateToProps = (state: RootState): StateProps => {
  return {
    perspective: getActivePerspective(state),
    pinnedResources: getPinnedResources(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  onPinnedResourcesChange: (resources: string[]) => {
    dispatch(setPinnedResources(resources));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(PerspectiveNav);
