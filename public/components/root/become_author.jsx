import React, { useContext } from "react";
import { TokenContext } from "../app.jsx";
import { fetch_become_author, fetch_refresh_tokens } from "../../api_requests.jsx";
import { Navigate } from 'react-router-dom';

export default function BecomeAuthor() {
    const context = useContext(TokenContext);

    async function click_handle() {
        let author = await fetch_become_author(context);
        if (author) {
            let token = await fetch_refresh_tokens(context.token);
            if (token) {
                context.setToken(token);
            }
        }
    }

    if (context.token.rights.includes("author")) {
        return (<Navigate to="/home/mycourses"/>);
    }

    return (
        <>
            <button onClick={click_handle}>Стать автором</button>
        </>
    );
}