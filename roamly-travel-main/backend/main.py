import os
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from models.user import User

from routes import auth, ai, destinations, user, weather, agent

load_dotenv()

app = FastAPI(title="Roamly API", version="1.0.0")

db_client: AsyncIOMotorClient | None = None

# --- CORE LIVENESS & HEALTH ROUTES ---


@app.get("/")
def home():
    return {"message": "Roamly backend is running smoothly 🚀"}


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "roamly"}

# -------------------------------------

# Rate Limiter: Configured with a custom request checker to ignore OPTIONS
def custom_rate_limit_checker(request: Request):
    # Completely bypass rate limiting for browser pre-flight checks
    if request.method == "OPTIONS":
        return None
    return get_remote_address(request)

limiter = Limiter(key_func=custom_rate_limit_checker, default_limits=["100/15minutes"])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Predictable, Production-Safe CORS Setup
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    # Ensure no trailing slash messes up the match
    allowed_origins.append(frontend_url.rstrip("/"))
else:
    print("⚠️ FRONTEND_URL not set — CORS will be restrictive only for localhost")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://roamly-travel-iota.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Explicitly catch global OPTIONS requests if middleware doesn't absorb them
@app.options("/{path:path}")
async def preflight_handler(path: str):
    return Response(status_code=200)

# --- APPLICATION LIFECYCLE HOOKS ---

@app.on_event("startup")
async def startup_db():
    global db_client
    uri = os.getenv("MONGODB_URI")
    if not uri:
        raise RuntimeError("CRITICAL STARTUP FAILURE: MONGODB_URI is missing.")

    try:
        db_client = AsyncIOMotorClient(uri)
        db = db_client.get_database("roamly")
        await init_beanie(database=db, document_models=[User])
        print("✅ MongoDB connected and Beanie initialized securely")
    except Exception as e:
        print("❌ CRITICAL: Database connection failed during startup loop!")
        raise e


@app.on_event("shutdown")
async def shutdown_db():
    global db_client
    if db_client:
        print("🛑 Closing MongoDB connection pool gracefully...")
        db_client.close()

# Include Routers
app.include_router(auth.router,         prefix="/api/auth")
app.include_router(ai.router,           prefix="/api/ai")
app.include_router(destinations.router, prefix="/api/destinations")
app.include_router(user.router,         prefix="/api/user")
app.include_router(weather.router,      prefix="/api/weather")
app.include_router(agent.router,        prefix="/api/ai/agent")

from routes.analytics import router as analytics_router
app.include_router(analytics_router, prefix="/api/admin")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 5000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)