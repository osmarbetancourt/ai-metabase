import os
import logging
from agents import Agent, Runner, function_tool, RunContextWrapper
from pydantic import BaseModel
from typing import Optional
import httpx
from dotenv import load_dotenv
import asyncio

# Load environment variables
load_dotenv()

METABASE_URL = os.getenv("METABASE_URL")
METABASE_TOKEN = os.getenv("METABASE_TOKEN")

# Global cache for Metabase metadata
METABASE_METADATA_CACHE = {}

async def fetch_metabase_metadata():
    """
    Fetch all databases, tables, and fields from Metabase and cache them.
    Use this tool to get the latest metadata from Metabase and have the context whenever an user asks a question related to DBs
    """
    logger = logging.getLogger("metabase_agent")
    if not METABASE_URL or not METABASE_TOKEN:
        logger.error("Metabase URL or token not configured for metadata fetch.")
        return
    headers = {"X-API-Key": METABASE_TOKEN}
    try:
        async with httpx.AsyncClient() as client:
            # Get all databases
            db_url = f"{METABASE_URL}/api/database"
            db_resp = await client.get(db_url, headers=headers, timeout=10)
            db_resp.raise_for_status()
            db_json = db_resp.json()
            if isinstance(db_json, list):
                dbs = db_json
            elif isinstance(db_json, dict) and "data" in db_json:
                dbs = db_json["data"]
            else:
                dbs = []
            # For each database, get tables and fields
            metadata = {"databases": []}
            for db in dbs:
                db_id = db.get("id")
                db_entry = {"id": db_id, "name": db.get("name"), "tables": []}
                if db_id is not None:
                    tables_url = f"{METABASE_URL}/api/database/{db_id}/metadata"
                    tables_resp = await client.get(tables_url, headers=headers, timeout=10)
                    tables_resp.raise_for_status()
                    tables_json = tables_resp.json()
                    for table in tables_json.get("tables", []):
                        table_entry = {
                            "id": table.get("id"),
                            "name": table.get("name"),
                            "fields": [
                                {"id": f.get("id"), "name": f.get("name"), "display_name": f.get("display_name"), "base_type": f.get("base_type")} for f in table.get("fields", [])
                            ]
                        }
                        db_entry["tables"].append(table_entry)
                metadata["databases"].append(db_entry)
            METABASE_METADATA_CACHE.clear()
            METABASE_METADATA_CACHE.update(metadata)
            logger.info(f"Fetched and cached Metabase metadata: {len(metadata['databases'])} databases.")
    except Exception as e:
        logger.error(f"Error fetching Metabase metadata: {e}", exc_info=True)

# Startup: fetch metadata and cache it
def _startup_metadata_cache():
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.ensure_future(fetch_metabase_metadata())
        else:
            loop.run_until_complete(fetch_metabase_metadata())
    except Exception as e:
        logging.getLogger("metabase_agent").error(f"Failed to fetch Metabase metadata at startup: {e}")

_startup_metadata_cache()




# Real Metabase API interaction: create a card (question) with SQL, viz type, name, and visualization_settings
async def create_metabase_card(sql: str, name: str, viz_type: str = "table") -> dict:
    """
    Create a Metabase card (question) using the API. Required fields: name, dataset_query, display. visualization_settings is always set to {}.
    """
    logger = logging.getLogger("metabase_agent")
    if not METABASE_URL or not METABASE_TOKEN:
        logger.error("Metabase URL or token not configured for card creation.")
        return {"error": "Metabase URL or token not configured."}
    db_id = None
    if METABASE_METADATA_CACHE.get("databases"):
        db_id = METABASE_METADATA_CACHE["databases"][0].get("id")
    if not db_id:
        logger.error("No database found in cached metadata.")
        return {"error": "No database found in cached metadata."}
    url = f"{METABASE_URL}/api/card"
    headers = {"X-API-Key": METABASE_TOKEN, "Content-Type": "application/json"}
    payload = {
        "name": name,
        "dataset_query": {
            "type": "native",
            "native": {"query": sql},
            "database": db_id
        },
        "display": viz_type or "table",
        "visualization_settings": {}
    }
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, headers=headers, json=payload, timeout=15)
            logger.info(f"Metabase card creation status: {resp.status_code}")
            resp.raise_for_status()
            data = resp.json()
            card_id = data.get("id")
            card_url = f"{METABASE_URL}/card/{card_id}" if card_id else None
            return {"card_id": card_id, "url": card_url, "viz_type": viz_type, "raw": data}
    except httpx.HTTPStatusError as e:
        logger.error(f"Metabase API error: {e.response.status_code} {e.response.text}")
        return {"error": f"Metabase API error: {e.response.status_code} {e.response.text}"}
    except Exception as e:
        logger.error(f"Error creating Metabase card: {e}", exc_info=True)
        return {"error": f"Error creating Metabase card: {e}"}

