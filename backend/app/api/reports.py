from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.domain import Inspection, User

router = APIRouter()

@router.get("/{inspection_id}")
def generate_report(
    inspection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")

    # In a real app, this would use reportlab or xhtml2pdf to generate a binary PDF.
    # For prototype, we return the structured report data that the frontend can render or print.

    return {
        "report_id": f"REP-{inspection.inspection_id}",
        "title": "PACKAGED COMMODITY COMPLIANCE INSPECTION REPORT",
        "inspection_details": {
            "id": inspection.inspection_id,
            "inspector": inspection.inspector_name,
            "date": inspection.created_at.strftime("%d-%b-%Y")
        },
        "overall_result": inspection.status,
        "compliance_score": inspection.compliance_score,
        "violations": [
            {
                "rule_id": v.rule_id,
                "field": v.field,
                "status": v.status,
                "severity": v.severity,
                "message": v.message,
                "confidence": v.confidence,
            }
            for v in inspection.violations
        ],
        "evidence_images": [img.image_url for img in inspection.images],
        "disclaimer": "This system is an AI-assisted inspection and decision-support tool. Automated findings are indicative and should be verified."
    }
