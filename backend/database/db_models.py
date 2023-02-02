from sqlalchemy.orm.attributes import InstrumentedAttribute
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy import Column, Integer, String, Date, Boolean, TIMESTAMP, Float, ARRAY, ForeignKey
from sqlalchemy.ext.declarative import declarative_base

def base_repr(self):
    """Representation method for every sqlalchemy Base instance"""
    columns = [k for k, v in self.__class__.__dict__.items() if isinstance(v, InstrumentedAttribute)]
    values = map(lambda k: f"{k}={self.__dict__.get(k, 'None')}", columns)
    return f"<{self.__class__.__name__}({', '.join(list(values))})>"

Base = declarative_base()
setattr(Base, "__repr__", base_repr)

class Users(Base):
    __tablename__ = "Users"

    email = Column(String, primary_key = True)
    hashed_password = Column(String)