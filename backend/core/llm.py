from langchain_groq import ChatGroq
from core.config import GROQ_API_KEY

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    groq_api_key=GROQ_API_KEY,
    temperature=0.2,
    max_retries=3,
)
