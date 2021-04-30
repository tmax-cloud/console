import * as React from 'react';
import { K8sKind } from '@console/internal/module/k8s';
import DynamicResourceLinkList from './DynamicResourceLinkList';
import { useTranslation } from 'react-i18next';
import { ResourceLabelPlural } from '../../../../../../public/models/hypercloud/resource-plural';

type ResourceLinkListProps = {
  namespace: string;
  model: K8sKind;
  links: string[];
};
const ResourceLinkList: React.FC<ResourceLinkListProps> = ({ links, model, namespace }) => {
  const { t } = useTranslation();
  return (
    <DynamicResourceLinkList
      links={links.map((name) => ({ model, name }))}
      namespace={namespace}
      title={ResourceLabelPlural(model, t)}
    />
  );
};

export default ResourceLinkList;
