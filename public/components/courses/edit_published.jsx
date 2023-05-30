import React, { useState, useRef, useEffect, useLayoutEffect, useContext } from 'react';
import { useParams, Link } from "react-router-dom";
import { fetch_change_course } from "../../api_requests.jsx";
import { TokenContext } from "../app.jsx";


export default function EditPublished(props) {
    const context = useContext(TokenContext);

    const [top, setTop] = useState(0);
    const [drag_item, setDragItem] = useState(null);

    const initial_mouse_top = useRef(null);
    const initial_elem_top = useRef(null);
    const upper_limit = useRef(null);
    const lower_limit = useRef(null);

    const articles_order = props.articles.map(elem => (elem.id));

    const {course_id} = useParams();

    
    const get_limits = function(target_elem) {
        let upper_limit = null;
        let lower_limit = null;

        for(let i = 0; i < props.articles.length; i++) {
            if (props.articles[i].id == target_elem.dataset.article_id) {
                if (i != 0) {
                    let upper_elem = document.querySelector(`li[data-article_id="${props.articles[i-1].id}"]`);
                    upper_limit = Math.floor(target_elem.offsetTop - top - upper_elem.offsetTop)/2;
                }

                if (i != props.articles.length-1) {
                    let lower_elem = document.querySelector(`li[data-article_id="${props.articles[i+1].id}"]`);
                    lower_limit = Math.floor(lower_elem.offsetTop - (target_elem.offsetTop - top))/2;
                }

                break;
            }
        }

        return [upper_limit, lower_limit];
    }


    useLayoutEffect(()=>{
        if(drag_item!==null) {
            let target_elem = document.querySelector(`li[data-article_id="${drag_item}"]`);
            let diff = target_elem.offsetTop - top - initial_elem_top.current;

            initial_mouse_top.current = initial_mouse_top.current + diff;
            [upper_limit.current, lower_limit.current] = get_limits(target_elem);
            initial_elem_top.current = target_elem.offsetTop - top;

            setTop(top=>(top - diff));
        }
    }, articles_order);


    const handle_mouse_move = function(event) {
        if (drag_item) {
            if (upper_limit.current !== null && top < -upper_limit.current) {
                for(let i = 1; i < props.articles.length; i++) {
                    if (props.articles[i].id == drag_item) {
                        [props.articles[i], props.articles[i-1]] = [props.articles[i-1], props.articles[i]];

                        props.setArticles(props.articles);

                        return;
                    }
                }
            }

            if (lower_limit.current !== null &&  top > lower_limit.current) {
                for(let i = 0; i < props.articles.length - 1; i++) {
                    if (props.articles[i].id == drag_item) {
                        [props.articles[i], props.articles[i+1]] = [props.articles[i+1], props.articles[i]];
                        
                        props.setArticles(props.articles);

                        return;
                    }
                }
            }

            let new_top = event.pageY - initial_mouse_top.current;
            if ((drag_item == props.articles[0].id && new_top < 0) ||
                (drag_item == props.articles[props.articles.length - 1].id && new_top > 0)) {
                    new_top = 0;
                }
            setTop(new_top);
        }
    }

    const handle_mouse_up = async function(event) {
        setDragItem(null);
        setTop(0);

        document.removeEventListener('mousemove', handle_mouse_move);
        document.removeEventListener('mouseup', handle_mouse_up);

        let success = await fetch_change_course(context, course_id, {articles_order: articles_order});
    }


    useEffect(() => {
        if(drag_item !== null) {
            document.addEventListener('mousemove', handle_mouse_move);
            document.addEventListener('mouseup', handle_mouse_up);
        }
        return () => {
            document.removeEventListener('mousemove', handle_mouse_move);
            document.removeEventListener('mouseup', handle_mouse_up);
        }
    }, [top, drag_item]);


    const handle_mouse_down = function(event) {
        event.preventDefault();

        let target = event.target;
        if (target.tagName != 'LI') return;

        initial_mouse_top.current = event.pageY;
        [upper_limit.current, lower_limit.current] = get_limits(target);
        initial_elem_top.current = target.offsetTop;
        
        setDragItem(target.dataset.article_id);
    }


    const getStyle = function(elem_id) {
        if (drag_item == elem_id) {
            return {position: 'relative', top: top}
        } else {
            return {};
        }
    }

    const article_list = props.articles.map((article) =>
        <li key={article.id} data-article_id={article.id} style={getStyle(article.id)} >
            <Link  className='first_word' to={`/courses/${course_id}/articles/${article.id}`}>
                {article.name}
            </Link>
            <Link to={`/courses/${course_id}/articles/${article.id}/edit`}>
                Редактировать
            </Link>
        </li>
    );

    return (
        <div>
            <ol onMouseDown={handle_mouse_down}>{article_list}</ol>
        </div>
    )
}