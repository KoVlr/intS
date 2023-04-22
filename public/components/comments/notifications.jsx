import React, { useEffect, useState, useContext } from "react";
import { fetch_direct_comments, fetch_direct_count } from "../../api_requests.jsx";
import { TokenContext } from '../app.jsx';
import useInfiniteScroll from "../courses/infinite_scroll_hook.jsx";
import DirectElem from "./direct_elem.jsx";


export default function Notifications() {
    const context = useContext(TokenContext);

    const [comments, setComments, scrollHandler, activateLoad] = useInfiniteScroll(fetch_direct_comments);

    const [count, setCount] = useState('-');
    const [display, setDisplay] = useState(false);

    useEffect(() => {
        const getCount = async function() {
            let count = await fetch_direct_count(context);
            if (count) {
                setCount(count);
            }
        }
        getCount();
    }, []);


    const comment_list = comments.map((comment, i) =>
        <DirectElem key={comment.id} comment={comment} handleClick={() => {
            setDisplay(false);
            setComments(comments => [...comments.slice(0,i), ...comments.slice(i+1)]);
            setCount(count => count-1);
        }}/>
    );

    return (
        <div>
            <button onClick={()=>setDisplay((display)=>!display)}>{`Уведомления | ${count}`}</button>
            {display &&
                <ul style={{height: 310, overflow: 'auto'}} onScroll={scrollHandler}>{comment_list}</ul>
            }
        </div>
    );
}