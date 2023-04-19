import React, { useState } from "react";
import Comments from "./comments.jsx";

export default function CommentElem(props) {
    const [display, setDisplay] = useState(false);

    const clickHandler = function() {
        setDisplay(display=>(!display));
    }

    return (
        <div>
            <div style={{height: 200}}>
                <p>{props.comment.user}</p>
                <p>{props.comment.content}</p>
                <p>{props.comment.created_at}</p>
            </div>

            {props.comment.replies_count!=0 &&
                <details onClick={clickHandler}>
                    <summary>{`${props.comment.replies_count} ответов`}</summary>
                    <Comments reply_to={props.comment.id} display={display}/>
                </details>
            }
        </div>
    );
}