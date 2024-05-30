import { useState } from 'react';
import './App.css';
import coney from './images/coney.jpg';
import field from './images/duel-field-lux.png';
import { v4 as uuidv4 } from 'uuid';


import {
  DndContext,
} from '@dnd-kit/core';

import {useDraggable, useDroppable} from '@dnd-kit/core';
import {CSS} from '@dnd-kit/utilities';


const defaultCoordinates = {
  x: 0,
  y: 0,
};

function Droppable(props) {
  const {isOver, setNodeRef} = useDroppable({
    id: 'unique-droppable',
  });
  console.log(isOver);
  return (
    <div ref={setNodeRef} className='Droppable'>
      {props.children}
    </div>
  );
}


function App() {
  const [{x, y}, setCoordinates] = useState(defaultCoordinates);
  
  return (
    <DndContext onDragEnd={({delta}) => {
      setCoordinates(({x, y}) => {
        return {
          x: x + delta.x,
          y: y + delta.y,
        };
      });
    }}>
    <div className="App">
      <div className="Container" style={{ backgroundImage: "url(" + ")" }}>
          <Card x={x} y={y}/>
      </div>
      <Droppable>
        <Hand />
      </Droppable>
    </div>
    </DndContext>
  );
}



function Card({ x, y }) {
  /**
   * A card has an image source for its front and back
   * A card can be translated, rotated, or flipped
   * A card knows the game it is tied to (YGO, MTG, etc.)
   * A card has an ID that is used to lookup the image source
   */

  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: 'unique-id',
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    backgroundImage: "url(" + coney + ")",
    top: y,
    left: x,
    position: 'relative',
  };
  return (
      <div className="Card" ref={setNodeRef} style={style} {...listeners} {...attributes}></div>
  );
}

function Hand() {
  /**
   * A hand is an ordered list of cards
   * Cards can be reordered in hand by dragging them
   */
  
  return(
    <div className="flex flexCenter Hand" style={{ flexWrap: "wrap" }}>
    </div>
  )
}


function Deck() {
  /** 
   * A deck is a list of cards 
   * Cards can be placed on the top or bottom of a deck
   * A deck can be shuffled
  */
}

function Field() {
  /**
   * The field is the main space where cards are placed and moved
   * A field tracks the cards it contains
   * (?): A field tracks the positions of the cards inside it
   */
}

function Game() {
  /**
   * A game has 
   */
}

/**
 * Cards can be moved between three types of locations:
 * - Pile/Deck
 * - Field
 * - Hand
 * 
 * Each Hand and Pile/Deck should have an ID
 * 
 * Each Hand is only visible to one Player
 * 
 * Piles can be set to public (GY, Banish) or Private (Main Deck, Extra Deck)
 * Piles take an orientation (face up or face down)
 * 
 * The field does not need an ID since there should only be one
 */

export default App;
