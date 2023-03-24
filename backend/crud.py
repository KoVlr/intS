from sqlalchemy.orm import Session
import uuid

from . import schemes
from . import db_models

def get_user(db: Session, email: str):
    return db.query(db_models.Users).filter(db_models.Users.email == email).first()


def get_scopes(db: Session, email: str):
    user = db.query(db_models.Users).filter(db_models.Users.email == email).first()
    scopes = []
    if user.author != []:
        scopes += ['author']
    return scopes


def create_user(db: Session, user: schemes.UserCreate):
    db_user = db_models.Users(
        username=user.username,
        email=user.email,
        hashed_password=user.password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user



def create_refresh_token(db: Session, refresh_token: schemes.RefreshToken):
    db_refresh_token = db_models.RefreshTokens(**refresh_token.dict())
    db.add(db_refresh_token)
    db.commit()
    db.refresh(db_refresh_token)
    return db_refresh_token


def get_refresh_token(db: Session, refresh_token: uuid.UUID):
    return db.query(db_models.RefreshTokens).filter(db_models.RefreshTokens.uuid == refresh_token).first()


def delete_refresh_token(db: Session, refresh_token: uuid.UUID):
    db_refresh_token = db.query(db_models.RefreshTokens).filter(db_models.RefreshTokens.uuid == refresh_token).first()
    if db_refresh_token:
        db.delete(db_refresh_token)
        db.commit()



def create_author(db: Session, author: schemes.AuthorCreate):
    db_author = db_models.Authors(user_id=author.user_id)
    db.add(db_author)
    db.commit()
    db.refresh(db_author)
    return db_author



def get_course(db: Session, id: int):
    return db.get(db_models.Courses, id)


def get_course_by_name(db: Session, name: str, author_id: int):
    return db.query(db_models.Courses)\
        .filter(db_models.Courses.name == name, db_models.Courses.author_id == author_id).first()


def create_course(db: Session, course: schemes.CourseCreate):
    db_course = db_models.Courses(**course.dict())
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course


def get_courses_list(db: Session, offset: int, limit: int):
    return db.query(db_models.Courses)\
        .order_by(db_models.Courses.is_public.desc())\
        .offset(offset).limit(limit).all()


def get_courses_by_author(db: Session, author_id: int, offset: int, limit: int):
    return db.query(db_models.Courses)\
        .filter(db_models.Courses.author_id == author_id)\
        .order_by(db_models.Courses.updated_at.desc())\
        .offset(offset).limit(limit).all()


def get_published_articles_count(db: Session, course_id: int):
    return db.query(db_models.Articles)\
        .filter(db_models.Articles.course_id == course_id,
                db_models.Articles.is_published == True).count()


def get_published_articles(db: Session, course_id: int):
    return db.query(db_models.Articles)\
        .filter(db_models.Articles.course_id == course_id,
                db_models.Articles.is_published == True)\
                    .order_by(db_models.Articles.position_in_course).all()


def get_article(db: Session, id: int):
    return db.get(db_models.Articles, id)


def update_article(
            db: Session,
            id: int,
            article_data: schemes.ArticleUpdate
        ):
    
    db_article = db.get(db_models.Articles, id)
    
    for attr in article_data.dict(exclude_unset=True):
        setattr(db_article, attr, getattr(article_data, attr))

    db.commit()
    return db_article


def get_article_by_name(db: Session, name: str, course_id: int):
    return db.query(db_models.Articles)\
        .filter(db_models.Articles.name == name, db_models.Articles.course_id == course_id).first()


def create_article(db: Session, article: schemes.ArticleCreate):
    db_article = db_models.Articles(**article.dict())
    db.add(db_article)
    db.commit()
    db.refresh(db_article)
    return db_article


def create_image(db: Session, image: schemes.ImageCreate):
    db_image = db_models.Images(**image.dict())
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    return db_image


def get_article_images(db: Session, article_id: int):
    return get_article(db, article_id).images


def get_image(db: Session, id: int):
    return db.get(db_models.Images, id)


def delete_image(db: Session, id: int):
    db_image = db.get(db_models.Images, id)
    if db_image:
        db.delete(db_image)
        db.commit()
        return True
    else:
        return False
    

def get_access_entry(db: Session, course_id: int, user_id: int):
    return db.get(db_models.Access, (course_id, user_id))