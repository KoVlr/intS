import React from "react";
import { Link } from "react-router-dom";

export default function SearchElem(props) {
    return (
        <li className="list_elem">
            {props.data.article==null
                ? <Link className="elem_head" to={`/courses/${props.data.id}`}>{props.data.name}</Link>
                : <Link className="elem_head" to={`/courses/${props.data.id}/articles/${props.data.article.id}`}>
                    {props.data.article.name}
                </Link>
            }

            <hr/>

            {props.data.article!=null &&
                <span>
                    <span className="elem_label">Курс: </span>
                    <Link to={`/courses/${props.data.id}`}>{props.data.name}</Link>
                </span>
            }

            <span>
                <span className="elem_label">Автор: </span>
                <span className="author">{props.data.author}</span>
            </span>
        </li>
    );
}