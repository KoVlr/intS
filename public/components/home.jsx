import React, {useContext} from "react";
import { NavLink, Outlet } from "react-router-dom";
import { TokenContext } from "./app.jsx";

export default function Home() {
    let context = useContext(TokenContext);

    return (
        <>
            <nav id="home_nav">
                <ul>
                    <li><NavLink to="/home/collection">Коллекция</NavLink></li>
                    <li><NavLink to="/home/history">История</NavLink></li>
                    <li><NavLink to="/home/allcourses">Все курсы</NavLink></li>
                    {
                        context.token?.rights.includes("author") &&
                        <li><NavLink to="/home/mycourses">Мои курсы</NavLink></li>
                    }
                </ul>

                <hr/>
            </nav>

            <article>
                <Outlet/>
            </article>
        </>
    );
}