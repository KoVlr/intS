import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import {
    fetch_article,
    fetch_change_article_name,
    fetch_publish_article,
    fetch_article_content,
    fetch_article_images
} from '../../api_requests.jsx';
import { TokenContext } from '../app.jsx';
import EditContent from './edit_content.jsx'
import EditImages from './edit_images.jsx'

export default function ArticleEditor() {
    const context = useContext(TokenContext);

    const [article_data, setArticleData] = useState(null);
    const [name_edit_mode, setNameEditMode] = useState(false);
    const [editor_type, setEditorType] = useState('content');
    const [content, setContent] = useState("");
    const [images, setImages] = useState([]);

    const {article_id} = useParams();

    useEffect(() => {
        const get_data = async function() {
            let article_data = await fetch_article(context, article_id);
            if (article_data) {
                setArticleData(article_data);
            }

            let content = await fetch_article_content(context, article_id);
            if (content) {
                setContent(content);
            }

            let images = await fetch_article_images(context, article_id);
            if (images) {
                setImages(images);
            }
        };
        get_data();
    }, [context.token===null])

    const handleNameChange = function() {
        setNameEditMode(true);
    }

    const handleSubmitName = async function(event) {
        event.preventDefault();
        
        let article = await fetch_change_article_name(context, article_id, article_data.name);
        if (article) {
            setArticleData(article);
            setNameEditMode(false);
        }
    }

    const handlePublish = async function() {
        let article = await fetch_publish_article(context, article_id);
        if(article) {
            setArticleData(article);
        }
    }

    const getDate = function(strdate) {
        let utcdate = new Date(strdate);
        return new Date(utcdate.getTime() - utcdate.getTimezoneOffset() * 60000);
    }

    return (
        <div>
            {article_data &&
                <>
                    {name_edit_mode
                        ?<form onSubmit={handleSubmitName}>
                            <input type="text" value={article_data.name} onChange={(event)=>{
                                    setArticleData(article_data=>({...article_data, name: event.target.value}));
                                }}/>
                            <input type="submit" value="Сохранить"/>
                        </form>
        
                        :<div>
                            <h2>{article_data.name}</h2>
                            <button onClick={handleNameChange}>Редактировать</button>
                        </div>
                    }
                    
                    <div>{getDate(article_data.updated_at).toString()}</div>

                    {!article_data.is_published &&
                        <button onClick={handlePublish}>Опубликовать</button>
                    }
                </>
            }

            <nav>
                <ul>
                    <li><button onClick={() => setEditorType('content')}>Редактор</button></li>
                    <li><button onClick={() => setEditorType('images')}>Загрузка изображений</button></li>
                </ul>
            </nav>

            {editor_type=='content' &&
                <EditContent content={content} setContent={setContent} setArticleData={setArticleData}/>
            }

            {editor_type=='images' &&
                <EditImages images={images} setImages={setImages} setArticleData={setArticleData}/>
            }

        </div>
    )
}