import React, { useRef, createContext, useState, useEffect, useContext, useMemo } from "react";
import DragSelect from "dragselect";
import { yugioh } from "../data/Yugioh";
import back from '../images/card_backing.jpeg';
import './DragSelectTest.scss';
import { useReducer } from "react";

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
  SHUFFLE_DECK: 'SHUFFLE_DECK'
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
]}
// extraDeck: [
//   11321089, 19181420,
//   19181420,  1769875,
//   11765832, 54757758,
//   22850702, 34001672,
//   71166481, 98127546,
//   86066372, 38342335,
//   29301450, 47759571,
//   65741786
// ]}

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

export function DragSelectTest({ playerA, playerB }) {

  function reducer(state, { type, payload }) {
    const firstSelected = state.cards.find((card) => state.selectedItemIds.includes(card.itemId));

    switch (type) {     
      case GAME_ACTIONS.SELECT_CARD:
        const newSelectedItemIds = [...new Set([...state.selectedItemIds, payload.itemId])];
        console.log(newSelectedItemIds)
        return {...state, selectedItemIds: newSelectedItemIds}
      case GAME_ACTIONS.SET_COORDS:
        return {...state, cards: state.cards.map((card) => (card.itemId === payload.itemId ? {...card, coords: payload.coords} : card))}
      case GAME_ACTIONS.UNSELECT_CARD:
        const selectedItemIds = [...new Set([...state.selectedItemIds.filter((id) => id !== payload.itemId)])];
        console.log(selectedItemIds)
        return {...state, selectedItemIds: selectedItemIds}
      case GAME_ACTIONS.DRAW_CARD:
        const cardId = state.collections.mainDeck.shift();
        return {...state, 
              cards: [...state.cards.map((card) => (card.itemId === cardId ? {...card, x: payload.x, y: payload.y, coords: {x:payload.x, y:payload.y}, flipped: true, horizontal: false} : card))], 
              collections: {mainDeck: [...state.collections.mainDeck], field: [...state.collections.field, cardId]}};
      case GAME_ACTIONS.FLIP_SELECTED:
        return {...state, cards: 
          state.cards.map((card) => {
            return {...card, 
              flipped: (state.selectedItemIds.includes(card.itemId) ? !card.flipped : card.flipped)
            }
          }
        )
      }
      case GAME_ACTIONS.ROTATE_SELECTED:
        return {...state, cards: 
          state.cards.map((card) => {
            return {...card, 
              horizontal: (state.selectedItemIds.includes(card.itemId) ? !card.horizontal : card.horizontal)
            }
          }
        )
      }
      case GAME_ACTIONS.ORGANIZE_SELECTED:
        if (!state.selectedItemIds) return {...state}
        return {...state, cards: state.cards.map((card) => (state.selectedItemIds.includes(card.itemId) ? {...card, x: firstSelected.coords.x + (firstSelected.itemId === card.itemId ? 0 : 10), y: firstSelected.coords.y + (firstSelected.itemId === card.itemId ? 0 : 10)} : card))}
      case GAME_ACTIONS.VIEW_SELECTED:
        if (!state.selectedItemIds) return {...state}
        var newCards = [...state.cards];
        state.selectedItemIds.forEach((itemId, index) => {
          var w = newCards.find((c) => c.itemId === itemId)
          w.x = firstSelected.coords.x + ((cardWidth + 10) * (index % 5)) - (2 * cardWidth);
          w.y = firstSelected.coords.y + ((cardHeight + 10) * Math.floor(index / 5));
        });
        return {...state, cards: newCards};
      case GAME_ACTIONS.SHUFFLE_DECK:
        return {...state, collections: {...state.collections, mainDeck: [...shuffle(state.collections.mainDeck)]}}

    }

  }

  // Set up initial state
  let cardsData = []
  let mainDeckCardIds = []
  let idCount = 0;

  deckData.mainDeck.map((c) => { 
    idCount++
    let card = yugioh.getCardByID(c)
    let cardId = `card${idCount}`;
    cardsData.push({id: card.id, horizontal: false, flipped: false, itemId: `card${idCount}`});
    mainDeckCardIds.push(cardId)
  });
  // deckData.extraDeck.map((c) => { 
  //   idCount++
  //   let card = yugioh.getCardByID(c)
  //   let cardId = `card${idCount}`;
  //   cardsData.push({id: card.id, horizontal: false, flipped: false, itemId: });
  // });

  const [{ cards, collections, selectedItemIds }, dispatch] = useReducer(reducer,
  {
    cards: cardsData,
    collections: {mainDeck: mainDeckCardIds, field: []},
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
            <Hand handId={'handA'} />
            <div id='field' className="Container">
              <Field />
                {collections.field.map((itemId) => {return(
                  <Card {...cards.find((c) => {
                    return c.itemId === itemId})} dispatch={dispatch}/>)})}
                {/* <Deck x={525} y={3} itemId="deck0" dispatch={dispatch}/> */}
                {/* <Deck x={3} y={443} itemId="deck1" dispatch={dispatch}/> */}
                {/* <Deck x={3} y={3} itemId="deck2" dispatch={dispatch}/> */}
                <Deck x={525} y={443} itemId="mainDeck" cardItemIds={collections.mainDeck} dispatch={dispatch}/>

            </div>
            <Hand handId={'handB'} />
          </DragSelectProvider>
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
      debugger;
      handleDragEnd(e);
      }); 
    return () => ds.unsubscribe("DS:end", null, id);
  }, [ds]);

  return (
    <div ref={inputEl} className={droppableClass}>{ children }</div>
  )
}

