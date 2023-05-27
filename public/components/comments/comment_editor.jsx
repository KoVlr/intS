import React, { useState, useContext } from 'react';
import { fetch_create_comment, fetch_update_comment } from '../../api_requests.jsx';
import { TokenContext } from "../app.jsx";
import { useParams } from "react-router-dom";



export default function CommentEditor(props) {
    const context = useContext(TokenContext);

    const [content, setContent] = useState(props.comment != null ? props.comment.content : '');

    const {article_id} = useParams();


    const handleSubmit = async function(event) {
        event.preventDefault();

        let comment;
        if (props.comment != null) {
            comment = await fetch_update_comment(context, props.comment.id, content);
        } else {
            comment = await fetch_create_comment(context, article_id, content, props.reply_to);
        }

        if (comment) {
            props.setComment(comment);
        }
    }

    return (
        <div>
            <form className='comment_editor' onSubmit={handleSubmit}>
                <textarea value={content} onChange={(event)=>{setContent(event.target.value)}}/>
                <span>
                    <input type="submit" value="Отправить"/>
                    <button onClick={props.cancelHandler}>Отмена</button>
                </span>
            </form>
        </div>
    );
}