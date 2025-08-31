
import os
import logging
from agents import Agent, Runner, function_tool, RunContextWrapper
from pydantic import BaseModel
from typing import Optional
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

METABASE_URL = os.getenv("METABASE_URL")
METABASE_TOKEN = os.getenv("METABASE_TOKEN")


# Placeholder for Metabase API interaction (to be implemented)
def create_metabase_card(sql: str, viz_type: str = "bar") -> dict:
    # TODO: Implement actual Metabase API call
    return {"card_id": 123, "url": f"{METABASE_URL}/card/123", "viz_type": viz_type}

# Tool: List Metabase databases
@function_tool
async def list_metabase_databases() -> str:
    """
    List all databases available in Metabase using the REST API.
    """
    logger = logging.getLogger("metabase_agent")
    if not METABASE_URL or not METABASE_TOKEN:
        logger.error("Metabase URL or token not configured.")
        return "Metabase URL or token not configured."
    url = f"{METABASE_URL}/api/database"
    headers = {"X-API-Key": METABASE_TOKEN}
    logger.info(f"Attempting to connect to Metabase at {url} with token {METABASE_TOKEN[:8]}... (truncated)")
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=headers, timeout=10)
            logger.info(f"Metabase API response status: {resp.status_code}")
            resp.raise_for_status()
            resp_json = resp.json()
            dbs = resp_json.get("data", [])
            logger.info(f"Received databases: {dbs}")
            names = [db.get("name", "(no name)") for db in dbs]
            return "Databases: " + ", ".join(names)
    except Exception as e:
        logger.error(f"Error listing databases: {e}", exc_info=True)
        return f"Error listing databases: {e}"

# Tool: Generate SQL from prompt
@function_tool
def generate_sql(prompt: str) -> str:
    """
    Generate a SQL query from a natural language prompt.
    """
    if "payment methods" in prompt.lower():
        return "SELECT payment_method, COUNT(*) FROM payments GROUP BY payment_method;"
    return "SELECT * FROM users LIMIT 10;"

# Tool: Create Metabase card
@function_tool
def create_card(sql: str, viz_type: str = "bar") -> dict:
    """
    Create a Metabase card (question) with the given SQL and visualization type.
    """
    return create_metabase_card(sql, viz_type)

# Tool: End conversation (for future use)
@function_tool
def end_conversation(ctx: RunContextWrapper) -> str:
    """
    End the conversation with the user.
    """
    ctx.conversation_ended = True
    return "Conversation ended."

# Agent definition
metabase_agent = Agent(
    name="Mika SQL",
    instructions="""
    You are Mika, an assistant that generates SQL queries and Metabase visualizations from user prompts.
    Use the available tools to generate SQL, list Metabase databases, and create Metabase cards as needed.
    If the user wants to end the conversation, use the end_conversation tool.
    To show the user all available databases, use the list_metabase_databases tool.
    """,
    model="gpt-5-nano",
    tools=[generate_sql, create_card, end_conversation, list_metabase_databases]
)
