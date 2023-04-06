import React, { useContext } from 'react';
import { useParams, Link } from "react-router-dom";
import { TokenContext } from '../app.jsx';

export default function EditPublished(props) {
    const context = useContext(TokenContext);

    const {course_id} = useParams();

    const article_list = props.articles.map((article) =>
        <li key={article.id}>
            <Link to={`/courses/${course_id}/articles/${article.id}`}>
                {article.name}
            </Link>
            <Link to={`/courses/${course_id}/articles/${article.id}/edit`}>
                Редактировать
            </Link>
        </li>
    );

    return (
        <div>
            <ul>{article_list}</ul>
        </div>
    )
}