import os, json, re
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Any
from dotenv import load_dotenv

load_dotenv()

from groq import Groq
from models.user import User
from middleware.auth import protect

router = APIRouter()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"

AGENT_SYSTEM = """You are Compass, an elite AI travel agent inside Roamly. You are witty, opinionated, and deeply knowledgeable about travel. Always be specific with real names, prices, and tips."""

TOOLS = {
    "vibe_search":       "Find destinations matching a travel vibe or feeling",
    "get_weather":       "Get weather and best time to visit a destination",
    "get_country_info":  "Get visa, currency, language, safety info for a country",
    "build_itinerary":   "Build a detailed day-by-day itinerary",
    "budget_truth":      "Get honest budget breakdown for a destination",
    "packing_list":      "Generate smart packing list",
    "culture_coach":     "Get cultural dos and don'ts",
    "destination_intel": "Deep dive into a specific destination",
    "what_if":           "Simulate a travel scenario",
    "trip_roast":        "Roast and improve a travel itinerary",
}


def groq_chat(messages, max_tokens=2048):
    response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        temperature=0.7,
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content


def clean_json(text: str) -> Any:
    text = re.sub(r"```json|```", "", text).strip()
    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        raise ValueError("Invalid JSON")
    return json.loads(match.group())


class AgentRequest(BaseModel):
    message: str
    history: List[dict] = []


def run_tool(tool_name: str, params: dict) -> str:
    try:
        if tool_name == "vibe_search":
            prompt = f"Find 3 perfect travel destinations for this vibe: {params.get('vibe', '')}. Give destination name, why it matches, best time, budget hint, and one hidden gem tip for each."
        elif tool_name == "get_weather":
            dest = params.get('destination', '')
            prompt = f"What is the weather like in {dest}? Give best months to visit, worst months, what to expect each season, and packing tips for weather."
        elif tool_name == "get_country_info":
            country = params.get('country', '')
            prompt = f"Give practical travel info for {country}: visa requirements for Indian tourists, local currency and exchange tips, main language and useful phrases, safety rating, emergency numbers, and cultural norms."
        elif tool_name == "build_itinerary":
            dest = params.get('destination', '')
            days = params.get('days', 7)
            budget = params.get('budget', 'mid-range')
            style = params.get('style', 'balanced')
            prompt = f"Build a {days}-day itinerary for {dest}. Budget: {budget}. Style: {style}. Include morning/afternoon/evening activities, where to eat, insider secrets, and daily budget estimate."
        elif tool_name == "budget_truth":
            dest = params.get('destination', '')
            days = params.get('days', 7)
            prompt = f"Give the REAL honest budget breakdown for {dest} for {days} days. Show accommodation, food, transport, activities costs in local currency + USD. Include hidden costs and money saving tips."
        elif tool_name == "packing_list":
            dest = params.get('destination', '')
            days = params.get('days', 7)
            season = params.get('season', 'summer')
            prompt = f"Create a smart packing list for {dest} for {days} days in {season}. Include clothing, tech, documents, health items, and destination-specific essentials."
        elif tool_name == "culture_coach":
            dest = params.get('destination', '')
            prompt = f"Give cultural intelligence for {dest}: top 5 dos, top 5 don'ts, dining etiquette, dress code, tipping guide, common scams to avoid, and one local secret."
        elif tool_name == "destination_intel":
            dest = params.get('destination', '')
            prompt = f"Give deep travel intelligence for {dest}: best neighborhoods to stay, top 5 must-do experiences, best local food to try, getting around tips, hidden gems tourists miss, and your honest unpopular opinion."
        elif tool_name == "what_if":
            scenario = params.get('scenario', '')
            prompt = f"Simulate this travel scenario realistically: {scenario}. Is it feasible? What would it cost? What could go wrong? What would be amazing?"
        elif tool_name == "trip_roast":
            itinerary = params.get('itinerary', '')
            prompt = f"Roast this travel itinerary lovingly but honestly: {itinerary}. Give a funny roast score, top 3 mistakes, fixes, and improved version."
        else:
            return f"Unknown tool: {tool_name}"

        return groq_chat([{"role": "user", "content": prompt}], max_tokens=1500)
    except Exception as e:
        return f"Tool error: {str(e)}"


