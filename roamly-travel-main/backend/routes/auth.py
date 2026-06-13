from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from models.user import User
from middleware.auth import sign_token, protect

router = APIRouter()


# ── Request schemas ──────────────────────────────────────────────
class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ── SIGNUP ───────────────────────────────────────────────────────
@router.post("/signup", status_code=201)
async def signup(body: SignupRequest):
    if len(body.name.strip()) == 0 or len(body.name) > 50:
        raise HTTPException(status_code=400, detail="Name is required (max 50 chars)")
    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    existing = await User.find_one({"email": body.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = User.hash_password(body.password)
    user = User(name=body.name.strip(), email=body.email.lower(), password=hashed)
    await user.insert()

    token = sign_token(str(user.id))
    return {"message": "Welcome to Roamly! 🌍", "token": token, "user": user.to_safe_dict()}


# ── LOGIN ────────────────────────────────────────────────────────
@router.post("/login")
async def login(body: LoginRequest):
    user = await User.find_one({"email": body.email.lower()})
    if not user or not user.compare_password(body.password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = sign_token(str(user.id))
    return {
        "message": f"Welcome back, {user.name}! Ready to explore? ✈️",
        "token": token,
        "user": user.to_safe_dict()
    }


# ── GET CURRENT USER ─────────────────────────────────────────────
@router.get("/me")
async def get_me(current_user: User = Depends(protect)):
    return {"user": current_user.to_safe_dict()}


# ── LOGOUT ───────────────────────────────────────────────────────
@router.post("/logout")
async def logout(current_user: User = Depends(protect)):
    return {"message": "Logged out successfully. Safe travels! 🌙"}
