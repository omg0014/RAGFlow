from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Dict, Optional
from urllib.parse import urlparse
import hashlib


@dataclass
class Source:
    id: str
    url: str
    title: str
    snippet: str
    domain: str
    accessed_at: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict:
        return {
            "id": self.id, "url": self.url, "title": self.title,
            "snippet": self.snippet, "domain": self.domain,
            "accessed_at": self.accessed_at.isoformat()
        }


class SourceManager:
    def __init__(self):
        self._sources: Dict[str, Source] = {}
        self._url_to_id: Dict[str, str] = {}
        self._counter = 0
    
    def _generate_id(self) -> str:
        self._counter += 1
        return f"[{self._counter}]"
    
    def _extract_domain(self, url: str) -> str:
        try:
            parsed = urlparse(url)
            domain = parsed.netloc
            return domain[4:] if domain.startswith('www.') else domain
        except Exception:
            return "unknown"
    
    def _url_hash(self, url: str) -> str:
        normalized = url.lower().strip().rstrip('/')
        return hashlib.md5(normalized.encode()).hexdigest()
    
    def add_source(self, url: str, title: str, snippet: str) -> Source:
        url_hash = self._url_hash(url)
        
        if url_hash in self._url_to_id:
            return self._sources[self._url_to_id[url_hash]]
        
        source_id = self._generate_id()
        source = Source(
            id=source_id, url=url, title=title or "Untitled",
            snippet=snippet or "", domain=self._extract_domain(url)
        )
        
        self._sources[source_id] = source
        self._url_to_id[url_hash] = source_id
        return source
    
    def add_sources_from_results(self, results: List[Dict]) -> List[Source]:
        sources = []
        for result in results:
            url = result.get('url', result.get('link', ''))
            if url:
                source = self.add_source(
                    url=url,
                    title=result.get('title', ''),
                    snippet=result.get('snippet', result.get('description', ''))
                )
                sources.append(source)
        return sources
    
    def get_all_sources(self) -> List[Source]:
        return list(self._sources.values())
    
    def get_source_by_id(self, source_id: str) -> Optional[Source]:
        return self._sources.get(source_id)
    
    def format_sources_for_llm(self) -> str:
        if not self._sources:
            return "No sources available."
        
        lines = ["Available Sources:"]
        for source in self._sources.values():
            lines.append(f"\n{source.id} {source.title}")
            lines.append(f"   URL: {source.url}")
            lines.append(f"   Content: {source.snippet[:500]}...")
        return "\n".join(lines)
    
    def format_citations(self) -> str:
        if not self._sources:
            return ""
        
        lines = ["\n---\n**Sources:**"]
        for source in self._sources.values():
            lines.append(f"{source.id} [{source.title}]({source.url}) - {source.domain}")
        return "\n".join(lines)
    
    def to_dict_list(self) -> List[Dict]:
        return [s.to_dict() for s in self._sources.values()]
    
    def source_count(self) -> int:
        return len(self._sources)
