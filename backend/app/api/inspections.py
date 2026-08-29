from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from typing import List
import shutil
import os
import uuid
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.domain import Inspection, Product, InspectionImage, Violation, User
from app.schemas.domain import Inspection as InspectionSchema
from app.ocr.engine import ocr_engine
from app.rules.engine import rule_engine

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/", response_model=InspectionSchema)
def create_inspection(
    inspector_name: str = Form(None),
    product_name: str = Form(None),
    product_id: int = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not product_id and product_name:
        db_product = Product(name=product_name)
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        product_id = db_product.id

    inspection_id_str = f"INS-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

    db_inspection = Inspection(
        inspection_id=inspection_id_str,
        product_id=product_id,
        inspector_name=inspector_name or current_user.full_name or current_user.email,
        status="PENDING",
    )
    db.add(db_inspection)
    db.commit()
    db.refresh(db_inspection)
    return db_inspection


@router.post("/{inspection_id}/images", response_model=InspectionSchema)
def upload_inspection_image(
    inspection_id: int,
    file: UploadFile = File(...),
    view_type: str = Form(default="front"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not db_inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")

    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    db_image = InspectionImage(
        inspection_id=inspection_id,
        image_url=f"/uploads/{filename}",
        view_type=view_type,
    )
    db.add(db_image)

    # Run real OCR pipeline on the uploaded image
    try:
        ocr_results = ocr_engine.process_image(file_path)
    except Exception as e:
        error_text = str(e)
        if "tesseract" in error_text.lower() or "TesseractNotFound" in type(e).__name__:
            raise HTTPException(
                status_code=500,
                detail=(
                    "OCR engine (Tesseract) was not found. If it's installed but in a "
                    "non-standard location, set a TESSERACT_CMD environment variable to its "
                    "full .exe path (e.g. C:\\Program Files\\Tesseract-OCR\\tesseract.exe) "
                    "before starting the backend. See the README's 'Install Tesseract' step."
                ),
            )
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {error_text}")

    # Run rule engine against the extracted declarations
    try:
        compliance_results = rule_engine.evaluate(
            ocr_results["extracted_declarations"],
            ocr_results["readability_score"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rule evaluation failed: {str(e)}")

    # Update Inspection Status
    db_inspection.status = compliance_results["status"]
    db_inspection.compliance_score = compliance_results["score"]

    # Persist every violation found so it's queryable later (dashboard, reports)
    for v in compliance_results["violations"]:
        db.add(Violation(
            inspection_id=db_inspection.id,
            rule_id=v["rule_id"],
            field=v.get("field"),
            status=v["status"],
            severity=v["severity"],
            message=v["message"],
            confidence=v.get("confidence"),
        ))

    db.commit()
    db.refresh(db_inspection)

    return db_inspection


@router.get("/", response_model=List[InspectionSchema])
def list_inspections(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Inspection)
        .options(joinedload(Inspection.violations), joinedload(Inspection.images), joinedload(Inspection.product))
        .order_by(Inspection.created_at.desc())
        .all()
    )


@router.get("/{inspection_id}", response_model=InspectionSchema)
def get_inspection(
    inspection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    inspection = (
        db.query(Inspection)
        .options(joinedload(Inspection.violations), joinedload(Inspection.images), joinedload(Inspection.product))
        .filter(Inspection.id == inspection_id)
        .first()
    )
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return inspection
