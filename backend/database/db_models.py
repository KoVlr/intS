from sqlalchemy.orm.attributes import InstrumentedAttribute
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy import Column, Integer, String, Date, Boolean, TIMESTAMP, Float, ARRAY, ForeignKey, UniqueConstraint, Text, PrimaryKeyConstraint
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
    email = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)

class Authors(Base):
    __tablename__ = 'authors'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))

    user = relationship('users', backref='author', uselist=False)

class Courses(Base):
    __tablename__ = 'courses'

    id = Column(Integer, primary_key=True)
    author_id = Column(Integer, ForeignKey('authors.id'))
    name = Column(String, nullable=False)
    description = Column(Text)
    is_public = Column(Boolean, nullable=False)
    views_count = Column(Integer)
    rating = Column(Float)
    creation_date = Column(Date, nullable=False)

    author = relationship('authors', backref='courses')

    __table_args__ = (
        UniqueConstraint('name', 'author_id'),
    )

class Access(Base):
    __tablename__ = 'access'
    course_id = Column(Integer, ForeignKey('courses.id'))
    user_id = Column(Integer, ForeignKey('users.id'))
    receiving_date = Column(Date, nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint('course_id', 'user_id'),
    )

class Articles(Base):
    __tablename__ = 'articles'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    file = Column(String, nullable=False)
    course_id = Column(Integer, ForeignKey('courses.id'))
    creation_date = Column(Date, nullable=False)
    update_date = Column(Date, nullable=False)
    published = Column(Boolean, nullable=False)
    
    course = relationship('courses', backref='article')

    __table_args__ = (
        UniqueConstraint('name', 'course_id'),
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
    writing_date = Column(Date, nullable=False)

    user = relationship('users', backref='comment')
    article = relationship('articles', backref='comment')

class History(Base):
    __tablename__ = 'history'

    article_id = Column(Integer, ForeignKey('articles.id'))
    user_id = Column(Integer, ForeignKey('users.id'))
    reading_date = Column(Date, nullable=False)

    user = relationship('users', backref='comment')
    article = relationship('articles', backref='comment')

    __table_args__ = (
        PrimaryKeyConstraint('article_id', 'user_id'),
    )