import React, { useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetch_user_activation} from "../../api_requests.jsx";
import { TokenContext } from "../app.jsx";

export default function UserActivation() {
    const context = useContext(TokenContext);

    const navigate = useNavigate();

    let {user_id, confirmation_code} = useParams();

    useEffect(() => {
        const effect = async function() {
            let token = await fetch_user_activation(context, user_id, confirmation_code);
            if (token) {
                context.setToken(token);
                navigate('/');
            }
        }
        effect();
    }, []);

    return (
        <>
            Loading...
        </>
    )
}