@router.post("/run-sync")
async def agent_run_sync(body: AgentRequest, current_user: User = Depends(protect)):
    tools_desc = "\n".join([f"- {k}: {v}" for k, v in TOOLS.items()])

    # Step 1: Plan tools
    plan_messages = [
        {"role": "system", "content": AGENT_SYSTEM},
        {"role": "user", "content": f"""The user asks: "{body.message}"

Available tools:
{tools_desc}

Decide which tools to use. Respond with JSON only:
{{
  "needsTools": true,
  "tools": [
    {{"tool": "tool_name", "params": {{"key": "value"}}, "reason": "why using this"}}
  ],
  "directAnswer": "only if needsTools is false"
}}"""}
    ]

    plan_response = groq_chat(plan_messages, max_tokens=1000)

    steps = []
    tool_results = []

    try:
        plan = clean_json(plan_response)

        if plan.get("needsTools") and plan.get("tools"):
            for tool_call in plan["tools"][:5]:
                tool_name = tool_call.get("tool")
                params = tool_call.get("params", {})
                reason = tool_call.get("reason", "")

                if tool_name not in TOOLS:
                    continue

                steps.append({"type": "tool_use", "tool": tool_name, "reason": reason})
                result = run_tool(tool_name, params)
                tool_results.append({"tool": tool_name, "result": result})

            # Step 2: Synthesize as structured JSON
            synthesis_messages = [
                {"role": "system", "content": AGENT_SYSTEM},
                {"role": "user", "content": f"""User asked: "{body.message}"

Tool results:
{json.dumps(tool_results, indent=2)}

Based on ALL the tool results above, create a structured travel guide. Respond with JSON only (no markdown):
{{
  "destination": "City, Country",
  "title": "Catchy trip title",
  "verdict": "1-2 sentence honest Compass verdict",
  "overview": {{
    "bestFor": "Type of traveler this suits",
    "bestTime": "Best months to visit",
    "budget": "Daily budget estimate in local currency + USD",
    "safety": "Safety rating out of 10",
    "language": "Main language",
    "currency": "Local currency"
  }},
  "highlights": [
    {{"emoji": "🏯", "title": "Highlight name", "desc": "One sentence description"}}
  ],
  "itinerary": [
    {{
      "day": 1,
      "title": "Day title",
      "morning": "Morning activity and place",
      "afternoon": "Afternoon activity and place",
      "evening": "Evening activity and place",
      "eat": "Best place to eat today",
      "budget": "₹XX (~$XX)"
    }}
  ],
"budget": {{
    "accommodation": "local currency/night (~$XX USD)",
    "food": "local currency/day (~$XX USD)",
    "transport": "local currency/day (~$XX USD)",
    "activities": "local currency/day (~$XX USD)",
    "total": "local currency for X days (~$XX USD)"
  }},
  "mustEat": [
    {{"dish": "Dish name", "where": "Restaurant name", "price": "₹XX"}}
  ],
  "culturalTips": [
    {{"type": "do", "tip": "Something to do"}},
    {{"type": "dont", "tip": "Something to avoid"}}
  ],
  "packingEssentials": ["item1", "item2", "item3", "item4", "item5"],
  "hiddenGem": "One insider tip tourists miss",
  "warnings": ["Warning 1", "Warning 2"]
}}"""
            }
            ]
            raw = groq_chat(synthesis_messages, max_tokens=3000)
            try:
                structured = clean_json(raw)
                return {
                    "structured": True,
                    "data": structured,
                    "steps": steps,
                    "toolsUsed": [t["tool"] for t in tool_results]
                }
            except Exception:
                # Fallback to plain text
                return {
                    "structured": False,
                    "answer": raw,
                    "steps": steps,
                    "toolsUsed": [t["tool"] for t in tool_results]
                }

        else:
            final_answer = plan.get("directAnswer") or groq_chat([
                {"role": "system", "content": AGENT_SYSTEM},
                {"role": "user", "content": body.message}
            ])
            return {
                "structured": False,
                "answer": final_answer,
                "steps": [],
                "toolsUsed": []
            }

    except Exception:
        final_answer = groq_chat([
            {"role": "system", "content": AGENT_SYSTEM},
            {"role": "user", "content": body.message}
        ])
        return {
            "structured": False,
            "answer": final_answer,
            "steps": steps,
            "toolsUsed": []
        }


@router.post("/run")
async def agent_run(body: AgentRequest, current_user: User = Depends(protect)):
    result = await agent_run_sync(body, current_user)

    async def generate():
        yield f"data: {json.dumps({'type': 'answer', 'content': result.get('answer', '')})}\n\n"
        yield f"data: {json.dumps({'type': 'done', 'steps': result.get('steps', [])})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")