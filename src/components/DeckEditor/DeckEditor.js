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
} from '@dnd-kit/sortable';
import Fuse from 'fuse.js';

import '../../App.css';
import { yugioh } from '../../data/Yugioh';

import { CSS } from '@dnd-kit/utilities';
import allCards from '../../yugioh.json';


export const DECK_EDITOR_ACTIONS = {
    ADD: 'ADD',
    MOVE: 'MOVE',
    REMOVE: 'REMOVE',
    IMPORT: 'IMPORT',
    SELECT: 'SELECT',
    SAVE_AS: 'SAVE_AS',
    TOGGLE_MAGNIFY: 'TOGGLE_MAGNIFY',
}

export function DeckEditor() {
    function reducer(state, { type, payload }) {
        switch (type) {
            case DECK_EDITOR_ACTIONS.ADD:
                return { ...state, idCounter: state.idCounter + 1, cards: [...state.cards, {...allCards.data.find((card) => card.id === payload.cardId), sortableId: `id-${state.idCounter}`}] };
            case DECK_EDITOR_ACTIONS.MOVE:
                const newCards = arrayMove([...state.cards], payload.oldIndex, payload.newIndex);
                return { ...state, cards: newCards }
            case DECK_EDITOR_ACTIONS.REMOVE:
                return {...state, cards: state.cards.filter((card) => card.sortableId !== payload.sortableId)}
            case DECK_EDITOR_ACTIONS.SELECT:
                return {...state, selectedId: payload.cardId}
            case DECK_EDITOR_ACTIONS.SAVE_AS:
                return {...state}
        }
    }

    const [{ cards, selectedId }, dispatch] = useReducer(reducer,
        {
          cards: [],
          selectedId: '',
          idCounter: 0,
        });

    useEffect(() => {
        document.addEventListener('keydown', handleOnKeyDown)
    }, [])

    function handleOnKeyDown(ev) {
        switch(ev.code) {
            case 'KeyM':
              dispatch({type: DECK_EDITOR_ACTIONS.TOGGLE_MAGNIFY, payload: {}});
              break;
        }
    }
    
    return (
        <div>
            <DeckViewer cards={cards} dispatch={dispatch}/>
            <CardSearch dispatch={dispatch}/> 
            <CardDetails cardId={selectedId}/>
        </div>
    );
}


function DeckViewer({ cards, dispatch }) {
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
                items={cards.map((card) => card.sortableId)}
            >
                <div className="flex flexCenter flexWrap alignContentStart bgBlue overflowScroll justifyStart" style={{ width: "600px", height: "100vh", margin: "auto" }}>
                    {cards.map((card) => <SortableCard key={card.sortableId} id={card.sortableId} card={card} dispatch={dispatch}/>)}
                </div>
            </SortableContext>
        </DndContext>
    );

    function handleDragEnd(event) {
        const { active, over } = event;

        if (active.id !== over.id) {
            dispatch({type: DECK_EDITOR_ACTIONS.MOVE, payload: {oldIndex: cards.indexOf(cards.find((card) => card.sortableId === active.id)), newIndex: cards.indexOf(cards.find((card) => card.sortableId === over.id))}})
            // setItems((items) => {
            //     const oldIndex = items.indexOf(items.find((card) => card.sortableId === active.id));
            //     const newIndex = items.indexOf(items.find((card) => card.sortableId === over.id));

            //     return arrayMove(items, oldIndex, newIndex);
            // });
        }
    }

}


function SortableCard({ id, card, dispatch }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    function handleOnRightClick(event, sortableId) {
        event.preventDefault();
        dispatch({type: DECK_EDITOR_ACTIONS.REMOVE, payload: {sortableId: sortableId}})
    }

    function handleOnClick() {
        dispatch({type: DECK_EDITOR_ACTIONS.SELECT, payload: {cardId: card.id}})
    }

    return (
        <div onClick={handleOnClick} onContextMenu={(event) => handleOnRightClick(event, card.sortableId)} ref={setNodeRef} style={style} {...attributes} {...listeners}>
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
        <div className="bgBlue search">
            <div style={{position: "sticky", top: "5px"}}>
                <input
                    value={queryText}
                    type="search"
                    onChange={handleSearch}
                    placeholder={`Start typing to search…`}
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
        dispatch({ type: DECK_EDITOR_ACTIONS.ADD, payload: { cardId: item.id } })
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

function CardDetails({ cardId, magnify }) {
    
    function handleOnMouseEnter() {
        // TODO: Add magnification to view card text closer
    }

    return (
    <div className='CardDetails'>{ cardId ? <img style={{objectFit: 'contain', width: '400px'}} src={yugioh.getImage(cardId)}/> : <div></div>}
    </div>)


}
