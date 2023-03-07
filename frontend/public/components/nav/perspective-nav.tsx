import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import * as _ from 'lodash-es';
import { RootState } from '../../redux';
import { setPinnedResources } from '../../actions/ui';
import { getActivePerspective, getPinnedResources } from '../../reducers/ui';
import { getCmpListFetchUrl } from '@console/internal/components/hypercloud/utils/menu-utils';
import { coFetchJSON } from '@console/internal/co-fetch';
import { basicMenusFactory, dynamicMenusFactory } from './menus';
import './_perspective-nav.scss';
import { FlagsObject, getFlagsObject } from '@console/internal/reducers/features';
import { PerspectiveType } from '../../hypercloud/perspectives';
import { FLAGS } from '@console/shared';

type StateProps = {
  perspective: string;
  pinnedResources: string[];
  flags: FlagsObject;
};

interface DispatchProps {
  onPinnedResourcesChange: (resources: string[]) => void;
}

const PerspectiveNav: React.FC<StateProps & DispatchProps> = ({ perspective, flags }) => {
  const [cmp, setCmp] = React.useState(null);

  React.useEffect(() => {
    coFetchJSON(getCmpListFetchUrl())
      .then(res => {
        if (res?.items?.length > 0) {
          // MEMO : primary=true 레이블 가진 리소스 중 첫번째 리소스내용만 적용되도록 구현.
          setCmp(res.items[0]);
        } else {
          setCmp({ tabs: [] });
        }
      })
      .catch(err => {
        // MEMO : CMP CR이 없을 땐 기본메뉴들로 구성하도록 설정함. getNavItems에서 tabs 없을 시 기본메뉴 return함.
        setCmp({ tabs: [] });
      });
  }, [perspective]);

  return !!cmp ? getNavItems(perspective, cmp, flags) : <></>;
};

const getNavItems = (perspective, cmp, flags) => {
  const tabs = cmp.menuTabs;
  switch (perspective) {
    case PerspectiveType.MULTI: {
      const multiMenus = _.filter(tabs, { name: PerspectiveType.MULTI });
      if (multiMenus?.length > 0) {
        return dynamicMenusFactory(perspective, multiMenus[0], flags[FLAGS.CAN_LIST_NS]);
      } else {
        return tabs ? <></> : basicMenusFactory(PerspectiveType.MULTI, flags[FLAGS.CAN_LIST_NS]);
      }
    }
    case PerspectiveType.MASTER: {
      const masterMenus = _.filter(tabs, { name: PerspectiveType.MASTER });
      if (masterMenus?.length > 0) {
        // MEMO : CR안에 Master메뉴에 대한 정의가 여러 개여도 0번째만 가져와서 반영 되도록.
        return dynamicMenusFactory(perspective, masterMenus[0], flags[FLAGS.CAN_LIST_NS]);
      } else {
        return tabs ? <></> : basicMenusFactory(PerspectiveType.MASTER, flags[FLAGS.CAN_LIST_NS]);
      }
    }
    case PerspectiveType.SINGLE: {
      const singleMenus = _.filter(tabs, { name: PerspectiveType.SINGLE });
      if (singleMenus?.length > 0) {
        return dynamicMenusFactory(perspective, singleMenus[0], flags[FLAGS.CAN_LIST_NS]);
      } else {
        return tabs ? <></> : basicMenusFactory(PerspectiveType.SINGLE, flags[FLAGS.CAN_LIST_NS]);
      }
    }
    case PerspectiveType.DEVELOPER: {
      const developerMenus = _.filter(tabs, { name: PerspectiveType.DEVELOPER });
      if (developerMenus?.length > 0) {
        return dynamicMenusFactory(perspective, developerMenus[0], flags[FLAGS.CAN_LIST_NS]);
      } else {
        return tabs ? <></> : basicMenusFactory(PerspectiveType.DEVELOPER, flags[FLAGS.CAN_LIST_NS]);
      }
    }
    case PerspectiveType.BAREMETAL: {
      const baremetalMenus = _.filter(tabs, { name: PerspectiveType.BAREMETAL });
      if (baremetalMenus?.length > 0) {
        return dynamicMenusFactory(perspective, baremetalMenus[0], flags[FLAGS.CAN_LIST_NS]);
      } else {
        return tabs ? <></> : basicMenusFactory(PerspectiveType.BAREMETAL, flags[FLAGS.CAN_LIST_NS]);
      }
    }
    case PerspectiveType.SAS: {
      const sasMenus = _.filter(tabs, { name: PerspectiveType.SAS });
      if (sasMenus?.length > 0) {
        return dynamicMenusFactory(perspective, sasMenus[0], flags[FLAGS.CAN_LIST_NS]);
      } else {
        return tabs ? <></> : basicMenusFactory(PerspectiveType.SAS, flags[FLAGS.CAN_LIST_NS]);
      }
    }
    case PerspectiveType.CUSTOM: {
      const customMenus = _.filter(tabs, { name: PerspectiveType.CUSTOM });
      if (customMenus?.length > 0) {
        return dynamicMenusFactory(perspective, customMenus[0], flags[FLAGS.CAN_LIST_NS]);
      } else {
        return tabs ? <></> : basicMenusFactory(PerspectiveType.MASTER, flags[FLAGS.CAN_LIST_NS]);
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
    flags: getFlagsObject(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  onPinnedResourcesChange: (resources: string[]) => {
    dispatch(setPinnedResources(resources));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(PerspectiveNav);
