import React, { useContext, useEffect, useState } from "react";
import { fetch_my_courses } from "../../api_requests.jsx";
import { TokenContext } from "../app.jsx";
import MyCourseElem from "./my_course_elem.jsx";
import { Link } from "react-router-dom";

export default function MyCourses() {
    const context = useContext(TokenContext);

    const [courses, setCourses] = useState([]);

    useEffect(() => {
        const get_courses = async function() {
            let courses = await fetch_my_courses(context);
            if (courses) {
                setCourses(courses);
            }
        }
        get_courses();
    }, [context.token===null]);

    const course_list = courses.map((course) =>
        <li key={course.id}>
            <MyCourseElem course={course} />
        </li>
    );

    return (
        <div>
            <Link to={'/courses/new'}>Создать курс</Link>
            <ul>{course_list}</ul>
        </div>
    );
}