import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { fetch_change_course, fetch_course, fetch_course_drafts} from "../../api_requests.jsx";
import { TokenContext } from "../app.jsx";
import EditPublished from "./edit_published.jsx";
import EditDrafts from "./edit_drafts.jsx";
import CourseFiles from "./course_files.jsx";

export default function CourseEditor() {
    const context = useContext(TokenContext);

    const [course, setCourse] = useState(null);
    const [drafts, setDrafts] = useState([]);
    const [edit_mode, setArticlesType] = useState('published');

    const {course_id} = useParams();

    useEffect(() => {
        const get_course = async function() {
            let course = await fetch_course(context, course_id);
            if (course) {
                setCourse(course);
            }

            let drafts = await fetch_course_drafts(context, course_id);
            if (drafts) {
                    setDrafts(drafts)
                }
        }
        get_course();
    }, [])


    const change_name = async function(event) {
        event.preventDefault();

        await fetch_change_course(context, course_id, {course_data: {name: course.course_data.name}});
    }

    const change_description = async function(event) {
        event.preventDefault();

        await fetch_change_course(context, course_id, {course_data: {description: course.course_data.description}});
    }

    const change_access_type = async function(event) {
        event.preventDefault();

        await fetch_change_course(context, course_id, {course_data: {is_public: course.course_data.is_public}});
    }

    const update_access_code = async function(event) {
        event.preventDefault();

        let course_data = await fetch_change_course(context, course_id, {change_access_code: true});
        if (course_data) {
            setCourse(course => ({...course, access_code: course_data.access_code}));
        }
    }


    return (
        <div>
            {course &&
                <>
                    <form onSubmit={change_name}>
                        Название курса: 
                        <input type="text" value={course.course_data.name} onChange={(event)=>{
                                setCourse(course=>({...course, course_data: {...course.course_data, name: event.target.value}}));
                            }}/>
                        <input type="submit" value="Сохранить"/>
                    </form>

                    <form onSubmit={change_description}>
                        Описание:<br/>
                        <textarea value={course.course_data.description} onChange={(event)=>{
                                setCourse(course=>({...course, course_data: {...course.course_data, description: event.target.value}}));
                            }}/>
                        <input type="submit" value="Сохранить"/>
                    </form>

                    <form onSubmit={change_access_type}>
                        Доступность: 
                        <input name="public" type="radio" value="public" checked={course.course_data.is_public} onChange={
                                (event)=>setCourse(course=>({...course, course_data: {...course.course_data, is_public: !course.course_data.is_public}}))
                            }/>
                        Публичный курс
                        <input name="private" type="radio" value="private" checked={!course.course_data.is_public} onChange={
                                (event)=>setCourse(course=>({...course, course_data: {...course.course_data, is_public: !course.course_data.is_public}}))
                            }/>
                        Закрытый курс
                        <input type="submit" value="Сохранить"/>
                    </form>

                    {course.access_code &&
                        <div>
                            Код доступа:<br/>
                            {course.access_code}
                            <button onClick={update_access_code}>Удалить и сгенерировать новый</button>
                        </div>
                    }

                    <nav>
                        <ul>
                            <li><button onClick={() => setArticlesType('published')}>Опубликованное</button></li>
                            <li><button onClick={() => setArticlesType('drafts')}>Черновики</button></li>
                            <li><button onClick={() => setArticlesType('files')}>Файлы</button></li>
                        </ul>
                    </nav>

                    {edit_mode == 'published' &&
                        <EditPublished articles={course.articles} setArticles={(articles)=>setCourse(course=>({...course, articles: articles}))} />
                    }

                    {edit_mode == 'drafts' &&
                        <EditDrafts drafts={drafts} />
                    }

                    {edit_mode == 'files' &&
                        <CourseFiles files={course.files} setCourse={setCourse} edit_mode={true}/>
                    }
                </>
            }
        </div>
    )
}