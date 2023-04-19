import React from "react";
import Comments from "./comments.jsx";

export default function CommentElem(props) {

    return (
        <div>
            <div style={{height: 200}}>
                <p>{props.comment.user}</p>
                <p>{props.comment.content}</p>
                <p>{props.comment.created_at}</p>
            </div>

            {props.comment.replies_count!=0 &&
                <Comments reply_to={props.comment.id}/>
            }
        </div>
    );
}