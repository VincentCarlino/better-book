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



export const EXTRA_DECK_TYPES = [
    'Link Monster',
    'Fusion Monster',
    'XYZ Monster',
    'Synchro Monster'
]

export const DECK_EDITOR_ACTIONS = {
    ADD: 'ADD',
    MOVE: 'MOVE',
    REMOVE: 'REMOVE',
    // Update meta data
    UPDATE: 'UPDATE',
    IMPORT: 'IMPORT',
    SELECT: 'SELECT',
    SELECT_DECK: 'SELECT_DECK',
    SAVE_AS: 'SAVE_AS',
    SAVE: 'SAVE',
    CLEAR: 'CLEAR',
    TOGGLE_MAGNIFY: 'TOGGLE_MAGNIFY',
}

export function DeckEditor() {
    function reducer(state, { type, payload }) {
        switch (type) {
            case DECK_EDITOR_ACTIONS.UPDATE:
                return { ...state, ...payload };
            case DECK_EDITOR_ACTIONS.CLEAR:
                return {
                    ...state,
                    deck: {
                        mainDeck: [],
                        extraDeck: [],
                        sideDeck: [],
                        title: ''
                    }
                }
            case DECK_EDITOR_ACTIONS.ADD:
                if (EXTRA_DECK_TYPES.includes(payload.card.type)) {
                    return { ...state,
                         deck: { ...state.deck,
                             extraDeck: [...state.deck.extraDeck,
                                        { ...payload.card, sortableId: `id-${state.idCounter}` }] }, 
                             idCounter: state.idCounter + 1 };
                }
                return { ...state,
                    deck: { ...state.deck,
                    mainDeck: [...state.deck.mainDeck,
                            { ...payload.card,
                            sortableId: `id-${state.idCounter}` }] },
                    idCounter: state.idCounter + 1 };
            case DECK_EDITOR_ACTIONS.MOVE:
                if (payload.type == 'extraDeck') {
                    return { ...state, 
                        deck: { ...state.deck, 
                            extraDeck: arraySwap([...state.deck.extraDeck], payload.oldIndex, payload.newIndex)
                         } 
                    }
                }
                else {
                    return { ...state, deck: { ...state.deck, mainDeck: arraySwap([...state.deck.mainDeck], payload.oldIndex, payload.newIndex) } }
                }
            case DECK_EDITOR_ACTIONS.REMOVE:
                return { ...state, deck: { ...state.deck, mainDeck: state.deck.mainDeck.filter((card) => card.sortableId !== payload.sortableId) } }
            case DECK_EDITOR_ACTIONS.SELECT_DECK:
                // New deck is being loaded, so sortable IDs can be reset
                let tempSortableId = 0;
                let tempDeck = {
                    mainDeck: [],
                    extraDeck: [],
                    sideDeck: [],
                    title: payload.deck.title,
                    deckId: payload.deck._id
                };

                payload.deck.mainDeck.forEach((cardId) => {
                    tempSortableId++;
                    tempDeck.mainDeck.push({...yugioh.getCardByID(cardId), sortableId: tempSortableId});
                });
                payload.deck.extraDeck.forEach((cardId) => {
                    tempSortableId++;
                    tempDeck.extraDeck.push({...yugioh.getCardByID(cardId), sortableId: tempSortableId});
                });
                return { ...state, 
                    deck: tempDeck }
            case DECK_EDITOR_ACTIONS.SELECT:
                return { ...state, 
                    selectedId: payload.cardId }
            case DECK_EDITOR_ACTIONS.SAVE:
                if (state.deckId) {
                    // This deck already exists. We should update it
                }
                else {
                    // This is a new deck, we should create a new db object
                    axios.post("http://localhost:5050/api/deck/create", {
                        deck: {
                            mainDeck: state.deck.mainDeck.map((c) => c.id),
                            extraDeck: state.deck.extraDeck.map((c) => c.id),
                            sideDeck: state.deck.sideDeck.map((c) => c.id),
                            title: state.title,
                            deckId: state.deckId
                        }, token: localStorage.getItem('token')
                    })
                        .then(result => {
                            console.log(result);
                            // console.log({...state, deck: {...state.deck}, deckId: result.deckId})
                        })
                        .catch(err => console.log(err))
                }

                return { ...state }
        }
    }

    const [{ title, deck, selectedId, idCounter, deckId }, dispatch] = useReducer(reducer,
        {
            title: '',
            deck: { mainDeck: [], extraDeck: [], sideDeck: [] },
            selectedId: '',
            idCounter: 0,
            deckId: null
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
                inDeck.mainDeck.map((card) => dispatch({ type: DECK_EDITOR_ACTIONS.ADD, payload: { card: card } }))
                inDeck.extraDeck.map((card) => dispatch({ type: DECK_EDITOR_ACTIONS.ADD, payload: { card: card } }))

            })
            .catch((e) => console.error(e));
    }, [])

    return (
        <div className="DeckEditorContainer">
            <div className="Center">
                <DeckName title={title} dispatch={dispatch} />
                <DeckViewer deck={deck} dispatch={dispatch} />
            </div>
            <CardSearch dispatch={dispatch} />
            <div className='Left'>
                <CardDetails cardId={selectedId} />
                <DeckControls dispatch={dispatch} />
            </div>

        </div>
    );
}

