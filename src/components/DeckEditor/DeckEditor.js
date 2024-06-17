import React, { useReducer, useEffect, useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    useSortable,
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSwappingStrategy,
    arraySwap
} from '@dnd-kit/sortable';
import Select from 'react-select';
import axios from 'axios';
import Fuse from 'fuse.js';
import memento from '../../data/memento.ydk';

import '../../App.css';
import '../DeckEditor/DeckEditor.scss'
import { yugioh } from '../../data/Yugioh';

import { CSS } from '@dnd-kit/utilities';
import allCards from '../../yugioh.json';


export const DECK_EDITOR_ACTIONS = {
    ADD: 'ADD',
    MOVE: 'MOVE',
    REMOVE: 'REMOVE',
    UPDATE: 'UPDATE',
    IMPORT: 'IMPORT',
    SELECT: 'SELECT',
    SAVE_AS: 'SAVE_AS',
    SAVE: 'SAVE',
    CLEAR: 'CLEAR',
    TOGGLE_MAGNIFY: 'TOGGLE_MAGNIFY',
}

export function DeckEditor() {
    function reducer(state, { type, payload }) {
        switch (type) {
            case DECK_EDITOR_ACTIONS.UPDATE:
                return {...state, ...payload};
            case DECK_EDITOR_ACTIONS.CLEAR:
                return {...state, deck: {mainDeck: [], extraDeck: []}}
            case DECK_EDITOR_ACTIONS.ADD:
                return { ...state, deck: {...state.deck, mainDeck: [...state.deck.mainDeck, {...payload.card, sortableId: `id-${state.idCounter}`}]}, idCounter: state.idCounter + 1};
            case DECK_EDITOR_ACTIONS.MOVE:
                const newMainDeck = arraySwap([...state.deck.mainDeck], payload.oldIndex, payload.newIndex);
                return { ...state, deck: {...state.deck, mainDeck: newMainDeck} }
            case DECK_EDITOR_ACTIONS.REMOVE:
                return {...state, deck: {...state.deck, mainDeck: state.deck.mainDeck.filter((card) => card.sortableId !== payload.sortableId)}}
            case DECK_EDITOR_ACTIONS.SELECT:
                return {...state, selectedId: payload.cardId}
            case DECK_EDITOR_ACTIONS.SAVE_AS:
                axios.post("http://localhost:5050/api/deck/create", { deck: state.deck, deckName: payload.deckName })
                .then(result => {console.log(result)
                })
                .catch(err => console.log(err))
                return {...state}
        }
    }

    const [{ deck, selectedId }, dispatch] = useReducer(reducer,
        {
            deckName: '',
            deck: {mainDeck: [], extraDeck: []},
            selectedId: '',
            idCounter: 0,
        });

    useEffect(() => {
        document.addEventListener('keydown', handleOnKeyDown)
    }, [])

    function handleOnKeyDown(ev) {
        
    }

    useEffect(() => {
        fetch(memento)
        .then((res) => res.text())
        .then((text) => {
            const inDeck = yugioh.importYDKtoJSON(text);
            inDeck.mainDeck.map((card) => dispatch({type: DECK_EDITOR_ACTIONS.ADD, payload: {card: card}}))
        })
        .catch((e) => console.error(e));
    }, [])
    
    return (
        <div className="DeckEditorContainer">
            <div className="Center">
                <DeckName deck={deck} dispatch={dispatch}/>
                <DeckViewer deck={deck} dispatch={dispatch}/>
            </div>
            <DeckControls dispatch={dispatch} />
            <CardSearch dispatch={dispatch}/> 
            <CardDetails cardId={selectedId}/>
        </div>
    );
}

const DeckControls = ({dispatch}) => {
    const [selectedDeck, setSelectedDeck] = useState('')
    
    function handleSaveAs(e) {
        e.preventDefault();
        dispatch({type: DECK_EDITOR_ACTIONS.SAVE_AS , payload: {}})
    }

    function handleClear(e) {
        e.preventDefault();
        dispatch({type: DECK_EDITOR_ACTIONS.CLEAR , payload: {}})

    }

    function confirmSaveAs(e) {

    }

    const selectDeckOptions = []

    return (
        <div className='Buttons'>
            <div className='input-wrapper'>
                <Select
                unstyled
                className='select'
                value={selectedDeck}
                onChange={setSelectedDeck}
                options={selectDeckOptions}
                classNamePrefix="deck-select"
                placeholder="Select Deck"
            />
            </div>
            <div className="button" onClick={handleSaveAs}>SAVE AS</div>
            <div className="button" onClick={handleClear}>CLEAR</div>
        </div>
    );
}


