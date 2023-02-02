import React, { useState } from "react";
import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import RootElem from "./rootelem.jsx";
import LoginForm from "./login.jsx";

export const TokenContext = React.createContext({token: null, setToken: () => {}});

function App(props) {
    const [token, setToken] = useState(null);

    return (
        <TokenContext.Provider value={{token: token, setToken: setToken}}>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginForm/>} />
                    <Route path="/" element={<RootElem/>} />
                </Routes>
            </BrowserRouter>
        </TokenContext.Provider>
    );
}

export default App;