from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Product
from schemas import ProductCreate
from schemas import ProductResponse
from schemas import ProductUpdate


router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


# ============================================================
# GET ALL PRODUCTS
# ============================================================

@router.get(
    "/",
    response_model=list[ProductResponse]
)
def get_products(
    search: str | None = None,
    category_id: int | None = None,
    db: Session = Depends(get_db)
):

    query = db.query(Product).filter(
        Product.is_active == True
    )

    # Search by product name
    if search:

        query = query.filter(
            Product.name.ilike(
                f"%{search}%"
            )
        )

    # Filter by category
    if category_id:

        query = query.filter(
            Product.category_id == category_id
        )

    products = query.order_by(
        Product.id.desc()
    ).all()

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
            detail="Product not found"
        )

    return product


# ============================================================
# CREATE PRODUCT
# ============================================================

@router.post(
    "/",
    response_model=ProductResponse,
    status_code=201
)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db)
):

    product = Product(
        name=product_data.name,
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
# UPDATE PRODUCT
# ============================================================

@router.put(
    "/{product_id}",
    response_model=ProductResponse
)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db)
):

    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:

        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )


    update_data = product_data.model_dump(
        exclude_unset=True
    )


    for field, value in update_data.items():

        setattr(
            product,
            field,
            value
        )


    db.commit()

    db.refresh(product)

    return product


# ============================================================
# DELETE PRODUCT
# ============================================================

@router.delete(
    "/{product_id}"
)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):

    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:

        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )


    # Soft delete
    product.is_active = False

    db.commit()


    return {
        "message": "Product deleted successfully",
        "product_id": product_id
    }
    