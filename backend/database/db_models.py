from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy import Column, Integer, String, UUID, Boolean, TIMESTAMP,\
    ForeignKey, UniqueConstraint, Text, PrimaryKeyConstraint, types, Computed, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import TSVECTOR


Base = declarative_base()

class TSVector(types.TypeDecorator):
    impl = TSVECTOR


class Users(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, nullable=False, unique=True)
    hashed_password = Column(String, nullable=False)
    activated = Column(Boolean, nullable=False)
    confirmation_code = Column(UUID)

    author = relationship('Authors', uselist=False, back_populates='user')
    comments = relationship('Comments', back_populates='user')
    refresh_tokens = relationship('RefreshTokens', back_populates='user')

class Authors(Base):
    __tablename__ = 'authors'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True)

    user = relationship('Users', back_populates='author')
    courses = relationship('Courses', back_populates='author')

class Courses(Base):
    __tablename__ = 'courses'

    id = Column(Integer, primary_key=True)
    author_id = Column(Integer, ForeignKey('authors.id'))
    name = Column(String, nullable=False)
    description = Column(Text)
    is_public = Column(Boolean, nullable=False)
    views_count = Column(Integer)
    access_code = Column(UUID)
    created_at = Column(TIMESTAMP, nullable=False)
    updated_at = Column(TIMESTAMP, nullable=False)
    ts_vector = Column(TSVector(), Computed(
        "to_tsvector('russian', name || ' ' || description)",
        persisted=True
    ))

    author = relationship('Authors', back_populates='courses')
    articles = relationship(
        'Articles',
        back_populates='course',
        cascade="all, delete-orphan"
    )
    collections = relationship('Collections', cascade="all, delete-orphan")
    access = relationship('Access', cascade="all, delete-orphan")
    files = relationship(
        'Files',
        back_populates='course',
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        UniqueConstraint('name', 'author_id'),
        Index('ix_courses_ts_vector', ts_vector, postgresql_using='gin'),
    )

class Collections(Base):
    __tablename__ = 'collections'
    user_id = Column(Integer, ForeignKey('users.id'))
    course_id = Column(Integer, ForeignKey('courses.id'))
    added_at = Column(TIMESTAMP, nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint('user_id', 'course_id'),
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
    content = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, nullable=False)
    updated_at = Column(TIMESTAMP, nullable=False)
    is_published = Column(Boolean, nullable=False)
    published_at = Column(TIMESTAMP)
    position_in_course = Column(Integer)
    ts_vector = Column(TSVector(), Computed(
        "to_tsvector('russian', name || ' ' || content)",
        persisted=True
    ))
    
    course = relationship('Courses', back_populates='articles')
    images = relationship('Images', back_populates='article', cascade="all, delete-orphan")
    comments = relationship('Comments', back_populates='article', cascade="all, delete-orphan")
    history = relationship('History', cascade="all, delete-orphan")
    
    __table_args__ = (
        UniqueConstraint('name', 'course_id'),
        UniqueConstraint('position_in_course', 'course_id'),
        Index('ix_articles_ts_vector', ts_vector, postgresql_using='gin'),
    )

class Images(Base):
    __tablename__ = 'images'

    id = Column(Integer, primary_key=True)
    article_id = Column(Integer, ForeignKey('articles.id'))
    file = Column(String, nullable=False, unique=True)
    original_name = Column(String, nullable=False)

    article = relationship('Articles', back_populates='images')

    __table_args__ = (
        UniqueConstraint('original_name', 'article_id'),
    )

class Files(Base):
    __tablename__ = 'files'

    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey('courses.id'))
    path = Column(String, nullable=False, unique=True)
    original_name = Column(String, nullable=False)
    uploaded_at = Column(TIMESTAMP, nullable=False)

    course = relationship('Courses', back_populates='files')

    __table_args__ = (
        UniqueConstraint('original_name', 'course_id'),
    )

class Comments(Base):
    __tablename__ = 'comments'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    article_id = Column(Integer, ForeignKey('articles.id'))
    content = Column(String)
    created_at = Column(TIMESTAMP, nullable=False)
    viewed_by_author = Column(Boolean)
    reply_to = Column(Integer, ForeignKey('comments.id'))
    reply_viewed = Column(Boolean)

    user = relationship('Users', back_populates='comments')
    article = relationship('Articles', back_populates='comments')
    replies = relationship('Comments', back_populates='parent')
    parent = relationship('Comments', remote_side=[id], back_populates='replies')

class History(Base):
    __tablename__ = 'history'

    article_id = Column(Integer, ForeignKey('articles.id'))
    user_id = Column(Integer, ForeignKey('users.id'))
    read_at = Column(TIMESTAMP, nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint('article_id', 'user_id'),
    )

class RefreshTokens(Base):
    __tablename__ = 'refresh_tokens'

    uuid = Column(UUID, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    created_at = Column(TIMESTAMP, nullable=False)
    expires_in = Column(Integer, nullable=False)

    user = relationship('Users', back_populates='refresh_tokens')