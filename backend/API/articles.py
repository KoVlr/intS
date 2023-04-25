from fastapi import APIRouter, Depends, HTTPException, Security, UploadFile, Body
from sqlalchemy.orm import Session
from datetime import datetime
from os import makedirs
from markdown import markdown
import uuid
import shutil
import re


from .auth import get_current_user, get_authenticated_user
from .courses import check_own_course, check_available_course
from ..database import get_db
from .. import schemes
from .. import crud

articles_router = APIRouter(
    prefix="/api/articles",
    tags=["Articles"]
)


def get_own_article(
        article_id: int,
        user = Security(get_authenticated_user, scopes=['author']),
        db: Session = Depends(get_db)
    ):
    db_article = crud.get_article(db, article_id)
    if db_article is None:
        raise HTTPException(status_code=400, detail="This article does not exist")
    
    check_own_course(db_article.course, user)
    return db_article


def get_available_article(
        article_id: int,
        user = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
    db_article = crud.get_article(db, article_id)
    if db_article is None:
        raise HTTPException(status_code=400, detail="This article does not exist")
    
    check_available_course(db_article.course, user, db)
    return db_article



@articles_router.post("", response_model=schemes.ArticleGet)
def create_new_article(
        new_article: schemes.ArticleNew,
        user = Security(get_authenticated_user, scopes=['author']),
        db: Session = Depends(get_db)
    ):

    course = crud.get_course(db, new_article.course_id)

    if course is None:
        raise HTTPException(status_code=400, detail="This course does not exist")
    
    if course.author_id != user.author.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")

    article = schemes.ArticleCreate(
        **new_article.dict(),
        content = '',
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    return crud.create_article(db, article)


@articles_router.get("/{article_id}", response_model=schemes.ArticleGet)
def get_article(article = Depends(get_own_article)):
    return article


@articles_router.patch("/{article_id}", response_model=schemes.ArticleGet)
def change_article(
        update_data: schemes.ArticlePatch,
        article = Depends(get_own_article),
        db: Session = Depends(get_db)
    ):

    actual_update_data = update_data.dict(exclude_unset=True)

    updated_article = schemes.ArticleUpdate(**actual_update_data, updated_at=datetime.utcnow())

    if 'name' in actual_update_data and article.name != updated_article.name:
        existing_article = crud.get_article_by_name(db, updated_article.name, article.course_id)
        if existing_article:
            raise HTTPException(status_code=400, detail="Article with the same name already exists in this course")
    
    if 'is_published' in actual_update_data:
        if updated_article.is_published == False:
            raise HTTPException(status_code=400, detail="Cancellation of article publication is not supported")
        if article.is_published:
            raise HTTPException(status_code=400, detail="This article has already been published")
        updated_article.published_at = updated_article.updated_at
        updated_article.position_in_course = crud.get_published_articles_count(db, article.course_id)

    return crud.update_article(db, article.id, updated_article)


@articles_router.get("/{article_id}/content")
def get_article_content(article = Depends(get_own_article)):
    return article.content


@articles_router.post("/{article_id}/content", response_model=schemes.ArticleGet)
def change_article_content(article = Depends(get_own_article), content: str = Body(embed=True), db: Session = Depends(get_db)):
    article_data = schemes.ArticleUpdate(content=content, updated_at=datetime.utcnow())
    return crud.update_article(db, article.id, article_data)


@articles_router.get("/{article_id}/images", response_model=list[schemes.ImageGet])
def get_article_images(article = Depends(get_own_article), db: Session = Depends(get_db)):

    return crud.get_article_images(db, article.id)


@articles_router.post("/{article_id}/images", response_model=schemes.UploadImagesResponse)
def upload_article_images(files: list[UploadFile], article = Depends(get_own_article), db: Session = Depends(get_db)):
    
    uploaded_images = []
    existing_images = crud.get_article_images(db, article.id)

    for file in files:
        if file.content_type.split('/')[0] != 'image':
            raise HTTPException(status_code=400, detail='Uploaded files must be images')
        
        for image in existing_images:
            if image.original_name == file.filename:
                raise HTTPException(status_code=400, detail="Image with the same name already exists in this article")

        filename = str(uuid.uuid4()) + '.' + file.filename.split('.')[-1]
        dirpath = 'storage/images/' + filename[:2] + '/' + filename[2:4] + '/'
        filepath = dirpath + filename

        image_data = schemes.ImageCreate(
            article_id = article.id,
            file = filepath,
            original_name = file.filename
        )
        
        makedirs(dirpath, exist_ok=True)
        with open(filepath, 'wb') as fdst:
            shutil.copyfileobj(file.file, fdst)

        db_image = crud.create_image(db, image_data)
        uploaded_images += [db_image]

    article_data = schemes.ArticleUpdate(updated_at=datetime.utcnow())
    db_article = crud.update_article(db, article.id, article_data)
    return {'article': db_article, 'uploaded_images': uploaded_images}


@articles_router.get("/{article_id}/view")
def get_article_view(db_article = Depends(get_available_article)):
    html = markdown(db_article.content, extensions=['extra'])

    def img_repl(match):
        img_name = match.group(1)
        for image in db_article.images:
            if image.original_name == img_name:
                return match.group(0).replace(img_name, f'/api/images/{image.id}')
        return match.group(0)

    html = re.sub(r'<img[^>]+?src\s*=\s*"(.+?)"', img_repl, html)

    return {'html': html}