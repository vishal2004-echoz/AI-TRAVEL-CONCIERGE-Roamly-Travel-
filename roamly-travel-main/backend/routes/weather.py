from fastapi import APIRouter, Query
import httpx

router = APIRouter()

WEATHER_CODES = {
    0: "☀️ Clear sky",  1: "🌤️ Mainly clear",  2: "⛅ Partly cloudy", 3: "☁️ Overcast",
    45: "🌫️ Foggy",    51: "🌦️ Light drizzle", 61: "🌧️ Light rain",   71: "🌨️ Light snow",
    80: "🌦️ Showers",  95: "⛈️ Thunderstorm"
}


# ── WEATHER (Open-Meteo — 100% free, no key needed) ───────────────
@router.get("/")
async def get_weather(
    lat: float = Query(...),
    lng: float = Query(...),
    destination: str = Query("")
):
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lng}"
        f"&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode"
        f"&current_weather=true&timezone=auto&forecast_days=7"
    )
    async with httpx.AsyncClient() as client:
        r = await client.get(url)
        data = r.json()

    current = data["current_weather"]
    daily   = data["daily"]

    return {
        "destination": destination,
        "current": {
            "temp":      round(current["temperature"]),
            "windspeed": current["windspeed"],
            "condition": WEATHER_CODES.get(current["weathercode"], "🌍 Variable")
        },
        "forecast": [
            {
                "date":          daily["time"][i],
                "maxTemp":       round(daily["temperature_2m_max"][i]),
                "minTemp":       round(daily["temperature_2m_min"][i]),
                "precipitation": daily["precipitation_sum"][i],
                "condition":     WEATHER_CODES.get(daily["weathercode"][i], "🌍 Variable")
            }
            for i in range(len(daily["time"]))
        ]
    }
