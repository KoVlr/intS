import React from "react";
import { Link } from "react-router-dom";

export default function MyCourseElem(props) {

    return (
        <li>
            <div style={{height: 100}}>
                <Link to={`/courses/${props.course.id}`}>{props.course.name}</Link>
            </div>
        </li>
    );
}