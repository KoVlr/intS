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
                    <Route path="/" element={<RootElem/>}>
                        <Route path="/collection" element={<></>} />
                        <Route path="/history" element={<></>} />
                        <Route path="/allcourses" element={<></>} />
                    </Route>
                    <Route path="/courses/:courseId" element={<></>} />
                    <Route path="/article/:articleID" element={<></>} />

                    <Route path="/become_author" element={<></>} />
                    <Route path="/authors/:authorId" element={<></>} />
                    <Route path="/author_menu" element={<></>} />
                    <Route path="/edit/courses/:courseId" element={<></>} />
                    <Route path="/edit/article/:articleId" element={<></>} />

                    <Route path="/login" element={<LoginForm/>} />
                    <Route path="/signup" element={<></>} />
                </Routes>
            </BrowserRouter>
        </TokenContext.Provider>
    );
}

export default App;