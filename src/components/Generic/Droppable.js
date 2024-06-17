import { useDroppable } from "@dnd-kit/core";

export function Droppable({id, children}) {

    const {isOver, setNodeRef} = useDroppable({
      id: id,
    });
    
    return (
      <div ref={setNodeRef} className='Droppable'>
        {children}
      </div>
    );
  }