import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TokenContext } from './app.jsx';
import { useGetToken } from './login.jsx';

export default function SignupForm() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const navigate = useNavigate();
    const getToken = useGetToken(email, password, TokenContext);

    const handleSubmit = async function(event) {
        event.preventDefault();

        let response = await fetch('http://127.0.0.1:8000/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });
        if (response.ok){
            if (getToken()) navigate("/");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <fieldset>
                <legend>Регистрация</legend>
                <label>
                    username:
                    <input name="username" type="text" value={username} onChange={(event)=>setUsername(event.target.value)}/>
                </label>
                <label>
                    email:
                    <input name="email" type="text" value={email} onChange={(event)=>setEmail(event.target.value)}/>
                </label>
                <label>
                    password:
                    <input name="password" type="text" value={password} onChange={(event)=>setPassword(event.target.value)}/>
                </label>
                <input type="submit" value="Зарегистрироваться"/>
            </fieldset>
        </form>
    );
}