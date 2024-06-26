import React, { useRef, createContext, useState, useEffect, useContext, useMemo } from "react";
import DragSelect from "dragselect";
import { yugioh } from "../data/Yugioh";
import back from '../images/card_backing.jpeg';
import './DragSelectTest.scss';
import { useReducer } from "react";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDrag, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend'

const GAME_ACTIONS = {
  RESET: 'RESET',
  GRAB_CARD: 'GRAB_CARD',
  MOVE_CARD: 'MOVE_CARD',
  TRANSFER_CARD: 'TRANSFER_CARD',
  SELECT_CARD: 'SELECT_CARD',
  UNSELECT_CARD: 'UNSELECT_CARD',
  FLIP_SELECTED: 'FLIP_SELECTED',
  ROTATE_SELECTED: 'ROTATE_SELECTED',
  ORGANIZE_SELECTED: 'ORGANIZE_SELECTED',
  SET_COORDS: 'SET_COORDS',
  VIEW_SELECTED: 'VIEW_SELECTED',
  SHUFFLE_DECK: 'SHUFFLE_DECK',
  TOP_DECK: 'TOP_DECK', 
  BOTTOM_DECK: 'BOTTOM_DECK',
  SEARCH_CARD: 'SEARCH_CARD',
  CARD_TO_HAND: 'CARD_TO_HAND',
  CARD_TO_FIELD: 'CARD_TO_FIELD'
}

const cardHeight = 90;
const cardWidth = 62;

// BEGIN: DragSelect react integration
const Context = createContext(undefined);

function DragSelectProvider({ children, settings = {dropInsideThreshold: 0.1} }) {
  const [ds, setDS] = useState();

  useEffect(() => {
    setDS((prevState) => {
      if (prevState) return prevState;
      return new DragSelect({});
    });
    // return () => {
    //   if (ds) {
    //     ds.stop();
    //     setDS(undefined);
    //   }
    // };
  }, [ds]);

  useEffect(() => {
    ds?.setSettings(settings);
  }, [ds, settings]);

  return <Context.Provider value={ds}>{children}</Context.Provider>;
}


function useDragSelect() {
  return useContext(Context);
}

const deckData = {
  mainDeck: [
  23288411, 55272555, 32909498, 32909498,
  81677154, 81677154, 18165869, 18165869,
  18165869, 24079759, 81275020, 81275020,
  81275020, 54550967, 54550967, 54550967,
  53932291, 14558127, 14558127, 14558127,
  52038441, 52038441, 52918032, 17943271,
  81945676, 97268402, 97268402, 90711610,
  48130397, 48130397, 48130397, 66518509,
  66518509, 80722024, 80722024, 80722024,
  43338320, 10045474, 10045474, 10045474,
  79600447
],
extraDeck: [
  11321089, 19181420,
  19181420,  1769875,
  11765832, 54757758,
  22850702, 34001672,
  71166481, 98127546,
  86066372, 38342335,
  29301450, 47759571,
  65741786
]}

function shuffle(c) {
  var array = [...c]
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}
let cardsData = []
let mainDeckCardIds = []
let extraDeckCardIds = []

let idCount = 0;

  deckData.mainDeck.map((c) => { 
    idCount++
    let card = yugioh.getCardByID(c)
    let cardId = `card${idCount}`;
    cardsData.push({id: card.id, horizontal: false, flipped: false, visible: true, itemId: `card${idCount}`, collectionId: 'mainDeck'});
    mainDeckCardIds.push(cardId);
  });
  deckData.extraDeck.map((c) => { 
    idCount++
    let card = yugioh.getCardByID(c)
    let cardId = `card${idCount}`;
    cardsData.push({id: card.id, horizontal: false, flipped: false, visible: true, itemId: `card${idCount}`, collectionId: 'extraDeck'});
    extraDeckCardIds.push(cardId);
  })

