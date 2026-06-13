"""
backend/routes/analytics.py
──────────────────────────────────────────────────────────────────
Admin-only analytics endpoint.

Mount in main.py:
    from routes.analytics import router as analytics_router
    app.include_router(analytics_router, prefix="/api/admin")

Access:   GET /api/admin/analytics
Auth:     Bearer token  (protect middleware)
Guard:    user email must match ADMIN_EMAIL env var, or user.isAdmin == True
"""

import os
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timedelta
from collections import Counter

from models.user import User
from middleware.auth import protect

router = APIRouter()

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@roamly.ai")


def _require_admin(current_user: User = Depends(protect)) -> User:
    is_admin = (
        current_user.email == ADMIN_EMAIL
        or getattr(current_user, "isAdmin", False)
    )
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/analytics")
async def admin_analytics(_: User = Depends(_require_admin)):
    """
    Returns aggregate platform statistics derived from the users collection.
    All aggregation is done in Python; for large collections consider
    moving to MongoDB aggregation pipelines instead.
    """
    users: list[User] = await User.find_all().to_list()

    total_users = len(users)

    # Active today (lastActive within last 24 h)
    now = datetime.utcnow()
    cutoff_24h = now - timedelta(hours=24)
    active_today = sum(1 for u in users if u.lastActive and u.lastActive >= cutoff_24h)

    # Trips / messages / wishlist
    all_trips = [t for u in users for t in (u.savedTrips or [])]
    all_messages = [m for u in users for m in (u.conversationHistory or [])]
    all_wishlist = [d for u in users for d in (u.travelDNA.wishlistDestinations or [])]
    all_autopsies = [a for u in users for a in (u.tripAutopsies or [])]

    total_trips = len(all_trips)
    total_messages = sum(1 for m in all_messages if m.role == "user")
    total_wishlist_items = len(all_wishlist)
    total_autopsies = len(all_autopsies)

    # Avg trip rating
    rated = [a.rating for a in all_autopsies if a.rating is not None]
    avg_trip_rating = round(sum(rated) / len(rated), 2) if rated else None

    # Top 8 destinations
    dest_counter = Counter(
        t.destination.strip()
        for t in all_trips
        if t.destination and t.destination.strip()
    )
    top_destinations = [
        {"destination": dest, "count": count}
        for dest, count in dest_counter.most_common(8)
    ]

    # Travel style distribution
    styles = [u.travelDNA.travelStyle for u in users if u.travelDNA.travelStyle]
    style_counter = Counter(styles)
    total_styles = len(styles) or 1
    travel_styles = [
        {
            "style": style,
            "count": count,
            "pct": round(count / total_styles * 100),
        }
        for style, count in style_counter.most_common()
    ]

    # Budget range distribution
    budgets = [u.travelDNA.budgetRange for u in users if u.travelDNA.budgetRange]
    budget_counter = Counter(budgets)
    total_budgets = len(budgets) or 1
    budget_ranges = [
        {
            "range": b,
            "count": count,
            "pct": round(count / total_budgets * 100),
        }
        for b, count in budget_counter.most_common()
    ]

    # Signups last 7 days
    signups_last_7: list[dict] = []
    for days_ago in range(6, -1, -1):
        day = now - timedelta(days=days_ago)
        day_str = day.strftime("%Y-%m-%d")
        count = sum(
            1 for u in users
            if u.createdAt and u.createdAt.strftime("%Y-%m-%d") == day_str
        )
        signups_last_7.append({"day": day_str, "count": count})

    # User growth pct (this week vs last week)
    cutoff_7d = now - timedelta(days=7)
    cutoff_14d = now - timedelta(days=14)
    new_this_week = sum(1 for u in users if u.createdAt and u.createdAt >= cutoff_7d)
    new_last_week = sum(1 for u in users if u.createdAt and cutoff_14d <= u.createdAt < cutoff_7d)
    if new_last_week > 0:
        user_growth_pct = round((new_this_week - new_last_week) / new_last_week * 100)
    else:
        user_growth_pct = 100 if new_this_week > 0 else 0

    # Quick metrics
    avg_trips_per_user = round(total_trips / total_users, 2) if total_users else 0
    avg_wishlist_size = round(total_wishlist_items / total_users, 2) if total_users else 0
    dna_completion = sum(1 for u in users if u.travelDNA.topInterests or u.travelDNA.travelStyle != "explorer")
    dna_completion_pct = round(dna_completion / total_users * 100) if total_users else 0
    adventure_levels = [u.travelDNA.adventureLevel for u in users if u.travelDNA.adventureLevel]
    avg_adventure_level = round(sum(adventure_levels) / len(adventure_levels), 1) if adventure_levels else None

    return {
        "totalUsers": total_users,
        "activeToday": active_today,
        "totalTrips": total_trips,
        "totalMessages": total_messages,
        "totalWishlistItems": total_wishlist_items,
        "totalAutopsies": total_autopsies,
        "avgTripRating": avg_trip_rating,
        "userGrowthPct": user_growth_pct,
        "topDestinations": top_destinations,
        "travelStyles": travel_styles,
        "budgetRanges": budget_ranges,
        "signupsLast7Days": signups_last_7,
        "avgTripsPerUser": avg_trips_per_user,
        "avgWishlistSize": avg_wishlist_size,
        "dnaCompletionPct": dna_completion_pct,
        "avgAdventureLevel": avg_adventure_level,
    }