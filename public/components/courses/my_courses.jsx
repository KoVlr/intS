import React from "react";
import { fetch_my_courses } from "../../api_requests.jsx";
import MyCourseElem from "./my_course_elem.jsx";
import { Link } from "react-router-dom";
import useInfiniteScroll from "./infinite_scroll_hook.jsx";


export default function MyCourses() {
    const [courses, setCourses, scrollHandler] = useInfiniteScroll(fetch_my_courses);

    const course_list = courses.map((course) =>
        <MyCourseElem key={course.id} course={course} />
    );

    return (
        <div>
            <Link to={'/courses/new'}>Создать курс</Link>
            <ul style={{height: 310, overflow: 'auto'}} onScroll={scrollHandler}>{course_list}</ul>
        </div>
    );
}