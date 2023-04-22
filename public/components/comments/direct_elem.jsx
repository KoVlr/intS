import React, { useContext} from 'react';
import { useNavigate} from 'react-router-dom';
import { TokenContext } from '../app.jsx';
import { fetch_delete_direct_entry } from "../../api_requests.jsx";

export default function DirectElem(props) {
    const context = useContext(TokenContext);

    const navigate = useNavigate();

    const clickHandler = async function() {
        let res = await fetch_delete_direct_entry(context, props.comment.id);
        if (res) {
            props.handleClick();
            navigate(
                `/courses/${props.comment.course_id}/articles/${props.comment.article_id}`,
                {state: {parent_sequence: props.comment.parent_sequence}}
            );
        }
    }

    return (
        <li>
            <div onClick={clickHandler}>
                <p>{props.comment.user}</p>
                <p>{props.comment.content}</p>
                <p>{props.comment.created_at}</p>
                <p>{props.comment.course}</p>
                <p>{props.comment.article}</p>
            </div>
        </li>
    );
}