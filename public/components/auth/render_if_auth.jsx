import React, { useContext } from "react";
import { TokenContext } from '../app.jsx';
import ToAuth from "./to_auth.jsx";



export default function RenderIfAuth(props) {
    const context = useContext(TokenContext);

    if (context.token!=null) {
        return (<>
            <props.component/>
        </>);
    } else {
        return <ToAuth/>;
    }
}