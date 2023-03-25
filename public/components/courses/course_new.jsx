import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetch_create_course} from '../../api_requests.jsx';
import { TokenContext } from '../app.jsx';

export default function CourseNew() {
    const context = useContext(TokenContext);

    const navigate = useNavigate();

    const [course_name, setCourseName] = useState("");
    const [description, setDescription] = useState("");
    const [is_public, setIsPublic] = useState(false);

    const handleSubmit = async function(event) {
        event.preventDefault();

        let course = await fetch_create_course(context, course_name, description, is_public);
        if (course) {
            navigate("/");
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <fieldset>
                <legend>Новый курс</legend>
                <label>
                    Название курса:
                    <input name="course_name" type="text" value={course_name} onChange={(event)=>setCourseName(event.target.value)}/>
                </label>
                <label>
                    Описание курса:
                    <textarea name="description" value={description} onChange={(event)=>setDescription(event.target.value)}/>
                </label>
                <label>
                    <input name="public" type="radio" value="public" checked={is_public} onChange={(event)=>setIsPublic(!is_public)}/>
                    Публичный курс
                </label>
                <label>
                    <input name="private" type="radio" value="private" checked={!is_public} onChange={(event)=>setIsPublic(!is_public)}/>
                    Закрытый курс
                </label>
                <input type="submit" value="Создать курс"/>
            </fieldset>
        </form>
    );
}