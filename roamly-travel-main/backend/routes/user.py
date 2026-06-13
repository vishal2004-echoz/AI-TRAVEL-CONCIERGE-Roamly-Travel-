from datetime import datetime

from altair import Field
from beanie import Document
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any
from models.user import ConversationMessage, TravelDNA, User, SavedTrip, TripAutopsy
from middleware.auth import protect

router = APIRouter()


    
class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None


class TripBody(BaseModel):
    destination: Optional[str] = None
    duration: Optional[int] = None
    itinerary: Optional[Any] = None
    budget: Optional[Any] = None
    notes: Optional[str] = None


class AutopsyBody(BaseModel):
    destination: Optional[str] = None
    rating: Optional[float] = None
    whatWorked: Optional[str] = None
    whatDidnt: Optional[str] = None
    advice: Optional[str] = None


class DNAUpdate(BaseModel):
    adventureLevel: Optional[int] = None
    preferredClimate: Optional[str] = None
    travelStyle: Optional[str] = None
    budgetRange: Optional[str] = None
    topInterests: Optional[list] = None
    avoidances: Optional[list] = None
    visitedDestinations: Optional[list] = None
    wishlistDestinations: Optional[list] = None


class WishlistBody(BaseModel):
    destination: str


# ── GET FULL PROFILE ──────────────────────────────────────────────
@router.get("/profile")
async def get_profile(current_user: User = Depends(protect)):
    return {"user": current_user.to_safe_dict()}


# ── UPDATE PROFILE ────────────────────────────────────────────────
@router.patch("/profile")
async def update_profile(body: ProfileUpdate, current_user: User = Depends(protect)):
    if body.name:
        current_user.name = body.name
    if body.avatar:
        current_user.avatar = body.avatar
    await current_user.save()
    return {"user": current_user.to_safe_dict()}


# ── SAVE TRIP ─────────────────────────────────────────────────────
@router.post("/trips")
async def save_trip(body: TripBody, current_user: User = Depends(protect)):
    current_user.savedTrips.append(SavedTrip(**body.dict()))
    await current_user.save()
    return {"trips": [t.dict() for t in current_user.savedTrips]}


# ── GET SAVED TRIPS ───────────────────────────────────────────────
@router.get("/trips")
async def get_trips(current_user: User = Depends(protect)):
    return {"trips": [t.dict() for t in current_user.savedTrips]}


# ── DELETE SAVED TRIP ─────────────────────────────────────────────
@router.delete("/trips/{trip_id}")
async def delete_trip(trip_id: str, current_user: User = Depends(protect)):
    current_user.savedTrips = [t for t in current_user.savedTrips if str(t.dict().get("_id", "")) != trip_id]
    await current_user.save()
    return {"message": "Trip removed"}


# ── ADD TRIP AUTOPSY ──────────────────────────────────────────────
@router.post("/autopsy")
async def add_autopsy(body: AutopsyBody, current_user: User = Depends(protect)):
    current_user.tripAutopsies.append(TripAutopsy(**body.dict()))
    await current_user.save()
    return {"autopsies": [a.dict() for a in current_user.tripAutopsies]}


# ── UPDATE TRAVEL DNA ─────────────────────────────────────────────
@router.patch("/dna")
async def update_dna(body: DNAUpdate, current_user: User = Depends(protect)):
    for field, value in body.dict(exclude_none=True).items():
        setattr(current_user.travelDNA, field, value)
    await current_user.save()
    return {"travelDNA": current_user.travelDNA.dict()}


# ── ADD TO WISHLIST ───────────────────────────────────────────────
@router.post("/wishlist")
async def add_wishlist(body: WishlistBody, current_user: User = Depends(protect)):
    if body.destination not in current_user.travelDNA.wishlistDestinations:
        current_user.travelDNA.wishlistDestinations.append(body.destination)
        await current_user.save()
    return {"message": f"{body.destination} added to wishlist ✨"}


# ── GET CONVERSATION HISTORY ──────────────────────────────────────
@router.get("/history")
async def get_history(current_user: User = Depends(protect)):
    return {"history": [m.dict() for m in current_user.conversationHistory]}
