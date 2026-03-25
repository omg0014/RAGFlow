from typing import List, Dict
from langchain.tools import tool
from langchain_community.utilities import SerpAPIWrapper
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize SerpAPI wrapper
# Requires SERPAPI_API_KEY environment variable
search = SerpAPIWrapper()

def search_with_metadata(query: str, max_results: int = 5) -> List[Dict]:
    """
    Search using SerpAPI.
    """
    if not query or not query.strip():
        return []

    try:
        # Get raw results with metadata
        # SerpAPIWrapper.results() returns the raw JSON from SerpAPI
        raw_results = search.results(query)
        
        # Extract organic results
        organic_results = raw_results.get('organic_results', [])
        
        structured_results = []
        for result in organic_results[:max_results]:
            url = result.get('link', '')
            title = result.get('title', 'Untitled')
            snippet = result.get('snippet', '')
            
            domain = 'unknown'
            if url:
                try:
                    from urllib.parse import urlparse
                    parsed = urlparse(url)
                    domain = parsed.netloc.removeprefix('www.')
                except Exception:
                    pass

            structured_results.append({
                'title': title,
                'snippet': snippet,
                'url': url,
                'domain': domain
            })
        
        return structured_results

    except Exception as e:
        print(f"Search error: {e}")
        return []

def search_multiple_queries(queries: List[str], results_per_query: int = 3) -> List[Dict]:
    all_results = []
    # Deduplicate queries roughly
    seen_queries = set()
    for query in queries:
        if query in seen_queries:
            continue
        seen_queries.add(query)
        
        results = search_with_metadata(query, max_results=results_per_query)
        all_results.extend(results)
    return all_results

@tool("web_search", return_direct=False)
def web_search_tool(query: str) -> str:
    """Search the web for current information on any topic."""
    # Use formatted results for tool output
    results = search_with_metadata(query, max_results=5)
    
    if not results:
        return "No search results found."
    
    formatted = []
    for i, r in enumerate(results, 1):
        formatted.append(f"{i}. {r['title']}")
        formatted.append(f"   URL: {r['url']}")
        formatted.append(f"   {r['snippet']}\n")
    
    return "\n".join(formatted)

@tool("google_search", return_direct=False)
def google_search(query: str) -> str:
    """Search the web (proxy to web_search_tool)."""
    return web_search_tool.invoke(query)
