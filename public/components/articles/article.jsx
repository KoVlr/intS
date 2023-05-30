import React, { useState, useContext, useEffect } from "react";
import { useOutletContext, useParams, Link, useLocation } from "react-router-dom";
import { fetch_article_view, fetch_image } from "../../api_requests.jsx";
import { TokenContext } from "../app.jsx";
import hljs from 'highlight.js';
import DOMPurify from "dompurify";
import Comments from "../comments/comments.jsx";
import CommentEditor from "../comments/comment_editor.jsx";
import { get_str_local_date } from "../../local_date.js";


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
        if (view.length != 0) {
            MathJax.typeset();
            hljs.highlightAll();
        }
    }, [view]);

    useEffect(() => {
        const get_images = async function() {
            let images = document.querySelectorAll("#article img");
            images.forEach(async (image) => {
                let image_blob = await fetch_image(context, image.dataset.src);
                image.src = URL.createObjectURL(image_blob);
            });
        }
        if (view.length != 0) {
            get_images();
        }
    }, [view]);


    return (
        <div id="article_page">
            <div>
                <span>
                    <span className="elem_label">Последнее изменение: </span>
                    <span>
                        {course ? get_str_local_date(course.articles.find((article)=>article.id==article_id).updated_at) : "Loading..."}
                    </span>
                </span>

                {course?.ownership &&
                    <Link to={`/courses/${course_id}/articles/${article_id}/edit`}>Редактировать</Link>
                }
            </div>
            
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