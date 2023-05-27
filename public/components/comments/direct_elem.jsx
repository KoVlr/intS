import React, { useContext} from 'react';
import { useNavigate} from 'react-router-dom';
import { TokenContext } from '../app.jsx';
import { fetch_delete_direct_entry } from "../../api_requests.jsx";
import { get_str_local_date } from '../../local_date.js';

export default function DirectElem(props) {
    const context = useContext(TokenContext);

    const navigate = useNavigate();

    const clickHandler = async function() {
        let res = await fetch_delete_direct_entry(context, props.comment.id);
        if (res) {
            props.handleClick(true);
            navigate(
                `/courses/${props.comment.course_id}/articles/${props.comment.article_id}`,
                {state: {parent_sequence: props.comment.parent_sequence}}
            );
        }
    }

    const clearHandler = async function(event) {
        event.stopPropagation();
        
        let res = await fetch_delete_direct_entry(context, props.comment.id);
        if (res) {
            props.handleClick(false);
        }
    }

    return (
        <li className="list_elem" onClick={clickHandler}>
            <span>{props.comment.user}</span>
            <hr/>
            <span>{props.comment.content}</span>
            <span className='elem_label'>{get_str_local_date(props.comment.created_at)}</span>
            <span>
                <span className='elem_label'>Курс: </span>
                <span>{props.comment.course}</span>
            </span>
            <span>
                <span className='elem_label'>Материал :</span>
                <span>{props.comment.article}</span>
            </span>
            <button onClick={clearHandler}>Прочитано</button>
        </li>
    );
}