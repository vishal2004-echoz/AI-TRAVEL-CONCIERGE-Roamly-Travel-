from datetime import datetime
from typing import Optional, List, Any
from beanie import Document
from pydantic import BaseModel, EmailStr, Field
import bcrypt


# ── Sub-schemas ──────────────────────────────────────────────────
class TravelDNA(BaseModel):
    adventureLevel: int = 5
    preferredClimate: str = "mixed"
    travelStyle: str = "explorer"      # luxury, backpacker, explorer, cultural
    budgetRange: str = "mid-range"     # budget, mid-range, luxury
    topInterests: List[str] = []
    avoidances: List[str] = []
    visitedDestinations: List[str] = []
    wishlistDestinations: List[str] = []
    personalityTraits: List[str] = []
    lastUpdated: datetime = Field(default_factory=datetime.utcnow)


class SavedTrip(BaseModel):
    destination: str = ""
    duration: Optional[int] = None
    itinerary: Optional[Any] = None
    budget: Optional[Any] = None
    notes: str = ""
    createdAt: datetime = Field(default_factory=datetime.utcnow)


class ConversationMessage(BaseModel):
    role: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class TripAutopsy(BaseModel):
    destination: str = ""
    rating: Optional[float] = None
    whatWorked: str = ""
    whatDidnt: str = ""
    advice: str = ""
    date: datetime = Field(default_factory=datetime.utcnow)


# ── User Document ────────────────────────────────────────────────
class User(Document):
    name: str
    email: EmailStr
    password: str
    avatar: str = ""
    isAdmin: bool = False   # ← add this line
    travelDNA: TravelDNA = Field(default_factory=TravelDNA)
    savedTrips: List[SavedTrip] = []
    conversationHistory: List[ConversationMessage] = []
    tripAutopsies: List[TripAutopsy] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    lastActive: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"

    # Hash password
    @classmethod
    def hash_password(cls, plain: str) -> str:
        return bcrypt.hashpw(plain.encode(), bcrypt.gensalt(12)).decode()

    # Verify password
    def compare_password(self, candidate: str) -> bool:
        return bcrypt.checkpw(candidate.encode(), self.password.encode())

    # Safe dict (no password)
    def to_safe_dict(self) -> dict:
        d = self.dict()
        d.pop("password", None)
        d["id"] = str(self.id)
        return d
