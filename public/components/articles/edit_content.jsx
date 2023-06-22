import React, { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetch_editor_view, fetch_save_content, fetch_image } from '../../api_requests.jsx';
import { TokenContext } from '../app.jsx';
import hljs from 'highlight.js';

export default function EditContent(props) {
    const context = useContext(TokenContext);

    const [view, setView] = useState("");

    const {article_id} = useParams();

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
            <form id='article_form' onSubmit={handleSubmit}>
                <textarea value={props.content} onChange={(event)=>{props.setContent(event.target.value)}}/>
                <br/>
                <button onClick={get_view}>Посмотреть результат</button>
                <input type="submit" value="Сохранить изменения"/>
            </form>

            {view != "" &&
                <div id="article" dangerouslySetInnerHTML={{__html: view}}/>
            }
        </div>
    )
}