import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetch_tokens } from '../../api_requests.jsx';
import { TokenContext } from "../app.jsx";

export default function LoginForm() {
    const context = useContext(TokenContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const navigate = useNavigate();

    const handleSubmit = async function(event) {
        event.preventDefault();
        let success = await fetch_tokens(context, email, password);
        if (success) navigate("/");
    };

    return (
        <form onSubmit={handleSubmit}>
            <fieldset>
                <legend>Вход</legend>
                <label>
                    email:
                    <input name="email" type="text" value={email} onChange={(event)=>setEmail(event.target.value)}/>
                </label>
                <label>
                    password:
                    <input name="password" type="text" value={password} onChange={(event)=>setPassword(event.target.value)}/>
                </label>
                <input type="submit" value="Войти"/>
            </fieldset>
        </form>
    );
}