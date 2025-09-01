# Copilot Instructions for AI Assistant for Metabase

## Project Overview

This project is building an AI-powered browser extension that embeds a chat assistant called **Mika** directly into the Metabase UI (cloud or on-premise). Mika helps users generate SQL queries, create dashboards, and visualize data using natural language without modifying Metabase itself.

**Current Status**: Mika agent is fully implemented using OpenAI Agents SDK with comprehensive Metabase integration. The FastAPI backend is production-ready, and the browser extension is complete and functional. The project is now in testing and feedback phase.

## Architecture & Components

### Core Architecture
- **Browser Extension**: React + TypeScript frontend that injects a floating chat widget into Metabase pages
- **AI Backend**: FastAPI Python service that processes natural language prompts using LLMs (OpenAI)
- **Metabase API Integration**: REST API calls to create questions (cards), dashboards, and visualizations
- **Seamless Authentication**: Uses existing Metabase user sessions, no additional login required

### User Flow
1. User clicks floating chat button in Metabase
2. User types natural language request (e.g., "Show me a pie chart of payment methods last month")
3. Extension sends prompt to Mika via AI backend
4. Mika processes request using OpenAI Agents SDK and generates SQL and visualization instructions
5. Extension creates new question in Metabase via API and returns link/preview

## Tech Stack & Key Technologies

### Frontend (Browser Extension)
- **React** with **TypeScript** for UI components
- **Plasmo** or **crxjs** for browser extension framework
- **Chrome Extension APIs** for browser integration
- **CSS/Styled Components** for styling the chat widget

### Backend (AI Service)
- **FastAPI** for async Python web framework (✅ Implemented)
- **OpenAI Agents SDK** for LLM orchestration and agent logic (✅ Implemented - Mika agent)
- **Pydantic** for data validation and API schemas (✅ Implemented)
- **Python 3.8+** as base runtime (✅ Implemented)

### Integration & APIs
- **Metabase REST API** for creating cards and visualizations (dashboards planned) (✅ Implemented)
- **OpenAI API** for natural language processing and SQL generation (✅ Implemented via Agents SDK)
- **Docker** for containerized deployment (✅ Implemented)

## Development Guidelines

### Code Organization
```
/extension/          # Browser extension code (React + TypeScript)
  /src/
    /components/     # React components for chat UI
    /api/           # API client for backend communication
    /utils/         # Utility functions
    /types/         # TypeScript type definitions
  /public/          # Extension manifest and assets
  
/backend/           # FastAPI backend service
  /app/
    /api/          # FastAPI route handlers
    /agents/       # OpenAI agent logic and tools
    /models/       # Pydantic models and schemas
    /services/     # Business logic services
    /utils/        # Utility functions
  /tests/          # Backend tests
  
/docker/            # Docker configurations
/docs/              # Documentation
```

### Coding Patterns & Best Practices

#### Browser Extension Development
- Use **content scripts** to inject chat widget into Metabase pages (✅ Implemented)
- Implement **message passing** between content scripts and background scripts (✅ Implemented)
- Handle **cross-origin requests** properly with CORS (✅ Implemented)
- Store user preferences in **chrome.storage.local** (✅ Implemented)
- Use **React hooks** for state management in components (✅ Implemented)
- Implement **error boundaries** for robust error handling (✅ Implemented)
- **Plasmo framework** for modern extension development (✅ Implemented)

#### Backend Development  
- Use **async/await** patterns for all API calls and database operations
- Implement **dependency injection** with FastAPI's Depends system
- Create **Pydantic models** for request/response validation
- Use **OpenAI Agents SDK** patterns for LLM orchestration
- Implement **proper error handling** with custom exception classes
- Add **logging** throughout the application for debugging

#### API Integration
- Create **typed client classes** for Metabase API interactions
- Implement **retry logic** for API calls with exponential backoff
- Use **async HTTP clients** (httpx) for non-blocking requests
- Handle **authentication tokens** securely
- Validate **API responses** against expected schemas

### Key Libraries & Frameworks

#### Frontend Dependencies
```json
{
  "react": "^18.x",
  "typescript": "^5.x", 
  "@types/chrome": "^0.0.x",
  "plasmo": "^0.x"
}
```

#### Backend Dependencies
```python
fastapi = "^0.100.0"
openai-agents-python = "^1.x"
pydantic = "^2.x"
httpx = "^0.25.0"
uvicorn = "^0.23.0"
```

### Environment Configuration
- Use **.env files** for configuration management
- Support **OPENAI_API_KEY** environment variable
- Configure **METABASE_BASE_URL** for API endpoints (✅ Implemented as METABASE_URL)
- Configure **METABASE_TOKEN** for API authentication (✅ Implemented)
- Set **CORS_ORIGINS** for browser extension integration (✅ Implemented)

### Testing Strategy
- **Unit tests** for individual components and functions
- **Integration tests** for API endpoints and Metabase integration
- **E2E tests** for complete user workflows
- **Mock OpenAI API** responses in tests to avoid API costs

