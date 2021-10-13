import * as React from 'react';
import * as _ from 'lodash-es';
import { Translation } from 'react-i18next';
import i18next, { TFunction, i18n } from 'i18next';
import { modelFor } from '@console/internal/module/k8s';
import { NavSection } from '@console/internal/components/nav/section';
import { HrefLink, ResourceNSLink, ResourceClusterLink, NewTabLink, Separator } from '@console/internal/components/nav/items';
import HyperCloudDefaultMenus from '@console/internal/hypercloud/menu/hc-default-menus';
import { CustomMenusMap, MenuType, MenuLinkType, MenuContainerLabels } from '@console/internal/hypercloud/menu/menu-types';
import { PerspectiveType } from '@console/internal/hypercloud/perspectives';
import { ResourceLabel, getI18nInfo } from '@console/internal/models/hypercloud/resource-plural';

const en = i18next.getFixedT('en');

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
                const i18nExist = i18next.exists(menuData.label);
                let containerLabel = '';
                let type = '';
                if (i18nExist) {
                  containerLabel = t(menuData.label);
                  type = en(menuData.label);
                } else {
                  containerLabel = menuData.label;
                  type = '@@customlabel@@';
                }
                return (
                  <NavSection title={containerLabel} key={containerLabel} type={type}>
                    {menuData.innerMenus?.map(innerMenuKind => {
                      return generateMenu(perspective, innerMenuKind, true, t, i18n);
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

export const dynamicMenusFactory = (perspective, data) => {
  return (
    <Translation>
      {(t, { i18n }) => (
        <>
          {data.menus?.map((menuData: MenuData, index) => {
            switch (menuData.menuType) {
              case MenuType.CONTAINER: {
                const labelText = menuData.label?.toLowerCase().replace(' ', '') || '';
                const containerKeyOrLabel = !!MenuContainerLabels[labelText] ? t(MenuContainerLabels[labelText]) : menuData.label;
                const i18nExist = i18next.exists(containerKeyOrLabel);
                let containerLabel = '';
                let type = '';
                if (i18nExist) {
                  containerLabel = t(labelText);
                  type = en(labelText);
                } else {
                  containerLabel = labelText;
                  type = '@@customlabel@@';
                }
                return (
                  <NavSection title={containerLabel || ''} key={containerLabel} type={type}>
                    {menuData.innerMenus?.map(innerMenuData => {
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

const generateMenu = (perspective, data, isInnerMenu, t: TFunction, i18n: i18n) => {
  // MEMO : BasicMenus는 string으로 들어오고, DynamicMenus는 object형태로 데이타가 들어옴.
  const kind = typeof data === 'string' ? data : data.kind || '';
  // MEMO : data가 string타입일 땐 data값이 kind와 menuType으로 동일함.
  const menuType = typeof data === 'string' ? kind : data.menuType || '';
  if (isInnerMenu && menuType === MenuType.SEPERATOR) {
    return <Separator name="seperator" />;
  } else if (menuType === MenuType.NEW_TAB_LINK) {
    const label = data.label || 'empty';
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
      <NavSection title={label} isSingleChild={true} type="@@customlabel@@">
        {getMenuComponent(menuInfo, label)}
      </NavSection>
    );
  } else {
    if (!!modelFor(kind)) {
      const model = modelFor(kind);

      const label = ResourceLabel(model, t);
      const key = getI18nInfo(model)?.label;
      const type = i18next.exists(key) ? en(key) : '@@customlabel@@';
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
        const i18nExists = i18n.exists(menuInfo.defaultLabel);
        const label = i18nExists ? t(menuInfo.defaultLabel) : menuInfo.defaultLabel;
        const type = i18nExists ? en(menuInfo.defaultLabel) : '@@customlabel@@';
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
