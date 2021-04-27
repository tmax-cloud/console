import * as React from 'react';
import { ModalLauncher } from './';
import { PenIcon, MinusIcon } from '@patternfly/react-icons';

export const ModalList = props => {
  const { handleMethod, onRemove, list, description, title, children, id } = props;
  let uId = id + '-list';
  return (
    <>
      {list.length ? (
        <ul id={uId} className="modal-list" style={{ paddingLeft: '0px' }}>
          {list.map((item, index) => {
            return (
              <li style={{ listStyle: 'none' }} key={index} data-modify={false}>
                <input className="col-xs-6 text-secondary" value={`${item.name}`} disabled />
                <button
                  type="button"
                  id={`item-modify-${id}-${index}`}
                  onClick={e => {
                    let target = document.getElementById(`item-modify-${id}-${index}`).closest('li');
                    console.log(target);
                    target.dataset.modify = 'true';
                    // target['dataset']['modify'] = true;
                    return ModalLauncher({ inProgress: false, index: index, title: title, id: id, handleMethod: handleMethod, children: children, submitText: '수정' });
                  }}
                >
                  <PenIcon />
                </button>
                <button type="button" id={`item-remove-${index}`} onClick={onRemove}>
                  <MinusIcon />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="help-block">{description}</p>
      )}
    </>
  );
};
