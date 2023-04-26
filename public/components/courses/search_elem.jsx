import React from "react";
import { Link } from "react-router-dom";

export default function SearchElem(props) {

    return (
        <li>
            <div>
                <p><Link to={`/courses/${props.data.id}`}>{props.data.name}</Link></p>
                <p>Автор: {props.data.author}</p>
                {props.data.article!=null &&
                    <p>
                        <Link to={`/courses/${props.data.id}/articles/${props.data.article.id}`}>
                            {props.data.article.name}
                        </Link>
                    </p>
                }
            </div>
        </li>
    );
}