export function DragSelectTest({ pilotDeck, opponentDeck }) {
  // Given an item, reset its parameters to their defaults
  function reducer(state, { type, payload }) {
    var newState = {...state}
    var newCollections = {...state.collections};
    var newCards = [...state.cards];

    var item = newCards.find((card) => card.itemId === payload.itemId);
    const firstSelected = state.cards.find((card) => state.selectedItemIds.includes(card.itemId));
    const o = originRef.current.getBoundingClientRect();

    switch (type) {     
      case GAME_ACTIONS.SELECT_CARD:
        const newSelectedItemIds = [...new Set([...state.selectedItemIds, payload.itemId])];
        return {...state, selectedItemIds: newSelectedItemIds}

      case GAME_ACTIONS.SET_COORDS:
        return {...state, cards: state.cards.map((card) => (card.itemId === payload.itemId ? {...card, coords: payload.coords} : card))}
        
      case GAME_ACTIONS.UNSELECT_CARD:
        const selectedItemIds = [...new Set([...state.selectedItemIds.filter((id) => id !== payload.itemId)])];
        return {...state, selectedItemIds: selectedItemIds}

      case GAME_ACTIONS.DRAW_CARD:
        const cardId = newCollections.mainDeck.shift();
        newCollections.field = [...state.collections.field, cardId];

        return {...state, 
              cards: [...state.cards.map((card) => (
                card.itemId === cardId ? {
                  ...card, x: payload.x, y: payload.y, coords: {x:payload.x, y:payload.y}, flipped: true, horizontal: false
                } 
                : card))], 
              collections: newCollections};

      case GAME_ACTIONS.TOP_DECK:
        newCollections[payload.deckId] = [payload.cardId, ...newCollections[payload.deckId]]
        newCollections.field = [...newCollections.field.filter((id) => id !== payload.cardId)]
        return {...state,
          cards: [...state.cards.map((card) => (
            card.itemId === payload.cardId ? {
              ...card, x: 0, y: 0, flipped: false, horizontal: false
            } 
            : card))],
          collections: newCollections
        }

      case GAME_ACTIONS.BOTTOM_DECK:
        newCollections[payload.deckId] = [...newCollections[payload.deckId], payload.cardId]
        newCollections.field = [...newCollections.field.filter((id) => id !== payload.cardId)]
        return {...state,
          cards: [...state.cards.map((card) => (
            card.itemId === payload.cardId ? {
              ...card, x: 0, y: 0, flipped: false, horizontal: false
            } 
            : card))],
          collections: newCollections
        }

      case GAME_ACTIONS.SEARCH_CARD:
        newCollections[payload.deckId] = [...state.collections[payload.deckId].filter((c) => c !== payload.itemId)]
        newCollections.field = [...state.collections.field, payload.itemId];

        return  {...state, 
          cards: [...state.cards.map((card) => (card.itemId === payload.itemId ? {...card, x: payload.x - o.x, y:payload.y - o.y, flipped: false, horizontal: false} : card))], 
          collections: newCollections};

      case GAME_ACTIONS.FLIP_SELECTED:
        newState = {...state, cards: 
          state.cards.map((card) => {
            return {...card, 
              flipped: (state.selectedItemIds.includes(card.itemId) ? !card.flipped : card.flipped)
            }
          }
        )
      }
      break;

      case GAME_ACTIONS.ROTATE_SELECTED:
        newState = {...state, cards: 
          state.cards.map((card) => {
            return {...card, 
              horizontal: (state.selectedItemIds.includes(card.itemId) ? !card.horizontal : card.horizontal)
            }
          }
        )
      }
      break;

      case GAME_ACTIONS.ORGANIZE_SELECTED:
        if (!state.selectedItemIds) return {...state}
        newState = {...state, cards: state.cards.map((card) => (state.selectedItemIds.includes(card.itemId) ? {...card, x: firstSelected.coords.x + (firstSelected.itemId === card.itemId ? 0 : 10), y: firstSelected.coords.y + (firstSelected.itemId === card.itemId ? 0 : 10)} : card))}
        break;

      case GAME_ACTIONS.VIEW_SELECTED:
        if (!state.selectedItemIds) return {...state}
        state.selectedItemIds.forEach((itemId, index) => {
          var w = newCards.find((c) => c.itemId === itemId)
          w.x = firstSelected.coords.x + ((cardWidth + 10) * (index % 5)) - (2 * cardWidth);
          w.y = firstSelected.coords.y + ((cardHeight + 10) * Math.floor(index / 5));
        });
        newState = {...state, cards: newCards};
        break;

      case GAME_ACTIONS.SHUFFLE_DECK:
        newState = {...state, collections: {...state.collections, mainDeck: [...shuffle(state.collections.mainDeck)]}}
        break;

      case GAME_ACTIONS.CARD_TO_HAND:
        newCollections[payload.handId].push(payload.cardId)
        newCollections.field = newCollections.field.filter((cardId) => cardId !== payload.cardId)
        newState = {...state, cards: [...state.cards.map((card) => {return (card.itemId === payload.cardId ? {...card, x: 0, y: 0} : card)})], collections: newCollections, selectedItemIds: []}
        break;

      case GAME_ACTIONS.TRANSFER_CARD:
        if(item.collectionId === payload.to) break;
        item.collectionId = payload.to
        newCollections = distributeCards(newState.cards);
        newState = {...newState, collections: newCollections};
        break;
      case GAME_ACTIONS.CARD_TO_FIELD:
        newCollections[payload.fromId] = [...state.collections[payload.fromId].filter((c) => c !== payload.cardId)]
        newCollections.field = [...state.collections.field, payload.cardId];
        newState = {...state, 
          cards: [...state.cards.map((card) => (card.itemId === payload.cardId ? {...card, x: payload.x - o.x, y:payload.y - o.y} : card))], 
          collections: newCollections};
        break;
    }
    return sanitizeState(newState);
  }

  function distributeCards(cards) {
    var newCollections = {
      mainDeck: [],
      extraDeck: [],
      field: [],
      pilot: [],
      opponent: [],
    }
    cards.forEach((c) => {
       newCollections[c.collectionId].push(c.itemId)
    })
    return newCollections
  }

  function sanitizeState(state) {
    return {...state,
      collections: {
        mainDeck: [...new Set(state.collections.mainDeck)],
        extraDeck: [...new Set(state.collections.extraDeck)],
        field: [...new Set(state.collections.field)],
        pilot: [...new Set(state.collections.pilot)],
        opponent: [...new Set(state.collections.opponent)],
      }
    }
  }
  const originRef = useRef(null);

  /**
   * cards: a list of all cards that appear in the current game
   */
  /**
   * Each collection is a list of card Ids, where each card receives an ID unique to the current game
   * 
   * collections: {mainDeck: Player Main Deck, 
   * extraDeck: Player Extra Deck, 
   * field: Any card in play, 
   * pilot: The hand of the player using this device, 
   * opponent: The hand of the opposing player},
   */
  const [{ cards, collections, selectedItemIds }, dispatch] = useReducer(reducer,
  {
    cards: cardsData,
    collections: {mainDeck: mainDeckCardIds, extraDeck: extraDeckCardIds, field: [], pilot: [], opponent: []},
    selectedItemIds: []

  });

  function handleOnKeyDown(ev) {
    switch(ev.code) {
      case 'KeyR':
        dispatch({type: GAME_ACTIONS.ROTATE_SELECTED, payload: {}});
        break;
      case 'KeyF':
        dispatch({type: GAME_ACTIONS.FLIP_SELECTED, payload: {}});
        break;
      case 'KeyC':
        dispatch({type: GAME_ACTIONS.ORGANIZE_SELECTED, payload: {}});
        break;
      case 'KeyV':
        dispatch({type: GAME_ACTIONS.VIEW_SELECTED, payload: {}});
        break;
      case 'KeyS':
        dispatch({type: GAME_ACTIONS.SHUFFLE_DECK, payload: {}})
        break
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleOnKeyDown);
    // document.addEventListener('click', handleUniversalClick)
  }, [])

    // Deck coords
            
    // ED top: 525, 3
    // ED bottom: 3, 443
    // Deck bottom: 525, 443
    // Deck top: 3, 3
    return(
      <>
          <DragSelectProvider settings={{}}>
            <HiddenHand handId={'opponent'} collection={collections.opponent} dispatch={dispatch}/>
            <div id='field' className="Container">
              <div ref={originRef} style={{ height: '10px', width: '10px', backgroundColor: 'black', position: 'absolute'}}></div>
              <Field />
                {collections.field.map((itemId) => {return(
                  <Card {...cards.find((c) => {
                    return c.itemId === itemId})} dispatch={dispatch}/>)})}
                {/* <Deck x={525} y={3} itemId="deck0" dispatch={dispatch}/> */}
                {/* <Deck x={3} y={443} itemId="deck1" dispatch={dispatch}/> */}
                {/* <Deck x={3} y={3} itemId="deck2" dispatch={dispatch}/> */}
                <Deck x={5} y={443} deckId="extraDeck" left={true} itemId="extraDeck" cardItemIds={collections.extraDeck} cards={cards.filter((c) => collections.extraDeck.includes(c.itemId))} dispatch={dispatch}/>

                <Deck x={525} y={443} deckId="mainDeck" itemId="mainDeck" cardItemIds={collections.mainDeck} cards={cards.filter((c) => collections.mainDeck.includes(c.itemId))} dispatch={dispatch}/>

            </div>
            <Hand handId={'pilot'} cardItemIds={collections.pilot} cards={cards.filter((card) => {return collections.pilot.includes(card.itemId)})} dispatch={dispatch}/>
          </DragSelectProvider>
          <CoordinateDebugger />
      </>
    )
}

