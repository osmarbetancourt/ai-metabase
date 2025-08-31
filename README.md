

# AI Assistant for Metabase – Browser Extension

![Python](https://img.shields.io/badge/python-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/fastapi-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/react-20232A?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/typescript-3178C6?logo=typescript&logoColor=white)
![OpenAI](https://img.shields.io/badge/openai-412991?logo=openai&logoColor=white)
![LLM](https://img.shields.io/badge/llm-FFD700?logo=google&logoColor=black)
![Browser Extension](https://img.shields.io/badge/browser--extension-4285F4?logo=googlechrome&logoColor=white)
![Metabase](https://img.shields.io/badge/metabase-509EE3?logo=metabase&logoColor=white)
![Chatbot](https://img.shields.io/badge/chatbot-00BFAE?logo=wechat&logoColor=white)

## Overview

This project aims to build a browser extension that embeds an AI-powered chat assistant called **Mika** directly into the Metabase UI (cloud or on-premise). Mika helps users generate SQL queries, create dashboards, and visualize data using natural language, all without modifying or forking Metabase itself.

## Main Idea

- **Browser Extension (React + TypeScript):** Injects a floating chat widget into every Metabase page. Handles user prompts and displays AI responses from Mika.
- **AI Backend (FastAPI, Python):** Receives prompts, uses Mika (powered by OpenAI Agents SDK) to interpret intent, generate SQL, and suggest visualizations.
- **Metabase API Integration:** The extension or backend uses the authenticated Metabase REST API to create questions (cards), dashboards, and set visualization types (bar, pie, funnel, etc.).
- **Seamless Experience:** Users interact with Mika as themselves, leveraging their existing Metabase session for authentication. No extra login required.

## Why This Approach?
- No need to maintain a fork of Metabase.
- Works with all Metabase deployments and upgrades.
- Maximum flexibility: inject custom UI, communicate with APIs, and overlay new features.
- Easy to enable/disable per user or organization.

## Example User Flow
1. User clicks the floating chat button in Metabase.
2. User types a request (e.g., "Show me a pie chart of payment methods last month").
3. Extension sends the prompt to Mika via the AI backend.
4. Mika processes the request and returns SQL and visualization instructions.
5. Extension creates a new question in Metabase via the API, sets the visualization, and returns a link or preview to the user.

## Tech Stack
- **Browser Extension:** React + TypeScript (Plasmo or crxjs)
- **AI Backend:** Python (FastAPI) with Mika agent powered by OpenAI Agents SDK
- **Metabase API:** REST endpoints for cards, dashboards, and visualizations

## Current Implementation Status

### ✅ Completed Features
- **Mika Agent**: AI assistant implemented using OpenAI Agents SDK with the following capabilities:
  - Generate SQL queries from natural language prompts
  - Create Metabase cards (questions) with SQL and visualization types
  - List available Metabase databases via REST API
  - End conversation functionality
- **FastAPI Backend**: RESTful API with `/ai/prompt` endpoint for processing user requests
- **Docker Configuration**: Ready-to-deploy containerized setup with docker-compose

### 🚧 In Development
- Browser extension frontend (React + TypeScript)
- Session memory for conversation context
- Basic authentication and security validation
- Enhanced Metabase API integration (card updates, retrieval)
- Advanced SQL generation and visualization suggestions


## Agents & LLM Orchestration Resources

- **OpenAI Agents SDK (Python):**
	- [OpenAI Agents SDK Documentation](https://openai.github.io/openai-agents-python/)
	- [GitHub Repository](https://github.com/openai/openai-agents-python)
	- [Quickstart Guide](https://openai.github.io/openai-agents-python/quickstart/)
	- [Function Tools](https://openai.github.io/openai-agents-python/tools/#function-tools)
	- [Custom Tool Example](https://openai.github.io/openai-agents-python/tools/#custom-function-tools)
	- [Agent Orchestration](https://openai.github.io/openai-agents-python/tools/#agents-as-tools)
	- [Session Memory](https://openai.github.io/openai-agents-python/sessions/)
	- [Streaming & Results](https://openai.github.io/openai-agents-python/streaming/)
	- [Best Practices](https://openai.github.io/openai-agents-python/usage/)

- **Related Concepts:**
	- [Pydantic](https://docs.pydantic.dev/) (for tool input validation)
	- [FastAPI](https://fastapi.tiangolo.com/) (for async Python APIs)
	- [OpenAI Python API](https://platform.openai.com/docs/api-reference)

These resources will help you implement, extend, and maintain the agent logic and LLM orchestration in the backend.

## Next Steps
- ✅ Set up the FastAPI backend with Mika agent
- ✅ Implement basic Metabase API integration (database listing, card creation)
- ✅ Configure Docker containerization
- 🚧 Scaffold the browser extension (React + TypeScript)
- 🚧 Build the chat widget UI with Mika integration
- 🚧 Implement session memory for conversation context
- 🚧 Add basic authentication and security validation
- 🚧 Enhanced Metabase API calls (card updates, retrieval, dashboard operations)
- 🚧 Polish, test, and expand functionality

