import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { TokenContext } from "./app.jsx";
import { fetch_user } from "../data_loaders.jsx";

export default function UserMenu() {
    const context = useContext(TokenContext);
    
    const [username, setUsername] = useState("loading...");

    useEffect(() => {
        async function get_data() {
            let user = await fetch_user(context);
            if (user) setUsername(user.username);
        }
        get_data();
    }, []);

    async function logout_click_handle() {
        let response = await fetch('/auth/logout', {
            method: 'POST'
        });
        if (response.ok) {
            context.setToken(null);
        }
    }

    return (
        <>
            {username}<br/>
            <Link to="/become_author">Стать автором</Link><br/>
            <button onClick={logout_click_handle}>Выход</button>
        </>
    );
}