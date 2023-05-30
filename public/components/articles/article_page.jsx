import React, { useEffect, useState, useContext } from "react";
import { useParams, NavLink, Outlet, Link } from "react-router-dom";
import { fetch_course } from "../../api_requests.jsx";
import { TokenContext } from "../app.jsx";

export default function ArticlePage() {
    const context = useContext(TokenContext);

    const [course, setCourse] = useState(null);

    const {course_id} = useParams();

    useEffect(() => {
        const get_course = async function() {
            let course = await fetch_course(context, course_id);
            if (course) {
                setCourse(course);
            }
        }
        get_course();
    }, [])

    const article_list = course?.articles.map((article) =>
        <li key={article.id}>
            <NavLink to={`/courses/${course.course_data.id}/articles/${article.id}`}>
                {article.name}
            </NavLink>
        </li>
    );

    return (
        <>
            {course &&
                <nav id="article_nav">
                    <div>
                        <span className="course_label">Курс: </span>
                        <Link to={`/courses/${course.course_data.id}`}>{course.course_data.name}</Link>
                    </div>
                    <ol>
                        {article_list}
                    </ol>
                </nav>
            }
            <Outlet context={course}/>
        </>
    )
}