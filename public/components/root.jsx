import React, { useContext } from "react";
import { Outlet, Link } from "react-router-dom";
import UserMenu from "./usermenu.jsx";
import {TokenContext} from "./app.jsx";

export default function Root() {
    const context = useContext(TokenContext);

    let user_menu;
    if (context.token === null) {
        user_menu = <>
            <Link to="/login">Войти</Link> <Link to="/signup">Зарегистрироваться</Link>
        </>;
    } else {
        user_menu = <UserMenu/>;
    }

    return (
        <>
            <header>
                <h1>intSpread</h1>
            </header>

            {user_menu}

            <Outlet/>
        </>
    );
}