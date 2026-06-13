import os
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from models.user import User


async def connect_db():
    uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/roamly")
    client = AsyncIOMotorClient(uri)
    await init_beanie(database=client.get_default_database(), document_models=[User])
    print("✅ MongoDB connected")
