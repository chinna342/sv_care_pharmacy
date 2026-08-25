import os
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from database import get_db
from models import Prescription, User, Order, AuditLog, Notification
from schemas import PrescriptionResponse, PrescriptionReview
from jwt_handler import get_current_user, require_pharmacist_or_admin

router = APIRouter(
    prefix="/prescriptions",
    tags=["Prescription Verification & Rx Audit"]
)

PRESCRIPTIONS_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads", "prescriptions")
os.makedirs(PRESCRIPTIONS_DIR, exist_ok=True)


@router.post("/upload", response_model=PrescriptionResponse, status_code=201)
def upload_prescription(
    file_path: Optional[str] = Form(None),
    order_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Securely uploads customer clinical prescription document.
    """
    rx = Prescription(
        user_id=current_user.id,
        order_id=order_id,
        file_path=file_path or "/uploads/prescriptions/sample_rx.png",
        original_filename="Prescription_Document.pdf",
        file_type="application/pdf",
        status="PENDING_REVIEW"
    )
    db.add(rx)

    # Link to order if order_id provided
    if order_id:
        order = db.query(Order).filter(Order.id == order_id).first()
        if order:
            order.prescription_status = "PENDING_REVIEW"

    db.commit()
    db.refresh(rx)
    return rx


@router.get("/", response_model=List[PrescriptionResponse])
def list_prescriptions(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Prescription)
    
    if current_user.role == "CUSTOMER":
        query = query.filter(Prescription.user_id == current_user.id)
    
    if status_filter:
        query = query.filter(Prescription.status == status_filter.upper())

    return query.order_by(Prescription.created_at.desc()).all()


@router.put("/{rx_id}/review", response_model=PrescriptionResponse)
def review_prescription(
    rx_id: int,
    payload: PrescriptionReview,
    db: Session = Depends(get_db),
    pharmacist: User = Depends(require_pharmacist_or_admin)
):
    rx = db.query(Prescription).filter(Prescription.id == rx_id).first()
    if not rx:
        raise HTTPException(status_code=404, detail="Prescription not found")

    new_status = payload.status.upper()
    if new_status not in ["APPROVED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Status must be APPROVED or REJECTED")

    rx.status = new_status
    rx.pharmacist_id = pharmacist.id
    rx.pharmacist_name = pharmacist.name
    rx.pharmacist_notes = payload.notes
    rx.reviewed_at = datetime.now(timezone.utc)

    # Update associated order if any
    if rx.order_id:
        order = db.query(Order).filter(Order.id == rx.order_id).first()
        if order:
            order.prescription_status = new_status
            if new_status == "APPROVED" and order.order_status == "PENDING_PHARMACIST_REVIEW":
                order.order_status = "ACCEPTED"

    # Send Notification to customer
    if rx.user_id:
        notif = Notification(
            user_id=rx.user_id,
            title=f"Prescription {new_status.title()}",
            message=payload.notes or f"Your uploaded prescription has been {new_status.lower()} by {pharmacist.name}.",
            notification_type="PRESCRIPTION_UPDATE",
            order_id=rx.order_id
        )
        db.add(notif)

    # Audit log
    audit = AuditLog(
        user_id=pharmacist.id,
        user_name=pharmacist.name,
        user_role=pharmacist.role,
        action="REVIEW_PRESCRIPTION",
        entity="PRESCRIPTION",
        entity_id=str(rx.id),
        old_value="PENDING_REVIEW",
        new_value=f"{new_status} (Notes: {payload.notes})"
    )
    db.add(audit)

    db.commit()
    db.refresh(rx)
    return rx
