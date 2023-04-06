import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { fetch_add_to_collection, fetch_course, fetch_delete_from_collection, fetch_get_access } from "../../api_requests.jsx";
import { TokenContext } from "../app.jsx";

export default function Course() {
    const context = useContext(TokenContext);

    const [course, setCourse] = useState(null);

    const [access_code, setAccessCode] = useState('');

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

    
    const handleSubmitAccessCode = async function(event) {
        event.preventDefault();

        let success = await fetch_get_access(context, course_id, access_code);
        if(success) {
            setCourse(course=>({...course, access: true}));
        }
    }


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

                    {course.ownership
                        ?<Link to={`/courses/${course_id}/edit`}>Редактировать курс</Link>
                        : (course.in_collection
                            ?<>
                                <p>Курс добавлен в коллекцию</p>
                                <button onClick={delete_from_collection}>Удалить из коллекции</button>
                            </>
                            :<button onClick={add_to_collection}>Добавить курс в коллекцию</button>
                        )
                    }

                    <p>Автор: {course.author}</p>
                    <p>Последнее обновление: {course.course_data.updated_at}</p>
                    <p>Количество просмотров: {course.course_data.views_count}</p>
                    <p>{course.course_data.description}</p>

                    {!course.course_data.is_public &&
                        <>
                            <p>Закрытый курс</p>
                            {!course.access &&
                                <form onSubmit={handleSubmitAccessCode}>
                                    Введите код доступа: 
                                    <input type="text" value={access_code} onChange={(event)=>{
                                            setAccessCode(event.target.value);
                                        }}/>
                                    <input type="submit" value="Отправить"/>
                                </form>
                            }
                        </>
                    }

                    <ul>{article_list}</ul>
                </>
            }
        </div>
    )
}