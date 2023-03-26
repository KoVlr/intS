import React, { useContext, useEffect, useRef, useState } from "react";
import { fetch_my_courses } from "../../api_requests.jsx";
import { TokenContext } from "../app.jsx";
import MyCourseElem from "./my_course_elem.jsx";
import { Link } from "react-router-dom";

export default function MyCourses() {
    const context = useContext(TokenContext);

    const [courses, setCourses] = useState([]);
    const [listenScroll, setListenScroll] = useState(false);

    const download_count = useRef(0);

    useEffect(() => {
        if (!listenScroll) {
            const get_courses = async function() {
                let chunk_size = 5;
                let new_courses = [];

                //Loading data until there are chunk_size new unique elements or until all data is loaded.
                while (new_courses.length < chunk_size) {
                    let downloaded_courses = await fetch_my_courses(context, download_count.current, chunk_size);
                    if (downloaded_courses) {
                        download_count.current += downloaded_courses.length;

                        for_downloaded_courses: for (let downloaded_course of downloaded_courses) {
                            for (let course of courses) {
                                if (downloaded_course.id == course.id) continue for_downloaded_courses;
                            }
                            new_courses.push(downloaded_course);
                        }
                        
                        //if all data is loaded
                        if (downloaded_courses.length < chunk_size) {
                            setCourses(courses => [...courses, ...new_courses]);
                            //value of listenScroll remains equal to false
                            return;
                        }
                    } else {
                        setCourses(courses => [...courses, ...new_courses]);
                        if (courses.length >= chunk_size) setListenScroll(true);
                        return;
                    }
                }
                
                setCourses(courses => [...courses, ...new_courses]);
                setListenScroll(true);
            }

            get_courses();
        }
    }, [listenScroll, context.token===null])


    const handleScroll = async function(event) {
        if (listenScroll) {
            let margin = 500;
            if (event.target.scrollHeight - (event.target.scrollTop + event.target.clientHeight) < margin) {
                setListenScroll(false);
            }
        }
    }

    const course_list = courses.map((course) =>
            <MyCourseElem key={course.id} course={course} />
    );

    return (
        <div>
            <Link to={'/courses/new'}>Создать курс</Link>
            <ul style={{height: 310, overflow: 'auto'}} onScroll={handleScroll}>{course_list}</ul>
        </div>
    );
}