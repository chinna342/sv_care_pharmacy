from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import Delivery, Order, User, Notification, OrderStatusHistory, AuditLog
from schemas import (
    DeliveryAssignRequest,
    DeliveryResponse,
    DeliveryStatusUpdate,
)
from jwt_handler import (
    get_current_user,
    require_pharmacist_or_admin,
    require_delivery,
)

router = APIRouter(
    prefix="/deliveries",
    tags=["Delivery Fleet & Rider Dispatch"]
)


@router.post("/assign/{order_id}", response_model=DeliveryResponse)
def assign_delivery_rider(
    order_id: int,
    payload: DeliveryAssignRequest,
    db: Session = Depends(get_db),
    staff_user: User = Depends(require_pharmacist_or_admin)
):
    """
    Assign an express cold-chain delivery rider to a packed order.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    existing = db.query(Delivery).filter(Delivery.order_id == order_id).first()
    now = datetime.now(timezone.utc)

    if existing:
        existing.rider_user_id = payload.rider_user_id
        existing.rider_name = payload.rider_name
        existing.rider_phone = payload.rider_phone
        existing.delivery_notes = payload.delivery_notes
        existing.assigned_at = now
        delivery = existing
    else:
        delivery = Delivery(
            order_id=order.id,
            rider_user_id=payload.rider_user_id,
            rider_name=payload.rider_name,
            rider_phone=payload.rider_phone,
            delivery_notes=payload.delivery_notes,
            status="ASSIGNED",
            assigned_at=now
        )
        db.add(delivery)

    # Transition order status to READY_FOR_DISPATCH if not already
    if order.order_status in ["PACKED", "ACCEPTED"]:
        order.order_status = "READY_FOR_DISPATCH"

    # Notification to customer
    if order.user_id:
        notif = Notification(
            user_id=order.user_id,
            title=f"Rider Assigned • Order #{order.order_number}",
            message=f"Rider {payload.rider_name} ({payload.rider_phone}) has been assigned for express 15-30 min delivery.",
            notification_type="ORDER_UPDATE",
            order_id=order.id
        )
        db.add(notif)

    db.commit()
    db.refresh(delivery)
    return delivery


@router.get("/my-assignments", response_model=List[DeliveryResponse])
def get_my_delivery_assignments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List deliveries assigned to the currently authenticated delivery rider.
    """
    return (
        db.query(Delivery)
        .filter(Delivery.rider_user_id == current_user.id)
        .order_by(Delivery.created_at.desc())
        .all()
    )


@router.put("/{delivery_id}/status", response_model=DeliveryResponse)
def update_delivery_status(
    delivery_id: int,
    payload: DeliveryStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Rider updates delivery state (OUT_FOR_DELIVERY / DELIVERED).
    """
    delivery = db.query(Delivery).filter(Delivery.id == delivery_id).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery record not found")

    order = db.query(Order).filter(Order.id == delivery.order_id).first()
    now = datetime.now(timezone.utc)
    target = payload.status.upper()

    delivery.status = target
    if target == "OUT_FOR_DELIVERY":
        delivery.dispatched_at = now
        if order:
            order.order_status = "OUT_FOR_DELIVERY"
    elif target == "DELIVERED":
        delivery.delivered_at = now
        if order:
            order.order_status = "DELIVERED"
            order.payment_status = "paid"

    if payload.notes:
        delivery.delivery_notes = payload.notes

    # Notification to customer
    if order and order.user_id:
        msg = "Your order is out for express doorstep delivery!" if target == "OUT_FOR_DELIVERY" else "Your order has been safely delivered. Thank you for choosing SV Care!"
        notif = Notification(
            user_id=order.user_id,
            title=f"Order #{order.order_number}: {target.replace('_', ' ').title()}",
            message=msg,
            notification_type="ORDER_UPDATE",
            order_id=order.id
        )
        db.add(notif)

    db.commit()
    db.refresh(delivery)
    return delivery
