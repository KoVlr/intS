import React, { useState, useEffect } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import { fetch_refresh_tokens } from "../api_requests.jsx";

import Root from "./root.jsx";
import Home from "./home.jsx";
import LoginForm from "./login.jsx";
import SignupForm from "./signup.jsx";
import BecomeAuthor from "./become_author.jsx";

export const TokenContext = React.createContext({token: null, setToken: () => {}});

export default function App() {
    const [token, setToken] = useState(null);

    useEffect(() => {
        async function refresh_tokens() {
            let new_token = await fetch_refresh_tokens();
            setToken(new_token);
        }
        refresh_tokens();
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
                        <Route path="/become_author" element={<BecomeAuthor/>} />
                    </Route>
                    <Route path="/login" element={<LoginForm/>} />
                    <Route path="/signup" element={<SignupForm/>} />
                </Routes>
            </BrowserRouter>
        </TokenContext.Provider>
    );
}