function DeckName({ deckName, dispatch }) {

    function handleUpdateDeckName(e) {
        dispatch({ type: DECK_EDITOR_ACTIONS.UPDATE, payload: { deckName: e.target.value }})
    }

    
    return(
        <div className="input-wrapper DeckName">
            <input value={deckName}
                type="text"
                onChange={(e) => handleUpdateDeckName(e)}
                placeholder={`Deck Name`}
                name="name" id="name" autocomplete="off"
                autoFocus/></div>

    );
}


function DeckViewer({ deck, dispatch }) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
              distance: 8,
            },
          }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={deck.mainDeck.map((card) => card.sortableId)} strategy={rectSwappingStrategy}>
                <div className="flex flexCenter flexWrap alignContentStart justifyStart">
                    {deck.mainDeck.map((card) => <SortableCard key={card.sortableId} id={card.sortableId} card={card} dispatch={dispatch}/>)}
                </div>
            </SortableContext>
        </DndContext>
    );

    function handleDragEnd(event) {
        const { active, over } = event;

        if (active.id !== over.id) {
            dispatch({type: DECK_EDITOR_ACTIONS.MOVE, payload: {oldIndex: deck.mainDeck.indexOf(deck.mainDeck.find((card) => card.sortableId === active.id)), newIndex: deck.mainDeck.indexOf(deck.mainDeck.find((card) => card.sortableId === over.id))}})
        }
    }

}


function SortableCard({ id, card, dispatch }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
    } = useSortable({ id: id });

    const style = {
        transform: CSS.Transform.toString(transform),

    };

    function handleOnRightClick(event) {
        debugger;
        event.preventDefault();
        dispatch({type: DECK_EDITOR_ACTIONS.REMOVE, payload: {sortableId: card.sortableId}})
    }

    function handleOnClick() {
        dispatch({type: DECK_EDITOR_ACTIONS.SELECT, payload: {cardId: card.id}})
    }

    return (
        <div onClick={handleOnClick} onContextMenu={handleOnRightClick} ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <img style={{ width: "75px", height: "108px" }} src={yugioh.getImageSmall(card.id)} />
        </div>
    );
}

function CardSearch({ dispatch }) {
    const [queryText, setQueryText] = useState('');
    const [results, setResults] = useState([]);
    const fuse = new Fuse(allCards.data, { keys: ['name'], threshold: 0.1 });

    function handleSearch(ev) {
        setQueryText(ev.target.value);
        if (ev.target.value.length >= 4) {
            const fuseResults = fuse.search(ev.target.value);
            setResults(fuseResults.map((result) => result.item));
        }
    }

    return (
        <div className="Search">
            <div style={{position: "sticky", top: "5px"}} className='input-wrapper'>
                <input
                    value={queryText}
                    type="search"
                    onChange={handleSearch}
                    placeholder={`Spright...`}
                    autoFocus
                />
            </div>
            {results.map((item) => (
                <CardSearchResult item={item} dispatch={dispatch} />
            ))}
        </div>
    );
}

function CardSearchResult({ item, dispatch }) {

    function handleOnClick() {
        dispatch({type: DECK_EDITOR_ACTIONS.SELECT, payload: {cardId: item.id}})
    }

    function handleOnRightClick(ev) {
        ev.preventDefault();
        dispatch({ type: DECK_EDITOR_ACTIONS.ADD, payload: { card: item } })
    }

    return (
        <div onClick={handleOnClick} onContextMenu={handleOnRightClick} className="flex flexStart alignItemsStart" key={item.id}>
            <img style={{ objectFit: 'contain', width: '60px', paddingTop: '10px' }} src={yugioh.getImageSmall(item)} />
            <div style={{ padding: '10px' }}>
                <p>{item.name}</p>
                <p>{item.race} {item.type}</p>
            </div>
        </div>
    )
}

function CardDetails({ cardId }) {
    return (
    <div className='Preview'>{ cardId ? <img style={{objectFit: 'contain', width: '100%'}} src={yugioh.getImage(cardId)}/> : <div></div>}
    </div>)


}
