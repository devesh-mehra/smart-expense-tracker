from collections import defaultdict
from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.auth import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/summary", response_model=schemas.AnalyticsSummary)
def analytics_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    months: int = Query(default=6, le=24, ge=1),
):
    transactions = (
        db.query(models.Transaction)
        .filter(models.Transaction.owner_id == current_user.id)
        .all()
    )

    total_income = sum(t.amount for t in transactions if t.type == models.TransactionType.income)
    total_expense = sum(t.amount for t in transactions if t.type == models.TransactionType.expense)

    # Category breakdown (expenses only, most relevant for spending analysis)
    cat_totals: dict = defaultdict(float)
    cat_meta: dict = {}
    for t in transactions:
        if t.type != models.TransactionType.expense:
            continue
        key = t.category_id or 0
        cat_totals[key] += t.amount
        if t.category:
            cat_meta[key] = (t.category.name, t.category.color)
        else:
            cat_meta[key] = ("Uncategorized", "#9ca3af")

    category_breakdown = [
        schemas.CategoryBreakdown(
            category_id=key if key != 0 else None,
            category_name=cat_meta[key][0],
            color=cat_meta[key][1],
            total=round(total, 2),
        )
        for key, total in sorted(cat_totals.items(), key=lambda kv: -kv[1])
    ]

    # Monthly trend for the last N months
    monthly: dict = defaultdict(lambda: {"income": 0.0, "expense": 0.0})
    for t in transactions:
        month_key = t.date.strftime("%Y-%m")
        monthly[month_key][t.type.value] += t.amount

    sorted_months = sorted(monthly.keys())[-months:]
    monthly_trend = [
        schemas.MonthlyTrend(
            month=m,
            income=round(monthly[m]["income"], 2),
            expense=round(monthly[m]["expense"], 2),
        )
        for m in sorted_months
    ]

    return schemas.AnalyticsSummary(
        total_income=round(total_income, 2),
        total_expense=round(total_expense, 2),
        net_balance=round(total_income - total_expense, 2),
        category_breakdown=category_breakdown,
        monthly_trend=monthly_trend,
    )
