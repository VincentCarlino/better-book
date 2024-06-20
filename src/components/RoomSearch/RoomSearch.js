import { Modal } from "../Modal/Modal";
import { useReducer } from "react";
import { TextInput } from "../Generic/TextInput";
import { Button } from "../Generic/Button";


const ROOM_SEARCH_ACTIONS = {
    CREATE: 'CREATE', 
    JOIN: 'JOIN',
    SHOW_MODAL: 'SHOW_MODAL',
    UPDATE_FORM: 'UPDATE_FORM'
}

const ROOM_SEARCH_MODAL_TYPES = {
    CREATE: 'CREATE'
}

export const RoomSearch = () => {
    function reducer(state, { type, payload }) {
        switch (type) {
            case ROOM_SEARCH_ACTIONS.SHOW_MODAL:
                debugger;
                return {...state, showModal: true, modalType: payload.modalType}
            case ROOM_SEARCH_ACTIONS.UPDATE_FORM:
                return {...state, ...payload};
            case ROOM_SEARCH_ACTIONS.CREATE:
                return {...state}
                // Validate form
                // Create room and navigate to game
        }
    }
    const [{ showModal, modalType, RoomName, RoomPassword }, dispatch] = useReducer(reducer, {
        showModal: false,
        modalType: '',
        RoomName: '',
        RoomPassword: ''
    });

    function showCreateModal() {
        dispatch({type: ROOM_SEARCH_ACTIONS.SHOW_MODAL, payload: {modalType: ROOM_SEARCH_MODAL_TYPES.CREATE}})
    }

    function CreateRoomModalContent({ }) {
        return (
            <div>
                <h2>Create Room</h2>
                <TextInput style={{marginBottom: '20px'}} placeholder={'name'} inputName="RoomName" value={RoomName} dispatch={dispatch} dispatchType={ROOM_SEARCH_ACTIONS.UPDATE_FORM} />
                <TextInput style={{marginBottom: '20px'}} placeholder={'password'} inputName="RoomPassword" value={RoomPassword} dispatch={dispatch} dispatchType={ROOM_SEARCH_ACTIONS.UPDATE_FORM} />
                <Button onClick={() => dispatch({type: ROOM_SEARCH_ACTIONS.CREATE})}>CREATE ROOM</Button>
            </div>
        )
    }
    return (
        <div>
            {
            showModal ? 
                <Modal>
                    { modalType === ROOM_SEARCH_MODAL_TYPES.CREATE ? <CreateRoomModalContent RoomName={RoomName} /> : ''}
                </Modal> : 
            ''
            }
            <div></div>
            <div className="flex">
                <div className="flex">
                    <h3>Room Code:</h3>
                    <div className="input-wrapper DeckName">
                    <input value="xyfa"
                        type="text"
                        placeholder={`Deck Name`}
                        name="name" id="name" autoComplete="off"
                        autoFocus /></div>
                </div>
                <div className="button" onClick={showCreateModal}>CREATE</div>
            </div>
        </div>
    );
  };