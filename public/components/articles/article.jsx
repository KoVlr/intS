import React, { useState, useContext, useEffect } from "react";
import { useOutletContext, useParams, Link } from "react-router-dom";
import { fetch_article_view } from "../../api_requests.jsx";
import { TokenContext } from "../app.jsx";
import hljs from 'highlight.js';
import DOMPurify from "dompurify";


export default function Article() {
    const context = useContext(TokenContext);

    const [view, setView] = useState("");

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
    }, [context.token===null]);

    useEffect(() => {
        MathJax.typeset();
        hljs.highlightAll();
    }, [view]);


    return (
        <div>
            {course?.ownership &&
                <div>
                    <Link to={`/courses/${course_id}/articles/${article_id}/edit`}>Редактировать</Link>
                </div>
            }
            <div dangerouslySetInnerHTML={{__html: view}}/>
        </div>
    )
}