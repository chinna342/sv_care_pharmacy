from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from models import Product, Inventory, User, AuditLog
from schemas import ProductCreate, ProductResponse, ProductUpdate
from jwt_handler import (
    get_current_user_optional,
    require_pharmacist_or_admin
)

router = APIRouter(
    prefix="/products",
    tags=["Products & Medicine Management"]
)


# ============================================================
# 1. GET ALL PRODUCTS (Customer Catalog / Staff Management)
# ============================================================

@router.get(
    "/",
    response_model=List[ProductResponse]
)
def get_products(
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    prescription_required: Optional[bool] = None,
    in_stock_only: bool = False,
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    is_staff = current_user and current_user.role in ["ADMIN", "PHARMACIST"]

    query = db.query(Product)
    
    # Non-staff only see active products
    if not (is_staff and include_inactive):
        query = query.filter(Product.is_active == True)

    if in_stock_only:
        query = query.filter(Product.stock > 0)

    if prescription_required is not None:
        query = query.filter(Product.prescription_required == prescription_required)

    # Search filter (name, generic_name, description, brand)
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            (Product.name.ilike(search_term)) |
            (Product.generic_name.ilike(search_term)) |
            (Product.brand.ilike(search_term)) |
            (Product.description.ilike(search_term))
        )

    # Category filter
    if category_id:
        query = query.filter(Product.category_id == category_id)

    products = query.order_by(Product.id.asc()).all()
    return products


# ============================================================
# 2. GET SINGLE PRODUCT
# ============================================================

@router.get(
    "/{product_id}",
    response_model=ProductResponse
)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_active == True
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Medicine not found or inactive"
        )

    return product


# ============================================================
# 3. CREATE PRODUCT (Admin & Pharmacist Protected)
# ============================================================

@router.post(
    "/",
    response_model=ProductResponse,
    status_code=201
)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    staff_user: User = Depends(require_pharmacist_or_admin)
):
    if product_data.price <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Medicine price must be greater than 0"
        )
    if product_data.stock < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stock quantity cannot be negative"
        )

    product = Product(
        name=product_data.name.strip(),
        generic_name=product_data.generic_name,
        brand=product_data.brand,
        manufacturer=product_data.manufacturer,
        strength=product_data.strength,
        pack_size=product_data.pack_size,
        form=product_data.form,
        description=product_data.description,
        price=product_data.price,
        mrp=product_data.mrp or (product_data.price * 1.2),
        discount_percent=product_data.discount_percent or 0,
        stock=product_data.stock,
        image=product_data.image,
        category_id=product_data.category_id,
        prescription_required=product_data.prescription_required,
        is_active=product_data.is_active
    )

    db.add(product)
    db.flush()

    # Create associated Inventory entity
    inv = Inventory(
        product_id=product.id,
        available_quantity=product.stock,
        reserved_quantity=0,
        sold_quantity=0,
        reorder_level=15,
        status="OUT_OF_STOCK" if product.stock <= 0 else ("LOW_STOCK" if product.stock <= 15 else "IN_STOCK")
    )
    db.add(inv)

    # Audit log
    audit = AuditLog(
        user_id=staff_user.id,
        user_name=staff_user.name,
        user_role=staff_user.role,
        action="CREATE_MEDICINE",
        entity="PRODUCT",
        entity_id=str(product.id),
        old_value=None,
        new_value=f"Created medicine '{product.name}' (Price: ₹{product.price}, Stock: {product.stock})"
    )
    db.add(audit)

    db.commit()
    db.refresh(product)
    return product


# ============================================================
# 4. UPDATE PRODUCT (Admin & Pharmacist Protected)
# ============================================================

@router.put(
    "/{product_id}",
    response_model=ProductResponse
)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
    staff_user: User = Depends(require_pharmacist_or_admin)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Medicine not found"
        )

    update_data = product_data.model_dump(exclude_unset=True)

    if "price" in update_data and update_data["price"] is not None and update_data["price"] <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Medicine price must be greater than 0"
        )
    if "stock" in update_data and update_data["stock"] is not None and update_data["stock"] < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stock quantity cannot be negative"
        )

    old_price = product.price
    old_stock = product.stock

    for field, value in update_data.items():
        setattr(product, field, value)

    # Sync inventory available quantity if stock changed
    if "stock" in update_data and update_data["stock"] is not None:
        inv = db.query(Inventory).filter(Inventory.product_id == product.id).first()
        if inv:
            inv.available_quantity = product.stock
            inv.status = "OUT_OF_STOCK" if product.stock <= 0 else ("LOW_STOCK" if product.stock <= inv.reorder_level else "IN_STOCK")

    # Audit log
    audit = AuditLog(
        user_id=staff_user.id,
        user_name=staff_user.name,
        user_role=staff_user.role,
        action="UPDATE_MEDICINE",
        entity="PRODUCT",
        entity_id=str(product.id),
        old_value=f"Price: ₹{old_price}, Stock: {old_stock}",
        new_value=f"Price: ₹{product.price}, Stock: {product.stock}"
    )
    db.add(audit)

    db.commit()
    db.refresh(product)
    return product


# ============================================================
# 5. DELETE PRODUCT (Soft Delete - Admin & Pharmacist)
# ============================================================

@router.delete(
    "/{product_id}"
)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    staff_user: User = Depends(require_pharmacist_or_admin)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Medicine not found"
        )

    product.is_active = False

    audit = AuditLog(
        user_id=staff_user.id,
        user_name=staff_user.name,
        user_role=staff_user.role,
        action="DEACTIVATE_MEDICINE",
        entity="PRODUCT",
        entity_id=str(product.id),
        old_value="Active: True",
        new_value="Active: False"
    )
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "message": f"Medicine '{product.name}' deactivated successfully",
        "product_id": product_id
    }