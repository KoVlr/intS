import React, { useState } from "react";
import { fetch_all_courses } from "../../api_requests.jsx";
import useInfiniteScroll from "./infinite_scroll_hook.jsx";
import CourseElem from "./course_elem.jsx";
import SearchInCourses from "./search_in_courses.jsx";


export default function AllCourses() {
    const [courses, setCourses, scrollHandler, activateLoad] = useInfiniteScroll(fetch_all_courses);

    const [query, setQuery] = useState('');
    const [input_value, setInputValue] = useState('');
    const [search_mode, setSearchMode] = useState(false);

    const course_list = courses.map((course) =>
        <CourseElem key={course.id} course={course} />
    );


    const submit_handle = function(event) {
        event.preventDefault();

        setQuery(input_value);
        setSearchMode(true);
    }


    const cancel_handle = function() {
        setSearchMode(false);
        setQuery('');
        setInputValue('');
    }


    return (
        <div>
            <form className="search" onSubmit={submit_handle}>
                <input type="search" value={input_value} onChange={(event)=>setInputValue(event.target.value)} placeholder="Поиск в курсах" />
                <input type="submit" value="Найти" />
                {search_mode &&
                    <button onClick={cancel_handle}>Очистить</button>
                }
            </form>

            {!search_mode
                ?<div>
                    <ul className="course_list" onScroll={scrollHandler}>{course_list}</ul>
                </div>

                : <SearchInCourses key={query} query={query} mine={false} collection={false}/>
            }
        </div>
    );
}