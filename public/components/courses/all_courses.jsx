import React from "react";
import { fetch_all_courses } from "../../api_requests.jsx";
import useInfiniteScroll from "./infinite_scroll_hook.jsx";
import CourseElem from "./course_elem.jsx";


export default function AllCourses() {
    const [courses, scrollHandler] = useInfiniteScroll(fetch_all_courses);

    const course_list = courses.map((course) =>
            <CourseElem key={course.id} course={course} />
    );

    return (
        <div>
            <ul style={{height: 310, overflow: 'auto'}} onScroll={scrollHandler}>{course_list}</ul>
        </div>
    );
}