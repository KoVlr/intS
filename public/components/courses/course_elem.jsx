import React from "react";
import { Link } from "react-router-dom";

export default function CourseElem(props) {

    return (
        <li className="list_elem">
            <Link className="elem_head" to={`/courses/${props.course.id}`}>{props.course.name}</Link>

            <hr/>

            {!props?.hide_author &&
                <span>
                    <span className="elem_label">Автор: </span>
                    <span className="author">{props.course.author}</span>
                </span>
            }

            <span className="elem_descr">{props.course.description}</span>
            
            {!props.course.is_public &&
                <span className="elem_label">(Закрытый курс)</span>
            }
        </li>
    );
}