# Copilot Instructions for AI Assistant for Metabase

## Project Overview

This project is building an AI-powered browser extension that embeds a chat assistant directly into the Metabase UI (cloud or on-premise). The assistant helps users generate SQL queries, create dashboards, and visualize data using natural language without modifying Metabase itself.

## Architecture & Components

### Core Architecture
- **Browser Extension**: React + TypeScript frontend that injects a floating chat widget into Metabase pages
- **AI Backend**: FastAPI Python service that processes natural language prompts using LLMs (OpenAI)
- **Metabase API Integration**: REST API calls to create questions (cards), dashboards, and visualizations
- **Seamless Authentication**: Uses existing Metabase user sessions, no additional login required

### User Flow
1. User clicks floating chat button in Metabase
2. User types natural language request (e.g., "Show me a pie chart of payment methods last month")
3. Extension sends prompt to AI backend
4. Backend generates SQL and visualization instructions using LLM
5. Extension creates new question in Metabase via API and returns link/preview

## Tech Stack & Key Technologies

### Frontend (Browser Extension)
- **React** with **TypeScript** for UI components
- **Plasmo** or **crxjs** for browser extension framework
- **Chrome Extension APIs** for browser integration
- **CSS/Styled Components** for styling the chat widget

### Backend (AI Service)
- **FastAPI** for async Python web framework
- **OpenAI Agents SDK** for LLM orchestration and agent logic
- **Pydantic** for data validation and API schemas
- **Python 3.8+** as base runtime

### Integration & APIs
- **Metabase REST API** for creating cards, dashboards, and visualizations
- **OpenAI API** for natural language processing and SQL generation
- **Docker** for containerized deployment

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
- Use **content scripts** to inject chat widget into Metabase pages
- Implement **message passing** between content scripts and background scripts
- Handle **cross-origin requests** properly with CORS
- Store user preferences in **chrome.storage.local**
- Use **React hooks** for state management in components
- Implement **error boundaries** for robust error handling

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
  "plasmo": "^0.x" // or "crxjs/vite-plugin": "^2.x"
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
- Configure **METABASE_BASE_URL** for API endpoints
- Set **CORS_ORIGINS** for browser extension integration

### Testing Strategy
- **Unit tests** for individual components and functions
- **Integration tests** for API endpoints and Metabase integration
- **E2E tests** for complete user workflows
- **Mock OpenAI API** responses in tests to avoid API costs

## Agent Development with OpenAI SDK

### Agent Architecture
- Use **OpenAI Agents SDK** for orchestrating LLM interactions
- Implement **custom tools** for Metabase API operations
- Use **session memory** to maintain conversation context
- Implement **streaming responses** for real-time chat experience

### Tool Development Patterns
```python
from openai import OpenAI
from pydantic import BaseModel

class MetabaseQueryTool(BaseModel):
    """Tool for creating Metabase queries"""
    query: str
    visualization_type: str
    
    def execute(self) -> dict:
        # Implementation for Metabase API calls
        pass
```

### Agent Best Practices
- Design **modular tools** for different Metabase operations
- Implement **input validation** using Pydantic schemas  
- Use **function calling** for structured LLM outputs
- Handle **LLM errors** gracefully with fallback responses
- Log **agent interactions** for debugging and improvement

## Metabase API Integration

### Key API Endpoints
- **POST /api/card** - Create new questions/queries
- **GET/POST /api/dashboard** - Dashboard operations
- **GET /api/database** - Database metadata
- **POST /api/dataset** - Execute queries
- **GET /api/session/current** - User authentication info

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
- Extract **session tokens** from existing Metabase cookies
- Implement **token refresh** logic for long-running sessions
- Handle **CORS preflight** requests properly
- Support both **cloud and on-premise** Metabase instances

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