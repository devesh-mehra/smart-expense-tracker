from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

DEFAULT_CATEGORIES = [
    ("Food & Dining", "expense", "#f97316"),
    ("Transportation", "expense", "#3b82f6"),
    ("Shopping", "expense", "#ec4899"),
    ("Bills & Utilities", "expense", "#ef4444"),
    ("Entertainment", "expense", "#8b5cf6"),
    ("Health", "expense", "#14b8a6"),
    ("Other", "expense", "#6b7280"),
    ("Salary", "income", "#22c55e"),
    ("Freelance", "income", "#10b981"),
    ("Other Income", "income", "#84cc16"),
]


@router.post("/register", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    for name, ctype, color in DEFAULT_CATEGORIES:
        db.add(
            models.Category(
                name=name,
                type=ctype,
                color=color,
                is_default=True,
                owner_id=user.id,
            )
        )
    db.commit()

    token = create_access_token({"sub": str(user.id)})
    return schemas.Token(access_token=token, user=schemas.UserOut.model_validate(user))


@router.post("/login", response_model=schemas.Token)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token({"sub": str(user.id)})
    return schemas.Token(access_token=token, user=schemas.UserOut.model_validate(user))


@router.get("/me", response_model=schemas.UserOut)
def read_current_user(current_user: models.User = Depends(get_current_user)):
    return current_user
