import React, { useEffect, useState, useContext } from 'react';
import { Outlet, useParams, NavLink } from 'react-router-dom';
import { fetch_article, fetch_change_article_name, fetch_publish_article } from '../../../api_requests.jsx';
import { TokenContext } from '../../app.jsx';

export default function ArticleEditor() {
    const context = useContext(TokenContext);

    const [article_data, setArticleData] = useState(null);
    const [name_edit_mode, setNameEditMode] = useState(false);

    const {article_id} = useParams();

    useEffect(() => {
        const effect = async function() {
            let article_data = await fetch_article(context, article_id);
            if (article_data) {
                setArticleData(article_data);
            }
        };
        effect();
    }, [context])

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
                    <li><NavLink to={`/courses/:course_id/articles/${article_id}/edit/content`}>Редактор</NavLink></li>
                    <li><NavLink to={`/courses/:course_id/articles/${article_id}/edit/images`}>Загрузка изображений</NavLink></li>
                </ul>
            </nav>

            <Outlet context={setArticleData}/>
        </div>
    )
}