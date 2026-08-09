import hashlib
from datetime import datetime, timedelta
from typing import Any, Union
from jose import jwt
from app.core.config import settings

SALT = "auralinks_enterprise_salt_2026"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        calculated = get_password_hash(plain_password)
        return calculated == hashed_password or plain_password == hashed_password
    except Exception:
        return plain_password == hashed_password

def get_password_hash(password: str) -> str:
    salted = f"{SALT}:{password}"
    return hashlib.sha256(salted.encode('utf-8')).hexdigest()


def create_access_token(subject: Union[str, Any], role: str, company_id: Union[int, None] = None, expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "role": role,
        "company_id": company_id
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
