from sqlalchemy.orm.attributes import InstrumentedAttribute
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy import Column, Integer, String, UUID, Boolean, TIMESTAMP, Float, ForeignKey, UniqueConstraint, Text, PrimaryKeyConstraint
from sqlalchemy.ext.declarative import declarative_base

def base_repr(self):
    """Representation method for every sqlalchemy Base instance"""
    columns = [k for k, v in self.__class__.__dict__.items() if isinstance(v, InstrumentedAttribute)]
    values = map(lambda k: f"{k}={self.__dict__.get(k, 'None')}", columns)
    return f"<{self.__class__.__name__}({', '.join(list(values))})>"

Base = declarative_base()
setattr(Base, "__repr__", base_repr)

class Users(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, nullable=False, unique=True)
    hashed_password = Column(String, nullable=False)

class Authors(Base):
    __tablename__ = 'authors'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))

    user = relationship('Users', backref='author', uselist=False)

class Courses(Base):
    __tablename__ = 'courses'

    id = Column(Integer, primary_key=True)
    author_id = Column(Integer, ForeignKey('authors.id'))
    name = Column(String, nullable=False)
    description = Column(Text)
    is_public = Column(Boolean, nullable=False)
    views_count = Column(Integer)
    rating = Column(Float)
    created_at = Column(TIMESTAMP, nullable=False)

    author = relationship('Authors', backref='courses')

    __table_args__ = (
        UniqueConstraint('name', 'author_id'),
    )

class Access(Base):
    __tablename__ = 'access'
    course_id = Column(Integer, ForeignKey('courses.id'))
    user_id = Column(Integer, ForeignKey('users.id'))
    received_at = Column(TIMESTAMP, nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint('course_id', 'user_id'),
    )

class Articles(Base):
    __tablename__ = 'articles'

    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey('courses.id'))
    name = Column(String, nullable=False)
    file = Column(String, nullable=False)
    position_in_course = Column(Integer, nullable=False)
    created_at = Column(TIMESTAMP, nullable=False)
    updated_at = Column(TIMESTAMP, nullable=False)
    published = Column(Boolean, nullable=False)
    
    course = relationship('Courses', backref='article')

    __table_args__ = (
        UniqueConstraint('name', 'course_id'),
        UniqueConstraint('position_in_course', 'course_id'),
    )

class Сomments(Base):
    __tablename__ = 'comments'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    article_id = Column(Integer, ForeignKey('articles.id'))
    to_author = Column(Boolean)
    reply_to = Column(Integer, ForeignKey('comments.id'))
    viewed = Column(Boolean)
    content = Column(String)
    written_at = Column(TIMESTAMP, nullable=False)

    user = relationship('Users', backref='comment')
    article = relationship('Articles', backref='comment')

class History(Base):
    __tablename__ = 'history'

    article_id = Column(Integer, ForeignKey('articles.id'))
    user_id = Column(Integer, ForeignKey('users.id'))
    read_at = Column(TIMESTAMP, nullable=False)

    user = relationship('Users', backref='history_record')
    article = relationship('Articles', backref='history_record')

    __table_args__ = (
        PrimaryKeyConstraint('article_id', 'user_id'),
    )

class RefreshTokens(Base):
    __tablename__ = 'refresh_tokens'

    uuid = Column(UUID, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    created_at = Column(TIMESTAMP)
    expires_in = Column(Integer)

    user = relationship('Users', backref='refresh_token')