import React, { useState, useContext } from "react";
import Comments from "./comments.jsx";
import CommentEditor from "./comment_editor.jsx";
import { TokenContext } from "../app.jsx";
import { fetch_delete_comment } from "../../api_requests.jsx";

export default function CommentElem(props) {
    const context = useContext(TokenContext);

    const [display, setDisplay] = useState(false);
    const [edit_mode, setEditMode] = useState(false);
    const [reply_mode, setReplyMode] = useState(false);
    const [new_reply, setNewReply] = useState(null);


    const detailsHandler = function() {
        setDisplay(display=>(!display));
    }

    const deleteHandler = async function() {
        let success = await fetch_delete_comment(context, props.comment.id);
        if (success) {
            props.setComment({...props.comment, content: null});
        }
    }

    return (
        <div>
            <div>
                {props.comment.content !== null
                    ? <>
                        {!edit_mode &&
                            <>
                                <p>{props.comment.user}</p>
                                <p>{props.comment.content}</p>
                                <p>{props.comment.created_at}</p>
                            </>
                        }
                        
                        {!reply_mode && !edit_mode &&
                            <p>
                                <button onClick={() => setReplyMode(true)}>Ответить</button>

                                {props.comment.ownership &&
                                    <>
                                        <button onClick={() => setEditMode(true)}>Редактировать</button>
                                        <button onClick={deleteHandler}>Удалить</button>
                                    </>
                                }
                            </p>
                        }

                        {edit_mode &&
                            <CommentEditor
                                cancelHandler = {() => setEditMode(false)}
                                comment = {props.comment}
                                setComment = {(comment) => {
                                    setEditMode(false);
                                    props.setComment(comment);
                                }}
                            />
                        }

                        {reply_mode &&
                            <CommentEditor
                                cancelHandler = {() => setReplyMode(false)}
                                reply_to = {props.comment.id}
                                setComment = {(comment) => {
                                    setReplyMode(false);
                                    props.setComment({...props.comment, replies_count: props.comment.replies_count+1});
                                    setNewReply(comment);
                                }}
                            />
                        }
                    </>
                    : <p>{'Комментарий был удалён'}</p>
                }
            </div>
            

            {props.comment.replies_count!=0 &&
                <details onClick={detailsHandler}>
                    <summary>{`${props.comment.replies_count} ответов`}</summary>
                    <Comments parent={props.comment} new_comment={new_reply} display={display}/>
                </details>
            }
        </div>
    );
}