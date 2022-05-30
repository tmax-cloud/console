import HyperCloudDefaultMenus from '@console/internal/hypercloud/menu/hc-default-menus';
import { getPerspectives, PerspectiveType } from '@console/internal/hypercloud/perspectives';

const getResourceSortList = () => {
    let sortList = [];
    const perspectives = getPerspectives();
    perspectives.map((perspective: any) => {
      let menus = [];
      switch (perspective?.properties?.id) {
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
      menus?.map(menu => {
        sortList = sortList.concat(menu.innerMenus ? menu.innerMenus : []);
      });
    });
  
    return sortList;
  };
  export const resourceSortList = getResourceSortList();
  
  export const resourceSortFunction = (resource: string) => {
    const sortResult = resourceSortList.indexOf(resource);
  
    return sortResult === -1 ? resourceSortList.length : sortResult;
  };