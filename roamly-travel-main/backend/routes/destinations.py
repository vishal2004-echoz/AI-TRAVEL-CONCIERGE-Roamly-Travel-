import os
import json
import re
import requests

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Any
from dotenv import load_dotenv

load_dotenv()

from groq import Groq
from models.user import User
from middleware.auth import protect

router = APIRouter()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"

UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY")


def groq_chat(messages):
    response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        temperature=0.7,
        max_tokens=2048,
    )
    return response.choices[0].message.content


def clean_json(text: str) -> Any:
    text = re.sub(r"```json|```", "", text).strip()

    match = re.search(r"\{[\s\S]*\}", text)

    if not match:
        raise ValueError("Invalid AI response format")

    return json.loads(match.group())

def get_unsplash_photos(destination: str):
    try:
        response = requests.get(
            "https://api.unsplash.com/search/photos",
            params={
                "query": f"{destination} landmark cityscape travel",
                "per_page": 8,
                "orientation": "landscape"
            },
            headers={
                "Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"
            },
            timeout=10
        )

        if response.status_code != 200:
            print("Unsplash Error:", response.text)
            return []

        data = response.json()

        photos = []

        for photo in data.get("results", []):
            photos.append(photo["urls"]["regular"])

        return photos

    except Exception as e:
        print("Unsplash Exception:", e)
        return []

def get_wikipedia_photos(destination: str):
    try:
        headers = {
            "User-Agent": "Roamly/1.0"
        }

        search_url = (
            "https://en.wikipedia.org/w/api.php"
            f"?action=query&list=search&srsearch={destination}"
            "&utf8=&format=json"
        )

        search_response = requests.get(
            search_url,
            headers=headers,
            timeout=10
        )

        search_data = search_response.json()

        results = search_data.get("query", {}).get("search", [])

        if not results:
            return []

        page_title = results[0]["title"]

        images_url = (
            "https://en.wikipedia.org/w/api.php"
            "?action=query"
            "&titles=" + page_title +
            "&prop=images"
            "&imlimit=20"
            "&format=json"
        )

        images_response = requests.get(
            images_url,
            headers=headers,
            timeout=10
        )

        images_data = images_response.json()

        photos = []

        pages = images_data.get("query", {}).get("pages", {})

        for page in pages.values():
            for img in page.get("images", []):

                title = img["title"]

                if not (
                    title.lower().endswith(".jpg")
                    or title.lower().endswith(".jpeg")
                    or title.lower().endswith(".png")
                ):
                    continue

                info_url = (
                    "https://en.wikipedia.org/w/api.php"
                    "?action=query"
                    "&titles=" + title +
                    "&prop=imageinfo"
                    "&iiprop=url"
                    "&format=json"
                )

                info_response = requests.get(
                    info_url,
                    headers=headers,
                    timeout=10
                )

                info_data = info_response.json()

                for p in info_data.get("query", {}).get("pages", {}).values():
                    imageinfo = p.get("imageinfo")

                    if imageinfo:
                        photos.append(imageinfo[0]["url"])

                if len(photos) >= 5:
                    return photos

        return photos

    except Exception as e:
        print("Wikipedia Exception:", e)
        return []

def get_destination_photos(destination: str):
    photos = []

    wiki_photos = get_wikipedia_photos(destination)

    photos.extend(wiki_photos)

    unsplash_photos = get_unsplash_photos(destination)

    for photo in unsplash_photos:
        if photo not in photos:
            photos.append(photo)

    return photos[:8]

class ExploreRequest(BaseModel):
    destination: str


@router.post("/explore")
async def explore(
    body: ExploreRequest,
    current_user: User = Depends(protect)
):
    prompt = f"""
You are Compass, an expert opinionated travel concierge.

Give deep travel intelligence for:
"{body.destination}"

Respond with JSON only (no markdown, no extra text):

{{
  "destination": {{
    "name": "{body.destination}",
    "country": "Country name",
    "tagline": "One exciting sentence about this place",
    "description": "3 sentence passionate honest overview",
    "safetyRating": 8,
    "crowdLevel": "moderate",
    "currency": "USD / local currency",
    "language": "Main language",
    "bestMonths": ["March", "April", "October"],
    "avoidMonths": ["July", "August"],
    "budgetPerDay": {{
      "budget": "$30-50",
      "midRange": "$80-120"
    }}
  }},
  "unpopularOpinion": "Roamly's honest controversial take on this destination",
  "nearby": [
    {{
      "name": "Nearby place",
      "distance": "2 hours away",
      "why": "Why it's worth visiting",
      "uniqueThing": "What makes it special",
      "travelMethod": "By train/bus/car"
    }}
  ],
  "similar": [
    {{
      "name": "Similar destination",
      "similarity": "Same vibe label",
      "why": "Why it's similar",
      "butBetter": "What makes it even better"
    }}
  ],
  "hiddenGem": {{
    "name": "Hidden gem near destination",
    "why": "Why hardly anyone goes here",
    "insiderTip": "Local secret tip"
  }},
  "smartRoute": {{
    "title": "The Perfect Route Title",
    "days": 10,
    "stops": ["City1", "City2", "City3", "City4"],
    "description": "Why this route is perfect"
  }}
}}
"""

    result = groq_chat([
        {
            "role": "user",
            "content": prompt
        }
    ])

    data = clean_json(result)

    # Add Unsplash images
    photos = get_destination_photos(body.destination)

    print("PHOTOS FOUND:", photos)

    data["photos"] = photos

    return data


class DestinationDetailRequest(BaseModel):
    destination: str


@router.post("/detail")
async def destination_detail(
    body: DestinationDetailRequest,
    current_user: User = Depends(protect)
):
    prompt = f"""
Give comprehensive travel intelligence for {body.destination}.

Respond with JSON only (no markdown):

{{
  "name": "{body.destination}",
  "overview": "3 sentence passionate overview",
  "bestMonths": ["Month1", "Month2", "Month3"],
  "avoidMonths": ["Month1", "Month2"],
  "neighborhoods": [
    {{
      "name": "Area name",
      "vibe": "description",
      "bestFor": "type of traveler"
    }}
  ],
  "mustDo": [
    "activity1",
    "activity2",
    "activity3",
    "activity4",
    "activity5"
  ],
  "mustEat": [
    "dish1",
    "dish2",
    "dish3"
  ],
  "avoid": [
    "tourist trap 1",
    "tourist trap 2"
  ],
  "budgetBreakdown": {{
    "budget": "$XX/day",
    "mid": "$XX/day",
    "luxury": "$XX/day"
  }},
  "gettingAround": "How to get around like a local",
  "localSecret": "Something only locals know"
}}
"""

    result = groq_chat([
        {
            "role": "user",
            "content": prompt
        }
    ])

    return clean_json(result)