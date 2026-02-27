import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas.response_models import ResearchResponse, QuestionRequest
from services.research_service import run_research


app = FastAPI(
    title="Research Assistant API",
    description="AI research assistant with web search and citation support",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "Research Assistant API is running",
        "version": "2.0.0",
        "endpoints": {"POST /ask": "Submit a research question", "GET /health": "Health check"}
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "research-assistant"}


@app.post("/ask", response_model=ResearchResponse)
async def ask_question(request: QuestionRequest) -> ResearchResponse:
    try:
        if not request.question or not request.question.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty")
        
        response = await asyncio.to_thread(run_research, request.question)
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Research failed: {str(e)}")


@app.post("/ask/simple")
async def ask_question_simple(request: QuestionRequest) -> dict:
    try:
        response = await asyncio.to_thread(run_research, request.question)
        return {"answer": response.answer}
    except Exception as e:
        return {"answer": f"Error: {str(e)}"}