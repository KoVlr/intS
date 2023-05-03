import React, { useState, useEffect } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import { fetch_refresh_tokens } from "../api_requests.jsx";

import Root from "./root/root.jsx";
import Home from "./home.jsx";
import LoginForm from "./auth/login.jsx";
import SignupForm from "./auth/signup.jsx";
import BecomeAuthor from "./root/become_author.jsx";
import CourseNew from "./courses/course_new.jsx";
import ArticleEditor from "./articles/article_editor.jsx";
import ArticlePage from "./articles/article_page.jsx";
import Article from "./articles/article.jsx";
import Course from "./courses/course.jsx";
import CourseEditor from "./courses/course_editor.jsx";
import MyCourses from "./courses/my_courses.jsx";
import AllCourses from "./courses/all_courses.jsx";
import Collection from "./courses/collection.jsx";
import ArticleHistory from "./articles/article_history.jsx";
import RenderIfAuth from "./auth/render_if_auth.jsx";
import CourseAccess from "./courses/course_access.jsx";

export const TokenContext = React.createContext({token: null, setToken: () => {}});

export default function App() {
    const [token, setToken] = useState(undefined);

    useEffect(() => {
        const refresh_tokens = async function() {
            let token = await fetch_refresh_tokens();
            if (token) {
                setToken(token);
            } else {
                setToken(null);
            }
        };
        refresh_tokens();
    }, [])

    if (token === undefined) return <>Loading...</>;

    return (
        <TokenContext.Provider value={{token: token, setToken: setToken}}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Root/>}>
                        <Route index element={<Navigate to="/home"/>} />

                        <Route path="/home" element={<Home/>}>
                            <Route index element={<Navigate to="/home/collection"/>} />
                            <Route path="/home/collection" element={<RenderIfAuth component={Collection}/>} />
                            <Route path="/home/history" element={<RenderIfAuth component={ArticleHistory}/>} />
                            <Route path="/home/allcourses" element={<AllCourses/>} />
                            <Route path="/home/mycourses" element={<MyCourses/>} />
                        </Route>

                        <Route path="/courses/:course_id" element={<Course/>} />
                        <Route path="/courses/:course_id/edit" element={<CourseEditor/>}/>
                        <Route path="/courses/:course_id/access/:access_code" element={<RenderIfAuth component={CourseAccess}/>}/>
                        <Route path="/courses/new" element={<CourseNew/>} />

                        <Route path="/courses/:course_id/articles" element={<ArticlePage/>}>
                            <Route path="/courses/:course_id/articles/:article_id" element={<Article/>}/>
                        </Route>

                        <Route path="/courses/:course_id/articles/:article_id/edit" element={<ArticleEditor/>} />
                        <Route path="/become_author" element={<BecomeAuthor/>} />
                    </Route>

                    <Route path="/login" element={<LoginForm/>} />
                    <Route path="/signup" element={<SignupForm/>} />
                </Routes>
            </BrowserRouter>
        </TokenContext.Provider>
    );
}