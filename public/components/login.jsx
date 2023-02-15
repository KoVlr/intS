import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TokenContext } from "./app.jsx";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const navigate = useNavigate();

    const context = useContext(TokenContext);

    const handleSubmit = async function(event) {
        event.preventDefault();

        let formdata = new FormData();
        formdata.set('username', email);
        formdata.set('password', password);

        let response = await fetch('http://127.0.0.1:8000/auth/token', {
            method: 'POST',
            body: formdata
        });
        if (response.ok){
            let token = await response.json();
            context.setToken(token);
            navigate("/");
        }
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