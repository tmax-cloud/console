import * as React from 'react';
import * as _ from 'lodash-es';
import { ModalLauncher } from './';
import { PenIcon, MinusIcon } from '@patternfly/react-icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import * as DragIcon from '../../../../imgs/hypercloud/menu.svg';
export const ModalList = props => {
  const { handleMethod, path, onRemove, list, description, title, children, id, methods, requiredFields, optionalValidCallback, optionalRequiredField = [] } = props;
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
                return ModalLauncher({ inProgress: false, path: path, index: index, methods: methods, requiredFields: requiredFields, title: title, id: id, handleMethod: handleMethod, children: children, submitText: '수정', optionalRequiredField: optionalRequiredField, optionalValidCallback: optionalValidCallback });
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
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="list">
            {provided => (
              <ul ref={provided.innerRef} id={uId} className="modal-list" style={{ paddingLeft: '0px' }} {...provided.droppableProps}>
                {renderList()}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <p className="help-block">{description}</p>
      )}
    </>
  );
};
