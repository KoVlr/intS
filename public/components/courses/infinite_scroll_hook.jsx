import { useContext, useEffect, useRef, useState } from "react";
import { TokenContext } from "../app.jsx";


export default function useInfiniteScroll(fetch_items, get_scroll_limit, chunk_size = 20) {
    const context = useContext(TokenContext);

    const [items, setItems] = useState([]);
    const [listenScroll, setListenScroll] = useState(false);

    const download_count = useRef(0);

    useEffect(() => {
        if (!listenScroll) {
            const get_items = async function() {
                let new_items = [];

                //Loading data until there are chunk_size new unique elements or until all data is loaded.
                while (new_items.length < chunk_size) {
                    let chunk_items = await fetch_items(context, download_count.current, chunk_size);
                    if (chunk_items) {
                        download_count.current += chunk_items.length;

                        let saved_items = [...items, ...new_items];

                        for_chunk_items: for (let chunk_item of chunk_items) {
                            for (let item of saved_items) {
                                if (chunk_item.id == item.id) {
                                    continue for_chunk_items;
                                }
                            }
                            new_items.push(chunk_item);
                        }
                        
                        //if all data is loaded
                        if (chunk_items.length < chunk_size) {
                            setItems(items => [...items, ...new_items]);
                            //value of listenScroll remains equal to false
                            return;
                        }
                    } else {
                        setItems(items => [...items, ...new_items]);
                        if (items.length >= chunk_size) setListenScroll(true);
                        return;
                    }
                }
                
                setItems(items => [...items, ...new_items]);
                setListenScroll(true);
            }

            get_items();
        }
    }, [listenScroll])


    const scrollHandler = function(event) {
        if (listenScroll) {
            let margin = 500;
            let target = event.target == document ? document.documentElement : event.target;
            let scroll_limit = get_scroll_limit !== undefined ? get_scroll_limit() : target.scrollHeight;

            if (scroll_limit - (target.scrollTop + target.clientHeight) < margin) {
                setListenScroll(false);
            }
        }
    }


    const activateLoad = function() {
        if(listenScroll) {
            setListenScroll(false);
        }
    }


    return [items, setItems, scrollHandler, activateLoad];
}