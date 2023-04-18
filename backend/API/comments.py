from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from .auth import get_current_user, get_authenticated_user
from .articles import articles_router, get_available_article
from ..database import get_db
from .. import schemes
from .. import crud


comments_router = APIRouter(
    prefix="/api/comments",
    tags=["Comments"]
)


@articles_router.post("/{article_id}/comments", response_model=schemes.CommentGet)
def create_comment(
    new_comment: schemes.CommentNew,
    user = Depends(get_authenticated_user),
    db_article = Depends(get_available_article),
    db: Session = Depends(get_db)
):
    comment = schemes.CommentCreate(
        **new_comment.dict(),
        user_id = user.id,
        created_at=datetime.utcnow()
    )

    if comment.reply_to is not None:
        comment.reply_viewed = False
    
    db_comment = crud.create_comment(db, comment)

    return {
        **schemes.Comment.from_orm(db_comment).dict(),
        'user': db_article.course.author.user.username,
        'replies_count': len(db_comment.replies)
    }


@articles_router.get("/{article_id}/comments", response_model=List[schemes.CommentGet])
def get_comments(
    article_id: int,
    reply_to: int | None = None,
    limit: int = 20,
    offset: int = 0,
    db_article = Depends(get_available_article),
    db: Session = Depends(get_db)
):
    db_comments = crud.get_comments(db, article_id, reply_to, offset, limit)
    
    comments = [{
        **schemes.Comment.from_orm(db_comment).dict(),
        'user': db_article.course.author.user.username,
        'replies_count': len(db_comment.replies)
    } for db_comment in db_comments]

    return comments