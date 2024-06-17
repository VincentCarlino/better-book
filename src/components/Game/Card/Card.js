
import { GAME_ACTIONS } from "../Game";
import { useState,  } from "react";
import { useDraggable } from "@dnd-kit/core";
import back from '../../../images/card_backing.jpeg';
import { yugioh } from "../../../data/Yugioh";
import {CSS} from '@dnd-kit/utilities';


export function Card({ horizontal , flipped, x, y, z, id, selected, dispatch, cid, moveable = true}) {
    /**
     * A card has an image source for its front and back
     * A card can be translated, rotated, or flipped
     * A card knows the game it is tied to (YGO, MTG, etc.)
     * A card has an ID that is used to lookup the image source
     */
  
    const [mouseX, setMouseX] = useState(0);
    const [mouseY, setMouseY] = useState(0);
  
    const onMouseEnter = (e) => {
        setMouseY(13);
        setMouseX(-2);
    };
  
    const onMouseLeave = (e) => {
        setMouseX(0);
        setMouseY(0);
    };
  
    const {attributes, listeners, setNodeRef, transform} = useDraggable({
      id: id,
    });
    const transformString = (transform !== null ? CSS.Translate.toString(transform) : '') + (horizontal ? ' rotate(90deg)' : '') + " rotateX(" + mouseX + "deg) rotateY(" + mouseY + "deg)";
    const style = {
      top: moveable ? y : '',
      left: moveable ? x : '',
      transform: transformString,
      position: moveable ? 'absolute' : 'relative',
      border: selected ? 'solid blue' : '',
      zIndex: z
    };
  
    function handleOnClick() {
      dispatch({type: GAME_ACTIONS.SELECT_CARD, payload: {targetId: id}})
    }
    
    function incrementZIndex() {
      dispatch({type: GAME_ACTIONS.GRAB_CARD, payload: {targetId: id}})
    }
  
    return (
      <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <div onMouseDown={incrementZIndex} onClick={handleOnClick} className={"Card" + (flipped ? ' flipped' : '')} ref={setNodeRef} style={style} {...listeners} {...attributes}>
          <div className='CardInner'>
            <div className='CardFront'>
              <img src={yugioh.getImageSmall(cid)}/>
            </div>
            <div className='CardBack'>
              <img src={back}/>
            </div>
          </div>
        </div>
      </div>
    );
  }