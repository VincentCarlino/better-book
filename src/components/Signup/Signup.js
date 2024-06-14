import { useState } from "react";
import axios from 'axios'
import './Signup.scss';
import logo from '../../images/book-heart-solid-72.png';

import { useNavigate } from "react-router-dom";

export default function Signup() {
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    function handleSignup(e) {
        e.preventDefault()
        axios.post("http://localhost:5050/api/users", { username, email, password })
        .then(result => {console.log(result)
        navigate("/deck");
        })
        .catch(err => console.log(err))
    }

    return (
        <>
            <div className="container">
                <img className="Logo" src={logo} />
                <h1 className="title">Spellbook</h1>
            <div className="input-wrapper">
                <input value={username}
                type="text"
                onChange={(e) => {setUserName(e.target.value)}}
                placeholder={`Username`}
                name="name" id="name" 
                autoFocus/>
            </div>
            <div className="input-wrapper">
            <input value={email}
                    type="email"
                    onChange={(e) => {setEmail(e.target.value)}}
                    placeholder={`Email`}/>
            </div>
            <div className="input-wrapper">
            
            <input value={password}
                    onChange={(e) => {setPassword(e.target.value)}}
                    placeholder={`Password`}/>
            </div>
            <div className="button secondary" onClick={handleSignup}>
                Sign Up
            </div>
        </div>
            
        </>
    );
}