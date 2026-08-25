from typing import Optional

from pydantic import BaseModel, Field


# ============================================================
# CATEGORY
# ============================================================

class CategoryBase(BaseModel):

    name: str = Field(
        ...,
        min_length=2,
        max_length=100
    )

    description: Optional[str] = None

    image: Optional[str] = None

    is_active: bool = True


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):

    name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100
    )

    description: Optional[str] = None

    image: Optional[str] = None

    is_active: Optional[bool] = None


class CategoryResponse(CategoryBase):

    id: int

    class Config:
        from_attributes = True


# ============================================================
# PRODUCT
# ============================================================

class ProductBase(BaseModel):

    name: str = Field(
        ...,
        min_length=2,
        max_length=200
    )

    description: Optional[str] = None

    price: float = Field(
        ...,
        gt=0
    )

    stock: int = Field(
        ...,
        ge=0
    )

    image: Optional[str] = None

    category_id: Optional[int] = None

    prescription_required: bool = False

    is_active: bool = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):

    name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=200
    )

    description: Optional[str] = None

    price: Optional[float] = Field(
        default=None,
        gt=0
    )

    stock: Optional[int] = Field(
        default=None,
        ge=0
    )

    image: Optional[str] = None

    category_id: Optional[int] = None

    prescription_required: Optional[bool] = None

    is_active: Optional[bool] = None


class ProductResponse(ProductBase):

    id: int

    class Config:
        from_attributes = True


# ============================================================
# CART ITEM
# ============================================================

class CartItemCreate(BaseModel):

    product_id: int

    quantity: int = Field(
        ...,
        ge=1
    )


class CartItemUpdate(BaseModel):

    quantity: int = Field(
        ...,
        ge=1
    )


class CartItemResponse(BaseModel):

    id: int

    product_id: int

    quantity: int

    class Config:
        from_attributes = True


# ============================================================
# CART
# ============================================================

class CartCreate(BaseModel):

    session_id: str


class CartResponse(BaseModel):

    id: int

    session_id: str

    items: list[CartItemResponse] = Field(
        default_factory=list
    )

    class Config:
        from_attributes = True


# ============================================================
# ADDRESS
# ============================================================

class AddressCreate(BaseModel):

    name: str = Field(
        ...,
        min_length=2,
        max_length=100
    )

    phone: str = Field(
        ...,
        min_length=10,
        max_length=15
    )

    house: str = Field(
        ...,
        min_length=1,
        max_length=200
    )

    area: str = Field(
        ...,
        min_length=1,
        max_length=200
    )

    city: str = Field(
        ...,
        min_length=2,
        max_length=100
    )

    pincode: str = Field(
        ...,
        min_length=6,
        max_length=6
    )


class AddressResponse(AddressCreate):

    id: int

    class Config:
        from_attributes = True


# ============================================================
# ORDER ITEM
# ============================================================

class OrderItemCreate(BaseModel):

    product_id: int

    quantity: int = Field(
        ...,
        ge=1
    )


class OrderItemResponse(BaseModel):

    id: int

    product_id: Optional[int] = None

    product_name: str

    price: float

    quantity: int

    subtotal: float

    class Config:
        from_attributes = True


# ==========================================
# ORDER
# ==========================================

class OrderCreate(BaseModel):

    name: str

    phone: str

    house: str

    area: str

    city: str

    pincode: str

    payment_method: str = "cod"

    payment_id: Optional[str] = None

    payment_signature: Optional[str] = None

    gateway_name: Optional[str] = "SV Care Gateway"

    items: list[OrderItemCreate]


class OrderResponse(BaseModel):

    id: int

    order_number: str

    address_id: Optional[int] = None

    payment_method: str

    payment_status: str

    order_status: str

    payment_id: Optional[str] = None

    payment_signature: Optional[str] = None

    gateway_name: Optional[str] = None

    paid_at: Optional[str] = None

    subtotal: float

    delivery_fee: float

    total: float

    items: list[OrderItemResponse] = Field(
        default_factory=list
    )

    class Config:
        from_attributes = True


# ==========================================
# PAYMENT GATEWAY SCHEMAS
# ==========================================

class PaymentCreateOrderRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Order total in INR")
    currency: str = Field(default="INR", description="Currency code")
    customer_name: str
    customer_phone: str
    order_id: Optional[str] = None
    payment_method: str = "upi"  # 'upi' | 'card' | 'netbanking' | 'cod'


class PaymentOrderResponse(BaseModel):
    gateway_order_id: str
    amount: float
    currency: str
    key_id: str
    status: str
    payment_method: str
    created_at: str


class PaymentVerifyRequest(BaseModel):
    order_id: str
    payment_id: str
    signature: Optional[str] = None
    gateway_name: str = "SV Care Gateway"
    method: str = "upi"


class PaymentVerifyResponse(BaseModel):
    success: bool
    status: str
    message: str
    order_id: str
    payment_id: str
    transaction_ref: str
    verified_at: str