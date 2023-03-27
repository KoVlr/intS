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
                    let chunk_items = await fetch_items(context, download_count.current, chunk_size);
                    if (chunk_items) {
                        download_count.current += chunk_items.length;

                        let saved_items = [...items, ...new_items];

                        for_chunk_items: for (let chunk_item of chunk_items) {
                            for (let item of saved_items) {
                                if (chunk_item.id == item.id) {
                                    console.log(item.id);
                                    continue for_chunk_items;
                                }
                            }
                            new_items.push(chunk_item);
                        }
                        
                        //if all data is loaded
                        if (chunk_items.length < chunk_size) {
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
    }, [listenScroll])


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