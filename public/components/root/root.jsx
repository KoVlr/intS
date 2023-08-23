import React, { useContext } from "react";
import { Outlet, Link } from "react-router-dom";
import { TokenContext } from "../app.jsx";
import Notifications from "../comments/notifications.jsx";
import UserMenu from "./user_menu.jsx";

export default function Root() {
    let context = useContext(TokenContext);

    return (
        <>
            <header>
                <Link to={"/"}><h1>intS</h1></Link>
                
                <div id="usermenu">
                    {context.token
                        ? <>
                            <Notifications/>
                            <UserMenu/>
                        </>
                        : <>
                            <Link to="/login"><button>Войти</button></Link>
                            <Link to="/signup"><button>Зарегистрироваться</button></Link>
                        </>
                    }
                </div>
            </header>
            
            <hr/>
            
            <main>
                <Outlet/>
            </main>
        </>
    );
}