const DeckControls = ({ dispatch }) => {
    const [selectedDeck, setSelectedDeck] = useState('');
    const [decks, setDecks] = useState([])

    function handleSaveAs(e) {
        e.preventDefault();
        dispatch({ type: DECK_EDITOR_ACTIONS.SAVE, payload: {} })
    }

    function handleClear(e) {
        e.preventDefault();
        dispatch({ type: DECK_EDITOR_ACTIONS.CLEAR, payload: {} })

    }

    function confirmSaveAs(e) {

    }

    useEffect(() => {
        axios.post("http://localhost:5050/api/deck/get", { token: localStorage.getItem('token') })
            .then(result => {
                setDecks(result.data);
            }).catch(err => { console.log(err) })
    }, [])

    return (
        <div className='Buttons'>
            <div className='input-wrapper'>
                <Select
                    unstyled
                    className='select'
                    value={selectedDeck}
                    onChange={(e) => { dispatch({ type: DECK_EDITOR_ACTIONS.SELECT_DECK, payload: { deck: decks.find((d) => (d._id === e.value)), dispatch: dispatch } }) }}
                    options={decks.map((d) => { return { value: d._id, label: (d.title ? d.title : 'Untitled') } })}
                    classNamePrefix="deck-select"
                    placeholder="Select Deck"
                />
            </div>
            <div className="button" onClick={handleSaveAs}>SAVE</div>
            <div className="button" onClick={handleClear}>CLEAR</div>
        </div>
    );
}


function DeckName({ title, dispatch }) {

    function handleUpdateDeckName(e) {
        dispatch({ type: DECK_EDITOR_ACTIONS.UPDATE, payload: { title: e.target.value } })
    }


    return (
        <div className="input-wrapper DeckName">
            <input value={title}
                type="text"
                onChange={(e) => handleUpdateDeckName(e)}
                placeholder={`Deck Name`}
                name="name" id="name" autoComplete="off"
                autoFocus /></div>

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
            <h3>Main Deck ({deck.mainDeck.length})</h3>
            <SortableContext
                items={deck.mainDeck.map((card) => card.sortableId)} strategy={rectSwappingStrategy}>
                <div className="flex flexCenter flexWrap alignContentStart justifyStart">
                    {deck.mainDeck.map((card) => <SortableCard key={card.sortableId} id={card.sortableId} card={card} dispatch={dispatch} />)}
                </div>
            </SortableContext>

            <h3>Extra Deck ({deck.extraDeck.length})</h3>
            <SortableContext
                items={deck.extraDeck.map((card) => card.sortableId)} strategy={rectSwappingStrategy}>
                <div className="extraDeck">
                    {deck.extraDeck.map((card) => <SortableCard key={card.sortableId} id={card.sortableId} card={card} dispatch={dispatch} />)}
                </div>
            </SortableContext>
        </DndContext>
    );

    function handleDragEnd(event) {
        const { active, over } = event;

        if (EXTRA_DECK_TYPES.includes(active.data.current.type)) {
            dispatch({ type: DECK_EDITOR_ACTIONS.MOVE, payload: { type: 'extraDeck', oldIndex: deck.extraDeck.indexOf(deck.extraDeck.find((card) => card.sortableId === active.id)), newIndex: deck.extraDeck.indexOf(deck.extraDeck.find((card) => card.sortableId === over.id)) } })

        }
        else {
            dispatch({ type: DECK_EDITOR_ACTIONS.MOVE, payload: { type: 'mainDeck', oldIndex: deck.mainDeck.indexOf(deck.mainDeck.find((card) => card.sortableId === active.id)), newIndex: deck.mainDeck.indexOf(deck.mainDeck.find((card) => card.sortableId === over.id)) } })
        }

        if (active.id !== over.id) {
        }
    }

}


function SortableCard({ id, card, dispatch }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
    } = useSortable({ id: id, data: { type: card.type } });

    const style = {
        transform: CSS.Transform.toString(transform),

    };

    function handleOnRightClick(event) {
        event.preventDefault();
        dispatch({ type: DECK_EDITOR_ACTIONS.REMOVE, payload: { sortableId: card.sortableId } })
    }

    function handleOnClick() {
        dispatch({ type: DECK_EDITOR_ACTIONS.SELECT, payload: { cardId: card.id } })
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
            <div style={{ position: "sticky", top: "5px" }} className='input-wrapper'>
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
        dispatch({ type: DECK_EDITOR_ACTIONS.SELECT, payload: { cardId: item.id } })
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
        <div className='Preview'>{cardId ? <img style={{ objectFit: 'contain', width: '100%' }} src={yugioh.getImage(cardId)} /> : <div></div>}
        </div>)


}
