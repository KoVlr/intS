from fastapi import APIRouter, Depends, HTTPException, Security
from sqlalchemy.orm import Session
from datetime import datetime


from .auth import get_current_user
from ..database import get_db
from .. import schemes
from .. import crud

courses_router = APIRouter(
    prefix="/api/courses",
    tags=["Courses"]
)


@courses_router.post("", response_model=schemes.Course)
def create_new_course(
        new_course: schemes.CourseNew,
        db: Session = Depends(get_db),
        user = Security(get_current_user, scopes=['author'])
    ):
    existing_course = crud.get_course_by_name(db, new_course.name, user.author.id)
    if existing_course:
        raise HTTPException(status_code=400, detail="Сourse with the same name already exists for this author")
    
    course = schemes.CourseCreate(
        **new_course.dict(),
        author_id=user.author.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    return crud.create_course(db, course)