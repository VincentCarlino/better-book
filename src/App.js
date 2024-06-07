import { useReducer, useEffect, useState } from 'react';
import './App.css';
import coney from './images/coney.jpg';
import back from './images/card_backing.jpeg';
import field from './images/duel-field-lux.png';
import { v4 as uuidv4 } from 'uuid';
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  GlassMagnifier,
} from "react-image-magnifiers";
import {
  DndContext, useSensor, useSensors, PointerSensor, DragOverlay
} from '@dnd-kit/core';

import allCards from './yugioh.json';

import {useDraggable, useDroppable} from '@dnd-kit/core';
import {CSS} from '@dnd-kit/utilities';

// Loading all images slows things down a LOT
// const images = require.context('./data/cardImages', true);


const defaultCoordinates = {
  x: 0,
  y: 0,
};

function Droppable({id, children}) {

  const {isOver, setNodeRef} = useDroppable({
    id: id,
  });
  return (
    <div ref={setNodeRef} className='Droppable'>
      {children}
    </div>
  );
}

class CardData {
  constructor(id, x, y, location) {
    this.id = id;
    this.x = x;
    this.y= y;
    this.location = location;
  }
}

class CollectionData {
  constructor(id, cards) {
    this.id = id;
    this.cards = cards;
  }
}

// BEGIN: Initial states
const cardsData = [
  {id: '1', x: 0, y: 0, horizontal: false, flipped: false, location: 'field', cid: 76145933},
  {id: '2', x: 0, y: 0, horizontal: false, flipped: false, location: 'field', cid: 75922381},
];

const collectionsData = [
  {id: 'hand', cards: []},
  {id: 'field', cards: cardsData.map((card) => card.id)},
  {id: 'deck', cards: []}
];
// END: Initial states

// BEGIN: Enums
export const ACTIONS = {
  RESET: 'RESET',
  MOVE_CARD: 'MOVE_CARD',
  TRANSFER_CARD: 'TRANSFER_CARD',
  SELECT_CARD: 'SELECT_CARD',
  FLIP_SELECTED_CARD: 'FLIP_SELECTED_CARD',
  ROTATE_SELECTED_CARD: 'ROTATE_SELECTED_CARD',

}
// END: Enums

let currentMouse;
document.addEventListener("mousemove", (e) => {
  currentMouse = e;
});

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Game />}>
          <Route index element={<Game />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const NoPage = () => {
  return <h1>404</h1>;
};


function Game() {
  // 1. Find Card
  // 2. Use location attr to find where it is stored
  // 3. Can then call transfer using the "from", replacing location with the "to"
  const [overlayEnabled, setOverlayEnabled] = useState(false)
  function reducer(state, { type, payload }) {
    switch (type) {
      // Move a card from one collection to another
      case ACTIONS.TRANSFER_CARD:
        const from = state.cards.find((card) => card.id === payload.targetId).location
        if (from === payload.to) {
          return {...state}
        } else {
          return {
            ...state,
            cards: state.cards.map((card) => card.id === payload.targetId ? {...card, x: currentMouse.clientX, y: currentMouse.clientY, location: payload.to} : card),
            collections: state.collections.map(
              (collection) => 
              collection.id === from ? 
              {...collection, cards: collection.cards.filter((cardId) => cardId !== payload.targetId)} : 
              collection.id === payload.to ? 
              {...collection, cards: [...collection.cards, payload.targetId]} : 
              collection
            )
          };
        }
        
      // Move a card's coordinates
      case ACTIONS.MOVE_CARD:
        debugger;
        return {
          ...state,
          cards: state.cards.map((card) => card.id === payload.targetId ? {...card, x: (card.x + payload.deltaX), y: (card.y + payload.deltaY)} : card)
        };
      case ACTIONS.FLIP_SELECTED_CARD:
        return {...state,
          cards: state.cards.map((card) => card.id === state.selectedCardId ? {...card, flipped: !card.flipped} : card)}
      case ACTIONS.ROTATE_SELECTED_CARD:
        return {...state,
          cards: state.cards.map((card) => card.id === state.selectedCardId ? {...card, horizontal: !card.horizontal} : card)}
      case ACTIONS.SELECT_CARD:
        return {...state, selectedCardId: payload.targetId}
    }
  }

  const [{ cards, collections, selectedCardId }, dispatch] = useReducer(reducer,
    {
      cards: cardsData,
      collections: collectionsData,
      selectedCardId: '1'

    });

  function handleDragEnd(ev) {
    const {active, over} = ev;
    const activeCollection = collections.find((collection) => collection.id === active.id);

    if(!activeCollection) {
      if (over && over.id) {
        dispatch({type: ACTIONS.TRANSFER_CARD, payload: {targetId: active.id, to: over.id}})
      }
      debugger;
      dispatch({type: ACTIONS.MOVE_CARD, payload: {targetId: active.id, deltaX: ev.delta.x, deltaY: ev.delta.y, x: currentMouse.clientX, y: currentMouse.clientY}})
    }
    setOverlayEnabled(false);
    debugger;
  }

  function handleDragStart(ev) {
    const {active} = ev;
    const activeCollection = collections.find((collection) => collection.id === active.id);
    setOverlayEnabled(activeCollection !== undefined)
  }

  function handle() {
    dispatch({ type: ACTIONS.TRANSFER_CARD , payload: { targetId: '1', from: 'field', to: 'hand' }})
  }

  function handleOnKeyDown(ev) {
    switch(ev.code) {
      case 'KeyR':
        dispatch({type: ACTIONS.ROTATE_SELECTED_CARD, payload: {}});
        break;
      case 'KeyF':
        dispatch({type: ACTIONS.FLIP_SELECTED_CARD, payload: {}});
        break;
    }
  }

  function handleUniversalClick(ev) {
    if(ev.target.classList.contains('Container')) {
      dispatch({type: ACTIONS.SELECT_CARD, payload: {selectedCardId: ''}})
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleOnKeyDown)
    document.addEventListener('click', handleUniversalClick)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )
  
  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
    <div className="App">
      <Droppable id='field'>
        <div className="Container" style={{ backgroundImage: "url(" + ")" }}>
          {cards.filter((card) => card.location === 'field').map((card) => (
            <Card {...card} key={card.id} selected={card.id === selectedCardId}  dispatch={dispatch}/>
          ))}
        </div>
      </Droppable>

      <Droppable id='hand'>
        <Hand cards={cards.filter((card) => card.location === 'hand')} dispatch={dispatch}/>
      </Droppable>
      <Deck x={400} y={400} id='deck'/>
      <CardDetails card={ cards.find((card) => card.id === selectedCardId)} />
    </div>
    <DragOverlay>{overlayEnabled ? <div className="Card">
        <div style={{position: 'absolute', transform: 'translate(4px, 4px)'}}>
            <img src={back}/>
          </div>
          </div>:<></>}
        
      </DragOverlay>
    </DndContext>
  );
}

