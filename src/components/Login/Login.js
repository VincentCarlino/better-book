import { useState } from "react";
import axios from 'axios'
import './Signup.scss';
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    function handleSignup(e) {
        e.preventDefault()
        axios.post("http://localhost:5050/api", { username, email, password })
        .then(result => {console.log(result)
        navigate("/deck");
        })
        .catch(err => console.log(err))
    }

    return (
        <>
            <div className="container">
                <h1 className="title">Spellbook</h1>
            <input value={username}
                type="text"
                onChange={(e) => {setUserName(e.target.value)}}
                placeholder={`Username`}
                name="name" id="name" 
                autoFocus/>
            <input value={email}
                    type="email"
                    onChange={(e) => {setEmail(e.target.value)}}
                    placeholder={`Email`}/>
            <input value={password}
                    onChange={(e) => {setPassword(e.target.value)}}
                    placeholder={`Password`}/>
            <div className="button secondary" onClick={handleSignup}>
                Sign Up
            </div>
        </div>
            
        </>
    );
}