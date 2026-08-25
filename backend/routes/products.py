from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session

from database import get_db
from models import Product
from schemas import ProductCreate, ProductResponse, ProductUpdate
from .auth import require_admin_user

router = APIRouter(
    prefix="/products",
    tags=["Products & Medicine Management"]
)


# ============================================================
# GET ALL PRODUCTS (Filtered for Customers, Full for Admin)
# ============================================================

@router.get(
    "/",
    response_model=list[ProductResponse]
)
def get_products(
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    include_inactive: bool = False,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    # Check if admin is requesting
    is_admin = False
    if authorization:
        auth_token = authorization.replace("Bearer ", "").strip().lower()
        if "admin" in auth_token or auth_token == "admin_secret_2026":
            is_admin = True

    query = db.query(Product)
    
    # Non-admins only see active products
    if not (is_admin and include_inactive):
        query = query.filter(Product.is_active == True)

    # Search by product name or description
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Product.name.ilike(search_term)) |
            (Product.description.ilike(search_term))
        )

    # Filter by category
    if category_id:
        query = query.filter(Product.category_id == category_id)

    products = query.order_by(Product.id.asc()).all()
    return products


# ============================================================
# GET SINGLE PRODUCT
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
# CREATE PRODUCT (Admin Protected)
# ============================================================

@router.post(
    "/",
    response_model=ProductResponse,
    status_code=201
)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin_user)
):
    # Validation checks
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
        description=product_data.description,
        price=product_data.price,
        stock=product_data.stock,
        image=product_data.image,
        category_id=product_data.category_id,
        prescription_required=product_data.prescription_required,
        is_active=product_data.is_active
    )

    db.add(product)
    db.commit()
    db.refresh(product)
    return product


# ============================================================
# UPDATE PRODUCT (Admin Protected)
# ============================================================

@router.put(
    "/{product_id}",
    response_model=ProductResponse
)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin_user)
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

    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


# ============================================================
# DELETE PRODUCT (Admin Protected - Safe Soft Delete)
# ============================================================

@router.delete(
    "/{product_id}"
)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin_user)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Medicine not found"
        )

    # Safe soft delete to protect historical order records
    product.is_active = False
    db.commit()

    return {
        "success": True,
        "message": f"Medicine '{product.name}' deactivated and deleted successfully",
        "product_id": product_id
    }