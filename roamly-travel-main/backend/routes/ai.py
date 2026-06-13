import os, json, re
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Any
from dotenv import load_dotenv

load_dotenv()

from groq import Groq
from models.user import User, ConversationMessage
from middleware.auth import protect

router = APIRouter()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"

SYSTEM_PERSONALITY = (
    "You are Compass, the AI travel agent inside Roamly, the world's most opinionated, honest, "
    "and knowledgeable travel concierge. You have visited every corner of the world and have strong, "
    "well-reasoned opinions. You are warm, witty, nostalgic, and passionate about authentic travel "
    "experiences. You actively steer travelers away from tourist traps and toward genuine discoveries. "
    "You are brutally honest but always kind. You speak like a well-traveled friend, not a guidebook. "
    "Be pleasant, warm and sweet — like a best friend who happens to know everything about travel. "
    "Keep responses SHORT and punchy — 1-3 sentences for greetings or simple questions. "
    "Only give detailed answers when the question genuinely needs it. "
    "Never ask more than one question per reply. "
    "Don't pepper the user with follow-up questions during small talk — let the conversation breathe. "
    "If they seem to just be chatting or giving short replies, just respond warmly with a statement — NO question. "
    "Only ask a question when the user seems genuinely ready to plan something specific. "
    "Use relevant emojis that match the context — 🏔️ for mountains, 🍜 for food, 🏖️ for beaches, ✈️ for travel plans, 🗺️ for exploring. "
    "Emojis should feel natural and fun, not random or excessive. Max 1-2 emojis per reply."
)


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
        raise ValueError("Invalid AI response format")
    return json.loads(match.group())


# ── Request schemas ──────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

class VibeRequest(BaseModel):
    vibe: str

class RoastRequest(BaseModel):
    itinerary: str

class BattleRequest(BaseModel):
    destination1: str
    destination2: str
    travelStyle: str = "general"

class WhatIfRequest(BaseModel):
    scenario: str

class ItineraryRequest(BaseModel):
    destination: str
    days: int
    budget: str
    style: str
    interests: str

class BudgetRequest(BaseModel):
    destination: str
    days: int
    people: int
    style: str

class DNARequest(BaseModel):
    answers: Any

class PackingRequest(BaseModel):
    destination: str
    days: int
    months: str
    activities: str

class CultureRequest(BaseModel):
    destination: str


# ── CHAT CONCIERGE ────────────────────────────────────────────────
@router.post("/chat")
async def chat(body: ChatRequest, current_user: User = Depends(protect)):
    dna = current_user.travelDNA
    travel_context = (
        f"User profile: Name: {current_user.name}, "
        f"Travel style: {dna.travelStyle}, Budget: {dna.budgetRange}, "
        f"Adventure level: {dna.adventureLevel}/10, "
        f"Visited: {', '.join(dna.visitedDestinations) or 'unknown'}."
    )

    messages = [
        {"role": "system", "content": SYSTEM_PERSONALITY + "\n\n" + travel_context},
        *[{"role": h.role if h.role != "model" else "assistant", "content": h.content} for h in body.history],
        {"role": "user", "content": body.message}
    ]

    response_text = groq_chat(messages)

    new_msgs = [
        ConversationMessage(role="user", content=body.message),
        ConversationMessage(role="model", content=response_text),
    ]
    current_user.conversationHistory = (current_user.conversationHistory + new_msgs)[-40:]
    await current_user.save()

    from datetime import datetime
    return {"response": response_text, "timestamp": datetime.utcnow()}


# ── VIBE SEARCH ───────────────────────────────────────────────────
@router.post("/vibe-search")
async def vibe_search(body: VibeRequest, current_user: User = Depends(protect)):
    prompt = f"""{SYSTEM_PERSONALITY}

A traveler describes their desired travel feeling/vibe: "{body.vibe}"

Respond with a JSON object (no markdown, just raw JSON) like this:
{{
  "topPick": {{"name": "City, Country", "why": "2-3 sentence passionate explanation", "bestTime": "Month range", "budgetHint": "$XX/day estimate", "vibe": ["tag1","tag2","tag3"], "hiddenGem": "One local secret tip"}},
  "alternatives": [
    {{"name": "City, Country", "why": "1 sentence", "differentiator": "what makes it unique"}},
    {{"name": "City, Country", "why": "1 sentence", "differentiator": "what makes it unique"}},
    {{"name": "City, Country", "why": "1 sentence", "differentiator": "what makes it unique"}}
  ],
  "wildCard": {{"name": "Unexpected destination", "why": "Why this will surprise them beautifully"}},
  "avoidThese": ["Overrated place 1 - reason", "Overrated place 2 - reason"]
}}"""
    result = groq_chat([{"role": "user", "content": prompt}])
    return clean_json(result)


