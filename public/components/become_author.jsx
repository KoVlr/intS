import React, { useContext } from "react";
import { TokenContext } from "./app.jsx";
import { fetch_become_author } from "../data_loaders.jsx";

export default function BecomeAuthor() {
    const context = useContext(TokenContext);

    async function click_handle() {
        await fetch_become_author(context);
    }

    return (
        <>
            <button onClick={click_handle}>Стать автором</button>
        </>
    );
}