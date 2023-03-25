import React, { useEffect, useState, useContext } from "react";
import { useParams, NavLink, Outlet } from "react-router-dom";
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
    }, [context.token===null])

    const article_list = course?.articles.map((article) =>
        <li key={article.id}>
            <NavLink to={`/courses/${course.course_data.id}/articles/${article.id}`}>
                {article.name}
            </NavLink>
        </li>
    );

    return (
        <div>
            {course &&
                <nav>
                    <ul>
                        {article_list}
                    </ul>
                </nav>
            }
            <Outlet context={course}/>
        </div>
    )
}