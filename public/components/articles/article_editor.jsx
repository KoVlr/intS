import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    fetch_article,
    fetch_change_article_name,
    fetch_publish_article,
    fetch_article_content,
    fetch_article_images,
    fetch_delete_article
} from '../../api_requests.jsx';
import { TokenContext } from '../app.jsx';
import EditContent from './edit_content.jsx'
import EditImages from './edit_images.jsx'
import { get_str_local_date } from '../../local_date.js';


export default function ArticleEditor() {
    const context = useContext(TokenContext);

    const [article_data, setArticleData] = useState(null);
    const [name_edit_mode, setNameEditMode] = useState(false);
    const [editor_type, setEditorType] = useState('content');
    const [content, setContent] = useState("");
    const [images, setImages] = useState([]);

    const navigate = useNavigate();

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
    }, [])

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

    const deleteHandle = async function() {
        let course = await fetch_delete_article(context, article_id);
        if (course) {
            navigate(`/courses/${course.course_data.id}`);
        }
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
                    
                    <div>{get_str_local_date(article_data.updated_at)}</div>

                    {!article_data.is_published &&
                        <button onClick={handlePublish}>Опубликовать</button>
                    }
                </>
            }

            <div><button onClick={deleteHandle}>Удалить статью</button></div>

            <nav>
                <ul>
                    <li><a
                        className={editor_type=='content' ? 'active' : 'inactive'}
                        onClick={() => setEditorType('content')}
                    >
                        Редактор
                    </a></li>
                    
                    <li><a
                        className={editor_type=='images' ? 'active' : 'inactive'}
                        onClick={() => setEditorType('images')}
                    >
                        Загрузка изображений
                    </a></li>
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