from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from .auth import get_authenticated_user
from .articles import articles_router, get_available_article
from database.db_connection import get_db
import schemes.comments
import crud


comments_router = APIRouter(
    prefix="/api/comments",
    tags=["Comments"]
)


def get_own_comment(
        comment_id: int,
        user = Depends(get_authenticated_user),
        db: Session = Depends(get_db)
    ):
    db_comment = crud.get_comment(db, comment_id)
    if db_comment is None:
        raise HTTPException(status_code=400, detail="This comment does not exist")
    
    if db_comment.user_id != user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    return db_comment


@articles_router.post("/{article_id}/comments", response_model=schemes.comments.CommentGet)
def create_comment(
    new_comment: schemes.comments.CommentNew,
    user = Depends(get_authenticated_user),
    db_article = Depends(get_available_article),
    db: Session = Depends(get_db)
):
    comment = schemes.comments.CommentCreate(
        **new_comment.dict(),
        user_id = user.id,
        created_at=datetime.utcnow()
    )

    if comment.reply_to is not None:
        comment.reply_viewed = False
    
    db_comment = crud.create_comment(db, comment)

    return {
        **schemes.comments.Comment.from_orm(db_comment).dict(),
        'user': db_article.course.author.user.username,
        'replies_count': len(db_comment.replies),
        'ownership': True
    }


@articles_router.get("/{article_id}/comments", response_model=List[schemes.comments.CommentGet])
def get_comments(
    article_id: int,
    reply_to: int | None = None,
    limit: int = 20,
    offset: int = 0,
    db_article = Depends(get_available_article),
    user = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
):
    db_comments = crud.get_comments(db, article_id, reply_to, offset, limit)
    
    comments = [{
        **schemes.comments.Comment.from_orm(db_comment).dict(),
        'user': db_comment.user.username,
        'replies_count': len(db_comment.replies),
        'ownership': db_comment.user_id == user.id
    } for db_comment in db_comments]

    return comments


@comments_router.get("/direct", response_model=List[schemes.comments.CommentNotification])
def get_direct_comments(
    limit: int = 20,
    offset: int = 0,
    user = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
):
    db_comments = crud.get_direct_comments(db, user.id, offset, limit)

    def get_parent_sequence(db_comment):
        curr_comment = db_comment
        parent_sequence = [curr_comment.id]
        while curr_comment.parent is not None:
            parent_sequence += [curr_comment.parent.id]
            curr_comment = curr_comment.parent
        return parent_sequence

    return [{
        **schemes.comments.CommentNotificationBase.from_orm(db_comment).dict(),
        'user': db_comment.user.username,
        'course': db_comment.article.course.name,
        'article': db_comment.article.name,
        'course_id': db_comment.article.course_id,
        'parent_sequence': get_parent_sequence(db_comment)
    } for db_comment in db_comments]


@comments_router.delete("/direct")
def delete_all_direct_entry(
    user = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
):
    db_comments = crud.get_direct_comments(db, user.id, 0, None)
    for db_comment in db_comments:
        update_data = {}
        if db_comment.parent is not None and db_comment.parent.user_id == user.id:
            update_data['reply_viewed'] = True
        if db_comment.article.course.author.user.id == user.id:
            update_data['viewed_by_author'] = True
        if len(update_data)!=0:
            crud.update_comment(db, db_comment.id, schemes.comments.CommentUpdate(**update_data))


@comments_router.get("/direct/count")
def get_direct_count(
    user = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
):
    count = crud.get_direct_count(db, user.id)
    return {'count': count}


@comments_router.delete("/direct/{comment_id}")
def delete_direct_entry(
    comment_id: int,
    user = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
):
    db_comment = crud.get_comment(db, comment_id)
    update_data = {}
    if db_comment.parent is not None and db_comment.parent.user_id == user.id:
        update_data['reply_viewed'] = True
    if db_comment.article.course.author.user.id == user.id:
        update_data['viewed_by_author'] = True
    if len(update_data)!=0:
        crud.update_comment(db, comment_id, schemes.comments.CommentUpdate(**update_data))


@comments_router.patch("/{comment_id}", response_model=schemes.comments.CommentGet)
def update_comment(
    comment_id: int,
    new_comment: schemes.comments.CommentPatch,
    db_comment = Depends(get_own_comment),
    db: Session = Depends(get_db)
):
    comment_data = schemes.comments.CommentUpdate(
        **new_comment.dict(),
        created_at=datetime.utcnow()
    )

    new_db_comment = crud.update_comment(db, comment_id, comment_data)
    return {
        **schemes.comments.Comment.from_orm(new_db_comment).dict(),
        'user': new_db_comment.user.username,
        'replies_count': len(new_db_comment.replies),
        'ownership': True
    }


@comments_router.delete("/{comment_id}")
def delete_comment(
    comment_id: int,
    db_comment = Depends(get_own_comment),
    db: Session = Depends(get_db)
):
    if db_comment.replies != []:
        crud.update_comment(db, comment_id, schemes.comments.CommentUpdate(content=None))
    else:
        parent_id = db_comment.reply_to
        crud.delete_comment(db, comment_id)

        parent = crud.get_comment(db, parent_id)
        if parent is not None and parent.content is None and parent.replies == []:
            crud.delete_comment(db, parent_id)