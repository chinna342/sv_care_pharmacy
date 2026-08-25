from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import (
    AuditLog,
    Inventory,
    Order,
    OrderItem,
    Product,
    User,
    UserRole
)
from schemas import (
    AuditLogResponse,
    DashboardAnalyticsResponse,
    UserResponse,
    UserUpdateRole
)
from jwt_handler import require_admin

router = APIRouter(
    prefix="/admin",
    tags=["Store Administration & Platform Governance"]
)


# ============================================================
# 1. USER & ROLE MANAGEMENT
# ============================================================

@router.get("/users", response_model=List[UserResponse])
def list_users(
    role: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(default=100, le=500),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """
    List registered platform users with role filters. (Admin only)
    """
    query = db.query(User)
    if role:
        query = query.filter(User.role == role.upper())
    if search:
        search_fmt = f"%{search}%"
        query = query.filter((User.name.ilike(search_fmt)) | (User.phone.ilike(search_fmt)) | (User.email.ilike(search_fmt)))

    return query.order_by(User.created_at.desc()).limit(limit).all()


@router.put("/users/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: int,
    payload: UserUpdateRole,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """
    Change user role (CUSTOMER, PHARMACIST, ADMIN, DELIVERY). (Admin only)
    """
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    new_role = payload.role.upper()
    if new_role not in ["CUSTOMER", "PHARMACIST", "ADMIN", "DELIVERY"]:
        raise HTTPException(status_code=400, detail="Invalid role specified")

    old_role = target_user.role
    target_user.role = new_role

    # Audit log
    audit = AuditLog(
        user_id=admin_user.id,
        user_name=admin_user.name,
        user_role=admin_user.role,
        action="UPDATE_USER_ROLE",
        entity="USER",
        entity_id=str(target_user.id),
        old_value=f"Role: {old_role}",
        new_value=f"Role: {new_role}"
    )
    db.add(audit)
    db.commit()
    db.refresh(target_user)

    return target_user


@router.put("/users/{user_id}/toggle-status", response_model=UserResponse)
def toggle_user_active_status(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    target_user.is_active = not target_user.is_active

    audit = AuditLog(
        user_id=admin_user.id,
        user_name=admin_user.name,
        user_role=admin_user.role,
        action="TOGGLE_USER_STATUS",
        entity="USER",
        entity_id=str(target_user.id),
        old_value=f"Active: {not target_user.is_active}",
        new_value=f"Active: {target_user.is_active}"
    )
    db.add(audit)
    db.commit()
    db.refresh(target_user)
    return target_user


# ============================================================
# 2. AUDIT LOGS
# ============================================================

@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    entity: Optional[str] = None,
    limit: int = Query(default=100, le=500),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    query = db.query(AuditLog)
    if entity:
        query = query.filter(AuditLog.entity == entity.upper())

    logs = query.order_by(AuditLog.created_at.desc()).limit(limit).all()
    return logs


# ============================================================
# 3. ANALYTICS & METRICS
# ============================================================

@router.get("/analytics", response_model=DashboardAnalyticsResponse)
def get_dashboard_analytics(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    total_orders = db.query(Order).count()
    
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    todays_orders = db.query(Order).filter(Order.created_at >= today_start).count()

    total_revenue_result = db.query(func.sum(Order.total)).filter(Order.payment_status == "paid").scalar()
    total_revenue = float(total_revenue_result or 0.0)

    pending_orders = db.query(Order).filter(Order.order_status == "PENDING_PHARMACIST_REVIEW").count()
    accepted_orders = db.query(Order).filter(Order.order_status == "ACCEPTED").count()
    packing_orders = db.query(Order).filter(Order.order_status == "PACKING").count()
    dispatched_orders = db.query(Order).filter(Order.order_status.in_(["PACKED", "READY_FOR_DISPATCH", "OUT_FOR_DELIVERY"])).count()
    delivered_orders = db.query(Order).filter(Order.order_status == "DELIVERED").count()
    cancelled_orders = db.query(Order).filter(Order.order_status.in_(["CANCELLED", "REJECTED"])).count()

    total_medicines = db.query(Product).filter(Product.is_active == True).count()
    low_stock_count = db.query(Product).filter(Product.is_active == True, Product.stock > 0, Product.stock <= 15).count()
    out_of_stock_count = db.query(Product).filter(Product.is_active == True, Product.stock <= 0).count()

    total_customers = db.query(User).filter(User.role == "CUSTOMER").count()

    # Top selling medicines
    top_selling = (
        db.query(OrderItem.product_name, func.sum(OrderItem.quantity).label("total_sold"))
        .group_by(OrderItem.product_name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
        .all()
    )
    top_selling_medicines = [{"name": r[0], "sold": int(r[1])} for r in top_selling]

    # Recent orders
    recent = db.query(Order).order_by(Order.created_at.desc()).limit(6).all()
    recent_orders = [
        {
            "id": o.id,
            "order_number": o.order_number,
            "total": float(o.total),
            "status": o.order_status,
            "payment_status": o.payment_status,
            "created_at": o.created_at.isoformat() if o.created_at else None
        }
        for o in recent
    ]

    return DashboardAnalyticsResponse(
        total_orders=total_orders,
        todays_orders=todays_orders,
        total_revenue=total_revenue,
        pending_orders=pending_orders,
        accepted_orders=accepted_orders,
        packing_orders=packing_orders,
        dispatched_orders=dispatched_orders,
        delivered_orders=delivered_orders,
        cancelled_orders=cancelled_orders,
        total_medicines=total_medicines,
        low_stock_count=low_stock_count,
        out_of_stock_count=out_of_stock_count,
        total_customers=total_customers,
        top_selling_medicines=top_selling_medicines,
        recent_orders=recent_orders
    )