function Field() {
  return (
    <div className="Field">
      {[...Array(14).keys()].map((item) => <div className={`zone zone${item + 1}`}></div>)}
    </div>
  )
}

/**
 * A component capable of accepting selectable components
 */
function Droppable({ droppableId, droppableClass = 'droppable', handleDragEnd = (() => {}), handleSelect = (() => {}), handleUnselect = (() => {}), children }) {
  const ds = useDragSelect();
  const inputEl = useRef();

  useEffect(() => {
    const element = inputEl.current;
    if (!element || !ds) return;

    ds.setSettings({dropZones: [...ds.DropZones._zones, {id: droppableId, element: element}]})
  }, [ds, inputEl])

  useEffect(() => {
    if (!ds) return;
    const id = ds.subscribe("DS:end", (e) => {
      handleDragEnd(e);
      }); 
    return () => ds.unsubscribe("DS:end", null, id);
  }, [ds]);

  return (
    <div ref={inputEl} className={droppableClass}>{ children }</div>
  )
}

function Selectable({x = 0, y = 0, coords, cx, cy, itemId, inline = false, selectableClass = 'selectable', transition = false, handleDragEnd = (() => {}), handleSelect = (() => {}), handleUnselect = (() => {}), handleDragStart = (() => {}), children}) {
  const ds = useDragSelect();
  const inputEl = useRef();

  useEffect(() => {
    const element = inputEl.current;
    if (!element || !ds) return;
    element.style.transform = `translate3d(${x}px, ${y}px, 1px);`
    ds.addSelectables(element);
  }, [ds, inputEl]);

  useEffect(() => {
    if (!ds) return;
    const id = ds.subscribe("DS:end", (e) => {
      handleDragEnd(e);
    });

    return () => ds.unsubscribe("DS:end", null, id);
  }, [ds]);

  useEffect(() => {
    if (!ds) return;
    const id = ds.subscribe("DS:start", (e) => {
      handleDragStart(e);
    });

    return () => ds.unsubscribe("DS:start", null, id);
  }, [ds]);

  useEffect(() => {
    if (!ds) return;
    const id = ds.subscribe("DS:select", (e) => {
      handleSelect(e);
    });

    return () => ds.unsubscribe("DS:select", null, id);
  }, [ds]);

  useEffect(() => {
    if (!ds) return;
    const id = ds.subscribe("DS:unselect", (e) => {
      handleUnselect(e);
    });

    return () => ds.unsubscribe("DS:unselect", null, id);
  }, [ds]);

  useMemo(() => {
    const element = inputEl.current;
    if (!element || !ds) return;
    if (transition) {
      element.style.transition = 'transform .05s';
      if (x && y) element.style.transform = `translate3d(${x}px, ${y}px, 1px)`;
    }
    // element.style.transition = 'none';
  },
    [x, y, inputEl, ds]
  );

    return (
      <div ref={inputEl} className={selectableClass} data-item-id={itemId} aria-labelledby="" style={{width: 'fit-content', position: (inline ? '': 'absolute'
      ), transform: (inline ? '': `translate3d(${x}px, ${y}px, 1px)`)}}>
        { children }
      </div>
    )
}



