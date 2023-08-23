from sqlalchemy.orm import Session, aliased
import uuid
import schemes.users
import schemes.auth
import schemes.articles
import schemes.courses
import schemes.comments
from database import db_models

def get_user(db: Session, id: int):
    return db.get(db_models.Users, id)


def get_user_by_email(db: Session, email: str):
    return db.query(db_models.Users).filter(db_models.Users.email == email).first()


def get_scopes(db: Session, email: str):
    user = db.query(db_models.Users).filter(db_models.Users.email == email).first()
    scopes = []
    if user.author is not None:
        scopes += ['author']
    return scopes


def create_user(db: Session, user: schemes.users.UserCreate):
    db_user = db_models.Users(
        username=user.username,
        email=user.email,
        hashed_password=user.password,
        activated=user.activated,
        confirmation_code=user.confirmation_code
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(
    db: Session,
    id: int,
    user_data: schemes.users.UserUpdate
):    
    db_user = db.get(db_models.Users, id)
    
    for attr in user_data.dict(exclude_unset=True):
        setattr(db_user, attr, getattr(user_data, attr))

    db.commit()
    return db_user


def create_refresh_token(db: Session, refresh_token: schemes.auth.RefreshToken):
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



def create_author(db: Session, author: schemes.users.AuthorCreate):
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


def create_course(db: Session, course: schemes.courses.CourseCreate):
    db_course = db_models.Courses(**course.dict())
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course


def delete_course(db: Session, id: int):
    db_course = db.get(db_models.Courses, id)
    if db_course:
        db.delete(db_course)
        db.commit()
        return True
    else:
        return False


def get_courses_list(db: Session, offset: int, limit: int):
    return db.query(db_models.Courses)\
        .order_by(
            db_models.Courses.is_public.desc(),
            db_models.Courses.views_count.desc(),
            db_models.Courses.name
        )\
        .offset(offset).limit(limit).all()


def get_courses_by_author(db: Session, author_id: int, offset: int, limit: int):
    return db.query(db_models.Courses)\
        .filter(db_models.Courses.author_id == author_id)\
        .order_by(db_models.Courses.updated_at.desc())\
        .offset(offset).limit(limit).all()


def get_courses_in_collection(db: Session, user_id: int, offset: int, limit: int):
    return db.query(db_models.Courses).join(db_models.Collections)\
        .filter(db_models.Collections.user_id == user_id)\
        .order_by(db_models.Collections.added_at.desc())\
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


def get_drafts(db: Session, course_id: int):
    return db.query(db_models.Articles)\
        .filter(db_models.Articles.course_id == course_id,
                db_models.Articles.is_published == False)\
                    .order_by(db_models.Articles.updated_at.desc()).all()


def create_access(db: Session, access_entry: schemes.courses.AccessCreate):
    db_access = db_models.Access(**access_entry.dict())
    db.add(db_access)
    db.commit()
    db.refresh(db_access)
    return db_access


def create_collection_entry(db: Session, collection_entry: schemes.courses.CollectionCreate):
    db_collection = db_models.Collections(**collection_entry.dict())
    db.add(db_collection)
    db.commit()
    db.refresh(db_collection)
    return db_collection


def delete_collection_entry(db: Session, user_id: int, course_id: int):
    db_collection = db.get(db_models.Collections, (user_id, course_id))
    if db_collection:
        db.delete(db_collection)
        db.commit()
        return True
    else:
        return False


def get_article(db: Session, id: int):
    return db.get(db_models.Articles, id)


def update_article(
    db: Session,
    id: int,
    article_data: schemes.articles.ArticleUpdate
):    
    db_article = db.get(db_models.Articles, id)
    
    for attr in article_data.dict(exclude_unset=True):
        setattr(db_article, attr, getattr(article_data, attr))

    db.commit()
    return db_article


def update_course(
    db: Session,
    id: int,
    course_data: schemes.courses.CourseUpdate
):    
    db_course = db.get(db_models.Courses, id)
    
    for attr in course_data.dict(exclude_unset=True):
        setattr(db_course, attr, getattr(course_data, attr))

    db.commit()
    return db_course


def get_article_by_name(db: Session, name: str, course_id: int):
    return db.query(db_models.Articles)\
        .filter(db_models.Articles.name == name, db_models.Articles.course_id == course_id).first()


def create_article(db: Session, article: schemes.articles.ArticleCreate):
    db_article = db_models.Articles(**article.dict())
    db.add(db_article)
    db.commit()
    db.refresh(db_article)
    return db_article


def delete_article(db: Session, id: int):
    db_article = db.get(db_models.Articles, id)
    if db_article:
        db.delete(db_article)
        db.commit()
        return True
    else:
        return False


def create_image(db: Session, image: schemes.articles.ImageCreate):
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



def create_comment(db: Session, comment: schemes.comments.CommentCreate):
    db_comment = db_models.Comments(**comment.dict())
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment



def get_comment(db: Session, id: int):
    return db.get(db_models.Comments, id)


def get_comments(db: Session, article_id: int, reply_to: int | None, offset: int, limit: int):
    query = db.query(db_models.Comments)\
        .filter(db_models.Comments.article_id==article_id, db_models.Comments.reply_to==reply_to)
    if reply_to is None:
        query = query.order_by(db_models.Comments.created_at.desc())
    else:
        query = query.order_by(db_models.Comments.created_at)
    return query.offset(offset).limit(limit).all()


def update_comment(
    db: Session,
    id: int,
    comment_data: schemes.comments.CommentUpdate
):
    db_comment = db.get(db_models.Comments, id)
    
    for attr in comment_data.dict(exclude_unset=True):
        setattr(db_comment, attr, getattr(comment_data, attr))

    db.commit()
    return db_comment


def delete_comment(db: Session, id: int):
    db_comment = db.get(db_models.Comments, id)
    if db_comment:
        db.delete(db_comment)
        db.commit()
        return True
    else:
        return False
    

def get_direct_comments(db: Session, user_id: int, offset: int, limit: int | None):
    Parent = aliased(db_models.Comments)
    replies = db.query(db_models.Comments)\
        .join(Parent, db_models.Comments.parent)\
            .filter(
                Parent.user_id==user_id,
                db_models.Comments.reply_viewed!=True,
                db_models.Comments.content != None,
                db_models.Comments.user_id!=user_id
            )
    
    to_author = db.query(db_models.Comments)\
        .join(db_models.Articles).join(db_models.Courses).join(db_models.Authors).join(db_models.Users)\
            .filter(
                db_models.Users.id == user_id,
                db_models.Comments.viewed_by_author!=True,
                db_models.Comments.content != None,
                db_models.Comments.user_id!=user_id
            )
    
    direct_comments = replies.union(to_author).order_by(db_models.Comments.created_at.desc()).offset(offset)
    if limit is not None:
        direct_comments = direct_comments.limit(limit)
    return direct_comments.all()


def get_direct_count(db: Session, user_id: int):
    Parent = aliased(db_models.Comments)
    replies = db.query(db_models.Comments)\
        .join(Parent, db_models.Comments.parent)\
            .filter(
                Parent.user_id==user_id,
                db_models.Comments.reply_viewed!=True,
                db_models.Comments.content != None,
                db_models.Comments.user_id!=user_id
            )
    
    to_author = db.query(db_models.Comments)\
        .join(db_models.Articles).join(db_models.Courses).join(db_models.Authors).join(db_models.Users)\
            .filter(
                db_models.Users.id == user_id,
                db_models.Comments.viewed_by_author!=True,
                db_models.Comments.content != None,
                db_models.Comments.user_id!=user_id
            )
    
    return replies.union(to_author).count()


def get_search_in_courses(
        db: Session,
        query: str, 
        user_id: int, 
        offset: int,
        limit: int,
        mine: bool,
        collection: bool
    ):
    db_query = db.query(db_models.Courses)
    if mine:
        db_query = db_query.join(db_models.Authors)\
            .filter(db_models.Authors.user_id==user_id)
    if collection:
        db_query = db_query.join(db_models.Collections)\
        .filter(db_models.Collections.user_id == user_id)
    return db_query.filter(db_models.Courses.ts_vector.match(query)).offset(offset).limit(limit).all()


def get_search_in_articles(
        db: Session,
        query: str, 
        user_id: int, 
        offset: int,
        limit: int,
        mine: bool,
        collection: bool
    ):
    db_query = db.query(db_models.Articles).join(db_models.Courses).join(db_models.Authors)
    if mine:
        db_query = db_query.filter(db_models.Authors.user_id==user_id)
    else:
        db_query = db_query.filter(db_models.Articles.is_published==True)

    if collection:
        db_query = db_query.join(db_models.Collections)\
        .filter(db_models.Collections.user_id == user_id)
    
    available_courses = db.query(db_models.Access.course_id).filter(db_models.Access.user_id==user_id)

    return db_query.filter((db_models.Courses.is_public==True)\
                           | (db_models.Courses.id.in_(available_courses))\
                            | (db_models.Authors.user_id==user_id))\
        .filter(db_models.Articles.ts_vector.match(query)).offset(offset).limit(limit).all()


def get_history(db: Session, user_id: int, offset: int, limit: int | None):
    q = db.query(db_models.Articles, db_models.History).join(db_models.History)\
        .filter(db_models.History.user_id==user_id).order_by(db_models.History.read_at.desc())\
        .offset(offset)
    if limit is not None:
        q = q.limit(limit)
    return q.all()


def update_history_entry(
    db: Session,
    history_entry: schemes.articles.History
):
    db_history = db.get(db_models.History, (history_entry.article_id, history_entry.user_id))
    if db_history is None:
        db_history = db_models.History(**history_entry.dict())
        db.add(db_history)
        db.commit()
        db.refresh(db_history)
        return db_history
    
    db_history.read_at = history_entry.read_at
    db.commit()
    return db_history


def delete_history_entry(db: Session, article_id: int, user_id: int):
    db_history = db.get(db_models.History, (article_id, user_id))
    if db_history:
        db.delete(db_history)
        db.commit()
        return True
    else:
        return False
    

def delete_all_history(db: Session, user_id: int):
    db_history_list = get_history(db, user_id, 0, None)
    for db_history in db_history_list:
        db.delete(db_history[1])
    db.commit()
    return True


def create_file(db: Session, file: schemes.courses.FileCreate):
    db_file = db_models.Files(**file.dict())
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return db_file


def get_course_files(db: Session, course_id: int):
    return db.query(db_models.Files).filter(db_models.Files.course_id==course_id)\
        .order_by(db_models.Files.original_name).all()


def get_file(db: Session, id: int):
    return db.get(db_models.Files, id)


def delete_file(db: Session, id: int):
    db_file = db.get(db_models.Files, id)
    if db_file:
        db.delete(db_file)
        db.commit()
        return True
    else:
        return False