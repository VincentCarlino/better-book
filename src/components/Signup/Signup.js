import { useState } from "react";

export default function Signup() {
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    return (
        <>
            <input value={username}
                    type="text"
                    onChange={(e) => {setUserName(e.target.value)}}
                    placeholder={`Username`}
                    autoFocus/>
            <input value={email}
                    type="email"
                    onChange={(e) => {setEmail(e.target.value)}}
                    placeholder={`Email`}/>
            <input value={password}
                    type="hidden"
                    onChange={(e) => {setPassword(e.target.value)}}
                    placeholder={`Password`}/>
        
        </>
    );
}