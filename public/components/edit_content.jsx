import React, { useEffect, useState, useContext } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { fetch_article_content, fetch_save_content } from '../api_requests.jsx';
import { TokenContext } from './app.jsx';

export default function EditContent() {
    const context = useContext(TokenContext);

    const [content, setContent] = useState("");

    const {article_id} = useParams();

    const setArticleData = useOutletContext();

    useEffect(() => {
        const get_content = async function() {
            let content = await fetch_article_content(context, article_id);
            if (content) {
                setContent(content);
            }
        };
        get_content();
    }, [context]);

    const handleSubmit = async function(event) {
        event.preventDefault();

        let article = await fetch_save_content(context, article_id, content);
        if (article) {
            setArticleData(article);
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <textarea value={content} onChange={(event)=>{setContent(event.target.value)}}/>
                <input type="submit" value="Сохранить изменения"/>
            </form>
        </div>
    )
}