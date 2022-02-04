import * as React from 'react';
import * as _ from 'lodash-es';
import { Translation } from 'react-i18next';
import { TFunction, i18n } from 'i18next';
import { modelFor } from '@console/internal/module/k8s';
import { NavSection } from '@console/internal/components/nav/section';
import { HrefLink, ResourceNSLink, ResourceClusterLink, NewTabLink, Separator } from '@console/internal/components/nav/items';
import HyperCloudDefaultMenus from '@console/internal/hypercloud/menu/hc-default-menus';
import { CustomMenusMap, MenuType, MenuLinkType, CUSTOM_LABEL_TYPE } from '@console/internal/hypercloud/menu/menu-types';
import { PerspectiveType } from '@console/internal/hypercloud/perspectives';
import { getContainerLabel, getLabelTextByDefaultLabel, getLabelTextByKind } from '@console/internal/components/hypercloud/utils/menu-utils';

type MenuData = {
  menuType: MenuType;
  label?: string;
  kind?: string;
  innerMenus?: Array<{ menuType: string; kind: string; label?: string }>;
};

export const basicMenusFactory = (perspective, canListNS) => {
  let menus = [];
  switch (perspective) {
    case PerspectiveType.MASTER:
      menus = HyperCloudDefaultMenus.MasterNavMenus;
      break;
    case PerspectiveType.MULTI:
      menus = HyperCloudDefaultMenus.MultiNavMenus;
      break;
    case PerspectiveType.SINGLE:
      menus = HyperCloudDefaultMenus.SingleNavMenus;
      break;
    case PerspectiveType.DEVELOPER:
      menus = HyperCloudDefaultMenus.DeveloperNavMenus;
      break;
    case PerspectiveType.BAREMETAL:
      menus = HyperCloudDefaultMenus.BaremetalNavMenus;
      break;
    case PerspectiveType.CUSTOM:
      menus = HyperCloudDefaultMenus.CustomNavMenus;
      break;
    default:
      // Empty
      break;
  }
  return (
    <Translation>
      {(t, { i18n }) => (
        <>
          {menus?.map((menuData, index) => {
            switch (menuData.menuType) {
              case MenuType.CONTAINER: {
                const { label: containerLabel, type } = getLabelTextByDefaultLabel(menuData.label, t);
                return (
                  <NavSection title={containerLabel} key={containerLabel} type={type}>
                    {menuData.innerMenus?.map(innerMenuKind => {
                      if (innerMenuKind === 'Dashboard' && !canListNS) {
                        // all Namespace 조회 권한 없으면 Dashboard lnb상에서 제거 기획 반영
                        return;
                      }
                      // MEMO : generateMenu()에서 data를 동일하게 object형식으로 받게하기 위해 정제해줌. (kind와 menuType모두 innerMenuKind로 값 동일함)
                      const d = { kind: innerMenuKind, menuType: innerMenuKind };
                      return generateMenu(perspective, d, true, t, i18n);
                    })}
                  </NavSection>
                );
              }
              case MenuType.SEPERATOR:
                return <Separator name="seperator" key={`seperator-${index}`} />;
              case MenuType.NEW_TAB_LINK:
              case MenuType.REGISTERED_MENU: {
                return generateMenu(perspective, menuData, false, t, i18n);
              }
              default: {
                return <></>;
              }
            }
          })}
        </>
      )}
    </Translation>
  );
};

export const dynamicMenusFactory = (perspective, data, canListNS) => {
  return (
    <Translation>
      {(t, { i18n }) => (
        <>
          {data.menus?.map((menuData: MenuData, index) => {
            switch (menuData.menuType) {
              case MenuType.CONTAINER: {
                const { containerLabel, type } = getContainerLabel(menuData.label, t);
                return (
                  <NavSection title={containerLabel || ''} key={containerLabel} type={type}>
                    {menuData.innerMenus?.map(innerMenuData => {
                      if (innerMenuData.kind === 'Dashboard' && !canListNS) {
                        // all Namespace 조회 권한 없으면 Dashboard lnb상에서 제거 기획 반영
                        return;
                      }
                      return generateMenu(perspective, innerMenuData, true, t, i18n);
                    })}
                  </NavSection>
                );
              }
              case MenuType.SEPERATOR:
                return <Separator name={menuData.label || ''} key={`seperator-${index}`} />;
              case MenuType.NEW_TAB_LINK:
              case MenuType.REGISTERED_MENU: {
                return generateMenu(perspective, menuData, false, t, i18n);
              }
              default: {
                return <></>;
              }
            }
          })}
        </>
      )}
    </Translation>
  );
};

const getMenuComponent = (menuInfo, labelText) => {
  switch (menuInfo.type) {
    case MenuLinkType.HrefLink:
      return <HrefLink key={labelText} href={menuInfo.href} activePath={menuInfo.activePath} name={labelText} startsWith={menuInfo.startsWith} />;
    case MenuLinkType.NewTabLink:
      return <NewTabLink key={labelText} name={labelText} url={menuInfo.url} />;
    case MenuLinkType.ResourceClusterLink:
      return <ResourceClusterLink key={labelText} resource={menuInfo.resource} name={labelText} startsWith={menuInfo.startsWith} />;
    case MenuLinkType.ResourceNSLink:
      return <ResourceNSLink key={labelText} resource={menuInfo.resource} name={labelText} />;
    default:
      // Empty
      return <></>;
  }
};

const generateMenu = (perspective, data: any, isInnerMenu, t: TFunction, i18n: i18n) => {
  const kind = data.kind || '';
  const menuType = data.menuType || '';
  if (isInnerMenu && menuType === MenuType.SEPERATOR) {
    return <Separator name="seperator" />;
  } else if (menuType === MenuType.NEW_TAB_LINK) {
    const label = data.label || 'label empty';
    const menuInfo = {
      visible: true,
      type: MenuLinkType.NewTabLink,
      defaultLabel: label,
      url: data.linkUrl,
      isMultiOnly: false,
    };
    return isInnerMenu ? (
      getMenuComponent(menuInfo, label)
    ) : (
      <NavSection title={label} isSingleChild={true} type={CUSTOM_LABEL_TYPE}>
        {getMenuComponent(menuInfo, label)}
      </NavSection>
    );
  } else {
    if (!!modelFor(kind)) {
      const { label, type } = getLabelTextByKind(kind, t);
      const model = modelFor(kind);
      const modelMenuInfo = model.menuInfo;

      if (!modelMenuInfo || !modelMenuInfo.visible || (perspective !== PerspectiveType.MULTI && modelMenuInfo.isMultiOnly === true)) {
        return <></>;
      } else {
        const menuInfo = {
          resource: model.plural,
          ...modelMenuInfo,
        };
        return isInnerMenu ? (
          getMenuComponent(menuInfo, label)
        ) : (
          <NavSection title={label} isSingleChild={true} type={type}>
            {getMenuComponent(menuInfo, label)}
          </NavSection>
        );
      }
    } else {
      const menuInfo = CustomMenusMap[kind];
      if (!menuInfo || !menuInfo.visible) {
        return <></>;
      } else {
        const { label, type } = getLabelTextByDefaultLabel(menuInfo.defaultLabel, t);
        return isInnerMenu ? (
          getMenuComponent(menuInfo, label)
        ) : (
          <NavSection title={label} isSingleChild={true} type={type}>
            {getMenuComponent(menuInfo, label)}
          </NavSection>
        );
      }
    }
  }
};
