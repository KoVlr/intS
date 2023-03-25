import React, { useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { fetch_create_user, fetch_tokens } from '../../api_requests.jsx';
import { TokenContext } from '../app.jsx';

export default function SignupForm() {
    const context = useContext(TokenContext);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async function(event) {
        event.preventDefault();

        let user = await fetch_create_user(username, email, password);
        if (user) {
            let token = await fetch_tokens(context, email, password);
            if (token) {
                context.setToken(token);
            }
        }
    };

    if (context.token !== null) {
        return <Navigate to="/"/>
    }

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