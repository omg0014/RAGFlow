from typing import List, Dict, Tuple
from core.llm import llm
from services.source_manager import SourceManager


SYNTHESIS_PROMPT = """You are an expert research assistant. Synthesize information from sources into a coherent, well-cited answer.

Rules:
1. Use ONLY information from the provided sources
2. Cite sources using their IDs like [1], [2] INLINE in your answer
3. If sources conflict, mention both perspectives with citations
4. If information is insufficient, state what's missing
5. Be concise but comprehensive
6. Never make up information
7. **ANSWER ONLY IN ENGLISH**. If sources are in another language, translate relevant information to English.
8. Use Markdown formatting for better readability:
   - Use bullet points or numbered lists for steps or items
   - Use **bold** for key terms
   - Use *italics* for emphasis
   - Use tables for comparisons or structured data
   - Use > blockquotes for important notes

Question: {question}

{sources}

Format:
ANSWER:
[Your synthesized answer with inline citations and markdown formatting]

CONFIDENCE: [0.0-1.0]
SUFFICIENT: [yes/no]
"""


def synthesize_answer(question: str, source_manager: SourceManager) -> Tuple[str, float, bool]:
    sources = source_manager.get_all_sources()
    
    if not sources:
        return (
            "I couldn't find any relevant information. Please try rephrasing your question.",
            0.0,
            False
        )
    
    source_text = source_manager.format_sources_for_llm()
    prompt = SYNTHESIS_PROMPT.format(question=question, sources=source_text)
    
    try:
        response = llm.invoke(prompt)
        content = response.content if hasattr(response, 'content') else str(response)
        
        answer = ""
        confidence = 0.7
        is_sufficient = True
        
        lines = content.strip().split('\n')
        in_answer = False
        answer_lines = []
        
        for line in lines:
            line = line.strip()
            if line.startswith('ANSWER:'):
                in_answer = True
                continue
            elif line.startswith('CONFIDENCE:'):
                in_answer = False
                try:
                    conf_str = line.replace('CONFIDENCE:', '').strip()
                    confidence = float(conf_str)
                    confidence = max(0.0, min(1.0, confidence))
                except ValueError:
                    confidence = 0.7
            elif line.startswith('SUFFICIENT:'):
                suff_str = line.replace('SUFFICIENT:', '').strip().lower()
                is_sufficient = suff_str in ('yes', 'true', '1')
            elif in_answer:
                answer_lines.append(line)
        
        answer = '\n'.join(answer_lines).strip()
        
        if not answer:
            answer = content.strip()
            for marker in ['CONFIDENCE:', 'SUFFICIENT:', 'ANSWER:']:
                if marker in answer:
                    parts = answer.split(marker)
                    answer = parts[0].strip() if parts else content.strip()
        
        citation_footer = source_manager.format_citations()
        if citation_footer:
            answer = answer + "\n" + citation_footer
        
        return (answer, confidence, is_sufficient)
        
    except Exception as e:
        return (f"Error synthesizing answer: {str(e)}", 0.0, False)


def quick_answer(question: str) -> str:
    try:
        response = llm.invoke(f"Answer concisely: {question}\nIf unsure, say 'I'm not sure'.")
        return response.content if hasattr(response, 'content') else str(response)
    except Exception as e:
        return f"Unable to generate answer: {str(e)}"
