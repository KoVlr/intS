import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TokenContext } from "../app.jsx";
import { fetch_logout, fetch_user } from "../../api_requests.jsx";

export default function UserMenu() {
    const context = useContext(TokenContext);
    
    const [username, setUsername] = useState("loading...");
    const [display, setDisplay] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const get_data = async function() {
            let user = await fetch_user(context);
            if (user) setUsername(user.username);
        }
        get_data();
    }, []);

    async function logout_click_handle() {
        let success = await fetch_logout(context);
        if (success) {
            context.setToken(null);
            navigate("/");
        }
    }

    return (
        <div>
            <button onClick={()=>setDisplay((display)=>!display)}>{username}</button>
            {display &&
                <div className="menu">
                    {!context.token.rights.includes("author") &&
                        <>
                            <Link to="/become_author">Стать автором</Link>
                        </>
                    }
                    <button onClick={logout_click_handle}>Выход</button>
                </div>
            }
        </div>
    );
}