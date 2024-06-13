import { useReducer, useEffect, useState, useRef } from 'react';
import './App.css';
import back from './images/card_backing.jpeg';
// import field from './images/duel-field-lux.png';
import { BrowserRouter, Switch, Routes, Route } from "react-router-dom";
import Fuse from 'fuse.js';
import { DeckEditor } from './components/DeckEditor/DeckEditor';
import { DragSelectTest } from './components/DragSelect';

import {
  DndContext, useSensor, useSensors, PointerSensor,
} from '@dnd-kit/core';

import allCards from './yugioh.json';
import { yugioh } from './data/Yugioh';
import {useDraggable, useDroppable} from '@dnd-kit/core';
import {CSS} from '@dnd-kit/utilities';
import Signup from './components/Signup/Signup';


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

// BEGIN: Initial states
const cardsData = [
  {id: '1', x: 0, y: 0, z: 0, horizontal: false, flipped: false, location: 'field', cid: 76145933},
  {id: '2', x: 100, y: 20, z: 0, horizontal: false, flipped: false, location: 'field', cid: 75922381},
  {id: '3', x: 0, y: 0, z: 0, horizontal: false, flipped: false, location: 'hand', cid: 15443125},
  {id: '4', x: 0, y: 0, z: 0, horizontal: false, flipped: false, location: 'hand', cid: 14558127},
  {id: '5', x: 0, y: 0, z: 0, horizontal: false, flipped: false, location: 'deck', cid: 14558127},
  {id: '6', x: 0, y: 0, z: 0, horizontal: false, flipped: false, location: 'deck', cid: 14558127},
];

const collectionsData = [
  {id: 'hand', cards: cardsData.filter((card) => card.location === 'hand').map((card) => card.id)},
  {id: 'field', cards: cardsData.filter((card) => card.location === 'field').map((card) => card.id)},
  {id: 'deck', cards: cardsData.filter((card) => card.location === 'deck').map((card) => card.id)}
];
// END: Initial states

// BEGIN: Enums
export const GAME_ACTIONS = {
  RESET: 'RESET',
  GRAB_CARD: 'GRAB_CARD',
  MOVE_CARD: 'MOVE_CARD',
  TRANSFER_CARD: 'TRANSFER_CARD',
  SELECT_CARD: 'SELECT_CARD',
  FLIP_SELECTED_CARD: 'FLIP_SELECTED_CARD',
  ROTATE_SELECTED_CARD: 'ROTATE_SELECTED_CARD',

}
export const DECK_EDITOR_ACTIONS = {
  ADD: 'ADD',
  REMOVE: 'REMOVE',
  IMPORT: 'IMPORT',
  REORDER: 'REORDER'
}
// END: Enums

let currentMouse;
document.addEventListener("mousemove", (e) => {
  // console.log('client: ', e.clientX, e.clientY);
  // console.log('page: ', e.pageX, e.pageY);
  // console.log('screen: ', e.screenX, e.screenY);

  currentMouse = e;
});

function App() {
  return (
    <div className="App">
    <BrowserRouter>
      <Routes>
        <Route path="/deck" element={<DeckEditor />} />
        <Route path="/dragselect" element={<DragSelectTest />} />
          <Route path="/search" element={<CardSearch />} />
          <Route path="/game" element={<Game />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<NoPage />} />
      </Routes>
    </BrowserRouter>
    </div>
  );
}

const NoPage = () => {
  return (
     <div className="center">
        <div className={"Card CardLarge Animate"} >
        <div className='CardInner'>
          <div className='CardFront'>
            <img src={yugioh.getRandomAceMonsterImage()}/>
          </div>
          <div className='CardBack'>
            <img src={back}/>
          </div>
        </div>
      </div>
      <h1 className="textCenter">404</h1>
     </div>);
};

let globalZIndex = 0;

function CardSearch({ dispatch }) {
  const [queryText, setQueryText] = useState('');
  const [results, setResults] = useState([]);
  const fuse = new Fuse(allCards.data, {keys: ['name'], threshold: 0.1});

  function handleSearch(ev) {
    setQueryText(ev.target.value);
    if (ev.target.value.length >= 4) {
      const fuseResults = fuse.search(ev.target.value);
      setResults(fuseResults.map((result) => result.item));
    }
  }

  return (
    <div className="bgBlue search">
      <div>
        <input
          value={queryText}
          type="search"
          onChange={handleSearch}
          placeholder={`Start typing to search…`}
          autoFocus
        />
      </div>
      {results.map((item) => (
        <CardSearchResult item={item} dispatch={dispatch}/>
      ))}
    </div>
  );
}

