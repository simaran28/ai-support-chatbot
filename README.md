# ai-support-chatbot
AI-powered customer support chatbot built with Angular 18, FastAPI, and  LangChain. Features RAG pipeline to answer questions from uploaded documents,  persistent chat history with MySQL, and session management.
## 🌐 Live Demo
> Frontend: https://ai-support-chatbot-tau.vercel.app
> Backend:  https://ai-support-chatbot-backend-w2m6.onrender.com/

---

## ✨ Features

- 💬 AI chat powered by Llama3 via Groq API
- 📄 Upload documents and ask questions from them (RAG)
- 🧠 Conversation memory per session
- 💾 Persistent chat history with MySQL
- 🗂️ Multiple chat sessions with rename and delete
- 🌙 Modern dark theme UI
- 📱 Fully responsive design

---

## 🛠️ Tech Stack

### Frontend
- Angular 18 (Standalone)
- TypeScript
- RxJS

### Backend
- FastAPI (Python)
- LangChain
- ChromaDB (Vector Database)
- HuggingFace Embeddings
- Groq API (Llama3-8B)

### Database
- MySQL
- SQLAlchemy ORM

### Deployment
- Frontend → Vercel
- Backend  → Render
- Database → Railway

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL
- Groq API key (free at console.groq.com)

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt
```

Create `.env` file:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=support_chatbot
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant
```

Run backend:
```bash
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
ng serve
```

Open → http://localhost:4200