function Deck({itemId, deckId, cardItemIds, cards, left, x, y, dispatch}) {
  const[deckViewerEnabled, setDeckViewerEnabled] = useState(false)
  const viewerRef = useRef(null);

  function handleDeckDragEnd(e) {
    if (e.items.length >= 1) {
      if (e.items[0].dataset.itemId === itemId && e.isDragging) {
        const style = getComputedStyle(e.items[0]);
        // Get the element's transform 
        const matrix = new DOMMatrixReadOnly(style.transform);
        const dragEndX = matrix.e;
        const dragEndY = matrix.f;
        // Reset the element's style
        e.items[0].style.transform = "translate3d(0px, 0px, 0px)";
        // Place the next card of the deck at the same coordinates relative to the deck
        dispatch({type: GAME_ACTIONS.DRAW_CARD, payload: {itemId: itemId, x: x + dragEndX, y: y + dragEndY}})
      }
    }
  }

  function handleTopDeck(e) {
    if (e.dropTarget && e.dropTarget.id === `${itemId}-top`) {
      e.items.map((item) => dispatch({type: GAME_ACTIONS.TOP_DECK, payload: {cardId: item.dataset.itemId, deckId: deckId}}))
    }
  }

  function handleBottomDeck(e) {
    if (e.dropTarget && e.dropTarget.id === `${deckId}-bottom`) {
      e.items.map((item) => dispatch({type: GAME_ACTIONS.BOTTOM_DECK, payload: {cardId: item.dataset.itemId, deckId: deckId}}))
    }
  }

  function handleViewDeck(e) {
    setDeckViewerEnabled(!deckViewerEnabled)
  }

  function handleDragEnd(e, itemId) {
    const vref = viewerRef.current;
    const target = e.items.find(((item) => item.dataset.itemId === itemId));
    if (!target) return;
    const bcr = vref.getBoundingClientRect();
    if(!bcr) return;
    const targetCr = target.getBoundingClientRect();

    if ((e.event.clientX < bcr.left || e.clientX > bcr.right) || (e.event.clientY < bcr.top || e.clientY > bcr.bottom)) {
      dispatch({type: GAME_ACTIONS.SEARCH_CARD, payload: {deckId: deckId, itemId: itemId, fromId: '', x: targetCr.x, y: targetCr.y}})
      setDeckViewerEnabled(false);
    }

   
  }

  return (
    <div style={{transform: `translate(${x}px, ${y}px)`}}>
      {deckViewerEnabled && cardItemIds ? 
        <div className="deckViewer" ref={viewerRef}>
          {cardItemIds.map((id) => <Card {...cards.find((c) => {
                    return c.itemId === id})} inline={true} onDragEnd={(e) => {handleDragEnd(e, id)}} dispatch={dispatch}/>)}
          <div onClick={handleViewDeck} style={{position: 'fixed', top: '0', right: '15px', cursor: 'pointer'}}><h1>X</h1></div>
        </div>
        :
       ''}
      {cardItemIds ? 
          <div style={{ display: 'flex', flexDirection: (left ? 'row' : 'row')}}>
            <div>
              <div className="Card" style={{position: 'absolute'}}>
                <div style={{position: 'absolute', transform: 'translate(6px, 6px)'}}>
                  <img src={back} draggable="false"/>
                </div>
                <div style={{position: 'absolute', transform: 'translate(4px, 4px)'}}>
                  <img src={back} draggable="false"/>
                </div>
                <div style={{position: 'absolute', transform: 'translate(2px, 2px)'}}>
                  <img src={back} draggable="false"/>
                </div>
                <div style={{position: 'absolute'}}>
                  <img src={back} draggable="false"/>
                </div>
              </div>
              <Selectable selectableClass="deck" style={{position: 'absolute'}} itemId={itemId} handleDragEnd={handleDeckDragEnd}>
                <div className="Card">
                <div className='CardInner'>
                    <img src={back} draggable="false"/>
                  </div>
                </div>
              </Selectable>
            </div>
            <div className="deckControls" style={{flexDirection: (left ? 'row-reverse' : 'row'), transform: (left ? 'translate(-210px, 0px)' : 'translate(85px, 0px)')}}>
              <Droppable droppableId={`${itemId}-top`} handleDragEnd={handleTopDeck}> top
              </Droppable>
              <Droppable droppableId={`${itemId}-bottom`} handleDragEnd={handleBottomDeck}> bottom
              </Droppable>
              <div className="viewDeck" onClick={handleViewDeck}>
                <FontAwesomeIcon icon={faEye} style={{fontSize: '20px'}}/>
              </div>
            </div>
          </div> : ''
        }
    
    </div>)

}
// Draggable, selectable, functional card
function Card({x = 0, y = 0, coords, id, itemId, collectionId, horizontal = false, flipped = false, inline = false, visible, dispatch, onDragEnd}) {
  const ds = useDragSelect();
  function handleSelect(e) {
    if (e.item.dataset.itemId == itemId) dispatch({type: GAME_ACTIONS.SELECT_CARD, payload: {itemId: itemId}})
  }

  function handleUnselect(e) {
    if (e.item && e.item.dataset.itemId == itemId) dispatch({type: GAME_ACTIONS.UNSELECT_CARD, payload: {itemId: itemId}});
    else if (e.items) console.log(e.items)
  }

  function handleDragEnd(e) {
    if (e.items.length >= 1) {
      // debugger;
      var selectableItem = e.items.find((item) => item.dataset.itemId === itemId);
      if (!selectableItem) return;
      const style = getComputedStyle(selectableItem);
      const matrix = new DOMMatrixReadOnly(style.transform)
      const dragEndX = matrix.e;
      const dragEndY = matrix.f;
      if (e.dropTarget){
        dispatch({type: GAME_ACTIONS.TRANSFER_CARD, payload: {to: e.dropTarget.id, itemId: itemId}})
        ds.publish('DS:unselect', e);
      }
      else {
        dispatch({type: GAME_ACTIONS.TRANSFER_CARD, payload: {to: 'field', itemId: itemId}})
      }
    }
  }

  return (
    <Selectable x={x} y={y} coords={coords} inline={inline} transition={true} selectableClass="beans" itemId={itemId} handleDragEnd={onDragEnd ? onDragEnd : handleDragEnd} handleSelect={handleSelect} handleUnselect={handleUnselect}>
      <div className={`Card ${(flipped || !visible ? 'flipped' : '')} ${(horizontal && visible ? 'horizontal' : '')}`}>
          <div className="CardRotationContainer">
            <div className='CardInner'>
              <div className='CardFront'>
                <img src={yugioh.getImageSmall(id)} draggable="false"/>
              </div>
              <div className='CardBack'>
                <img src={back} draggable="false"/>
              </div>
            </div>
        </div>
      </div>
    </Selectable>
  )

}

