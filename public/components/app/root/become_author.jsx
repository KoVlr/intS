import React, { useContext } from "react";
import { TokenContext } from "../../app.jsx";
import { fetch_become_author } from "../../../api_requests.jsx";
import { Navigate } from 'react-router-dom';

export default function BecomeAuthor() {
    const context = useContext(TokenContext);

    async function click_handle() {
        await fetch_become_author(context);
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