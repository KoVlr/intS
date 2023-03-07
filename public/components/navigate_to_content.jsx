import React from "react";
import { Navigate, useParams } from "react-router-dom";

export default function NavigateToContent() {
    const {course_id, article_id} = useParams();

    return (
        <Navigate to={`/courses/${course_id}/articles/${article_id}/edit/content`} />
    )
}