import * as React from 'react';
import { PlusCircleIcon, EditIcon } from '@patternfly/react-icons';
import { K8sKind, K8sResourceKind } from '@console/internal/module/k8s';
import { memoModal } from '../modals/memo-modal';

const Memo = (props: MemoProps) => {
  const { model, resource } = props;
  const memo = resource.metadata?.annotations?.memo;
  const handleClick = () => memoModal({ isCreate: !memo, memo, model, resource });
  return <div className="co-memo">{memo ? <EditIcon className="co-memo-edit-icon" onClick={handleClick} /> : <PlusCircleIcon className="co-memo-new-icon" onClick={handleClick} />}</div>;
};

export const memoColumnClass = 'col-lg-1 co-text-center';

interface MemoProps {
  model: K8sKind;
  resource: K8sResourceKind | any;
}

export default Memo;
