import os
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from models.user import User

security = HTTPBearer()
JWT_SECRET = os.getenv("JWT_SECRET", "changeme")


def sign_token(user_id: str) -> str:
    payload = {
        "id": user_id,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


async def protect(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired. Please log in again.")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token. Please log in again.")

    user = await User.get(payload["id"])
    if not user:
        raise HTTPException(status_code=401, detail="User no longer exists.")

    user.lastActive = datetime.utcnow()
    await user.save()
    return user
