import React from "react";
import { fetch_collection } from "../../api_requests.jsx";
import CourseElem from "./course_elem.jsx";
import { Link } from "react-router-dom";
import useInfiniteScroll from "./infinite_scroll_hook.jsx";


export default function Collection() {
    const [courses, scrollHandler] = useInfiniteScroll(fetch_collection);

    const course_list = courses.map((course) =>
            <CourseElem key={course.id} course={course} />
    );

    return (
        <div>
            <ul style={{height: 310, overflow: 'auto'}} onScroll={scrollHandler}>{course_list}</ul>
        </div>
    );
}