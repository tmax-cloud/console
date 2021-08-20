import * as React from 'react';
import * as _ from 'lodash-es';
import { Translation } from 'react-i18next';
import { TFunction, i18n } from 'i18next';
import { modelFor } from '@console/internal/module/k8s';
import { NavSection } from '@console/internal/components/nav/section';
import { HrefLink, ResourceNSLink, ResourceClusterLink, NewTabLink, Separator } from '@console/internal/components/nav/items';
import HyperCloudDefaultMenus from '@console/internal/hypercloud/menu/hc-default-menus';
import { CustomMenusMap, MenuType, MenuLinkType, MenuContainerLabels } from '@console/internal/hypercloud/menu/menu-types';
import { PerspectiveType } from '@console/internal/hypercloud/perspectives';
import { ResourceStringKeyMap } from '@console/internal/models/hypercloud/resource-plural';

type MenuData = {
  menuType: MenuType;
  label?: string;
  kind?: string;
  innerMenus?: Array<{ menuType: string; kind: string; label?: string }>;
};

export const basicMenusFactory = perspective => {
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
                const containerLabel = t(menuData.label);
                return (
                  <NavSection title={containerLabel} key={containerLabel}>
                    {menuData.innerMenus?.map(innerMenuKind => {
                      return generateMenu(perspective, innerMenuKind, true, t, i18n);
                    })}
                  </NavSection>
                );
              }
              case MenuType.SEPERATOR:
                return <Separator name="seperator" key={`seperator-${index}`} />;
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

export const dynamicMenusFactory = (perspective, data) => {
  return (
    <Translation>
      {(t, { i18n }) => (
        <>
          {data.menus?.map((menuData: MenuData, index) => {
            switch (menuData.menuType) {
              case MenuType.CONTAINER: {
                const labelText = menuData.label?.toLowerCase().replace(' ', '') || '';
                const containerLabel = !!MenuContainerLabels[labelText] ? t(MenuContainerLabels[labelText]) : menuData.label;
                return (
                  <NavSection title={containerLabel || ''} key={containerLabel}>
                    {menuData.innerMenus?.map(innerMenuData => {
                      return generateMenu(perspective, innerMenuData, true, t, i18n);
                    })}
                  </NavSection>
                );
              }
              case MenuType.SEPERATOR:
                return <Separator name={menuData.label || ''} key={`seperator-${index}`} />;
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
      return <NewTabLink key={labelText} name={labelText} url={menuInfo.url}/>;
    case MenuLinkType.ResourceClusterLink:
      return <ResourceClusterLink key={labelText} resource={menuInfo.resource} name={labelText} startsWith={menuInfo.startsWith} />;
    case MenuLinkType.ResourceNSLink:
      return <ResourceNSLink key={labelText} resource={menuInfo.resource} name={labelText} />;
    default:
      // Empty
      return <></>;
  }
};

const generateMenu = (perspective, data, isInnerMenu, t: TFunction, i18n: i18n) => {
  // MEMO : BasicMenus는 string으로 들어오고, DynamicMenus는 object형태로 데이타가 들어옴.
  const kind = typeof data === 'string' ? data : data.kind || '';
  // MEMO : data가 string타입일 땐 data값이 kind와 menuType으로 동일함.
  const menuType = typeof data === 'string' ? kind : data.menuType || '';
  if (isInnerMenu && menuType === MenuType.SEPERATOR) {
    return <Separator name="seperator" />;
  } else {
    if (!!modelFor(kind)) {
      const model = modelFor(kind);

      // MJ : model에 i18n 키값 속성 추가되면 ResourceStringKeyMap 대신 그 키값 사용하는걸로 리팩토링 하기
      const label = !!ResourceStringKeyMap[kind]?.label ? t(ResourceStringKeyMap[kind]?.label) : model.label;
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
          <NavSection title={label} isSingleChild={true}>
            {getMenuComponent(menuInfo, label)}
          </NavSection>
        );
      }
    } else {
      const menuInfo = CustomMenusMap[kind];
      if (!menuInfo || !menuInfo.visible) {
        return <></>;
      } else {
        const label = i18n.exists(menuInfo.defaultLabel) ? t(menuInfo.defaultLabel) : menuInfo.defaultLabel;
        return isInnerMenu ? (
          getMenuComponent(menuInfo, label)
        ) : (
          <NavSection title={label} isSingleChild={true}>
            {getMenuComponent(menuInfo, label)}
          </NavSection>
        );
      }
    }
  }
};
