from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import inspect
from sqlalchemy.orm import Session as DBSession
from uuid import uuid4
from database import engine, get_db, Base
from models import Document, Session, Message
from memory import (
    get_or_create_session, save_message,
    get_history, get_formatted_history, clear_session
)
from rag import ingest_document, chat_with_rag
import shutil, os

# Create all tables on startup
Base.metadata.create_all(bind=engine)

# Ensure the sessions.title column exists on the live database
inspector = inspect(engine)
if 'sessions' in inspector.get_table_names():
        session_columns = [col['name'] for col in inspector.get_columns('sessions')]
        if 'title' not in session_columns:
            with engine.connect() as conn:
                conn.exec_driver_sql("ALTER TABLE sessions ADD COLUMN title VARCHAR(100) NULL DEFAULT NULL")
        else:
            with engine.connect() as conn:
                conn.exec_driver_sql("ALTER TABLE sessions MODIFY COLUMN title VARCHAR(100) NULL DEFAULT NULL")
app = FastAPI(title="AI Support Chatbot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200",
        "https://ai-support-chatbot-tau.vercel.app" ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = "/tmp/data"
os.makedirs(DATA_DIR, exist_ok=True)

class ChatRequest(BaseModel):
    session_id: str
    question: str
    user_name: str = "Guest"

class ClearRequest(BaseModel):
    session_id: str

class SessionCreateRequest(BaseModel):
    user_name: str = "Guest"

class SessionUpdateRequest(BaseModel):
    title: Optional[str] = None

# ── Routes ────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "running"}

@app.post("/upload")
async def upload(file: UploadFile = File(...), db: DBSession = Depends(get_db)):
    try:
        file_path = f"{DATA_DIR}/{file.filename}"
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        chunks = ingest_document(file_path)

        # Save document info to MySQL
        doc = Document(
            filename=file.filename,
            file_path=file_path,
            chunk_count=chunks
        )
        db.add(doc)
        db.commit()

        return {
            "message": "Document uploaded successfully",
            "filename": file.filename,
            "chunks": chunks
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat(req: ChatRequest, db: DBSession = Depends(get_db)):
    try:
        # Get or create session in MySQL
        get_or_create_session(db, req.session_id, req.user_name)

        # Get history from MySQL
        history = get_history(db, req.session_id)

        # RAG + LLM
        response, sources = chat_with_rag(req.question, history)

        # Save both messages to MySQL
        save_message(db, req.session_id, "user", req.question)
        save_message(db, req.session_id, "assistant", response)

        return {
            "session_id": req.session_id,
            "answer": response,
            "sources": sources
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history/{session_id}")
def history(session_id: str, db: DBSession = Depends(get_db)):
    return {
        "session_id": session_id,
        "history": get_formatted_history(db, session_id)
    }

@app.delete("/clear/{session_id}")
def clear(session_id: str, db: DBSession = Depends(get_db)):
    clear_session(db, session_id)
    return {"message": "Session cleared"}

@app.post("/sessions")
def create_session(req: SessionCreateRequest, db: DBSession = Depends(get_db)):
    session_id = str(uuid4())
    get_or_create_session(db, session_id, req.user_name)
    return {"session_id": session_id}

@app.patch("/sessions/{session_id}")
def update_session(session_id: str, req: SessionUpdateRequest, db: DBSession = Depends(get_db)):
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if req.title is not None:
        session.title = req.title
    db.commit()
    return {"session_id": session_id, "title": session.title}

@app.delete("/sessions/{session_id}")
def delete_session(session_id: str, db: DBSession = Depends(get_db)):
    clear_session(db, session_id)
    return {"message": "Session deleted"}

@app.get("/documents")
def documents(db: DBSession = Depends(get_db)):
    docs = db.query(Document).order_by(Document.uploaded_at.desc()).all()
    return {"documents": [
        {"id": d.id, "filename": d.filename, "chunks": d.chunk_count}
        for d in docs
    ]}

@app.get("/sessions")
def get_sessions(db: DBSession = Depends(get_db)):
    sessions = db.query(Session).order_by(Session.created_at.desc()).all()
    
    result = []
    for session in sessions:
        # Get first user message as title
        first_msg = (
            db.query(Message)
            .filter(
                Message.session_id == session.id,
                Message.role == "user"
            )
            .order_by(Message.created_at)
            .first()
        )
        
        # Get last message time
        last_msg = (
            db.query(Message)
            .filter(Message.session_id == session.id)
            .order_by(Message.created_at.desc())
            .first()
        )

        default_title = None
        if first_msg:
            default_title = first_msg.content[:40] + ("..." if len(first_msg.content) > 40 else "")

        result.append({
            "session_id": session.id,
            "title": session.title if session.title and session.title != "New Chat" else (default_title or "New Chat"),
            "created_at": session.created_at.strftime("%d %b, %I:%M %p") if session.created_at else "",
            "last_active": last_msg.created_at.strftime("%d %b, %I:%M %p") if last_msg else ""
        })
    
    return {"sessions": result}