# Tool: List Metabase cards by name substring
@function_tool
async def list_cards_by_name(name_substring: str) -> list:
    """
    List all Metabase cards (questions) whose name contains the given substring (case-insensitive).
    Returns a list of dicts with card id, name, and URL.
    """
    logger = logging.getLogger("metabase_agent")
    if not METABASE_URL or not METABASE_TOKEN:
        logger.error("Metabase URL or token not configured.")
        return []
    url = f"{METABASE_URL}/api/card"
    headers = {"X-API-Key": METABASE_TOKEN}
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=headers, timeout=15)
            resp.raise_for_status()
            cards = resp.json()
            # Filter by name substring (case-insensitive)
            result = []
            for card in cards:
                if name_substring.lower() in card.get("name", "").lower():
                    result.append({
                        "id": card.get("id"),
                        "name": card.get("name"),
                        "url": f"{METABASE_URL}/card/{card.get('id')}"
                    })
            return result
    except Exception as e:
        logger.error(f"Error listing cards: {e}", exc_info=True)
        return []

# Tool: Update Metabase card (by ID)
@function_tool
async def update_card(
    card_id: int,
    sql: Optional[str] = None,
    name: Optional[str] = None,
    viz_type: Optional[str] = None
) -> dict:
    """
    Update a Metabase card (question) by ID. You can update the SQL, name, and/or visualization type.
    Only provided fields will be changed. Returns updated card info or error.
    """
    logger = logging.getLogger("metabase_agent")
    if not METABASE_URL or not METABASE_TOKEN:
        logger.error("Metabase URL or token not configured.")
        return {"error": "Metabase URL or token not configured."}
    url = f"{METABASE_URL}/api/card/{card_id}"
    headers = {"X-API-Key": METABASE_TOKEN, "Content-Type": "application/json"}
    # Get current card
    try:
        async with httpx.AsyncClient() as client:
            get_resp = await client.get(url, headers=headers, timeout=15)
            get_resp.raise_for_status()
            card = get_resp.json()
            # Update fields if provided
            if sql:
                if "dataset_query" in card:
                    card["dataset_query"]["native"]["query"] = sql
            if name:
                card["name"] = name
            if viz_type:
                card["display"] = viz_type
            # Always set visualization_settings to {}
            card["visualization_settings"] = {}
            put_resp = await client.put(url, headers=headers, json=card, timeout=15)
            put_resp.raise_for_status()
            updated = put_resp.json()
            return {"id": updated.get("id"), "name": updated.get("name"), "url": f"{METABASE_URL}/card/{updated.get('id')}", "raw": updated}
    except Exception as e:
        logger.error(f"Error updating card: {e}", exc_info=True)
        return {"error": f"Error updating card: {e}"}

# Tool: Generate SQL from prompt
@function_tool
def generate_sql(prompt: str) -> str:
    """
    Generate a SQL query from a natural language prompt.
    """
    if "payment methods" in prompt.lower():
        return "SELECT payment_method, COUNT(*) FROM payments GROUP BY payment_method;"
    return "SELECT * FROM users LIMIT 10;"



# Tool: Create Metabase card (async, uses real API)
@function_tool
async def create_card(
        sql: str,
        name: str,
        viz_type: str = "table"
) -> dict:
        """
        Create a Metabase card (question) using the Metabase API.
        Required fields: sql, name, viz_type.

        - name: The card's name (required).
        - sql: The SQL query (required).
        - viz_type: Visualization type (required, default "table").
            Supported types: "table", "bar", "line", "area", "pie", "scatter", "funnel", "number", "map", "pivot", "progress", "combo", "gauge".

        Example usage:
            create_card(sql="SELECT ...", name="My Card", viz_type="bar")
        """
        return await create_metabase_card(sql, name, viz_type)


# Tool: Return current Metabase metadata context
@function_tool
def show_metabase_context() -> dict:
    """
    Return the current cached Metabase metadata (databases, tables, fields) for Mika's context.
    Always use this tool to get the latest metadata from Metabase and have the context whenever an user asks a question to make a SQL query
    """
    return METABASE_METADATA_CACHE

# Tool: End conversation (for future use)
@function_tool
def end_conversation(ctx: RunContextWrapper) -> str:
    """
    End the conversation with the user.
    """
    ctx.conversation_ended = True
    return "Conversation ended."

# Agent definition (no developer arg)
metabase_agent = Agent(
    name="Mika SQL",
    instructions="""
    You are Mika, an AI assistant that generates SQL queries and Metabase visualizations from user prompts.
    Use the available tools to generate SQL, create Metabase cards, update cards, list cards by name, and show your current context as needed.
    """,
    model="gpt-5-nano",
    tools=[generate_sql, create_card, update_card, list_cards_by_name, end_conversation, show_metabase_context]
)

# Helper to inject metadata context for agent runs
def get_metabase_agent_context(extra: Optional[dict] = None) -> dict:
    ctx = {"metabase_metadata": METABASE_METADATA_CACHE}
    if extra:
        ctx.update(extra)
    return ctx
