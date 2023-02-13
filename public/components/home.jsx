import React from "react";
import { NavLink, Outlet } from "react-router-dom";

export default function Home() {
    return (
        <>
            <nav>
                <ul>
                    <li><NavLink to="/home/collection">Коллекция</NavLink></li>
                    <li><NavLink to="/home/history">История</NavLink></li>
                    <li><NavLink to="/home/allcourses">Все курсы</NavLink></li>
                    <li><NavLink to="/home/mycourses">Мои курсы</NavLink></li>
                </ul>
            </nav>

            <main>
                <article>
                    <Outlet/>
                </article>
            </main>
        </>
    );
}