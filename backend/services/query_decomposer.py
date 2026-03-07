from typing import List
from pydantic import BaseModel
from core.llm import llm


class DecomposedQueries(BaseModel):
    original_question: str
    queries: List[str]
    is_complex: bool


DECOMPOSITION_PROMPT = """Break down this question into 1-5 focused search queries.

Rules:
1. Simple questions: return 1 query
2. Complex questions: return 2-5 focused queries
3. Each query should be self-contained and searchable
4. Order by importance

Format:
COMPLEXITY: [simple|complex]
QUERIES:
- [First search query]
- [Second search query]

Question: {question}
"""


def decompose_question(question: str) -> DecomposedQueries:
    if not question or not question.strip():
        return DecomposedQueries(original_question=question, queries=[], is_complex=False)
    
    prompt = DECOMPOSITION_PROMPT.format(question=question.strip())
    
    try:
        response = llm.invoke(prompt)
        content = response.content if hasattr(response, 'content') else str(response)
        
        queries = []
        is_complex = False
        
        for line in content.strip().split('\n'):
            line = line.strip()
            if line.startswith('COMPLEXITY:'):
                is_complex = 'complex' in line.lower()
            elif line.startswith('- '):
                query = line[2:].strip()
                if query:
                    queries.append(query)
        
        if not queries:
            queries = [question.strip()]
            
        return DecomposedQueries(
            original_question=question,
            queries=queries[:5],
            is_complex=is_complex
        )
        
    except Exception:
        return DecomposedQueries(original_question=question, queries=[question.strip()], is_complex=False)
