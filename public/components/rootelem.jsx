import React, { useContext, useEffect, useState } from 'react';
import {Navigate} from 'react-router-dom';
import {TokenContext} from "./app.jsx";

function RootElem(props) {
    const context = useContext(TokenContext);
    if (context.token === null) return <Navigate to="/login"/>

    const [email, setEmail] = useState("loading...");

    useEffect(()=>{
        async function fetchEmail() {
            let response = await fetch('/test/', {
                method: 'GET',
                headers: {
                    Authorization: `${context.token.token_type} ${context.token.access_token}`
                }
            });
            if (response.ok){
                let user = await response.json();
                setEmail(user.email);
            }
        }
        fetchEmail();
    }, []);

    return (
        <p>
            email = {email}
        </p>
    );
}

export default RootElem;