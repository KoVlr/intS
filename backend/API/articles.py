from fastapi import APIRouter, Depends, HTTPException, Security, UploadFile, Body
from sqlalchemy.orm import Session
from datetime import datetime
from os import makedirs
import uuid
import shutil

from .auth import get_current_user
from ..database import get_db
from .. import schemes
from .. import crud

articles_router = APIRouter(
    prefix="/api/articles",
    tags=["articles"]
)


@articles_router.post("/new", response_model=schemes.ArticleGet)
def create_new_article(
        new_article: schemes.ArticleNew,
        db: Session = Depends(get_db),
        user = Security(get_current_user, scopes=['author'])
    ):
    # Check that this course exists
    # Check that this course belongs to this author
    # Check that an article with the same name is not yet in this course

    course = crud.get_course(db, new_article.course_id)

    if course is None:
        raise HTTPException(status_code=400, detail="This course does not exist")
    
    if course.author_id != user.author[0].id:
        raise HTTPException(status_code=400, detail="Not enough permissions")

    existing_article = crud.get_article_by_name(db, new_article.name, new_article.course_id)
    if existing_article:
        raise HTTPException(status_code=400, detail="Article with the same name already exists in this course")
    
    filename = str(uuid.uuid4()) + '.md'
    dirpath = 'storage/articles/' + filename[:2] + '/' + filename[2:4] + '/'
    filepath = dirpath + filename

    article = schemes.ArticleCreate(
        **new_article.dict(),
        file = filepath,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    makedirs(dirpath, exist_ok=True)
    with open(filepath, 'w'):
        pass

    return crud.create_article(db, article)


@articles_router.get("/{article_id}", response_model=schemes.ArticleGet)
def get_article(article_id: int, db: Session = Depends(get_db)):
    # Check that this article exists
    # Check that this article belongs to this author

    return crud.get_article(db, article_id)


@articles_router.post("/{article_id}/name", response_model=schemes.ArticleGet)
def change_article_name(article_id: int, new_name: str, db: Session = Depends(get_db)):
    # Check that this article exists
    # Check that this article belongs to this author
    # Check that an article with the same name is not yet in this course

    article_data = schemes.ArticleUpdateName(
        updated_at=datetime.utcnow(),
        name=new_name
    )
    return crud.update_article(db, article_id, article_data)


@articles_router.post("/{article_id}/publish", response_model=schemes.ArticleGet)
def publish_article(article_id: int, db: Session = Depends(get_db)):
    # Check that this article exists
    # Check that this article belongs to this author

    db_article = crud.get_article(db, article_id)

    article_data = schemes.ArticleUpdatePublished(
        updated_at=datetime.utcnow(),
        is_published=True,
        published_at=datetime.utcnow(),
        position_in_course=crud.get_published_articles_count(db, db_article.course_id)
    )
    
    return crud.update_article(db, article_id, article_data)


@articles_router.get("/{article_id}/content")
def get_article_content(article_id: int, db: Session = Depends(get_db)):
    # Check that this article exists
    # Check that this article belongs to this author

    article = crud.get_article(db, article_id)
    
    with open('./' + article.file, 'r') as article_file:
        content = article_file.read()
    return content


@articles_router.post("/{article_id}/content", response_model=schemes.ArticleGet)
def change_article_content(article_id: int, content: str = Body(embed=True), db: Session = Depends(get_db)):
    # Check that this article exists
    # Check that this article belongs to this author

    article = crud.get_article(db, article_id)

    with open('./' + article.file, 'w') as article_file:
        article_file.write(content)

    article_data = schemes.ArticleUpdate(updated_at=datetime.utcnow())
    return crud.update_article(db, article_id, article_data)


@articles_router.get("/{article_id}/images", response_model=list[schemes.ImageGet])
def get_article_images(article_id: int, db: Session = Depends(get_db)):
    # Check that this article exists
    # Check that this article belongs to this author

    return crud.get_article_images(db, article_id)


@articles_router.post("/{article_id}/images", response_model=schemes.UploadImagesResponse)
def upload_article_images(article_id: int, files: list[UploadFile], db: Session = Depends(get_db)):
    # Check that this article exists
    # Check that this article belongs to this author
    # Check that the received files are an image
    # Check the uniqueness of the image names

    uploaded_images = []

    for file in files:
        filename = str(uuid.uuid4()) + '.' + file.filename.split('.')[-1]
        dirpath = 'storage/images/' + filename[:2] + '/' + filename[2:4] + '/'
        filepath = dirpath + filename

        image_data = schemes.ImageCreate(
            article_id = article_id,
            file = filepath,
            original_name = file.filename
        )
        
        makedirs(dirpath, exist_ok=True)
        with open(filepath, 'wb') as fdst:
            shutil.copyfileobj(file.file, fdst)

        db_image = crud.create_image(db, image_data)
        uploaded_images += [db_image]

    article_data = schemes.ArticleUpdate(updated_at=datetime.utcnow())
    db_article = crud.update_article(db, article_id, article_data)
    #return schemes.UploadImagesResponse(article=db_article, uploaded_images=uploaded_images)
    return {'article': db_article, 'uploaded_images': uploaded_images}