from decimal import Decimal
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Address, Order, OrderItem, Product
from schemas import OrderCreate, OrderResponse


router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)


# ============================================================
# CREATE ORDER
# ============================================================

@router.post(
    "/",
    response_model=OrderResponse,
    status_code=201
)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # 1. Check cart/order items
    # --------------------------------------------------------

    if not order_data.items:
        raise HTTPException(
            status_code=400,
            detail="Order must contain at least one product"
        )


    # --------------------------------------------------------
    # 2. Create address
    # --------------------------------------------------------

    address = Address(
        name=order_data.name,
        phone=order_data.phone,
        house=order_data.house,
        area=order_data.area,
        city=order_data.city,
        pincode=order_data.pincode,
    )

    db.add(address)
    db.flush()


    # --------------------------------------------------------
    # 3. Calculate order
    # --------------------------------------------------------

    subtotal = Decimal("0.00")

    order_items = []


    for item_data in order_data.items:

        product = (
            db.query(Product)
            .filter(
                Product.id == item_data.product_id,
                Product.is_active == True
            )
            .first()
        )


        # Product doesn't exist
        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product {item_data.product_id} not found"
            )


        # ----------------------------------------------------
        # Check stock
        # ----------------------------------------------------

        if product.stock < item_data.quantity:

            raise HTTPException(
                status_code=400,
                detail=(
                    f"Insufficient stock for "
                    f"{product.name}. "
                    f"Available stock: {product.stock}"
                )
            )


        # ----------------------------------------------------
        # Calculate item subtotal
        # ----------------------------------------------------

        item_subtotal = (
            Decimal(str(product.price))
            * item_data.quantity
        )

        subtotal += item_subtotal


        # ----------------------------------------------------
        # Create OrderItem object
        # ----------------------------------------------------

        order_item = OrderItem(

            product_id=product.id,

            product_name=product.name,

            price=product.price,

            quantity=item_data.quantity,

            subtotal=item_subtotal,

        )

        order_items.append(
            (order_item, product)
        )


    # --------------------------------------------------------
    # 4. Delivery fee
    # --------------------------------------------------------

    if subtotal >= Decimal("500.00"):

        delivery_fee = Decimal("0.00")

    else:

        delivery_fee = Decimal("40.00")


    # --------------------------------------------------------
    # 5. Total
    # --------------------------------------------------------

    total = subtotal + delivery_fee


    # --------------------------------------------------------
    # 6. Generate order number
    # --------------------------------------------------------

    order_number = (
        "SV"
        + uuid4().hex[:10].upper()
    )


    # --------------------------------------------------------
    # 7. Create Order
    # --------------------------------------------------------

    # Determine payment status
    payment_status = "paid" if order_data.payment_id else ("pending" if order_data.payment_method == "cod" else "pending")
    order_status = "confirmed" if payment_status == "paid" else "pending"

    order = Order(
        order_number=order_number,
        address_id=address.id,
        payment_method=order_data.payment_method,
        payment_status=payment_status,
        order_status=order_status,
        payment_id=order_data.payment_id,
        payment_signature=order_data.payment_signature,
        gateway_name=order_data.gateway_name or "SV Care Gateway",
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        total=total,
    )

    db.add(order)
    db.flush()


    # --------------------------------------------------------
    # 8. Save order items + reduce stock
    # --------------------------------------------------------

    for order_item, product in order_items:

        order_item.order_id = order.id

        db.add(order_item)


        product.stock -= order_item.quantity


    # --------------------------------------------------------
    # 9. Commit everything
    # --------------------------------------------------------

    try:

        db.commit()

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to create order"
        )


    # --------------------------------------------------------
    # 10. Refresh order
    # --------------------------------------------------------

    db.refresh(order)


    return order


# ============================================================
# GET ORDER BY ID
# ============================================================

@router.get(
    "/{order_id}",
    response_model=OrderResponse
)
def get_order(
    order_id: int,
    db: Session = Depends(get_db)
):

    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )


    if not order:

        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )


    return order