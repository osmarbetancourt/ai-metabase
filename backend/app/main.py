from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Header
from pydantic import BaseModel
import os
import asyncio
import logging
import base64
import secrets
import time
from app.agents.metabase_agent import metabase_agent, init_metabase_metadata_cache
from agents import Runner
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()
app = FastAPI()

# Allow CORS for all origins and methods (adjust allow_origins for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your extension origin for more security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await init_metabase_metadata_cache()

MIKA_USER = os.getenv("MIKA_USER")
MIKA_PW = os.getenv("MIKA_PW")
TOKEN_EXPIRY_SECONDS = 3600  # 1 hour
_token_store = {}  # token: expiry

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    token: str
    expires_in: int

def create_token() -> str:
    raw = secrets.token_bytes(32)
    return base64.urlsafe_b64encode(raw).decode("utf-8")

def store_token(token: str):
    _token_store[token] = int(time.time()) + TOKEN_EXPIRY_SECONDS

def is_token_valid(token: str) -> bool:
    expiry = _token_store.get(token)
    if not expiry:
        return False
    if expiry < int(time.time()):
        _token_store.pop(token, None)
        return False
    return True

def get_token(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    token = authorization.split(" ", 1)[1]
    if not is_token_valid(token):
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return True

from typing import List, Optional, Dict, Any

class MessageItem(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

class PromptRequest(BaseModel):
    messages: Optional[List[MessageItem]] = None
    prompt: Optional[str] = None

class PromptResponse(BaseModel):
    reply: str
    sql: str = ""
    viz_type: str = ""


@app.get("/")
@app.get("/healthz")
async def healthcheck():
    return {"status": "ok"}

# --- LOGIN ENDPOINT ---
@app.post("/login", response_model=LoginResponse)
async def login(req: LoginRequest):
    if req.username == MIKA_USER and req.password == MIKA_PW:
        token = create_token()
        store_token(token)
        return LoginResponse(token=token, expires_in=TOKEN_EXPIRY_SECONDS)
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/ai/prompt", response_model=PromptResponse)
async def handle_prompt(req: PromptRequest, authorized: bool = Depends(get_token)):
    logger = logging.getLogger("main")
    try:
        # Accept either messages (chat history) or a single prompt
        if req.messages and isinstance(req.messages, list):
            # Convert to list of dicts for agent
            input_history = [
                {"role": m.role, "content": m.content}
                for m in req.messages
                if m.role in ("user", "assistant") and m.content
            ]
            if not input_history:
                return PromptResponse(reply="No valid messages provided.", sql="", viz_type="")
            result = await Runner.run(metabase_agent, input_history)
        elif req.prompt:
            # Fallback: treat as single-turn
            result = await Runner.run(metabase_agent, req.prompt)
        else:
            return PromptResponse(reply="No prompt or messages provided.", sql="", viz_type="")

        sql = ""
        reply = result.final_output if hasattr(result, 'final_output') else str(result)
        # Try to extract SQL from tool calls if present
        for item in getattr(result, 'new_items', []):
            if hasattr(item, 'tool_name') and item.tool_name == 'generate_sql':
                sql = item.output
        viz_type = "bar"  # Placeholder, can be improved with LLM
        return PromptResponse(reply=reply, sql=sql, viz_type=viz_type)
    except Exception as e:
        logger.exception("Failed to process prompt")
        return PromptResponse(reply="Sorry, there was an error processing your request.", sql="", viz_type="")
