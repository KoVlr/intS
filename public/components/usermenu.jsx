import React from "react";
import {Link} from "react-router-dom";

export default function UserMenu() {
    return (
        <>
            username<br/>
            <Link to="/become_author">Стать автором</Link><br/>
            <button>Выход</button>
        </>
    );
}