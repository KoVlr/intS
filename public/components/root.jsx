import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import UserMenu from "./usermenu.jsx";

export default function Root() {
    return (
        <>
            <header>
                <h1>intSpread</h1>
            </header>

            <nav>
                <ul>
                    <li><NavLink to="/collection">Коллекция</NavLink></li>
                    <li><NavLink to="/history">История</NavLink></li>
                    <li><NavLink to="/allcourses">Все курсы</NavLink></li>
                </ul>
            </nav>

            <UserMenu/>

            <main>
                <article>
                    <Outlet/>
                </article>
            </main>
        </>
    );
}