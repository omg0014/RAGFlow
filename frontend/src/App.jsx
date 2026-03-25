import { useState, useEffect } from 'react'
import { askQuestion } from './services/api'
import { Search, Loader2, Sparkles, BookOpen, Clock } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState(null)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [searchStep, setSearchStep] = useState(0)

  const steps = [
    "Analyzing research vector...",
    "Curating authoritative sources...",
    "Synthesizing editorial response..."
  ]

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    setError(null)
    setResponse(null)
    setSearchStep(0)

    const stepInterval = setInterval(() => {
      setSearchStep(prev => {
        if (prev < steps.length - 1) return prev + 1
        return prev
      })
    }, 1200)

    try {
      const result = await askQuestion(query)
      clearInterval(stepInterval)
      setSearchStep(steps.length)

      setTimeout(() => {
        setResponse(result)
        setIsLoading(false)
      }, 600)
    } catch (err) {
      clearInterval(stepInterval)
      setError(err.message || 'An error occurred during synthesis.')
      setIsLoading(false)
    }
  }

  return (
    <div className="container animate-fade-in">
      <div className="centered-hub">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16 relative animate-fade-in mt-4">
          <img 
            src="/logo.png" 
            alt="RAGFlow Logo" 
            style={{ 
              height: '8.5rem', 
              width: 'auto', 
              marginBottom: '1.5rem', 
              filter: 'drop-shadow(0 12px 24px rgba(63,99,120,0.15))',
              transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }} 
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          />
          <h2 className="font-display text-headline-md text-primary mb-3 tracking-tight">
            Research Assistant
          </h2>
          <br></br>
          <p className="font-body text-body-lg text-secondary max-w-lg leading-relaxed">
             Ask any question to synthesize authoritative insights instantly.
          </p>
          <br></br>
        </div>

        {/* Search Input Area */}
        <div className="mb-12">
          <form onSubmit={handleSearch} className="search-container">
            <Search className="search-icon" size={24} />
            <input
              type="text"
              className="search-input"
              placeholder="What would you like to explore?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" className="btn-search" disabled={isLoading || !query.trim()}>
              {isLoading && searchStep < steps.length ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Synthesize</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Status Indications */}
        {error && (
          <div className="surface-card card-error p-6 mb-8 animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <p className="font-body font-medium">{error}</p>
            </div>
          </div>
        )}

        {isLoading && !error && (
          <div className="mb-12 flex flex-col items-center justify-center gap-4 animate-fade-in">
             <div className="flex items-center gap-3 text-accent font-display font-semibold text-lg animate-pulse">
                <Loader2 size={24} className="animate-spin" />
                <span>{steps[Math.min(searchStep, steps.length - 1)]}</span>
             </div>
          </div>
        )}

        {/* Curation Results */}
        {response && !isLoading && (
          <div className="flex flex-col gap-12 animate-fade-in">
            
            {/* Answer Region */}
            <div className="surface-card p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="text-accent" size={24} />
                  <h2 className="font-display text-headline-md text-primary">Synthesis</h2>
                </div>
                {response.confidence !== null && response.confidence !== undefined && (
                  <span className="badge badge-confidence">
                    {Math.round(response.confidence * 100)}% Confidence
                  </span>
                )}
              </div>
              
              <div className="scroll-area">
                <div className="prose">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {response.answer}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            {/* Sources Region */}
            {response.sources && response.sources.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen className="text-secondary" size={24} />
                  <h3 className="font-display text-headline-md text-primary">Curated Sources</h3>
                </div>
                
                <div className="source-grid">
                  {response.sources.map((source, index) => (
                    <a
                      key={index}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="source-card source-link"
                    >
                      <h4 className="source-title">
                        {source.title || source.url}
                      </h4>
                      <p className="source-snippet">
                        {source.snippet || source.url}
                      </p>
                      <span className="source-domain">
                        {new URL(source.url).hostname.replace('www.', '')}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        )}
      </div>
    </div>
  )
}

export default App
