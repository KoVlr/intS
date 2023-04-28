import React, { useContext } from "react";
import { fetch_clear_history, fetch_history } from "../../api_requests.jsx";
import useInfiniteScroll from "../courses/infinite_scroll_hook.jsx";
import HistoryElem from "./history_elem.jsx";
import { TokenContext } from '../app.jsx';


export default function ArticleHistory() {
    const context = useContext(TokenContext);

    const [articles, setArticles, scrollHandler, activateLoad] = useInfiniteScroll(fetch_history);


    const handleClear = async function() {
        let res = await fetch_clear_history(context);
        if (res) {
            setArticles([]);
        }
    }
    

    const article_list = articles.map((article, i) =>
        <HistoryElem key={article.id} article={article} handleDelete={() => {
            setArticles(articles => [...articles.slice(0,i), ...articles.slice(i+1)]);
        }}/>
    );

    return (
        <div>
            <button onClick={handleClear}>Очистить все</button>
            <ul style={{height: 310, overflow: 'auto'}} onScroll={scrollHandler}>{article_list}</ul>
        </div>
    );
}