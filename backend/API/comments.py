from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from .auth import get_current_user, get_authenticated_user
from .articles import articles_router
from .courses import check_available_course
from ..database import get_db
from .. import schemes
from .. import crud


comments_router = APIRouter(
    prefix="/api/comments",
    tags=["Comments"]
)


@articles_router.post("/{articles_id}/comments", response_model=schemes.CommentGet)
def create_comment(
    new_comment: schemes.CommentNew,
    user = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
):
    db_article = crud.get_article(db, new_comment.article_id)
    check_available_course(db_article.course, user, db)

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
        'user': db_article.course.author.user.username
    }