import React, { useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetch_get_access} from "../../api_requests.jsx";
import { TokenContext } from "../app.jsx";

export default function CourseAccess() {
    const context = useContext(TokenContext);

    const navigate = useNavigate();

    let {course_id, access_code} = useParams();

    useEffect(() => {
        const get_access = async function() {
            let res = await fetch_get_access(context, course_id, access_code);
            if (res) {
                navigate(`/courses/${course_id}`);
            }
        }
        get_access();
    }, []);

    return (
        <>
            Loading...
        </>
    )
}