## Agent Development with OpenAI SDK

### Mika Agent Implementation
**Current Status**: Mika agent is implemented with the following tools:
- `generate_sql`: Generate SQL queries from natural language prompts
- `create_card`: Create Metabase cards with SQL and visualization types (supports database selection)
- `update_card`: Update existing Metabase cards by ID (SQL, name, visualization type)
- `list_cards_by_name`: List and search Metabase cards by name substring
- `show_metabase_context`: Access comprehensive Metabase metadata (databases, tables, fields)
- `end_conversation`: End conversation functionality

**Key Features:**
- **Multi-Database Support**: Cards can be created in specific databases by name
- **Comprehensive Metadata**: Real-time caching of all database schemas
- **Session Memory**: Maintains conversation context across interactions
- **Production Ready**: Complete error handling and logging

### Agent Architecture
- **✅ OpenAI Agents SDK** for orchestrating LLM interactions (implemented)
- **✅ Custom tools** for comprehensive Metabase API operations (full implementation)
- **✅ Metabase metadata caching** for real-time database context (implemented)
- **✅ Session memory** to maintain conversation context (implemented)
- **✅ Multi-database support** for card creation with database selection (implemented)
- **🚧 Streaming responses** for real-time chat experience (planned)

### Tool Development Patterns
```python
# Current Mika Agent Implementation
from agents import Agent, function_tool, RunContextWrapper
from typing import Optional

@function_tool
async def create_card(sql: str, name: str, viz_type: str = "table", db_name: str = None) -> dict:
    """Create a Metabase card (question) using the Metabase API."""
    return await create_metabase_card(sql, name, viz_type, db_name)

@function_tool
async def update_card(card_id: int, sql: Optional[str] = None, 
                     name: Optional[str] = None, viz_type: Optional[str] = None) -> dict:
    """Update a Metabase card by ID. Only provided fields will be changed."""
    # Real implementation with Metabase API
    
@function_tool
async def list_cards_by_name(name_substring: str) -> list:
    """List Metabase cards whose name contains the given substring."""
    # Real implementation with Metabase API

@function_tool
def show_metabase_context() -> dict:
    """Return cached Metabase metadata (databases, tables, fields) for context."""
    return METABASE_METADATA_CACHE

@function_tool  
def generate_sql(prompt: str) -> str:
    """Generate a SQL query from a natural language prompt."""
    # Implementation with pattern matching - can be enhanced with LLM

# Agent definition with all current tools
metabase_agent = Agent(
    name="Mika SQL",
    instructions="You are Mika, an AI assistant that generates SQL queries and Metabase visualizations from user prompts. You can create cards in specific databases when requested.",
    model="gpt-4o", 
    tools=[generate_sql, create_card, update_card, list_cards_by_name, end_conversation, show_metabase_context]
)
```

### Agent Best Practices
- Design **modular tools** for different Metabase operations
- Implement **input validation** using Pydantic schemas  
- Use **function calling** for structured LLM outputs
- Handle **LLM errors** gracefully with fallback responses
- Log **agent interactions** for debugging and improvement

## Metabase API Integration

### Current Implementation Status
**✅ Implemented Features:**
- Full database listing and metadata caching via `/api/database` endpoint
- Complete card creation via `/api/card` endpoint with real Metabase API
- Card updates via `/api/card/:id` endpoint (SQL, name, visualization)
- Card listing and search functionality via `/api/card` endpoint
- Comprehensive metadata fetching (databases, tables, fields) for context
- Real-time metadata caching system
- Authentication handling with API tokens
- Multi-database support for card creation with database selection
- Session-based authentication with token management

**🚧 Planned Features:**
- Dashboard operations via `/api/dashboard`
- Enhanced query execution via `/api/dataset`

### Key API Endpoints
- **✅ GET /api/database** - List databases and fetch metadata (implemented)
- **✅ POST /api/card** - Create new questions/queries (implemented)
- **✅ GET /api/card** - List and search cards (implemented)
- **✅ PUT /api/card/:id** - Update existing cards (implemented)
- **✅ POST /api/login** - Authentication and token management (implemented)
- **🚧 GET/POST /api/dashboard** - Dashboard operations (planned)
- **🚧 POST /api/dataset** - Execute queries (planned)

### API Client Pattern
```typescript
class MetabaseClient {
  constructor(private baseUrl: string, private authToken: string) {}
  
  async createCard(query: string, visualizationType: string): Promise<Card> {
    // Implementation
  }
  
  async createDashboard(cards: Card[]): Promise<Dashboard> {
    // Implementation  
  }
}
```

### Authentication Handling
**✅ Current Implementation:**
- API token-based authentication for development/testing
- Environment variable configuration for Metabase URL and tokens
- Session-based authentication with token management
- Login endpoint with credential validation
- Token storage and refresh logic

**🚧 Planned Enhancements:**
- Extract **session tokens** from existing Metabase cookies
- Implement **token refresh** logic for long-running sessions
- Handle **CORS preflight** requests properly
- Support both **cloud and on-premise** Metabase instances
- **Enhanced security validation** for production deployments

