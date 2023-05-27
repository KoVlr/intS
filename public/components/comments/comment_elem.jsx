import React, { useState, useContext, useEffect } from "react";
import Comments from "./comments.jsx";
import CommentEditor from "./comment_editor.jsx";
import { TokenContext } from "../app.jsx";
import { fetch_delete_comment } from "../../api_requests.jsx";
import { get_str_local_date } from "../../local_date.js";

export default function CommentElem(props) {
    const context = useContext(TokenContext);

    const [display, setDisplay] = useState(false);
    const [edit_mode, setEditMode] = useState(false);
    const [reply_mode, setReplyMode] = useState(false);
    const [new_reply, setNewReply] = useState(null);
    const [parent_sequence, setParentSequence] = useState(null);

    useEffect(() => {
        if (props.parent_sequence != null && props.comment.id == props.parent_sequence[props.parent_sequence.length - 1]) {
            if (props.parent_sequence.length == 1) {
                let comment_elem = document.querySelector(`#comment${props.comment.id}`);
                comment_elem?.scrollIntoView();
            } else {
                setDisplay(true);
                setParentSequence(props.parent_sequence.slice(0,-1));
            }
        }
    }, [props.parent_sequence && props.parent_sequence[0]]);


    const detailsHandler = function(event) {
        event.preventDefault();

        setDisplay(display=>(!display));
    }

    const deleteHandler = async function() {
        let success = await fetch_delete_comment(context, props.comment.id);
        if (success) {
            props.setComment((prev_comment) => ({...prev_comment, content: null}));
        }
    }

    return (
        <li>
            {!edit_mode &&
                <div className="comment" id={`comment${props.comment.id}`}>
                    {props.comment.content !== null
                        ? <>
                                <span>{props.comment.user}</span>
                                <hr/>
                                <span>{props.comment.content}</span>
                                <span className='elem_label'>{get_str_local_date(props.comment.created_at)}</span>

                                {!reply_mode && !edit_mode &&
                                    <span className="comment_buttons">
                                        <button onClick={() => setReplyMode(true)}>Ответить</button>

                                        {props.comment.ownership &&
                                            <>
                                                <button onClick={() => setEditMode(true)}>Редактировать</button>
                                                <button onClick={deleteHandler}>Удалить</button>
                                            </>
                                        }
                                    </span>
                                }
                        </>
                        : <span>Комментарий был удалён</span>
                    }
                </div>
            }

            {props.comment.content !== null &&
                <>
                    {edit_mode &&
                        <CommentEditor
                            cancelHandler = {() => setEditMode(false)}
                            comment = {props.comment}
                            setComment = {(comment) => {
                                setEditMode(false);
                                props.setComment((prev_comment) => comment);
                            }}
                        />
                    }

                    {reply_mode &&
                        <CommentEditor
                            cancelHandler = {() => setReplyMode(false)}
                            reply_to = {props.comment.id}
                            setComment = {(comment) => {
                                setReplyMode(false);
                                props.setComment((prev_comment) => ({...prev_comment, replies_count: prev_comment.replies_count+1}));
                                setNewReply(comment);
                            }}
                        />
                    }
                </>
            }
            
            {props.comment.replies_count!=0 &&
                <details open={display}>
                    <summary onClick={detailsHandler}>{`ответов: ${props.comment.replies_count}`}</summary>
                    <Comments parent={props.comment} new_comment={new_reply} display={display} parent_sequence={parent_sequence}/>
                </details>
            }
        </li>
    );
}