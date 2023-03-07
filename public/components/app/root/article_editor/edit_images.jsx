import React, { useEffect, useState, useContext, useRef } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { fetch_article_images, fetch_delete_image, fetch_upload_images } from '../../../../api_requests.jsx';
import { TokenContext } from '../../../app.jsx';

export default function EditImages() {
    const context = useContext(TokenContext);

    const [images, setImages] = useState(null);

    const {article_id} = useParams();

    const file_input = useRef(null);

    const setArticleData = useOutletContext();

    useEffect(() => {
        const get_images = async function() {
            let images = await fetch_article_images(context, article_id);
            if (images) {
                setImages(images);
            }
        };
        get_images();
    }, [context]);
    
    const handleSubmit = async function(event) {
        event.preventDefault();

        let {article, uploaded_images} = await fetch_upload_images(context, article_id, file_input.current.files);
        file_input.current.value = "";
        setImages(images => [...images, ...uploaded_images]);
        setArticleData(article);
    }

    const image_list = images ?
        images.map((image) =>
            <li key={image.id}>
                {image.original_name}
                <img src={`/api/images/${image.id}`} alt={image.original_name} width="100" height="100" />
                <button onClick={async () => {
                    let article = await fetch_delete_image(context, image.id);
                    if (article) {
                        setImages(images => images.filter(img => img.id != image.id));
                        setArticleData(article);
                    }
                }}>
                    Удалить
                </button>
            </li>
        ) : null;

    return (
        <div>
            <div>
                {image_list
                    ? <ul>{image_list}</ul>
                    : "loading..."
                }
            </div>
            <div>
                <form onSubmit={handleSubmit}>
                    <label>
                        Загрузить изображения
                        <input type="file" ref={file_input} multiple/>
                    </label>
                    <input type="submit" value="Отправить"/>
                </form>
            </div>
        </div>
    )
}