import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { fetch_save_content } from '../../api_requests.jsx';
import { TokenContext } from '../app.jsx';

export default function EditContent(props) {
    const context = useContext(TokenContext);

    const {article_id} = useParams();

    const handleSubmit = async function(event) {
        event.preventDefault();

        let article = await fetch_save_content(context, article_id, props.content);
        if (article) {
            props.setArticleData(article);
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <textarea value={props.content} onChange={(event)=>{props.setContent(event.target.value)}}/>
                <input type="submit" value="Сохранить изменения"/>
            </form>
        </div>
    )
}