import React, { useState } from "react";
import { fetch_my_courses } from "../../api_requests.jsx";
import MyCourseElem from "./my_course_elem.jsx";
import { Link } from "react-router-dom";
import useInfiniteScroll from "./infinite_scroll_hook.jsx";
import SearchInCourses from "./search_in_courses.jsx";


export default function MyCourses() {
    const [courses, setCourses, scrollHandler, activateLoad] = useInfiniteScroll(fetch_my_courses);

    const [query, setQuery] = useState('');
    const [input_value, setInputValue] = useState('');
    const [search_mode, setSearchMode] = useState(false);

    const course_list = courses.map((course) =>
        <MyCourseElem key={course.id} course={course} />
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
            <form onSubmit={submit_handle}>
                <input type="search" value={input_value} onChange={(event)=>setInputValue(event.target.value)} placeholder="Поиск в курсах" />
                <input type="submit" value="Найти" />
                {search_mode &&
                    <button onClick={cancel_handle}>Очистить</button>
                }
            </form>

            {!search_mode
                ? <div>
                    <Link to={'/courses/new'}>Создать курс</Link>
                    <ul style={{height: 310, overflow: 'auto'}} onScroll={scrollHandler}>{course_list}</ul>
                </div>

                : <SearchInCourses key={query} query={query} mine={true} collection={false}/>
            }
        </div>
    );
}