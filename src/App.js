import { useReducer, useEffect, useState, useRef } from 'react';
import './App.css';
import back from './images/card_backing.jpeg';
// import field from './images/duel-field-lux.png';
import { BrowserRouter, Switch, Routes, Route } from "react-router-dom";
import Fuse from 'fuse.js';
import { DeckEditor } from './components/DeckEditor/DeckEditor';
import { DragSelectTest } from './components/DragSelect';
import Header from './components/Header/Header';
import { NoPage } from './components/NoPage/NoPage';
import { Deck } from './components/Game/Deck/Deck';
import { Game } from './components/Game/Game';
import AuthProvider from './components/Auth/Provider/AuthProvider';

import {
  DndContext, useSensor, useSensors, PointerSensor,
} from '@dnd-kit/core';

import allCards from './yugioh.json';
import {useDraggable, useDroppable} from '@dnd-kit/core';
import {CSS} from '@dnd-kit/utilities';
import Signup from './components/Signup/Signup';
import Login from './components/Login/Login';
import Menu from './components/Menu/Menu';
import { Droppable } from './components/Generic/Droppable';

// BEGIN: Enums

export const DECK_EDITOR_ACTIONS = {
  ADD: 'ADD',
  REMOVE: 'REMOVE',
  IMPORT: 'IMPORT',
  REORDER: 'REORDER'
}
// END: Enums

function App() {
  return (
    <div className="App">
    <AuthProvider>
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/deck" element={<DeckEditor />} />
        <Route path="/dragselect" element={<DragSelectTest />} />
          <Route path="/search" element={<CardSearch />} />
          <Route path="/game" element={<Game />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Menu />} />
          <Route path="*" element={<NoPage />} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
    </div>
  );
}


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
