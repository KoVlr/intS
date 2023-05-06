import React, { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetch_editor_view, fetch_save_content } from '../../api_requests.jsx';
import { TokenContext } from '../app.jsx';
import hljs from 'highlight.js';

export default function EditContent(props) {
    const context = useContext(TokenContext);

    const [view, setView] = useState("");

    const {article_id} = useParams();

    useEffect(() => {
        MathJax.typeset();
        hljs.highlightAll();
    }, [view]);


    const handleSubmit = async function(event) {
        event.preventDefault();

        let article = await fetch_save_content(context, article_id, props.content);
        if (article) {
            props.setArticleData(article);
        }
    }


    const get_view = async function() {
        let view = await fetch_editor_view(context, article_id, props.content);
        if (view) {
            let clean_view = DOMPurify.sanitize(view.html);
            setView(clean_view);
        }
    }


    return (
        <div>
            <form onSubmit={handleSubmit}>
                <textarea value={props.content} onChange={(event)=>{props.setContent(event.target.value)}}/>
                <br/>
                <button onClick={get_view}>Посмотреть результат</button>
                <input type="submit" value="Сохранить изменения"/>
            </form>

            {view != "" &&
                <div dangerouslySetInnerHTML={{__html: view}}/>
            }
        </div>
    )
}