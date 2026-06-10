from sqlalchemy.orm import Session as DBSession
from models import Session, Message
from langchain_core.messages import HumanMessage, AIMessage

def get_or_create_session(db: DBSession, session_id: str, user_name: str = "Guest", title: str | None = None):
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        session = Session(id=session_id, user_name=user_name)
        if title is not None:
            session.title = title
        db.add(session)
        db.commit()
    return session

def save_message(db: DBSession, session_id: str, role: str, content: str):
    msg = Message(session_id=session_id, role=role, content=content)
    db.add(msg)
    db.commit()

def get_history(db: DBSession, session_id: str):
    messages = (
        db.query(Message)
        .filter(Message.session_id == session_id)
        .order_by(Message.created_at)
        .all()
    )
    # Convert to LangChain message objects
    history = []
    for msg in messages:
        if msg.role == "user":
            history.append(HumanMessage(content=msg.content))
        else:
            history.append(AIMessage(content=msg.content))
    return history

def get_formatted_history(db: DBSession, session_id: str):
    messages = (
        db.query(Message)
        .filter(Message.session_id == session_id)
        .order_by(Message.created_at)
        .all()
    )
    return [{"role": m.role, "content": m.content} for m in messages]

def clear_session(db: DBSession, session_id: str):
    db.query(Message).filter(Message.session_id == session_id).delete()
    db.query(Session).filter(Session.id == session_id).delete()
    db.commit()