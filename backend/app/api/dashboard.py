from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.domain import Inspection, Product, Violation, User

router = APIRouter()

SEVERITY_COLORS = {
    "CRITICAL": "#990000",
    "HIGH": "#cc0000",
    "MEDIUM": "#ff8c00",
    "LOW": "#4285f4",
}


@router.get("/")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_inspections = db.query(Inspection).count()
    compliant = db.query(Inspection).filter(Inspection.status == "COMPLIANT").count()
    non_compliant = db.query(Inspection).filter(Inspection.status == "NON-COMPLIANT").count()
    needs_review = db.query(Inspection).filter(Inspection.status == "NEEDS_REVIEW").count()

    # High-risk = inspections carrying at least one HIGH/CRITICAL severity violation
    high_risk = (
        db.query(Inspection.id)
        .join(Violation, Violation.inspection_id == Inspection.id)
        .filter(Violation.severity.in_(["HIGH", "CRITICAL"]))
        .distinct()
        .count()
    )

    open_violations = db.query(Violation).filter(Violation.status.in_(["FAIL", "WARNING"])).count()

    # Compliance trend: average score per day for the last 7 days
    since = datetime.utcnow() - timedelta(days=7)
    recent = (
        db.query(Inspection)
        .filter(Inspection.created_at >= since, Inspection.compliance_score.isnot(None))
        .all()
    )
    by_day = defaultdict(list)
    for insp in recent:
        day_label = insp.created_at.strftime("%a")
        by_day[day_label].append(insp.compliance_score)

    day_order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    compliance_trend = [
        {"day": d, "score": round(sum(by_day[d]) / len(by_day[d])) if by_day.get(d) else 0}
        for d in day_order
        if d in by_day
    ]

    # Violations broken down by severity, from real persisted violations
    severity_counts = defaultdict(int)
    for (severity,) in db.query(Violation.severity).all():
        severity_counts[severity] += 1
    violations_severity = [
        {"name": sev, "value": count, "fill": SEVERITY_COLORS.get(sev, "#888888")}
        for sev, count in severity_counts.items()
    ]

    # Category breakdown: inspections grouped by their product's category
    category_counts = defaultdict(int)
    rows = (
        db.query(Product.category)
        .join(Inspection, Inspection.product_id == Product.id)
        .filter(Product.category.isnot(None))
        .all()
    )
    for (category,) in rows:
        category_counts[category] += 1
    category_breakdown = [{"name": cat, "value": count} for cat, count in category_counts.items()]

    return {
        "total_inspections": total_inspections,
        "compliant": compliant,
        "non_compliant": non_compliant,
        "needs_review": needs_review,
        "high_risk": high_risk,
        "open_violations": open_violations,
        "compliance_trend": compliance_trend,
        "violations_severity": violations_severity,
        "category_breakdown": category_breakdown,
    }
