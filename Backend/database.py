# database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from urllib.parse import quote_plus
import os

load_dotenv()

DATABASE_URL = (
    os.getenv("MYSQL_PUBLIC_URL")
    or os.getenv("MYSQL_URL")
    or os.getenv("DATABASE_URL")
)

if DATABASE_URL:
    DB_URL = DATABASE_URL
    if DB_URL.startswith("mysql://"):
        DB_URL = DB_URL.replace("mysql://", "mysql+pymysql://", 1)
else:
    DB_HOST     = os.getenv("DB_HOST", "localhost")
    DB_PORT     = int(os.getenv("DB_PORT") or "3306")   # ← handles None safely
    DB_USER     = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME     = os.getenv("DB_NAME", "railway")

    DB_USER_ENCODED = quote_plus(DB_USER)
    DB_PASSWORD_ENCODED = quote_plus(DB_PASSWORD)
    DB_URL = f"mysql+pymysql://{DB_USER_ENCODED}:{DB_PASSWORD_ENCODED}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(
    DB_URL,
    pool_pre_ping=True,
    pool_recycle=180,
    pool_timeout=30,
    connect_args={
        "connect_timeout": 10,
        "read_timeout": 60,
        "write_timeout": 60,
    },
)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()