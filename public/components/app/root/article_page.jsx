import React from "react";
import { Outlet } from "react-router-dom";

export default function ArticlePage() {
    return (
        <div>
            <Outlet/>
        </div>
    )
}