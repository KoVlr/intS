import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { TokenContext } from "./app.jsx";

export default function UserMenu() {
    const context = useContext(TokenContext);
    const [username, setUsername] = useState("loading...");
    useEffect(()=>{
        async function fetchUser() {
            let response = await fetch('/test/', {
                method: 'GET',
                headers: {
                    Authorization: `${context.token.token_type} ${context.token.access_token}`
                }
            });
            if (response.ok){
                let user = await response.json();
                setUsername(user.username);
            }
        }
        fetchUser();
    }, []);

    return (
        <>
            {username}<br/>
            <Link to="/become_author">Стать автором</Link><br/>
            <button>Выход</button>
        </>
    );
}