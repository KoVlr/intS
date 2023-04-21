import React, { useEffect, useState } from "react";
import { fetch_comments } from "../../api_requests.jsx";
import useInfiniteScroll from "../courses/infinite_scroll_hook.jsx";
import CommentElem from "./comment_elem.jsx";
import { useParams } from "react-router-dom";


export default function Comments(props) {
    const {article_id} = useParams();

    const get_scroll_limit = function() {
        let selector = '#comments' + (props.parent!=null ? `${props.parent.id}` : '');
        let elem = document.querySelector(selector);
        return elem.getBoundingClientRect().top + window.scrollY + elem.offsetHeight;
    }

    
    const [comments, setComments, scrollHandler] = useInfiniteScroll(
        (context, offset, limit)=>fetch_comments(context, article_id, props.parent?.id, offset, limit),
        get_scroll_limit
    );


    useEffect(() => {
        if(props.display) {
            document.addEventListener('scroll', scrollHandler);
        }
        return () => {
            document.removeEventListener('scroll', scrollHandler);
        }
    }, [scrollHandler]);


    useEffect(() => {
        if (props.new_comment != null) {
            if (props.parent != null) {
                if ( props.parent.replies_count == comments.length + 1 && props.parent.replies_count != 1) {
                    setComments(comments => ([...comments, props.new_comment]));
                }
            } else {
                setComments(comments => ([props.new_comment, ...comments]));
            }
        }
    }, [props.new_comment?.id])


    const comment_list = comments.map((comment, i) =>
        <CommentElem key={comment.id}
            comment={comment}
            setComment={comment => (setComments([...Array.from(comments).slice(0,i), comment, ...Array.from(comments).slice(i+1)]))}
        />
    );

    return (
        <div id={'comments' + (props.parent!=null ? `${props.parent.id}` : '')}>
            <ul>{comment_list}</ul>
        </div>
    );
}