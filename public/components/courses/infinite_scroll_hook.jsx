import { useContext, useEffect, useRef, useState } from "react";
import { TokenContext } from "../app.jsx";


export default function useInfiniteScroll(fetch_items) {
    const context = useContext(TokenContext);

    const [items, setCourses] = useState([]);
    const [listenScroll, setListenScroll] = useState(false);

    const download_count = useRef(0);

    useEffect(() => {
        if (!listenScroll) {
            const get_items = async function() {
                let chunk_size = 20;
                let new_items = [];

                //Loading data until there are chunk_size new unique elements or until all data is loaded.
                while (new_items.length < chunk_size) {
                    let downloaded_items = await fetch_items(context, download_count.current, chunk_size);
                    if (downloaded_items) {
                        download_count.current += downloaded_items.length;

                        for_downloaded_items: for (let downloaded_item of downloaded_items) {
                            for (let item of items) {
                                if (downloaded_item.id == item.id) continue for_downloaded_items;
                            }
                            new_items.push(downloaded_item);
                        }
                        
                        //if all data is loaded
                        if (downloaded_items.length < chunk_size) {
                            setCourses(items => [...items, ...new_items]);
                            //value of listenScroll remains equal to false
                            return;
                        }
                    } else {
                        setCourses(items => [...items, ...new_items]);
                        if (items.length >= chunk_size) setListenScroll(true);
                        return;
                    }
                }
                
                setCourses(items => [...items, ...new_items]);
                setListenScroll(true);
            }

            get_items();
        }
    }, [listenScroll, context.token===null])


    const scrollHandler = async function(event) {
        if (listenScroll) {
            let margin = 500;
            if (event.target.scrollHeight - (event.target.scrollTop + event.target.clientHeight) < margin) {
                setListenScroll(false);
            }
        }
    }

    return [items, scrollHandler];
}