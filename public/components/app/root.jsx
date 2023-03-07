import React, { useContext } from "react";
import { Outlet, Link } from "react-router-dom";
import { TokenContext } from "../app.jsx";
import Notifications from "./root/notifications.jsx";
import UserMenu from "./root/usermenu.jsx";

export default function Root() {
    let context = useContext(TokenContext);

    return (
        <>
            <header>
                <h1>intSpread</h1>
            </header>
            
            {context.token === null
                ? <><Link to="/login">Войти</Link> <Link to="/signup">Зарегистрироваться</Link></>
                : <>
                    <Notifications/>
                    <UserMenu/>
                </>
            }

            <Outlet/>
        </>
    );
}