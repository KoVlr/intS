import React, { useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetch_article_view } from "../../../../api_requests.jsx";
import { TokenContext } from "../../../app.jsx";
import hljs from 'highlight.js';
import DOMPurify from "dompurify";


export default function Article() {
    const context = useContext(TokenContext);

    const [view, setView] = useState("");

    const {article_id} = useParams();

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
        <div dangerouslySetInnerHTML={{__html: view}}/>
    )
}