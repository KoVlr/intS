import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { fetch_add_to_collection, fetch_course, fetch_delete_from_collection, fetch_get_access } from "../../api_requests.jsx";
import { TokenContext } from "../app.jsx";
import { get_str_local_date } from "../../local_date.js";
import CourseFiles from "./course_files.jsx";

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
    }, [])


    const add_to_collection = async function() {
        let success = await fetch_add_to_collection(context, course_id);
        if(success) {
            setCourse(course=>({...course, in_collection: true}));
        }
    }


    const delete_from_collection = async function() {
        let success = await fetch_delete_from_collection(context, course_id);
        if(success) {
            setCourse(course=>({...course, in_collection: false}));
        }
    }


    const article_list = course?.articles?.map((article) =>
        <li className="ol_elem" key={article.id}>
            <Link to={`/courses/${course.course_data.id}/articles/${article.id}`}>
                {article.name}
            </Link>
        </li>
    );

    return (
        <div id="course">
            {course &&
                <>
                    <span className="course_head">
                        <div>{course.course_data.name}</div>
                        {course.ownership
                            ?<Link to={`/courses/${course_id}/edit`}>Редактировать курс</Link>
                            : (course.in_collection
                                ?<button onClick={delete_from_collection}>Удалить из коллекции</button>
                                :<button onClick={add_to_collection}>Добавить курс в коллекцию</button>
                            )
                        }
                    </span>

                    <span>
                        <span className="course_label">Автор: </span>
                        <span>{course.author}</span>
                    </span>

                    <span className="course_label">Описание:</span>
                    <div className="course_descr">{course.course_data.description}</div>

                    <span>
                        <span className="course_label">Последнее обновление: </span>
                        <span>{get_str_local_date(course.course_data.updated_at)}</span>
                    </span>

                    <span>
                        <span className="course_label">Доступ: </span>
                        {course.course_data.is_public
                            ?<span>Общедоступный курс</span>
                            :<span>
                                <span>Закрытый курс - </span>
                                {course.access
                                    ?<span>Есть доступ</span>
                                    :<span>Нет доступа</span>
                                }
                            </span>
                        }
                    </span>

                    <hr/>
                    
                    <span className="course_label">Материалы: </span>
                    {course.access &&
                        <>
                            <ol>{article_list}</ol>
                            <CourseFiles files={course.files} setCourse={setCourse} edit_mode={false}/>
                        </>
                    }
                </>
            }
        </div>
    )
}