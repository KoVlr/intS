import React, { useState, useEffect } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Root from "./root.jsx";
import Home from "./home.jsx";
import LoginForm from "./login.jsx";
import SignupForm from "./signup.jsx";

export const TokenContext = React.createContext({token: null, setToken: () => {}});

export default function App() {
    const [token, setToken] = useState(null);

    useEffect(()=>{
        async function fetchTokens() {
            let response = await fetch('/auth/refresh_tokens', {
                method: 'POST'
            });
            if (response.ok){
                let token = await response.json();
                setToken(token);
            }
        }
        fetchTokens();
    }, [])

    return (
        <TokenContext.Provider value={{token: token, setToken: setToken}}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Root/>}>
                        <Route index element={<Navigate to="/home"/>} />
                        <Route path="/home" element={<Home/>}>
                            <Route index element={<Navigate to="/home/collection"/>} />
                            <Route path="/home/collection" element={<>Collection</>} />
                            <Route path="/home/history" element={<>History</>} />
                            <Route path="/home/allcourses" element={<>Allcourses</>} />
                            <Route path="/home/mycourses" element={<>MyCourses</>} />
                        </Route>
                        <Route path="/courses/:courseId" element={<></>} />
                        <Route path="/courses/:courseId/edit" element={<></>}>
                            <Route path="/courses/:courseId/edit/published" element={<></>}/>
                            <Route path="/courses/:courseId/edit/drafts" element={<></>}/>
                        </Route>
                        <Route path="/courses/new" element={<></>} />
                        <Route path="/courses/:courseId/articles" element={<></>}>
                            <Route path="/courses/:courseId/articles/:articleId" element={<></>}/>
                        </Route>
                        <Route path="/courses/:courseId/articles/new" element={<></>} />
                        <Route path="/courses/:courseId/articles/:articleId/edit" element={<></>} />
                        <Route path="/authors/:authorId" element={<></>} />
                        <Route path="/become_author" element={<></>} />
                    </Route>
                    <Route path="/login" element={<LoginForm/>} />
                    <Route path="/signup" element={<SignupForm/>} />
                </Routes>
            </BrowserRouter>
        </TokenContext.Provider>
    );
}