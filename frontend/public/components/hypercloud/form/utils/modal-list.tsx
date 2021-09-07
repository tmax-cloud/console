import * as React from 'react';
import { ModalLauncher } from './';
import { PenIcon, MinusIcon } from '@patternfly/react-icons';

export const ModalList = props => {
  const { handleMethod, path, onRemove, list, description, title, children, id, methods, requiredFields, optionalRequiredField = [], optionalValidCallback, submitText = '수정' } = props;
  let uId = id + '-list';

  const onDragEnd = result => {
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    const source = list.splice(result.source.index, 1);
    list.splice(result.destination.index, 0, source[0]);
  };

  const renderList = () => {
    let isDraggable = uId.indexOf('step') >= 0;
    return list.map((item, index) => (
      <Draggable draggableId={item.name} index={index} key={item.name}>
        {provided => (
          <li ref={provided.innerRef} style={{ listStyle: 'none' }} key={index} data-modify={false} {...provided.draggableProps}>
            <input className="col-xs-6 text-secondary" value={`${item.name}`} disabled />
            <div className={`col-xs-1 pairs-list__action drag-button ${isDraggable ? '' : 'hide'}`} {...provided.dragHandleProps}>
              <img className="vertical-center drag-button__img" src={DragIcon} />
            </div>
            <button
              type="button"
              id={`item-modify-${id}-${index}`}
              onClick={e => {
                let target = document.getElementById(`item-modify-${id}-${index}`).closest('li');
                target.dataset.modify = 'true';
                return ModalLauncher({ inProgress: false, path: path, index: index, methods: methods, requiredFields: requiredFields, title: title, id: id, handleMethod: handleMethod, children: children, submitText: submitText, optionalRequiredField: optionalRequiredField, optionalValidCallback: optionalValidCallback });
              }}
            >
              <PenIcon />
            </button>
            <button type="button" id={`item-remove-${index}`} onClick={onRemove}>
              <MinusIcon />
            </button>
          </li>
        )}
      </Draggable>
    ));
  };

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
                    target.dataset.modify = 'true';
                    return ModalLauncher({ inProgress: false, path: path, index: index, methods: methods, requiredFields: requiredFields, title: title, id: id, handleMethod: handleMethod, children: children, submitText: '수정', optionalValidCallback: optionalValidCallback, optionalRequiredField: optionalRequiredField });
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
