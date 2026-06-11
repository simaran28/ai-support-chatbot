from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import TextLoader
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_groq import ChatGroq
from langchain_community.embeddings import HuggingFaceEmbeddings
from dotenv import load_dotenv
import os

load_dotenv()

# embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
embeddings = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2",
    model_kwargs={"device": "cpu"},
    encode_kwargs={"normalize_embeddings": False}
)

llm = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),
    model=os.getenv("GROQ_MODEL", "llama-3.1-8b-instant"),
    temperature=0.2,
)

VECTORSTORE_PATH = "/tmp/vectorstore"

def ingest_document(file_path: str):
    loader = TextLoader(file_path)
    documents = loader.load()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    chunks = splitter.split_documents(documents)

    Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=VECTORSTORE_PATH,
        collection_name="support_docs"
    )
    return len(chunks)

def chat_with_rag(question: str, history: list):
    vectorstore = Chroma(
        persist_directory=VECTORSTORE_PATH,
        embedding_function=embeddings,
        collection_name="support_docs"
    )
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    chunks = retriever.invoke(question)
    context = "\n\n".join([c.page_content for c in chunks])

    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are a helpful customer support assistant.
Answer the question using ONLY the context provided below.
Be polite, clear and concise in your answer.
If the answer is not found in the context, say:
'I am sorry, I do not have information about that. Please contact our support team.'

Context:
{context}"""),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{question}")
    ])

    chain = prompt | llm | StrOutputParser()

    response = chain.invoke({
        "context": context,
        "chat_history": history,
        "question": question
    })

    sources = list(set([
        c.metadata.get("source", "document").split("/")[-1]
        for c in chunks
    ]))

    return response, sources