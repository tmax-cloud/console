import * as React from 'react';
import { ModalLauncher } from './';

export const ModalList = props => {
  const { onModify, onRemove, list, description, title, children, id } = props;
  let uId = id + '-list';
  return (
    <>
      {list.length ? (
        <ul id={uId}>
          {list.map((item, index) => {
            return (
              <li style={{ listStyle: 'none' }} key={index} data-modify={false}>
                <input className="col-xs-4 text-secondary" value={`${item.name}`} disabled />
                <button
                  type="button"
                  id={`item-modify-${index}`}
                  onClick={e => {
                    e.target['parentNode']['dataset'].modify = true;
                    return ModalLauncher({ inProgress: false, index: index, title: title, id: id, handleMethod: onModify, children: children, submitText: '수정' });
                  }}
                >
                  Modify
                </button>
                <button type="button" id={`item-remove-${index}`} onClick={onRemove}>
                  Delete
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
