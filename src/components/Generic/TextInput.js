import { useState } from "react"

export const TextInput = ({ placeholder, inputName, value, dispatch, dispatchType, style }) => {
    /**
     * setValue is a function used to update value as passed by a parent form component
     */

    function handleChange(e) {
        const payload = {};
        payload[inputName] = e.target.value;        
        dispatch({type: dispatchType, payload: payload})
    }

    return (
        <div className="input-wrapper" style={style}>
            <input value={value}
                type="text"
                placeholder={placeholder}
                name={inputName} id={inputName} onChange={handleChange} autoComplete="off"
                autoFocus />
        </div>
    )
}