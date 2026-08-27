import json
import logging
from decimal import Decimal
from typing import List, Optional
from uuid import uuid4
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import (
    Address,
    Inventory,
    Notification,
    Order,
    OrderItem,
    OrderStatusHistory,
    Product,
    StockMovement,
    User,
    AuditLog
)
from schemas import (
    OrderCreate,
    OrderResponse,
    OrderStatusUpdate,
    OrderStatusHistoryResponse
)
from jwt_handler import (
    get_current_user,
    get_current_user_optional,
    require_pharmacist_or_admin
)
from ws_manager import ws_manager
from cache import cache
from email_service import send_order_confirmation_email

# Configure production logger
logger = logging.getLogger("svcare.orders")
logger.setLevel(logging.INFO)
if not logger.handlers:
    ch = logging.StreamHandler()
    formatter = logging.Formatter('[%(asctime)s] [%(levelname)s] [SVCARE_PROD_ORDER] %(message)s')
    ch.setFormatter(formatter)
    logger.addHandler(ch)

router = APIRouter(
    prefix="/orders",
    tags=["Orders & Fulfillment State Machine"]
)

# Valid Order State Machine Transitions
VALID_TRANSITIONS = {
    "PENDING_PHARMACIST_REVIEW": ["ACCEPTED", "REJECTED", "CANCELLED"],
    "ACCEPTED": ["PACKING", "CANCELLED"],
    "PACKING": ["PACKED", "CANCELLED"],
    "PACKED": ["READY_FOR_DISPATCH"],
    "READY_FOR_DISPATCH": ["OUT_FOR_DELIVERY"],
    "OUT_FOR_DELIVERY": ["DELIVERED"],
    "DELIVERED": [],
    "REJECTED": [],
    "CANCELLED": []
}