# ── TRIP ROAST ─────────────────────────────────────────────────────
@router.post("/trip-roast")
async def trip_roast(body: RoastRequest, current_user: User = Depends(protect)):
    prompt = f"""{SYSTEM_PERSONALITY}

A traveler has shared their planned itinerary and wants you to ROAST it (lovingly but brutally honest):

"{body.itinerary}"

Respond with JSON (no markdown):
{{
  "roastScore": 45,
  "roastTitle": "Funny title for their trip plan",
  "roasts": [
    {{"issue": "What's wrong", "roast": "Funny brutal comment", "fix": "How to fix it"}}
  ],
  "biggestMistake": "The #1 thing that will ruin their trip",
  "bestPart": "Something genuine to praise",
  "fixedHighlight": "Your improved version of the best part",
  "verdict": "Overall funny but kind verdict paragraph"
}}"""
    result = groq_chat([{"role": "user", "content": prompt}])
    return clean_json(result)


# ── DESTINATION BATTLE ─────────────────────────────────────────────
@router.post("/battle")
async def battle(body: BattleRequest, current_user: User = Depends(protect)):
    prompt = f"""{SYSTEM_PERSONALITY}

Create an epic travel battle between "{body.destination1}" vs "{body.destination2}" for a {body.travelStyle} traveler.

Respond with JSON (no markdown):
{{
  "winner": "Destination name",
  "winReason": "One compelling sentence why",
  "dest1": {{"name": "{body.destination1}", "score": 78, "strengths": ["s1","s2","s3"], "weaknesses": ["w1","w2"], "bestFor": "traveler type", "secretWeapon": "special thing", "verdict": "2 sentence verdict"}},
  "dest2": {{"name": "{body.destination2}", "score": 82, "strengths": ["s1","s2","s3"], "weaknesses": ["w1","w2"], "bestFor": "traveler type", "secretWeapon": "special thing", "verdict": "2 sentence verdict"}},
  "surprise": "A third destination neither considered but might love more"
}}"""
    result = groq_chat([{"role": "user", "content": prompt}])
    return clean_json(result)


# ── WHAT IF SIMULATOR ──────────────────────────────────────────────
@router.post("/what-if")
async def what_if(body: WhatIfRequest, current_user: User = Depends(protect)):
    prompt = f"""{SYSTEM_PERSONALITY}

A traveler asks: "What if: {body.scenario}"

Simulate this travel scenario realistically.

Respond with JSON (no markdown):
{{
  "title": "Catchy scenario title",
  "feasibility": 72,
  "summary": "2 sentence overview",
  "timeline": [
    {{"month": "Month 1", "location": "Where", "experience": "What life is like", "budget": "$XXX", "challenge": "Real difficulty", "highlight": "Magic moment"}}
  ],
  "totalBudget": {{"minimum": "$XXXX", "comfortable": "$XXXX", "breakdown": {{"accommodation": "XX%", "food": "XX%", "transport": "XX%", "activities": "XX%", "misc": "XX%"}}}},
  "whatCouldGoWrong": ["Risk 1", "Risk 2", "Risk 3"],
  "whatWouldBeAmazing": ["Joy 1", "Joy 2", "Joy 3"],
  "verdict": "Honest final take"
}}"""
    result = groq_chat([{"role": "user", "content": prompt}], max_tokens=4096)
    return clean_json(result)


