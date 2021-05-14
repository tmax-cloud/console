import * as React from 'react';
import * as _ from 'lodash-es';
import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '@console/internal/components/hypercloud/factory/modal';
import {useTranslation} from 'react-i18next'

export const _ModalLauncher = props => {
  const { inProgress, errorMessage, title, children, cancel, handleMethod, index, submitText, id } = props;
  const {t} = useTranslation();
  const onCancel = () => {
    // 수정일 경우에만 타는 로직
    let isModify = document.getElementById(`${id}-list`) ? true : false;
    if (isModify) {
      let list = document.getElementById(`${id}-list`).childNodes;
      list.forEach(cur => {
        if (cur['dataset']['modify'] === 'true') {
          cur['dataset']['modify'] = false;
        }
      });
    }
  };
  return (
    <form onSubmit={handleMethod.bind(null, cancel, index)}>
      <ModalTitle>{title}</ModalTitle>
      <ModalBody>{children}</ModalBody>
      <ModalSubmitFooter errorMessage={errorMessage} id="uId" inProgress={inProgress} onCancel={onCancel} submitText={submitText} cancelText={t('COMMON:MSG_COMMON_BUTTON_COMMIT_2')} cancel={cancel} />
    </form>
  );
};

export const useInitModal = (methods, curState, path) => {
  const { register, setValue } = methods;
  // console.log(_.get(defaultValues, path));
  React.useEffect(() => {
    register(path);
  }, [register]);
  React.useEffect(() => {
    setValue(path, curState);
  }, [curState]);
};

export const handleModalData = (id, objArray, curState, setState, isAddModal, methods, cancel, index, e: React.SyntheticEvent) => {
  e.preventDefault();

  let data = methods.getValues(); // modal에서 입력받은 data
  let obj = {};
  objArray.forEach(cur => {
    obj[cur] = data[cur];
  });

  if (isAddModal) {
    setState(() => {
      return [...curState, obj];
    });
  } else {
    let list = document.getElementById(`${id}-list`).childNodes;
    list.forEach(cur => {
      if (cur['dataset']['modify'] === 'true') {
        cur['dataset']['modify'] = false;
      }
    });
    let curObj = curState.map((cur, idx) => {
      if (idx === index) {
        return obj;
      }
      return cur;
    });
    setState(() => {
      return [...curObj];
    });
  }
  cancel();
  return false;
};
export const removeModalData = (curState, setState, e) => {
  let removedState = curState.filter((cur, idx) => {
    let targetIndex = Number(e.target.id.split('item-remove-')[1]);
    return targetIndex !== idx;
  });
  setState([...removedState]);
};

export const ModalLauncher = createModalLauncher(_ModalLauncher);
