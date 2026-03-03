from typing import List, Optional
from pydantic import BaseModel, Field


class SourceResponse(BaseModel):
    id: str = Field(..., description="Source identifier like [1], [2]")
    url: str
    title: str
    snippet: str
    domain: str


class ResearchResponse(BaseModel):
    answer: str = Field(..., description="Synthesized answer with inline citations")
    sources: List[SourceResponse] = Field(default_factory=list)
    is_sufficient: bool = Field(default=True)
    confidence: float = Field(default=0.8, ge=0.0, le=1.0)
    queries_used: List[str] = Field(default_factory=list)
    original_question: str = Field(default="")


class QuestionRequest(BaseModel):
    question: str
    detailed: bool = Field(default=False)