# ── ITINERARY BUILDER ──────────────────────────────────────────────
@router.post("/itinerary")
async def itinerary(body: ItineraryRequest, current_user: User = Depends(protect)):
    prompt = f"""{SYSTEM_PERSONALITY}

Build a detailed {body.days}-day itinerary for {body.destination}. Budget: {body.budget}. Style: {body.style}. Interests: {body.interests}.

Respond with JSON (no markdown):
{{
  "destination": "{body.destination}",
  "days": {body.days},
  "theme": "Trip theme/title",
  "intro": "Inspiring 2-sentence intro",
  "itinerary": [
    {{
      "day": 1, "title": "Day title",
      "morning":   {{"activity": "...", "place": "...", "tip": "...", "duration": "2 hours"}},
      "afternoon": {{"activity": "...", "place": "...", "tip": "...", "duration": "..."}},
      "evening":   {{"activity": "...", "place": "...", "tip": "...", "duration": "..."}},
      "eat": {{"breakfast": "place", "lunch": "place", "dinner": "place"}},
      "budget": "₹XX or $XX",
      "insiderSecret": "thing tourists miss"
    }}
  ],
  "packingEssentials": ["item1","item2","item3","item4","item5"],
  "culturalTips": ["tip1","tip2","tip3"],
  "totalEstimate": "₹XXX or $XXX for {body.days} days",
  "bestNeighborhood": "Where to stay and why",
  
  "transportOptions": {{
    "flight": [
      {{"name": "Airline name", "type": "Direct/Connecting", "from": "City", "to": "{body.destination}", "price": "₹3,500 (~$42)", "duration": "1.5 hrs", "frequency": "Daily", "bookingTip": "Book 3 weeks ahead", "bestClass": "Economy"}},
      {{"name": "Another airline", "type": "Direct", "from": "City", "to": "{body.destination}", "price": "₹4,200 (~$50)", "duration": "2 hrs", "frequency": "3x daily", "bookingTip": "Cheaper on weekdays", "bestClass": "Economy"}}
    ],
    "train": [
      {{"name": "Train name/number", "type": "Express/Superfast", "from": "City", "to": "{body.destination}", "price": "₹450 (~$5)", "duration": "6 hrs", "frequency": "Daily", "bookingTip": "Book on IRCTC 60 days ahead", "bestClass": "Sleeper/3AC"}}
    ],
    "bus": [
      {{"name": "KSRTC / Private operator", "type": "Public", "from": "City", "to": "{body.destination}", "price": "₹350 (~$4)", "duration": "8 hrs", "frequency": "Multiple daily", "bookingTip": "Book on RedBus", "bestClass": "AC Sleeper"}},
      {{"name": "Private Volvo", "type": "Private", "from": "City", "to": "{body.destination}", "price": "₹600 (~$7)", "duration": "7 hrs", "frequency": "Evening departures", "bookingTip": "More comfortable option", "bestClass": "AC Sleeper"}}
    ],
    "car": [
      {{"name": "Self Drive / Cab", "type": "Private", "from": "City", "to": "{body.destination}", "price": "₹3,500 (~$42)", "duration": "5 hrs", "frequency": "Anytime", "bookingTip": "Hire on Zoomcar or local taxi", "bestClass": "SUV recommended"}}
    ]
  }},
  "hotelRecommendations": [
    {{"type": "Budget", "name": "Hotel name", "neighborhood": "area", "pricePerNight": "₹1,500 (~$18)", "why": "why great"}},
    {{"type": "Mid-range", "name": "Hotel name", "neighborhood": "area", "pricePerNight": "₹5,000 (~$60)", "why": "why great"}},
    {{"type": "Luxury", "name": "Hotel name", "neighborhood": "area", "pricePerNight": "₹15,000 (~$180)", "why": "why great"}}
  ]
}}"""
    result = groq_chat([{"role": "user", "content": prompt}], max_tokens=4096)
    data = clean_json(result)

    from models.user import SavedTrip
    current_user.savedTrips.append(
        SavedTrip(destination=body.destination, duration=body.days, itinerary=data, budget=body.budget)
    )
    await current_user.save()
    return data


# ── BUDGET TRUTH BOMB ──────────────────────────────────────────────
@router.post("/budget-truth")
async def budget_truth(body: BudgetRequest, current_user: User = Depends(protect)):
    prompt = f"""{SYSTEM_PERSONALITY}

Give the REAL honest budget breakdown for {body.people} person(s) visiting {body.destination} for {body.days} days, {body.style} travel style. Show prices in both the local currency of {body.destination} AND USD equivalent. Format like: "¥5000 (~$33)" or "€50 (~$54)".
Respond with JSON (no markdown):
{{
  "destination": "{body.destination}",
  "blogClaims": "What travel blogs usually claim",
  "realityCheck": "What it actually costs",
  "breakdown": {{
    "accommodation": {{"blogSays": "$XX/night", "realityIs": "$XX/night", "whyDifference": "..."}},
    "food":          {{"blogSays": "$XX/day",   "realityIs": "$XX/day",   "whyDifference": "..."}},
    "transport":     {{"blogSays": "$XX",        "realityIs": "$XX",        "whyDifference": "..."}},
    "activities":    {{"blogSays": "$XX",        "realityIs": "$XX",        "whyDifference": "..."}},
    "hidden": [
      {{"cost": "Tourist tax / visa", "amount": "$XX"}},
      {{"cost": "Travel insurance",   "amount": "$XX"}},
      {{"cost": "Tipping culture",    "amount": "$XX"}}
    ]
  }},
  "totalMinimum": "$XXXX",
  "totalComfortable": "$XXXX",
  "totalLuxury": "$XXXX",
  "moneySavingTips": ["Tip 1","Tip 2","Tip 3"],
  "moneyWasters": ["Don't waste on 1","Don't waste on 2"],
  "verdict": "Honest one paragraph summary"
}}"""
    result = groq_chat([{"role": "user", "content": prompt}])
    return clean_json(result)


