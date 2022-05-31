import { getPerspectives } from '@console/internal/hypercloud/perspectives';
import { getMenusInPerspective } from '@console/internal/components/nav/menus';
import { Perspective } from '@console/plugin-sdk';

const getResourceSortList = () => {
  let sortList = [];
  const perspectives = getPerspectives();
  perspectives.map((perspective: Perspective) => {
    let menus = [];
    menus = getMenusInPerspective(perspective?.properties?.id);
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
