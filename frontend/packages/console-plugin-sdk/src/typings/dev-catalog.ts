import { K8sKind, K8sResourceKind } from '@console/internal/module/k8s';
import { Extension } from './base';
import { TFunction } from 'i18next';

namespace ExtensionProperties {
  export interface DevCatalogModel {
    model: K8sKind;
    flag?: string;
    normalize: (t: TFunction, data: K8sResourceKind[]) => K8sResourceKind[];
  }
}

export interface DevCatalogModel extends Extension<ExtensionProperties.DevCatalogModel> {
  type: 'DevCatalogModel';
}

export const isDevCatalogModel = (e: Extension): e is DevCatalogModel => {
  return e.type === 'DevCatalogModel';
};
