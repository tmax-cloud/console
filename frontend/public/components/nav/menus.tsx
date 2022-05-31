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
  innerMenus?: Array<string | { menuType: string; kind: string; label?: string }>;
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

const generateMenu = (perspective, data: any, isInnerMenu, t: TFunction, i18n: i18n, index?: number) => {
  const kind = data.kind || '';
  const menuType = data.menuType || '';
  if (isInnerMenu && menuType === MenuType.SEPERATOR) {
    return <Separator name="seperator" key={`separator-${index}`} />;
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
      <NavSection title={label} isSingleChild={true} type={CUSTOM_LABEL_TYPE} key={label}>
        {getMenuComponent(menuInfo, label)}
      </NavSection>
    );
  }
  if (modelFor(kind)) {
    const { label, type } = getLabelTextByKind(kind, t);
    const model = modelFor(kind);
    const modelMenuInfo = model.menuInfo;

    if (!modelMenuInfo || !modelMenuInfo.visible || (perspective !== PerspectiveType.MULTI && modelMenuInfo.isMultiOnly === true)) {
      return <></>;
    }
    const menuInfo = {
      resource: model.plural,
      ...modelMenuInfo,
    };
    return isInnerMenu ? (
      getMenuComponent(menuInfo, label)
    ) : (
      <NavSection title={label} isSingleChild={true} type={type} key={label}>
        {getMenuComponent(menuInfo, label)}
      </NavSection>
    );
  }
  const menuInfo = CustomMenusMap[kind];
  if (!menuInfo || !menuInfo.visible) {
    return <></>;
  }
  const { label, type } = getLabelTextByDefaultLabel(menuInfo.defaultLabel, t);
  return isInnerMenu ? (
    getMenuComponent(menuInfo, label)
  ) : (
    <NavSection title={label} isSingleChild={true} type={type} key={label}>
      {getMenuComponent(menuInfo, label)}
    </NavSection>
  );
};

export const getMenusInPerspective = (perspective: PerspectiveType): MenuData[] => {
  switch (perspective) {
    case PerspectiveType.MASTER:
      return HyperCloudDefaultMenus.MasterNavMenus;
    case PerspectiveType.MULTI:
      return HyperCloudDefaultMenus.MultiNavMenus;
    case PerspectiveType.SINGLE:
      return HyperCloudDefaultMenus.SingleNavMenus;
    case PerspectiveType.DEVELOPER:
      return HyperCloudDefaultMenus.DeveloperNavMenus;
    case PerspectiveType.BAREMETAL:
      return HyperCloudDefaultMenus.BaremetalNavMenus;
    case PerspectiveType.CUSTOM:
      return HyperCloudDefaultMenus.CustomNavMenus;
    default:
      // Empty
      return [];
  }
};

export const basicMenusFactory = (perspective, canListNS) => {
  const menus = getMenusInPerspective(perspective);

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
                    {menuData.innerMenus?.map((innerMenuKind, idx) => {
                      if (innerMenuKind === 'Dashboard' && !canListNS) {
                        // all Namespace 조회 권한 없으면 Dashboard lnb상에서 제거 기획 반영
                        return;
                      }
                      // MEMO : generateMenu()에서 data를 동일하게 object형식으로 받게하기 위해 정제해줌. (kind와 menuType모두 innerMenuKind로 값 동일함)
                      const d = { kind: innerMenuKind, menuType: innerMenuKind };
                      return generateMenu(perspective, d, true, t, i18n, idx);
                    })}
                  </NavSection>
                );
              }
              case MenuType.SEPERATOR:
                return <Separator name="seperator" key={`seperator-${index}-basic`} />;
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
                    {menuData.innerMenus?.map((innerMenuData, idx) => {
                      if (typeof innerMenuData === 'object' && innerMenuData.kind === 'Dashboard' && !canListNS) {
                        // all Namespace 조회 권한 없으면 Dashboard lnb상에서 제거 기획 반영
                        return;
                      }

                      return generateMenu(perspective, innerMenuData, true, t, i18n, idx);
                    })}
                  </NavSection>
                );
              }
              case MenuType.SEPERATOR:
                return <Separator name={menuData.label || ''} key={`seperator-${index}-dynamic`} />;
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
