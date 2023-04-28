import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { get_str_local_date } from "../../local_date";
import { TokenContext } from '../app.jsx';
import { fetch_delete_history_entry } from "../../api_requests.jsx";


export default function HistoryElem(props) {
    const context = useContext(TokenContext);

    const deleteHandler = async function() {
        let res = await fetch_delete_history_entry(context, props.article.id);
        if (res) {
            props.handleDelete();
        }
    }

    return (
        <li>
            <div>
                <p><Link to={`/courses/${props.article.course_id}/articles/${props.article.id}`}>
                    {props.article.name}
                </Link></p>

                <p>Курс: <Link to={`/courses/${props.article.course_id}`}>
                    {props.article.course_name}
                </Link></p>

                <p> {get_str_local_date(props.article.read_at)}</p>

            </div>
            <button onClick={deleteHandler}>Очистить</button>
        </li>
    );
}