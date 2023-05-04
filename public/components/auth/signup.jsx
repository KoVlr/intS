import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetch_create_user, fetch_tokens } from '../../api_requests.jsx';
import { TokenContext } from '../app.jsx';

export default function SignupForm() {
    const context = useContext(TokenContext);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmation_page, setConf] = useState(false);

    const navigate = useNavigate();


    useEffect(() => {
        if (context.token != null) {
            navigate(-1);
        }
    }, []);


    const handleSubmit = async function(event) {
        event.preventDefault();

        let user = await fetch_create_user(username, email, password);
        if (user) {
            setConf(true);
        }
    };


    if (confirmation_page) {
        return (
            <div>
                На вашу почту было отправлено письмо с ссылкой для подтверждения
            </div>
        )
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