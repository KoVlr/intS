import React, { useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { TokenContext } from '../app.jsx';
import { fetch_delete_file, fetch_upload_files } from '../../api_requests.jsx';

export default function CourseFiles(props) {
    const context = useContext(TokenContext);

    const {course_id} = useParams();

    const file_input = useRef(null);
    

    const handleSubmit = async function(event) {
        event.preventDefault();

        let course = await fetch_upload_files(context, course_id, file_input.current.files);
        file_input.current.value = "";
        props.setCourse(course);
    }


    const getDeleteHandler = function(file_id) {
        return async () => {
            let course = await fetch_delete_file(context, file_id);
            if (course) {
                props.setCourse(course);
            }
        }
    }


    const article_list = props.files.map((file) =>
        <li key={file.id}>
            <a href={`/api/files/${file.id}`} download>{file.original_name}</a>
            {props.edit_mode &&
                <button onClick={getDeleteHandler(file.id)}>Удалить</button>
            }
        </li>
    );

    return (
        <div>
            {props.edit_mode &&
                <form onSubmit={handleSubmit}>
                    <label>
                        Загрузить файлы
                        <input type="file" ref={file_input} multiple/>
                    </label>
                    <input type="submit" value="Отправить"/>
                </form>
            }

            <ul>{article_list}</ul>
        </div>
    )
}