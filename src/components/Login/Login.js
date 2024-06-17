import { useState } from "react";
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import './Login';
import { useAuth } from "../Auth/Provider/AuthProvider";

export default function Login() {
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [failed, setFailed] = useState(false);
    const { token, setToken } = useAuth();
    
    const navigate = useNavigate();

    function handleLogin(e) {
        e.preventDefault()
        axios.post("http://localhost:5050/api/auth/login", { username, password })
        .then(result => {
            setFailed(false);
            setToken(result.data._id);
            navigate('/home');
        })
        .catch(err => {
            setFailed(true);
        })
    }

    return (
        <div className="Login">
            <div className="container">
                <h1 className="title">Spellbook</h1>
            <div className="input-wrapper">
            <input value={username}
                type="text"
                onChange={(e) => {setUserName(e.target.value)}}
                placeholder={`Username`}
                name="name" id="name" 
                autoFocus/></div>
                <div className="input-wrapper">
            <input value={password}
            type="password"
                    onChange={(e) => {setPassword(e.target.value)}}
                    placeholder={`Password`}/></div>
            <>{failed ? 'incorrect username or password' : ''}</>
            <div className="button secondary" onClick={handleLogin}>
                Login
            </div>
        </div>
            
        </div>
    );
}