import React, { useState, useContext, useEffect } from "react";
import { useOutletContext, useParams, Link, useLocation } from "react-router-dom";
import { fetch_article_view } from "../../api_requests.jsx";
import { TokenContext } from "../app.jsx";
import hljs from 'highlight.js';
import DOMPurify from "dompurify";
import Comments from "../comments/comments.jsx";
import CommentEditor from "../comments/comment_editor.jsx";


export default function Article() {
    const context = useContext(TokenContext);

    const {state} = useLocation();

    const [view, setView] = useState("");
    const [edit_comment, setEditComment] = useState(false);
    const [new_comment, setNewComment] = useState(null);

    const {course_id, article_id} = useParams();

    const course = useOutletContext();

    useEffect(() => {
        const get_view = async function() {
            let view = await fetch_article_view(context, article_id);
            if (view) {
                let clean_view = DOMPurify.sanitize(view.html);
                setView(clean_view);
            }
        }
        get_view();
    }, [article_id]);

    useEffect(() => {
        MathJax.typeset();
        hljs.highlightAll();
    }, [view]);


    return (
        <div id="article_page">
            {course?.ownership &&
                <div id="edit_link">
                    <Link to={`/courses/${course_id}/articles/${article_id}/edit`}>Редактировать</Link>
                </div>
            }
            
            <div id="article" dangerouslySetInnerHTML={{__html: view}}/>


            <button onClick={() => setEditComment(true)}>Написать комментарий</button>

            {edit_comment &&
                <CommentEditor
                    cancelHandler = {() => setEditComment(false)}
                    setComment = {(comment) => {
                        setEditComment(false);
                        setNewComment(comment);
                    }}
                />
            }

            <Comments key={article_id} parent={null} display={true} new_comment={new_comment} parent_sequence={state?.parent_sequence}/>
        </div>
    )
}