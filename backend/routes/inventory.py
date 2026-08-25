from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from models import Inventory, Product, StockMovement, User, AuditLog
from schemas import (
    InventoryAdjustRequest,
    InventoryResponse,
    StockMovementResponse
)
from jwt_handler import require_pharmacist_or_admin

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory & Stock Management"]
)


def ensure_inventory_record(product: Product, db: Session) -> Inventory:
    """Helper to ensure an inventory record exists for a product."""
    inv = db.query(Inventory).filter(Inventory.product_id == product.id).first()
    if not inv:
        status_val = "OUT_OF_STOCK" if product.stock <= 0 else ("LOW_STOCK" if product.stock <= 15 else "IN_STOCK")
        inv = Inventory(
            product_id=product.id,
            available_quantity=product.stock,
            reserved_quantity=0,
            sold_quantity=0,
            reorder_level=15,
            status=status_val
        )
        db.add(inv)
        db.commit()
        db.refresh(inv)
    return inv


@router.get("/", response_model=List[InventoryResponse])
def get_inventory(
    low_stock_only: bool = False,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_pharmacist_or_admin)
):
    """
    List all warehouse stock levels, reservations, and reorder warnings.
    Restricted to Pharmacist and Admin.
    """
    products = db.query(Product).filter(Product.is_active == True).all()
    results = []

    for p in products:
        inv = ensure_inventory_record(p, db)
        
        if low_stock_only and inv.available_quantity > inv.reorder_level:
            continue

        if search and search.lower() not in p.name.lower() and search.lower() not in (p.generic_name or "").lower():
            continue

        results.append({
            "id": inv.id,
            "product_id": p.id,
            "product_name": p.name,
            "available_quantity": inv.available_quantity,
            "reserved_quantity": inv.reserved_quantity,
            "sold_quantity": inv.sold_quantity,
            "reorder_level": inv.reorder_level,
            "status": inv.status,
            "updated_at": inv.updated_at
        })

    return results


@router.post("/adjust", response_model=InventoryResponse)
def adjust_inventory_stock(
    payload: InventoryAdjustRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_pharmacist_or_admin)
):
    """
    Adjust inventory stock manually with audit and stock movement recording.
    """
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Medicine not found")

    inv = ensure_inventory_record(product, db)
    prev_qty = inv.available_quantity
    
    adj_type = payload.adjustment_type.upper()
    if adj_type == "ADD":
        new_qty = prev_qty + payload.quantity
    elif adj_type == "DEDUCT":
        if payload.quantity > prev_qty:
            raise HTTPException(status_code=400, detail="Cannot deduct more than available quantity")
        new_qty = prev_qty - payload.quantity
    elif adj_type == "SET":
        new_qty = payload.quantity
    else:
        raise HTTPException(status_code=400, detail="Invalid adjustment type (Use ADD, DEDUCT, or SET)")

    # Update Inventory & Product
    inv.available_quantity = new_qty
    product.stock = new_qty
    
    if new_qty <= 0:
        inv.status = "OUT_OF_STOCK"
    elif new_qty <= inv.reorder_level:
        inv.status = "LOW_STOCK"
    else:
        inv.status = "IN_STOCK"

    # Create StockMovement record
    movement = StockMovement(
        inventory_id=inv.id,
        product_id=product.id,
        movement_type="STOCK_ADJUSTED",
        quantity=abs(new_qty - prev_qty),
        previous_qty=prev_qty,
        new_qty=new_qty,
        reason=payload.reason,
        user_id=current_user.id
    )
    db.add(movement)

    # Audit Log
    audit = AuditLog(
        user_id=current_user.id,
        user_name=current_user.name,
        user_role=current_user.role,
        action="ADJUST_STOCK",
        entity="INVENTORY",
        entity_id=str(inv.id),
        old_value=f"Stock: {prev_qty}",
        new_value=f"Stock: {new_qty} (Reason: {payload.reason})"
    )
    db.add(audit)

    db.commit()
    db.refresh(inv)

    return {
        "id": inv.id,
        "product_id": product.id,
        "product_name": product.name,
        "available_quantity": inv.available_quantity,
        "reserved_quantity": inv.reserved_quantity,
        "sold_quantity": inv.sold_quantity,
        "reorder_level": inv.reorder_level,
        "status": inv.status,
        "updated_at": inv.updated_at
    }


@router.get("/movements", response_model=List[StockMovementResponse])
def get_stock_movements(
    product_id: Optional[int] = None,
    limit: int = Query(default=50, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_pharmacist_or_admin)
):
    """
    Get audit history of all physical stock movements.
    """
    query = db.query(StockMovement)
    if product_id:
        query = query.filter(StockMovement.product_id == product_id)

    movements = query.order_by(StockMovement.created_at.desc()).limit(limit).all()
    return movements