## Code Style & Standards

### TypeScript/JavaScript
- Use **strict TypeScript** configuration
- Implement **ESLint** with React and TypeScript rules
- Use **Prettier** for code formatting
- Follow **React hooks** best practices
- Use **async/await** instead of Promises for better readability

### Python
- Follow **PEP 8** style guidelines
- Use **Black** for code formatting
- Implement **type hints** throughout the codebase
- Use **ruff** for linting and code quality
- Follow **FastAPI** best practices for API design

### Git & Development Workflow
- Use **conventional commits** for clear commit messages
- Create **feature branches** for new development
- Write **descriptive PR descriptions** with context
- Include **tests** with all new features
- Update **documentation** with code changes

## Common Patterns & Examples

### Chat Widget Component
```typescript
interface ChatWidgetProps {
  onSendMessage: (message: string) => Promise<void>;
  messages: ChatMessage[];
  isLoading: boolean;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ onSendMessage, messages, isLoading }) => {
  // Implementation with proper error handling and accessibility
};
```

### Agent Tool Implementation  
```python
@tool
async def create_metabase_query(
    query_description: str,
    visualization_type: str = "table"
) -> dict:
    """Create a new Metabase query based on natural language description."""
    # Tool implementation with proper error handling
    pass
```

### API Error Handling
```python
class MetabaseAPIError(Exception):
    """Custom exception for Metabase API errors"""
    pass

async def handle_api_request(request_func):
    try:
        response = await request_func()
        return response
    except httpx.HTTPStatusError as e:
        raise MetabaseAPIError(f"API request failed: {e.response.status_code}")
```

## Security Considerations

- **Validate all user inputs** before processing
- **Sanitize SQL queries** to prevent injection attacks  
- **Use HTTPS** for all API communications
- **Store API keys** securely using environment variables
- **Implement rate limiting** for API endpoints
- **Validate extension permissions** in manifest.json

## Performance Guidelines

- **Lazy load** extension components to minimize impact
- **Cache API responses** when appropriate
- **Debounce user inputs** to reduce API calls
- **Use streaming** for LLM responses to improve perceived performance
- **Optimize bundle size** for faster extension loading

## Deployment & Operations

### Docker Configuration
- Create **multi-stage builds** for production optimization
- Use **health checks** for container monitoring
- Configure **logging drivers** for centralized logs
- Set **resource limits** appropriately

### Environment-Specific Configuration
- Support **development**, **staging**, and **production** environments
- Use **environment variables** for configuration
- Implement **feature flags** for gradual rollouts
- Configure **monitoring and alerting** for production

Remember: This project integrates AI capabilities with existing Metabase installations without requiring forks or modifications, providing a seamless natural language interface for data exploration and visualization.

## Production Readiness & Current Status

### ✅ Production-Ready Features
- **Complete Browser Extension**: React + TypeScript extension with Plasmo framework
- **Floating Chat Widget**: Modern UI with Metabase-style design and dark mode support
- **Full Backend API**: FastAPI service with comprehensive error handling and logging
- **Multi-Database Support**: Create cards in specific databases by name
- **Session Management**: Token-based authentication with automatic refresh
- **Markdown Rendering**: Rich text display with syntax-highlighted code blocks
- **Settings Management**: Popup and options pages for configuration
- **Docker Deployment**: Production-ready containerized setup

### 🧪 Current Phase: Testing & Feedback
The project has moved from development to **testing and feedback phase**. All core features are implemented and functional:
- Extension successfully injects into Metabase UI
- Chat widget provides natural language interface
- Mika agent generates SQL and creates visualizations
- Multi-database environments are fully supported
- Authentication and session management work reliably

**Focus Areas:**
- Real-world testing with different Metabase deployments
- User experience refinements and bug fixes
- Documentation improvements and examples
- Performance optimizations
- Preparation for Chrome Web Store submission

## Current Development Roadmap

### ✅ Phase 1: Core Agent Implementation (Completed)
- Mika AI agent with OpenAI Agents SDK
- FastAPI backend with `/ai/prompt` endpoint
- Complete Metabase API integration (database listing, card CRUD, metadata caching)
- Docker containerization setup
- Advanced SQL generation from natural language
- Comprehensive tool set: create_card, update_card, list_cards_by_name, show_metabase_context
- Multi-database support for card creation

### ✅ Phase 2: Enhanced Integration (Completed)
- Browser extension frontend development (React + TypeScript with Plasmo)
- Session memory for conversation context
- Authentication and security validation with token management
- Complete browser extension UI with floating chat widget
- Markdown/code rendering with syntax highlighting
- Database selection functionality for multi-database environments
- Production-ready error handling and logging

### 🚧 Phase 3: Production Features (In Progress)
- Dashboard operations and advanced visualization features
- Enhanced natural language processing for complex queries
- Performance optimizations and caching improvements
- Comprehensive testing and error handling
- Production deployment configurations
- Chrome Web Store preparation and submission