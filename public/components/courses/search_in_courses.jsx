import React from "react";
import { fetch_search_in_courses } from "../../api_requests.jsx";
import useInfiniteScroll from "./infinite_scroll_hook.jsx";
import SearchElem from "./search_elem.jsx";


export default function SearchInCourses(props) {
    const [search_result, setSearchResult, scrollHandler, activateLoad] = useInfiniteScroll(
        (context, offset, limit) => fetch_search_in_courses(context, props.query, offset, limit, props?.mine, props?.collection)
    );

    const result_list = search_result.map((elem) =>
        <SearchElem key={`${elem.id}_`+ (elem.article != null ? `${elem.article.id}` : '')} data={elem} />
    );

    return (
        <div>
            <ul style={{height: 310, overflow: 'auto'}} onScroll={scrollHandler}>{result_list}</ul>
        </div>
    );
}