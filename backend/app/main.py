
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import asyncio
import logging
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
    logger = logging.getLogger("main")
    try:
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
    except Exception as e:
        logger.exception("Failed to process prompt")
        # Option 1: raise HTTPException
        # raise HTTPException(status_code=500, detail="Failed to process prompt")
        # Option 2: return controlled error response
        return PromptResponse(reply="Sorry, there was an error processing your request.", sql="", viz_type="")
