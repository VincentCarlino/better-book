import {useDroppable} from '@dnd-kit/core';

function Droppable({props}) {
    const {isOver, setNodeRef} = useDroppable({
      id: props.id,
    });
    return (
      <div ref={setNodeRef} className='Droppable'>
        {props.children}
      </div>
    );
  }