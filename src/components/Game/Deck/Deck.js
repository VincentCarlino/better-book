
import { useDraggable } from "@dnd-kit/core";
import back from "../../../images/card_backing.jpeg";
import { Droppable } from "../../Generic/Droppable";
import {CSS} from '@dnd-kit/utilities';


export function Deck({ id = 'deck', x, y, cards, flipped = true }) {
    /** 
     * A deck is an ordered list of cards 
     * Cards can be placed on the top or bottom of a deck
     * A deck can be shuffled
    */
  
    const {attributes, listeners, setNodeRef, transform} = useDraggable({
      id: id,
    });
    const transformString = (transform !== null ? CSS.Translate.toString(transform) : '');
    const style = {
      transform: transformString,
    };
    return(
     <> 
          <div className="Card" style={{...style, top: y, left: x, position: 'absolute', zIndex: 1, border: 'none', boxShadow: 'none'}} ref={setNodeRef} {...listeners} {...attributes}>
            <div style={{position: 'absolute', transform: 'translate(6px, 6px)'}}>
              <img src={back}/>
            </div>
          </div>
          <Droppable>
          <div className="Card" style={{top: y, left: x, position: 'absolute'}}>
            <div style={{position: 'absolute'}}>
              <img src={back}/>
            </div>
            <div style={{position: 'absolute', transform: 'translate(2px, 2px)'}}>
              <img src={back}/>
            </div>
            <div style={{position: 'absolute', transform: 'translate(4px, 4px)'}}>
              <img src={back}/>
            </div>
            <div style={{position: 'absolute', transform: 'translate(6px, 6px)'}}>
              <img src={back}/>
            </div>
          </div>
        </Droppable>
      </>
      
    )
  }