function CardDetails({ card }) {
    // Displays a larger 
    return (
    <div className='CardDetails'>{ card ? <img style={{objectFit: 'contain', width: '400px'}} src={allCards.data.find((c) => c.id === card.cid).card_images[0].image_url}/> : <div></div>}
    </div>)


}


function Card({ horizontal , flipped, x, y, id, selected, dispatch, cid, moveable = true}) {
  /**
   * A card has an image source for its front and back
   * A card can be translated, rotated, or flipped
   * A card knows the game it is tied to (YGO, MTG, etc.)
   * A card has an ID that is used to lookup the image source
   */

  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: id,
  });
  const transformString = (transform !== null ? CSS.Translate.toString(transform) : '') + (horizontal ? ' rotate(90deg)' : '');
  const style = {
    top: moveable ? y : '',
    left: moveable ? x : '',
    transform: transformString,
    position: 'relative',
    border: selected ? 'solid blue' : ''
  };

  function handleOnClick() {
    dispatch({type: ACTIONS.SELECT_CARD, payload: {targetId: id}})
  } 

  return (
      <div onClick={handleOnClick} className={"Card" + (flipped ? ' flipped' : '')} ref={setNodeRef} style={style} {...listeners} {...attributes}>
        <div className='CardInner'>
          <div className='CardFront'>
            <img src={allCards.data.find((c) => c.id === cid).card_images[0].image_url_small}/>
          </div>
          <div className='CardBack'>
            <img src={back}/>
          </div>
        </div>
      </div>
  );
}

function Hand({ cards, dispatch }) {
  /**
   * A hand is an ordered list of cards
   * Cards can be reordered in hand by dragging them
   */
  
  return(
    <div className="flex flexCenter Hand" style={{ flexWrap: "wrap" }}>
      {cards.map((card) => <Card {...card} dispatch={dispatch} key={card.id} moveable={false}/>
)}
    </div>
  )
}


function Deck({ id = 'deck', x, y, cards, flipped = true }) {
  /** 
   * A deck is a list of cards 
   * Cards can be placed on the top or bottom of a deck
   * A deck can be shuffled
  */

  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: id,
  });
  return(
   <>

      <div className="Card" style={{top: y, left: x, position: 'absolute'}} >
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
        <Droppable>
        <div className="Card" style={{top: y, left: x, position: 'absolute'}} ref={setNodeRef} {...listeners} {...attributes}>
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

function Field() {
  /**
   * The field is the main space where cards are placed and moved
   * A field tracks the cards it contains
   * (?): A field tracks the positions of the cards inside it
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