function CardSearchResult({item, dispatch}) {

  function handleOnClick(ev) {
    ev.preventDefault(); 
    dispatch({type: DECK_EDITOR_ACTIONS.ADD, payload: {cardId: item.id}})
  }
  
  return (
  <div onContextMenu={handleOnClick} className="flex flexStart alignItemsStart" key={item.id}>
    <img style={{objectFit: 'contain', width: '60px', paddingTop: '10px'}} src={item.card_images[0].image_url_small}/> 
    <div style={{padding: '10px'}}>
    <p>{item.name}</p>
    <p>{item.race} {item.type}</p>
    </div>
  </div>
  )
}
 
function Game() {
  const [overlayEnabled, setOverlayEnabled] = useState(false)
  const fieldRef = useRef();
  function reducer(state, { type, payload }) {
    switch (type) {
      // Move a card from one collection to another
      case GAME_ACTIONS.TRANSFER_CARD:
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
      case GAME_ACTIONS.GRAB_CARD:
        const z = globalZIndex + 1;
        globalZIndex = z;
        return {
          ...state,
          cards: state.cards.map((card) => card.id === payload.targetId ? {...card, z: z} : card)
        }
        
      // Move a card's coordinates
      case GAME_ACTIONS.MOVE_CARD:
        let field = fieldRef.current.getBoundingClientRect()
        return {
          ...state,
          cards: state.cards.map((card) => card.id === payload.targetId ? {...card, x: payload.x + (card.horizontal ? 45 : 0), y: payload.y + (card.horizontal ? 31 : 0)} : card)
        };
      case GAME_ACTIONS.FLIP_SELECTED_CARD:
        return {...state,
          cards: state.cards.map((card) => card.id === state.selectedCardId ? {...card, flipped: !card.flipped} : card)}
      case GAME_ACTIONS.ROTATE_SELECTED_CARD:
        return {...state,
          cards: state.cards.map((card) => card.id === state.selectedCardId ? {...card, horizontal: !card.horizontal} : card)}
      case GAME_ACTIONS.SELECT_CARD:
        return {...state, selectedCardId: payload.targetId}
    }
  }

  const [{ cards, collections, selectedCardId }, dispatch] = useReducer(reducer,
    {
      cards: cardsData,
      collections: collectionsData,
      selectedCardId: ''

    });

  function handleDragEnd(ev) {
    const {activatorEvent, active, over} = ev;
    let activeRect = active.rect.current.translated;
    let field = fieldRef.current.getBoundingClientRect()
    
    const activeCollection = collections.find((collection) => collection.id === active.id);
    if(!activeCollection) {
      if (over && over.id) {
        dispatch({type: GAME_ACTIONS.TRANSFER_CARD, payload: {targetId: active.id, to: over.id, }})
      }
      dispatch({type: GAME_ACTIONS.MOVE_CARD, payload: {targetId: active.id, x: activeRect.left - field.x, y: activeRect.top - field.y}})
    }
    setOverlayEnabled(false);
  }

  function handleDragMove(ev) {
    
  }

  function handleDragStart(ev) {
    const {active} = ev;
    const activeCollection = collections.find((collection) => collection.id === active.id);
    setOverlayEnabled(activeCollection !== undefined)
  }

  function handle() {
    dispatch({ type: GAME_ACTIONS.TRANSFER_CARD , payload: { targetId: '1', from: 'field', to: 'hand' }})
  }

  function handleOnKeyDown(ev) {
    switch(ev.code) {
      case 'KeyR':
        dispatch({type: GAME_ACTIONS.ROTATE_SELECTED_CARD, payload: {}});
        break;
      case 'KeyF':
        dispatch({type: GAME_ACTIONS.FLIP_SELECTED_CARD, payload: {}});
        break;
    }
  }

  function handleUniversalClick(ev) {
    if(ev.target.classList.contains('Container')) {
      dispatch({type: GAME_ACTIONS.SELECT_CARD, payload: {selectedCardId: ''}})
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
    <DndContext sensors={sensors} onDragMove={handleDragMove} onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
    <div className="App">
      <Droppable id='field'>
        <div className="Container" style={{ backgroundImage: "url(" + ")" }} ref={fieldRef}>
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
    {/* <DragOverlay>{overlayEnabled ? <div className="Card">
        <div style={{position: 'absolute', transform: 'translate(4px, 4px)'}}>
            <img src={back}/>
          </div>
          </div>:<></>}
        
      </DragOverlay> */}
    </DndContext>
  );
}

function CardDetails({ card }) {
    // Displays a larger 
    return (
    <div className='CardDetails'>{ card ? <img style={{objectFit: 'contain', width: '400px'}} src={allCards.data.find((c) => c.id === card.cid).card_images[0].image_url}/> : <div></div>}
    </div>)


}


function Card({ horizontal , flipped, x, y, z, id, selected, dispatch, cid, moveable = true}) {
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
            <img src={allCards.data.find((c) => c.id === cid).card_images[0].image_url_small}/>
          </div>
          <div className='CardBack'>
            <img src={back}/>
          </div>
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
