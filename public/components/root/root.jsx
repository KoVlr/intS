import React, { useContext } from "react";
import { Outlet, Link } from "react-router-dom";
import { TokenContext } from "../app.jsx";
import Notifications from "./notifications.jsx";
import UserMenu from "./user_menu.jsx";

export default function Root() {
    let context = useContext(TokenContext);

    return (
        <>
            <header>
                <h1>intSpread</h1>
            </header>
            
            {context.token
                ? <>
                    <Notifications/>
                    <UserMenu/>
                </>
                : <><Link to="/login">Войти</Link> <Link to="/signup">Зарегистрироваться</Link></>
            }

            <Outlet/>
        </>
    );
}