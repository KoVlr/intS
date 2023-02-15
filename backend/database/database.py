from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import json

with open("backend/database/db_config.json", 'r') as config_file:
    db_config = json.load(config_file)
    
    host = db_config['host']
    port = db_config['port']
    db_type = db_config['db_type']
    db_name = db_config['db_name']
    login = db_config['login']
    password = db_config['password']

url = f'{db_type}://{login}:{password}@{host}:{port}/{db_name}'

engine = create_engine(url)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()