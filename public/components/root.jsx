import React from "react";
import { Outlet } from "react-router-dom";
import UserMenu from "./usermenu.jsx";

export default function Root() {
    return (
        <>
            <header>
                <h1>intSpread</h1>
            </header>

            <UserMenu/>

            <Outlet/>
        </>
    );
}