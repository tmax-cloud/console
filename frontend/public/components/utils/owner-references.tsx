import * as React from 'react';
import * as _ from 'lodash-es';
import { K8sResourceKind, OwnerReference, referenceForOwnerRef } from '../../module/k8s';
import { ResourceLink } from './resource-link';
import { useTranslation } from 'react-i18next';

export const OwnerReferences: React.FC<OwnerReferencesProps> = ({ resource, useHcOwnerPath, showOwnerRole }) => {
  const { t } = useTranslation();
  const role = showOwnerRole ? ` / ${t('COMMON:MSG_DETAILS_TABACCESSPERMISSIONS_RADIOBUTTON_1')}` : '';
  if (useHcOwnerPath) {
    // MEMO : HyperCloud에선 owner의 기본 path가 annotation.creator 이다.
    const owner = _.get(resource.metadata, 'annotations.creator');
    return !!owner ? <span>{`${owner}${role}`}</span> : <span className="text-muted">{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_97')}</span>;
  } else {
    // MEMO : 기존 Openshift에서 owner가져오는 방식.
    const owners = (_.get(resource.metadata, 'ownerReferences') || []).map((o: OwnerReference) => <ResourceLink key={o.uid} kind={referenceForOwnerRef(o)} name={o.name} namespace={resource.metadata.namespace} />);
    return owners.length ? <>{`${owners}${role}`}</> : <span className="text-muted">{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_97')}</span>;
  }
};

type OwnerReferencesProps = {
  resource: K8sResourceKind;
  useHcOwnerPath?: boolean;
  showOwnerRole?: boolean;
};

OwnerReferences.displayName = 'OwnerReferences';
