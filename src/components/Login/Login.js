import { useState } from "react";

export default function Login() {
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');

    return (
        <>
            <input value={username}
                    type="text"
                    onChange={(e) => {setUserName(e.target.value)}}
                    placeholder={`Username`}
                    autoFocus/>
            <input value={password}
                    type="hidden"
                    onChange={(e) => {setPassword(e.target.value)}}
                    placeholder={`Password`}/>
        
        </>
    );
}