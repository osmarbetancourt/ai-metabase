

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

### ✅ Completed & Working Features
- **Mika Agent**: AI assistant implemented using OpenAI Agents SDK with the following capabilities:
	- Generate SQL queries from natural language prompts
	- Create Metabase cards (questions) with SQL and visualization types
	- Update existing Metabase cards by ID (SQL, name, visualization type)
	- List and search Metabase cards by name
	- Access comprehensive Metabase metadata (databases, tables, fields)
	- End conversation functionality
- **FastAPI Backend**: RESTful API with `/ai/prompt` endpoint for processing user requests
- **Full Metabase API Integration**: Complete CRUD operations for cards, real-time metadata caching
- **Browser Extension Frontend**: Modern React + TypeScript UI, floating chat widget, robust Markdown/code rendering, Metabase-style UX
- **Authentication & Security**: Uses Metabase session, supports API tokens, secure storage
- **Dashboard Operations & Advanced Visualizations**: Create and update dashboards, set visualization types (bar, pie, funnel, etc.)
- **Session Memory**: Maintains conversation context for more natural chat
- **Docker Configuration**: Ready-to-deploy containerized setup with docker-compose

### 🚦 Testing & Feedback Phase
- The core features are implemented and working.
- The project is now in the testing, feedback, and polish phase.
- Please report bugs, suggest improvements, and help with real-world testing!

---



## How to Use (Local/Manual Installation)

You can use the Mika Metabase extension locally without waiting for Chrome Web Store approval. Here’s how to set up and use it step by step:

### 1. Clone the Repository

```
git clone https://github.com/osmarbetancourt/ai-metabase.git
cd ai-metabase
```

### 2. Start the AI Backend (FastAPI)

You need Python 3.8+ and Docker (recommended) or you can run it directly:

**With Docker (recommended):**

```
docker compose up fastapi-backend -d
```

**Or manually:**

```
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The backend will start on `http://localhost:8000` by default.

### 3. Build the Browser Extension

Open a new terminal and go to the extension folder:

```
cd extension
npm install
npm run build
```

This will generate a `build` or `dist` folder (depending on your setup) inside the `extension` directory.

### 4. Load the Extension in Your Browser

**For Chrome/Edge:**
1. Go to `chrome://extensions` (or `edge://extensions`).
2. Enable “Developer mode” (top right).
3. Click “Load unpacked.”
4. Select the `build` or `dist` folder inside `extension` (not the whole repo).
5. The Mika Metabase extension should now appear in your browser.

### 5. Configure the Extension

1. Click the extension icon in your browser toolbar.
2. Set the **AI Backend URL** (e.g., `http://localhost:8000`) and your **Mika API token** (if required).
3. Save your settings.

### 6. Use Mika in Metabase

1. Go to your Metabase instance in your browser.
2. You’ll see the Mika chat widget floating in the bottom right corner.
3. Click it, ask questions, and Mika will help you generate SQL, create dashboards, and more!

---

**Troubleshooting:**
- Make sure the backend is running and accessible from your browser.
- If you change backend settings, reload the extension or the Metabase page.
- For any issues, check the browser console and backend logs for errors.

---

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
- 🧪 More real-world testing and user feedback
- Bugfixes and UI/UX polish
- Documentation improvements
- Prepare for public release (optional: Chrome Web Store, Edge Add-ons, etc.)