def log_status_change(
    order: Order,
    prev_status: str,
    new_status: str,
    user: Optional[User],
    reason: Optional[str],
    db: Session
):
    """Records audit history and sends in-app notification to the customer."""
    history = OrderStatusHistory(
        order_id=order.id,
        previous_status=prev_status,
        new_status=new_status,
        changed_by_id=user.id if user else None,
        changed_by_name=user.name if user else "System",
        user_role=user.role if user else "SYSTEM",
        reason=reason or f"Order transitioned to {new_status}"
    )
    db.add(history)

    # Structured server log for status transition
    logger.info(
        json.dumps({
            "event": "ORDER_STATUS_CHANGED",
            "order_id": order.id,
            "order_number": order.order_number,
            "previous_status": prev_status,
            "new_status": new_status,
            "changed_by": user.name if user else "System",
            "user_role": user.role if user else "SYSTEM",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
    )

    # In-App Customer Notification
    if order.user_id:
        status_readable = new_status.replace("_", " ").title()
        notif = Notification(
            user_id=order.user_id,
            title=f"Order {order.order_number}: {status_readable}",
            message=reason or f"Your order #{order.order_number} status has been updated to {status_readable}.",
            notification_type="ORDER_UPDATE",
            order_id=order.id
        )
        db.add(notif)
        logger.info(
            json.dumps({
                "event": "NOTIFICATION_SENT",
                "user_id": order.user_id,
                "order_id": order.id,
                "order_number": order.order_number,
                "notification_type": "ORDER_UPDATE",
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
        )


# ============================================================
# 1. CREATE ORDER (Transactional & Stock Reservation)
# ============================================================

@router.post(
    "/",
    response_model=OrderResponse,
    status_code=201
)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    if not order_data.items:
        raise HTTPException(
            status_code=400,
            detail="Order must contain at least one medicine"
        )

    try:
        # Check if user exists by phone if not authenticated
        effective_user_id = current_user.id if current_user else None
        if not effective_user_id and order_data.phone:
            clean_phone = order_data.phone.strip()
            existing_user = db.query(User).filter(User.phone == clean_phone).first()
            if existing_user:
                effective_user_id = existing_user.id
            else:
                # Auto-create customer account so orders are permanently stored & accessible in PostgreSQL
                new_customer = User(
                    phone=clean_phone,
                    name=order_data.name.strip() or "Valued Customer",
                    role="CUSTOMER",
                    is_active=True,
                    is_verified=True
                )
                db.add(new_customer)
                db.flush()
                effective_user_id = new_customer.id

        # 1. Create Delivery Address
        address = Address(
            user_id=effective_user_id,
            name=order_data.name.strip(),
            phone=order_data.phone.strip(),
            house=order_data.house.strip(),
            area=order_data.area.strip(),
            city=order_data.city.strip(),
            pincode=order_data.pincode.strip(),
        )
        db.add(address)
        db.flush()

        # 2. Recalculate Subtotal & Verify Stock with Row Locking
        subtotal = Decimal("0.00")
        order_items_to_create = []
        requires_rx = False

        for item_data in order_data.items:
            # SELECT ... FOR UPDATE ensures race conditions / overselling are prevented
            product = (
                db.query(Product)
                .filter(Product.id == item_data.product_id, Product.is_active == True)
                .with_for_update()
                .first()
            )

            if not product:
                error_msg = f"Medicine ID {item_data.product_id} is no longer available"
                logger.error(
                    json.dumps({
                        "event": "ORDER_FAILED",
                        "reason": error_msg,
                        "phone": order_data.phone.strip(),
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    })
                )
                raise HTTPException(status_code=404, detail=error_msg)

            if product.stock < item_data.quantity:
                error_msg = f"Insufficient stock for {product.name}. Available: {product.stock}, requested: {item_data.quantity}"
                logger.error(
                    json.dumps({
                        "event": "ORDER_FAILED",
                        "reason": error_msg,
                        "product_id": product.id,
                        "product_name": product.name,
                        "available_stock": product.stock,
                        "requested_quantity": item_data.quantity,
                        "phone": order_data.phone.strip(),
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    })
                )
                raise HTTPException(status_code=400, detail=error_msg)

            if product.prescription_required:
                requires_rx = True

            item_subtotal = Decimal(str(product.price)) * item_data.quantity
            subtotal += item_subtotal

            order_item = OrderItem(
                product_id=product.id,
                product_name=product.name,
                price=product.price,
                quantity=item_data.quantity,
                subtotal=item_subtotal,
            )
            order_items_to_create.append((order_item, product))

        # 3. Dynamic Delivery Fee
        delivery_fee = Decimal("0.00") if subtotal >= Decimal("500.00") else Decimal("40.00")
        total = subtotal + delivery_fee

        # 4. Generate Order Identifier (Authoritative server generation)
        order_number = "SV" + uuid4().hex[:8].upper()

        payment_status = "paid" if order_data.payment_id and "COD" not in order_data.payment_id else "pending"
        initial_status = "PENDING_PHARMACIST_REVIEW"

        rx_status = "NOT_REQUIRED"
        if requires_rx:
            rx_status = "PENDING_REVIEW" if order_data.prescription_uploaded else "UPLOAD_REQUIRED"

        order = Order(
            order_number=order_number,
            user_id=effective_user_id,
            address_id=address.id,
            payment_method=order_data.payment_method,
            payment_status=payment_status,
            order_status=initial_status,
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            total=total,
            payment_id=order_data.payment_id,
            payment_signature=order_data.payment_signature,
            gateway_name=order_data.gateway_name or "SV Care Gateway",
            prescription_required=requires_rx,
            prescription_status=rx_status,
            paid_at=datetime.now(timezone.utc) if payment_status == "paid" else None
        )
        db.add(order)
        db.flush()

        # 5. Deduct Stock & Record Movement
        for order_item, product in order_items_to_create:
            order_item.order_id = order.id
            db.add(order_item)

            # Deduct product stock
            prev_stock = product.stock
            product.stock -= order_item.quantity

            # Update or create Inventory record
            inv = db.query(Inventory).filter(Inventory.product_id == product.id).first()
            if inv:
                inv.available_quantity = product.stock
                inv.sold_quantity += order_item.quantity
                inv.status = "OUT_OF_STOCK" if product.stock <= 0 else ("LOW_STOCK" if product.stock <= inv.reorder_level else "IN_STOCK")
                
                # Stock Movement Record
                movement = StockMovement(
                    inventory_id=inv.id,
                    product_id=product.id,
                    movement_type="STOCK_RESERVED",
                    quantity=order_item.quantity,
                    previous_qty=prev_stock,
                    new_qty=product.stock,
                    reason=f"Order {order.order_number} reservation",
                    reference_id=order.order_number,
                    user_id=effective_user_id
                )
                db.add(movement)

        # 6. Initial Status History
        log_status_change(
            order=order,
            prev_status=None,
            new_status=initial_status,
            user=current_user,
            reason="Order placed by customer and waiting for clinical pharmacist review.",
            db=db
        )

        db.commit()
        db.refresh(order)

        # Structured production server log for successful order creation
        logger.info(
            json.dumps({
                "event": "ORDER_CREATED",
                "order_id": order.id,
                "order_number": order.order_number,
                "customer_id": effective_user_id,
                "total_amount": float(order.total),
                "items_count": len(order.items),
                "payment_method": order.payment_method,
                "payment_status": order.payment_status,
                "prescription_required": order.prescription_required,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
        )

        # Invalidate product catalog cache due to stock reservation
        cache.invalidate("products:")

        # Real-time WebSocket dispatch broadcast to Pharmacist, Admin, Delivery & Customer
        ws_manager.broadcast_sync(
            "ORDER_CREATED",
            {
                "order_id": order.id,
                "order_number": order.order_number,
                "customer_id": effective_user_id,
                "total": float(order.total),
                "order_status": order.order_status,
                "prescription_required": order.prescription_required,
                "prescription_status": order.prescription_status,
                "items_count": len(order.items),
                "created_at": order.created_at.isoformat() if order.created_at else datetime.now(timezone.utc).isoformat()
            },
            channels=["pharmacist", "admin", "customer", "all"]
        )

        return order

    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        logger.error(
            json.dumps({
                "event": "ORDER_FAILED",
                "reason": str(exc),
                "phone": order_data.phone.strip() if hasattr(order_data, "phone") else "unknown",
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
        )
        raise HTTPException(
            status_code=500,
            detail=f"Failed to securely create order: {str(exc)}"
        )


# ============================================================
# 2. GET ALL ORDERS (Role-Aware)
# ============================================================

@router.get("/", response_model=List[OrderResponse])
def get_orders(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    List orders:
    - CUSTOMER: sees only their own orders
    - PHARMACIST / ADMIN / DELIVERY: sees all orders with filter
    """
    query = db.query(Order)

    if not current_user:
        # Guest gets empty or recent session
        return []

    user_role = (current_user.role or "CUSTOMER").upper()
    if user_role == "CUSTOMER":
        query = query.filter(Order.user_id == current_user.id)

    if status_filter:
        query = query.filter(Order.order_status == status_filter.upper())

    orders = query.order_by(Order.created_at.desc()).all()
    return orders


# ============================================================
# 3. GET SINGLE ORDER
# ============================================================

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    query = db.query(Order)
    if order_id.isdigit():
        order = query.filter(Order.id == int(order_id)).first()
    else:
        order = query.filter(Order.order_number == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Authorization Check
    if current_user and current_user.role == "CUSTOMER":
        if order.user_id and order.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Forbidden: You cannot access other customers' orders.")

    return order


# ============================================================
# 4. UPDATE ORDER STATUS (State Machine Enforced)
# ============================================================

@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Validates state transitions and updates order status.
    - CUSTOMER: Can only cancel if current state allows cancellation.
    - PHARMACIST / ADMIN: Full state machine control.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    curr_status = order.order_status
    target_status = payload.new_status.upper()

    user_role = (current_user.role or "CUSTOMER").upper()

    # Customer permissions check
    if user_role == "CUSTOMER":
        if order.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to modify this order")
        if target_status != "CANCELLED":
            raise HTTPException(status_code=403, detail="Customers may only request order cancellation")
        if curr_status not in ["PENDING_PHARMACIST_REVIEW", "ACCEPTED"]:
            raise HTTPException(status_code=400, detail="Order cannot be cancelled once packing has started.")
    elif user_role not in ["ADMIN", "PHARMACIST", "DELIVERY"]:
        raise HTTPException(status_code=403, detail="Insufficient role permissions")

    # State Machine Validation
    allowed_next = VALID_TRANSITIONS.get(curr_status, [])
    if target_status not in allowed_next:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid state transition from '{curr_status}' to '{target_status}'. Allowed transitions: {allowed_next}"
        )

    # Perform State Transition
    order.order_status = target_status
    if payload.rejection_reason:
        order.rejection_reason = payload.rejection_reason

    if target_status == "REJECTED" or target_status == "CANCELLED":
        # Release reserved inventory back to warehouse
        for item in order.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                prev_stock = product.stock
                product.stock += item.quantity
                inv = db.query(Inventory).filter(Inventory.product_id == product.id).first()
                if inv:
                    inv.available_quantity = product.stock
                    inv.status = "IN_STOCK"
                    movement = StockMovement(
                        inventory_id=inv.id,
                        product_id=product.id,
                        movement_type="STOCK_RELEASED",
                        quantity=item.quantity,
                        previous_qty=prev_stock,
                        new_qty=product.stock,
                        reason=f"Order {order.order_number} {target_status.lower()}",
                        reference_id=order.order_number,
                        user_id=current_user.id
                    )
                    db.add(movement)

    # Log to status history & trigger customer notification
    log_status_change(
        order=order,
        prev_status=curr_status,
        new_status=target_status,
        user=current_user,
        reason=payload.reason or payload.rejection_reason or f"Status updated to {target_status}",
        db=db
    )

    db.commit()
    db.refresh(order)

    # Real-time WebSocket dispatch broadcast for status updates
    ws_manager.broadcast_sync(
        "ORDER_STATUS_CHANGED",
        {
            "order_id": order.id,
            "order_number": order.order_number,
            "previous_status": curr_status,
            "new_status": target_status,
            "user_role": user_role,
            "user_id": current_user.id if current_user else None,
            "reason": payload.reason or payload.rejection_reason or f"Status updated to {target_status}"
        },
        channels=["pharmacist", "admin", "delivery", "customer", "all"]
    )

    return order


# ============================================================
# 5. GET ORDER STATUS HISTORY
# ============================================================

@router.get("/{order_id}/history", response_model=List[OrderStatusHistoryResponse])
def get_order_history(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if current_user and current_user.role == "CUSTOMER" and order.user_id and order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return order.status_history