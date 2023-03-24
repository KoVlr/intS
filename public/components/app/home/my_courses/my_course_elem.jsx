import React from "react";
import { Link } from "react-router-dom";

export default function MyCourseElem(props) {

    return (
        <div>
            <div>
                <Link to={`/courses/${props.course.id}`}>{props.course.name}</Link>
            </div>
        </div>
    );
}