# ── TRAVEL DNA ANALYZER ────────────────────────────────────────────
@router.post("/analyze-dna")
async def analyze_dna(body: DNARequest, current_user: User = Depends(protect)):
    prompt = f"""Based on these travel quiz answers: {json.dumps(body.answers)}

Analyze and return JSON (no markdown):
{{
  "travelPersonality": "Name (e.g. 'The Curious Wanderer')",
  "description": "2 sentence personality description",
  "adventureLevel": 7,
  "travelStyle": "explorer",
  "budgetRange": "mid-range",
  "topInterests": ["history","food","nature"],
  "avoidances": ["crowded tourist spots"],
  "perfectDestinations": ["Destination 1","Destination 2","Destination 3"],
  "wouldHate": ["Destination that would disappoint them"],
  "travelQuote": "A custom travel quote"
}}"""
    result = groq_chat([{"role": "user", "content": prompt}])
    dna = clean_json(result)

    current_user.travelDNA.travelStyle    = dna.get("travelStyle", current_user.travelDNA.travelStyle)
    current_user.travelDNA.budgetRange    = dna.get("budgetRange", current_user.travelDNA.budgetRange)
    current_user.travelDNA.adventureLevel = dna.get("adventureLevel", current_user.travelDNA.adventureLevel)
    current_user.travelDNA.topInterests   = dna.get("topInterests", current_user.travelDNA.topInterests)
    current_user.travelDNA.avoidances     = dna.get("avoidances", current_user.travelDNA.avoidances)
    from datetime import datetime
    current_user.travelDNA.lastUpdated = datetime.utcnow()
    await current_user.save()
    return dna


# ── PACKING LIST ───────────────────────────────────────────────────
@router.post("/packing-list")
async def packing_list(body: PackingRequest, current_user: User = Depends(protect)):
    prompt = f"""Create a smart packing list for {body.destination}, {body.days} days in {body.months}, activities: {body.activities}.

Respond with JSON (no markdown):
{{
  "destination": "{body.destination}",
  "weatherNote": "What weather to expect",
  "categories": [
    {{
      "name": "Clothing", "emoji": "👕",
      "items": [{{"item": "Item name", "quantity": 3, "essential": true, "why": "Brief reason"}}]
    }},
    {{"name": "Tech & Documents", "emoji": "📱", "items": []}},
    {{"name": "Health & Safety",  "emoji": "💊", "items": []}},
    {{"name": "Destination-Specific", "emoji": "🌍", "items": []}}
  ],
  "dontForget": ["Critical item 1","Critical item 2"],
  "leaveAtHome": ["Unnecessary item 1","Unnecessary item 2"],
  "totalItems": 42
}}"""
    result = groq_chat([{"role": "user", "content": prompt}])
    return clean_json(result)


# ── CULTURAL COACH ─────────────────────────────────────────────────
@router.post("/culture-coach")
async def culture_coach(body: CultureRequest, current_user: User = Depends(protect)):
    prompt = f"""Give deep cultural intelligence for visiting {body.destination}. Go beyond tourist tips.

Respond with JSON (no markdown):
{{
  "destination": "{body.destination}",
  "cultureScore": "How different from Western norms (1-10)",
  "essentialPhrases": [{{"phrase": "...", "pronunciation": "...", "meaning": "...", "when": "..."}}],
  "doThis": [{{"behavior": "...", "context": "...", "whyItMatters": "..."}}],
  "neverDoThis": [{{"behavior": "...", "context": "...", "consequence": "..."}}],
  "diningEtiquette": ["Rule 1","Rule 2","Rule 3"],
  "dressCode": {{"general": "...", "religious": "...", "beach": "..."}},
  "tippingGuide": {{"restaurants": "...", "taxis": "...", "hotels": "..."}},
  "commonScams": [{{"scam": "...", "howItWorks": "...", "howToAvoid": "..."}}],
  "localSecret": "One cultural insight that will make locals love you"
}}"""
    result = groq_chat([{"role": "user", "content": prompt}])
    return clean_json(result)