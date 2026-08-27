from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import Category, User, AuditLog
from schemas import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
)
from jwt_handler import require_admin
from cache import cache

router = APIRouter(
    prefix="/categories",
    tags=["Categories Management"]
)


# ============================================================
# 1. GET ALL ACTIVE CATEGORIES (Public)
# ============================================================

@router.get(
    "/",
    response_model=List[CategoryResponse]
)
def get_categories(
    include_inactive: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(Category)
    if not include_inactive:
        query = query.filter(Category.is_active == True)
    return query.order_by(Category.id.asc()).all()


# ============================================================
# 2. GET SINGLE CATEGORY (Public)
# ============================================================

@router.get(
    "/{category_id}",
    response_model=CategoryResponse
)
def get_category(
    category_id: int,
    db: Session = Depends(get_db)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )
    return category


# ============================================================
# 3. CREATE CATEGORY (Admin Only)
# ============================================================

@router.post(
    "/",
    response_model=CategoryResponse,
    status_code=201
)
def create_category(
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    existing = db.query(Category).filter(Category.name.ilike(category_data.name.strip())).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="A category with this name already exists"
        )

    category = Category(
        name=category_data.name.strip(),
        description=category_data.description,
        image=category_data.image,
        icon=category_data.icon or "💊",
        badge=category_data.badge,
        is_active=category_data.is_active,
    )
    db.add(category)
    db.flush()

    audit = AuditLog(
        user_id=admin_user.id,
        user_name=admin_user.name,
        user_role=admin_user.role,
        action="CREATE_CATEGORY",
        entity="CATEGORY",
        entity_id=str(category.id),
        new_value=f"Created category '{category.name}'"
    )
    db.add(audit)

    db.commit()
    db.refresh(category)
    cache.invalidate("categories:")
    return category


# ============================================================
# 4. UPDATE CATEGORY (Admin Only)
# ============================================================

@router.put(
    "/{category_id}",
    response_model=CategoryResponse
)
def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    update_data = category_data.model_dump(exclude_unset=True)
    old_name = category.name

    for field, value in update_data.items():
        setattr(category, field, value)

    audit = AuditLog(
        user_id=admin_user.id,
        user_name=admin_user.name,
        user_role=admin_user.role,
        action="UPDATE_CATEGORY",
        entity="CATEGORY",
        entity_id=str(category.id),
        old_value=f"Name: {old_name}",
        new_value=f"Updated category: {update_data}"
    )
    db.add(audit)

    db.commit()
    db.refresh(category)
    cache.invalidate("categories:")
    return category


# ============================================================
# 5. DELETE / DEACTIVATE CATEGORY (Admin Only)
# ============================================================

@router.delete(
    "/{category_id}"
)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    category.is_active = False

    audit = AuditLog(
        user_id=admin_user.id,
        user_name=admin_user.name,
        user_role=admin_user.role,
        action="DEACTIVATE_CATEGORY",
        entity="CATEGORY",
        entity_id=str(category.id),
        old_value="Active: True",
        new_value="Active: False"
    )
    db.add(audit)

    db.commit()
    cache.invalidate("categories:")
    return {
        "success": True,
        "message": f"Category '{category.name}' deactivated successfully",
        "category_id": category_id
    }