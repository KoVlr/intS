import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { fetch_course } from "../../../api_requests.jsx";
import { TokenContext } from "../../app.jsx";

export default function Course() {
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
            <Link to={`/courses/${course.course_data.id}/articles/${article.id}`}>
                {article.name}
            </Link>
        </li>
    );

    return (
        <div>
            {course &&
                <>
                    <h2>{course.course_data.name}</h2>
                    <p>Автор: {course.author}</p>
                    <p>{course.course_data.description}</p>
                    <ul>{article_list}</ul>
                </>
            }
        </div>
    )
}