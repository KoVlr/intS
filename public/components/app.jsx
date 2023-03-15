import React, { useState, useEffect } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import { fetch_refresh_tokens } from "../api_requests.jsx";

import Root from "./app/root.jsx";
import Home from "./app/root/home.jsx";
import LoginForm from "./app/login.jsx";
import SignupForm from "./app/signup.jsx";
import BecomeAuthor from "./app/root/become_author.jsx";
import CourseNew from "./app/root/course_new.jsx";
import ArticleEditor from "./app/root/article_editor.jsx";
import ArticlePage from "./app/root/article_page.jsx";
import Article from "./app/root/article_page/article.jsx";
import Course from "./app/root/course.jsx";
import CourseEditor from "./app/root/course_editor.jsx";

export const TokenContext = React.createContext({token: null, setToken: () => {}});

export default function App() {
    const [token, setToken] = useState(null);

    useEffect(() => {
        const refresh_tokens = async function() {
            await fetch_refresh_tokens({token: token, setToken: setToken});
        };
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
                        <Route path="/courses/:course_id" element={<Course/>} />
                        <Route path="/courses/:course_id/edit" element={<CourseEditor/>}>
                            <Route path="/courses/:course_id/edit/published" element={<></>}/>
                            <Route path="/courses/:course_id/edit/drafts" element={<></>}/>
                        </Route>
                        <Route path="/courses/new" element={<CourseNew/>} />
                        <Route path="/courses/:course_id/articles" element={<ArticlePage/>}>
                            <Route path="/courses/:course_id/articles/:article_id" element={<Article/>}/>
                        </Route>
                        <Route path="/courses/:course_id/articles/:article_id/edit" element={<ArticleEditor/>} />
                        <Route path="/authors/:author_id" element={<></>} />
                        <Route path="/become_author" element={<BecomeAuthor/>} />
                    </Route>
                    <Route path="/login" element={<LoginForm/>} />
                    <Route path="/signup" element={<SignupForm/>} />
                </Routes>
            </BrowserRouter>
        </TokenContext.Provider>
    );
}