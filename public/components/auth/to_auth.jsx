import React from "react";
import { Link } from "react-router-dom";

export default function ToAuth() {

    return (
        <div>
            <Link to="/login"><button>Войти</button></Link>
            <Link to="/signup"><button>Зарегистрироваться</button></Link>
        </div>
    );
}