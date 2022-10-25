import * as React from 'react';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { K8sKind, K8sResourceKind } from '@console/internal/module/k8s';
import * as MemoIcon from '../../../imgs/hypercloud/memo.svg';
import { memoModal } from '../modals/memo-modal';

const Memo = (props: MemoProps) => {
  const { model, resource } = props;
  const memo = resource.metadata?.annotations?.memo;
  const handleClick = () => memoModal({ isCreate: !memo, memo, model, resource });
  return <div className="co-memo">{memo ? <img className="co-memo-edit-icon" onClick={handleClick} src={MemoIcon} /> : <PlusCircleIcon className="co-memo-new-icon" onClick={handleClick} />}</div>;
};

export const memoColumnClass = 'col-lg-1 co-text-center';

interface MemoProps {
  model: K8sKind;
  resource: K8sResourceKind | any;
}

export default Memo;
