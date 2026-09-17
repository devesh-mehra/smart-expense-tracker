import datetime as dt
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict

from app.models import TransactionType


# ---------- Auth ----------
class UserCreate(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    created_at: dt.datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Category ----------
class CategoryCreate(BaseModel):
    name: str
    type: TransactionType = TransactionType.expense
    color: Optional[str] = "#6366f1"


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[TransactionType] = None
    color: Optional[str] = None


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    type: TransactionType
    color: str
    is_default: bool


# ---------- Transaction ----------
class TransactionCreate(BaseModel):
    amount: float
    type: TransactionType
    description: Optional[str] = None
    date: Optional[dt.date] = None
    category_id: Optional[int] = None


class TransactionUpdate(BaseModel):
    amount: Optional[float] = None
    type: Optional[TransactionType] = None
    description: Optional[str] = None
    date: Optional[dt.date] = None
    category_id: Optional[int] = None


class TransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    amount: float
    type: TransactionType
    description: Optional[str] = None
    date: dt.date
    category: Optional[CategoryOut] = None


# ---------- Analytics ----------
class CategoryBreakdown(BaseModel):
    category_id: Optional[int]
    category_name: str
    color: str
    total: float


class MonthlyTrend(BaseModel):
    month: str  # "2026-09"
    income: float
    expense: float


class AnalyticsSummary(BaseModel):
    total_income: float
    total_expense: float
    net_balance: float
    category_breakdown: list[CategoryBreakdown]
    monthly_trend: list[MonthlyTrend]