/** Use the browser inspector to change values for the element's x and y coords */
function CoordinateDebugger() {

  return (
    <div style={{ position: 'fixed', top: '0px', left: '0px', height: '20px', width: '20px', backgroundColor: 'black'}}></div>
  )

}

function Hand({ handId, cardItemIds, cards, dispatch }) {
  function handleDragEnd(e) {
    // if(e.dropTarget && e.dropTarget.id === handId) {
    //   e.items.map((item) => {
    //     dispatch({type: GAME_ACTIONS.CARD_TO_HAND, payload: {cardId: item.dataset.itemId, handId: 'pilot'}})
    //   })
    // }
    // // drop target is not this hand: check if any moved items were already in this hand and must be removed
    // else if (e.items) {
    //   // const removedCardIds = (e.items.filter((item) => componentCards.includes(item.dataset.itemId))).map((item) => item.dataset.itemId);
    //   const cardIds = cards.map((c) => c.itemId)
    //   const removedCardIds = e.items.filter((item) => cardIds.includes(item.dataset.itemId));
    //   removedCardIds.map((cardId) => {
    //     const target = e.items.find(((item) => item.dataset.itemId === cardId));
    //     if (!target) return;
    //     const targetCr = target.getBoundingClientRect();
    //     dispatch({type: GAME_ACTIONS.CARD_TO_FIELD, payload: {fromId: handId, cardId: cardId, x: targetCr.x, y: targetCr.y}})
    //   })
    // }
  }

  return (
    <Droppable droppableId={handId} handleDragEnd={handleDragEnd}> 
    <div style={{height: '200px', backgroundColor: 'gray'}}>
      <div className="cardsInHand">
        {cardItemIds.map((id) => <Card {...cards.find((c) => {
                    return c.itemId === id})} inline={true} dispatch={dispatch}/>)}
      </div>
    </div>
    </Droppable>
  )
}

/**
 * 
 */
function HiddenHand({ handId, collection, dispatch }) {

  function handleDragEnd(e) {
    if(e.dropTarget && e.dropTarget.id === handId) {
      console.log('Item dropped into', handId);
      e.items.map((item) => {
        if(!collection.includes(item.dataset.itemId)) {
          dispatch({type: GAME_ACTIONS.CARD_TO_HAND, payload: {cardId: item.dataset.itemId, handId: 'opponent'}})
        }
      }
      )

    }
  }
  return (
    <Droppable droppableId={handId} handleDragEnd={handleDragEnd}> 
      <div style={{height: '200px', backgroundColor: 'gray', opacity: '0.5', textAlign: 'center', 
      }}>
        <FontAwesomeIcon icon={faEyeSlash} style={{fontSize: '50px', paddingTop: '70px', position: 'absolute', left: '49%'}}/>
        <div className="cardsInHand">
          {collection.map((c) => {return <div className="Card"><img src={back} draggable="false"/></div>})}
        </div>
      </div>
      
      
    </Droppable>
  )
}