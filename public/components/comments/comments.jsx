import React, { useEffect, useState } from "react";
import { fetch_comments } from "../../api_requests.jsx";
import useInfiniteScroll from "../courses/infinite_scroll_hook.jsx";
import CommentElem from "./comment_elem.jsx";
import { useParams } from "react-router-dom";


export default function Comments(props) {
    const {article_id} = useParams();

    const get_scroll_limit = function() {
        let selector = '#comments' + (props.reply_to!==null ? `${props.reply_to}` : '');
        let elem = document.querySelector(selector);
        return elem.getBoundingClientRect().top + window.scrollY + elem.offsetHeight;
    }

    const [comments, scrollHandler] = useInfiniteScroll(
        (context, offset, limit)=>fetch_comments(context, article_id, props.reply_to, offset, limit),
        get_scroll_limit
    );

    useEffect(() => {
        document.addEventListener('scroll', scrollHandler);
        return () => {
            document.removeEventListener('scroll', scrollHandler);
        }
    }, [scrollHandler]);


    const comment_list = comments.map((comment) =>
        <CommentElem key={comment.id} comment={comment} />
    );

    return (
        <div id={'comments' + (props.reply_to!==null ? `${props.reply_to}` : '')}>
            <ul>{comment_list}</ul>
        </div>
    );
}