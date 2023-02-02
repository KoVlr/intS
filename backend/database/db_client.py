import sqlalchemy
from sqlalchemy.orm import sessionmaker
import json
from singleton_decorator import singleton
from backend.database.db_models import Base

@singleton
class DB_Client:
    def __init__(self):
        with open("backend/database/db_config.json") as config:
            database = json.load(config)['database']
            self.host = database['host']
            self.port = database['port']
            self.db_type = database['db_type']
            self.db_name = database['db_name']
            self.login = database['login']
            self.password = database['password']

        self.engine = None
        self.connection = None
        self.session = None
        self.url = None

    def connect(self):
        self.url = f'{self.db_type}://{self.login}:{self.password}@{self.host}:{self.port}/{self.db_name}'
        self.engine = sqlalchemy.create_engine(
            self.url
        )
        self.connection = self.engine.connect()
        self.session = sessionmaker(bind=self.connection.engine,
                                    autoflush=False,
                                    autocommit=False,
                                    expire_on_commit=False
                                    )()
        Base.metadata.create_all(bind=self.engine)
        return self.session