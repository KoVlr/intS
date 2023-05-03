import React from "react";
import { Link } from "react-router-dom";

export default function CourseElem(props) {

    return (
        <li>
            <div>
                <Link to={`/courses/${props.course.id}`}>{props.course.name}</Link><br/>
                Автор: {props.course.author}<br/>
                <p>{props.course.description}</p>
                {props.course.is_public
                    ?"Общедоступный курс"
                    :"Закрытый курс"
                }
            </div>
        </li>
    );
}