
import { useReducer, useEffect, useState, useRef } from "react";
import { Droppable } from "../Generic/Droppable";
import { Card } from "./Card/Card";
import { useSensor, useSensors, DndContext, PointerSensor } from "@dnd-kit/core";
import { Deck } from "./Deck/Deck";
import { CardDetails } from "./CardDetails/CardDetails";
import { Hand } from "./Hand/Hand";
import { ProtectedRoute } from "../Auth/ProtectedRoute/ProtectedRoute";

let currentMouse;
document.addEventListener("mousemove", (e) => {
  // console.log('client: ', e.clientX, e.clientY);
  // console.log('page: ', e.pageX, e.pageY);
  // console.log('screen: ', e.screenX, e.screenY);

  currentMouse = e;
});

export const GAME_ACTIONS = {
    RESET: 'RESET',
    GRAB_CARD: 'GRAB_CARD',
    MOVE_CARD: 'MOVE_CARD',
    TRANSFER_CARD: 'TRANSFER_CARD',
    SELECT_CARD: 'SELECT_CARD',
    FLIP_SELECTED_CARD: 'FLIP_SELECTED_CARD',
    ROTATE_SELECTED_CARD: 'ROTATE_SELECTED_CARD',
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

let globalZIndex = 0;

export function Game() {
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
      <ProtectedRoute>
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
      </ProtectedRoute>
    );
  }