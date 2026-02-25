# Research Assistant with Web Search + LLM Synthesis

An AI-powered research assistant that answers questions by searching the web, gathering information, and synthesizing coherent answers with proper citations.

## Features

- **Query Decomposition**: Breaks complex questions into focused search queries
- **Web Search Integration**: Uses DuckDuckGo for real-time web search
- **Source Tracking**: Deduplicates and tracks all sources with unique IDs
- **LLM Synthesis**: Uses Google Gemini to synthesize coherent answers
- **Citation System**: Inline citations `[1]`, `[2]` with full source list
- **Confidence Scoring**: Reports confidence level (0.0-1.0) in the answer
- **Insufficient Info Handling**: Gracefully handles cases with limited information
- **Modern React UI**: Clean, responsive dark-themed frontend

## Project Structure

```
WEB-RAG/
├── backend/               # FastAPI Backend
│   ├── main.py           # FastAPI application
│   ├── requirements.txt  # Python dependencies
│   ├── .env              # Environment variables (GOOGLE_API_KEY)
│   ├── core/             # Configuration and LLM setup
│   ├── agents/           # LangChain agent setup
│   ├── services/         # Query decomposition, synthesis, research service
│   ├── schemas/          # Request/Response models
│   ├── tools/            # Web search integration
│   └── utils/            # Error handling utilities
│
└── frontend/              # React Frontend (Vite)
    ├── package.json
    ├── src/
    │   ├── App.jsx       # Main application component
    │   ├── index.css     # Design system & base styles
    │   ├── services/     # API service layer
    │   └── components/   # UI Components
    │       ├── SearchInput/      # Question input field
    │       ├── LoadingSpinner/   # Loading animation
    │       ├── AnswerDisplay/    # Answer with citations
    │       ├── SourceCard/       # Source citation cards
    │       ├── ConfidenceMeter/  # Confidence score display
    │       └── QueryTags/        # Search queries used
    └── ...
```

## Quick Start

### 1. Setup Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create `.env` file:
```
GOOGLE_API_KEY=your_google_api_key_here
```

### 2. Setup Frontend

```bash
cd frontend
npm install
```

### 3. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload
```
Backend runs at: http://localhost:8000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs at: http://localhost:5173

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API info |
| `/health` | GET | Health check |
| `/ask` | POST | Submit research question |
| `/ask/simple` | POST | Simplified response |

### Example Request

```bash
curl -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What are the benefits of renewable energy?"}'
```

## Technologies

| Layer | Technologies |
|-------|-------------|
| **Backend** | FastAPI, Python 3.13, LangChain, Google Gemini |
| **Search** | DuckDuckGo (free, no API key) |
| **Frontend** | React, Vite, CSS Variables |
| **Validation** | Pydantic |

## License

MIT
