import React, { useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { fetch_delete_image, fetch_upload_images } from '../../api_requests.jsx';
import { TokenContext } from '../app.jsx';

export default function EditImages(props) {
    const context = useContext(TokenContext);

    const {article_id} = useParams();

    const file_input = useRef(null);
    
    const handleSubmit = async function(event) {
        event.preventDefault();

        let {article, uploaded_images} = await fetch_upload_images(context, article_id, file_input.current.files);
        file_input.current.value = "";
        props.setImages(images => [...images, ...uploaded_images]);
        props.setArticleData(article);
    }

    const image_list = props.images.map((image) =>
        <li className='img_elem' key={image.id}>
            <span>{image.original_name}</span>

            <img src={`/api/articles/images/${image.id}`} alt={image.original_name} width="200" height="200" />

            <button onClick={async () => {
                let article = await fetch_delete_image(context, image.id);
                if (article) {
                    props.setImages(images => images.filter(img => img.id != image.id));
                    props.setArticleData(article);
                }
            }}>
                Удалить
            </button>
        </li>
    );

    return (
        <div>
            <div>
                <form onSubmit={handleSubmit}>
                    <label>
                        <span className='course_label'>Загрузить изображения:</span>
                        <br/>
                        <br/>
                        <input type="file" ref={file_input} multiple/>
                    </label>
                    <input type="submit" value="Отправить"/>
                </form>
            </div>

            <br />
            <br />

            <div className='course_label'>Загруженные изображения:</div>

            <div>
                {image_list
                    ? <ul>{image_list}</ul>
                    : "loading..."
                }
            </div>
        </div>
    )
}