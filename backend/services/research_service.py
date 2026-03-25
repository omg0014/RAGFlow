from services.query_decomposer import decompose_question
from services.source_manager import SourceManager
from services.synthesis import synthesize_answer
from tools.search_tool import search_multiple_queries
from schemas.response_models import ResearchResponse, SourceResponse


def run_research(question: str) -> ResearchResponse:
    if not question or not question.strip():
        return ResearchResponse(
            answer="Please provide a valid research question.",
            sources=[], is_sufficient=False, confidence=0.0,
            queries_used=[], original_question=""
        )
    
    question = question.strip()
    decomposed = decompose_question(question)
    
    if not decomposed.queries:
        return ResearchResponse(
            answer="Unable to process your question. Please try rephrasing it.",
            sources=[], is_sufficient=False, confidence=0.0,
            queries_used=[], original_question=question
        )
    
    results_per_query = 5 if len(decomposed.queries) <= 2 else 3
    search_results = search_multiple_queries(decomposed.queries, results_per_query=results_per_query)
    
    source_manager = SourceManager()
    source_manager.add_sources_from_results(search_results)
    
    answer_text, confidence, is_sufficient = synthesize_answer(
        question=question, source_manager=source_manager
    )
    
    sources = [
        SourceResponse(
            id=s.id, url=s.url, title=s.title,
            snippet=s.snippet[:300] + "..." if len(s.snippet) > 300 else s.snippet,
            domain=s.domain
        )
        for s in source_manager.get_all_sources()
    ]
    
    return ResearchResponse(
        answer=answer_text, sources=sources, is_sufficient=is_sufficient,
        confidence=confidence, queries_used=decomposed.queries,
        original_question=question
    )


def run_research_simple(question: str) -> str:
    return run_research(question).answer
