import React, { useContext, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { TokenContext } from '../app.jsx';
import { fetch_create_article } from '../../api_requests.jsx';

export default function EditDrafts(props) {
    const context = useContext(TokenContext);

    const [new_article_mode, setNewArticleMode] = useState(false);
    const [new_article_name, setNewArticleName] = useState('');

    const {course_id} = useParams();

    const navigate = useNavigate();


    const create_article = async function(event) {
        event.preventDefault();

        let article = await fetch_create_article(context, new_article_name, course_id);
        if (article) {
            navigate(`/courses/${course_id}/articles/${article.id}/edit`);
        }
    }


    const article_list = props.drafts.map((article) =>
        <li key={article.id}>
            <Link className='first_word' to={`/courses/${course_id}/articles/${article.id}`}>
                {article.name}
            </Link>
            <Link to={`/courses/${course_id}/articles/${article.id}/edit`}>
                Редактировать
            </Link>
        </li>
    );

    return (
        <div>
            {new_article_mode
                ?<form onSubmit={create_article}>
                    Название новой статьи: 
                    <input type="text" value={new_article_name} onChange={(event)=>{
                            setNewArticleName(event.target.value);
                        }}/>
                    <input type="submit" value="Создать"/>
                </form>

                :<button onClick={()=>setNewArticleMode(true)}>Создать новую статью</button>
            }
            <ol>{article_list}</ol>
        </div>
    )
}