function Selectable({x = 0, y = 0, itemId, selectableClass = 'selectable', transition = false, handleDragEnd = (() => {}), handleSelect = (() => {}), handleUnselect = (() => {}), children}) {
  const ds = useDragSelect();
  const inputEl = useRef();

  useEffect(() => {
    const element = inputEl.current;
    if (!element || !ds) return;
    element.style.transform = `translate3d(${x}px, ${y}px, 1px)`
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
      element.style.transform = `translate3d(${x}px, ${y}px, 1px)`;
    }
    // element.style.transition = 'none';
  },
    [x, y, inputEl, ds]
  );

    return (
      <div ref={inputEl} className={selectableClass} data-item-id={itemId} aria-labelledby="" style={{width: 'fit-content', position: 'absolute'}}>
        { children }
      </div>
    )
}



function Deck({itemId, cardItemIds, x, y, dispatch}) {

  function handleDeckDragEnd(e) {
    if (e.items.length >= 1) {
      if (e.items[0].dataset.itemId === itemId && e.isDragging) {
        const style = getComputedStyle(e.items[0]);
        const matrix = new DOMMatrixReadOnly(style.transform)
        const dragEndX = matrix.e;
        const dragEndY = matrix.f;
        
        e.items[0].style.transform = "translate3d(0px, 0px, 0px)";
        dispatch({type: GAME_ACTIONS.DRAW_CARD, payload: {itemId: itemId, x: x + dragEndX, y: y + dragEndY}})
      }
    }
  }

  function handleDeckDrop(e) {
    debugger;
    if(e.dropTarget && e.dropTarget.id === itemId) {
      console.log('Item dropped into', itemId);
      console.log(e);
    }
  }



  return (
    <div style={{transform: `translate(${x}px, ${y}px)`}}>
    <Droppable droppableId={itemId} handleDragEnd={handleDeckDrop}> 
      {cardItemIds ? 
          <>
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
            <Selectable selectableClass="deck" itemId={itemId} handleDragEnd={handleDeckDragEnd}>
              <div className="Card">
              <div className='CardInner'>
                  <img src={back} draggable="false"/>
                </div>
              </div>
            </Selectable>
          </> : ''
        }
    </Droppable>
    </div>)

}

function Card({x = 0, y = 0, id, itemId, horizontal = false, flipped = false, dispatch}) {
  
  function handleSelect(e) {
    if (e.item.dataset.itemId == itemId) dispatch({type: GAME_ACTIONS.SELECT_CARD, payload: {itemId: itemId}})
  }

  function handleUnselect(e) {
    if (e.item.dataset.itemId == itemId) dispatch({type: GAME_ACTIONS.UNSELECT_CARD, payload: {itemId: itemId}})
  }

  function handleDragEnd(e) {
    if (e.items.length >= 1) {
      var selectableItem = e.items.find((item) => item.dataset.itemId === itemId);
      if (!selectableItem) return;
      const style = getComputedStyle(selectableItem);
      const matrix = new DOMMatrixReadOnly(style.transform)
      const dragEndX = matrix.e;
      const dragEndY = matrix.f;
      dispatch({type: GAME_ACTIONS.SET_COORDS, payload: {itemId: itemId, coords: {x: dragEndX, y: dragEndY}}})
    }
  }

  return (
    <Selectable x={x} y={y} transition={true} selectableClass="beans" itemId={itemId} handleDragEnd={handleDragEnd} handleSelect={handleSelect} handleUnselect={handleUnselect}>
      <div className={`Card ${(flipped ? 'flipped' : '')} ${(horizontal ? 'horizontal' : '')}`}>
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

function Hand({ handId }) {

  function handleDragEnd(e) {
    if(e.dropTarget && e.dropTarget.id === handId) {
      console.log('Item dropped into', handId);
      console.log(e);
    }
  }

  return (
    <Droppable droppableId={handId} handleDragEnd={handleDragEnd}> 
    <div style={{height: '200px', backgroundColor: 'gray'}}>
      HAND
    </div>
    </Droppable>
  )
}