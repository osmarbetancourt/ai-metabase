from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
import asyncio
from app.agents.metabase_agent import metabase_agent
from agents import Runner

load_dotenv()
app = FastAPI()

class PromptRequest(BaseModel):
    prompt: str

class PromptResponse(BaseModel):
    reply: str
    sql: str = ""
    viz_type: str = ""

@app.get("/")
async def healthcheck():
    return {"status": "ok"}

@app.get("/healthz")
async def healthcheck():
    return {"status": "ok"}

@app.post("/ai/prompt", response_model=PromptResponse)
async def handle_prompt(req: PromptRequest):
    # Use the agent to generate SQL from the prompt
    result = await Runner.run(metabase_agent, req.prompt)
    sql = ""
    reply = result.final_output if hasattr(result, 'final_output') else str(result)
    # Try to extract SQL from tool calls if present
    for item in getattr(result, 'new_items', []):
        if hasattr(item, 'tool_name') and item.tool_name == 'generate_sql':
            sql = item.output
    viz_type = "bar"  # Placeholder, can be improved with LLM
    return PromptResponse(reply=reply, sql=sql, viz_type=viz_type)
