from datetime import datetime
from typing import Any, List, Optional
from pydantic import BaseModel, Field


# ============================================================
# USER & AUTH SCHEMAS
# ============================================================

class UserBase(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    name: str = Field(..., min_length=2, max_length=100)
    email: Optional[str] = None
    role: str = "CUSTOMER" # CUSTOMER | PHARMACIST | ADMIN | DELIVERY


class UserRegister(BaseModel):
    phone: str
    name: str
    email: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = "CUSTOMER"


class SendEmailOtpRequest(BaseModel):
    email: str
    name: Optional[str] = None


class SendEmailOtpResponse(BaseModel):
    success: bool
    message: str
    email: str
    otp: Optional[str] = None
    expires_in_seconds: int


class VerifyEmailOtpRequest(BaseModel):
    email: str
    otp: str
    name: Optional[str] = None


class SendOtpRequest(BaseModel):
    phone: str
    country_code: Optional[str] = "+91"


class SendOtpResponse(BaseModel):
    success: bool
    message: str
    phone: str
    otp: str
    expires_in_seconds: int


class VerifyOtpRequest(BaseModel):
    phone: str
    otp: str


class UserLogin(BaseModel):
    email_or_phone: str
    password: str


class UserUpdateRole(BaseModel):
    role: str = Field(..., description="CUSTOMER, PHARMACIST, ADMIN, DELIVERY")


class UserResponse(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    avatar: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AuthTokenResponse(BaseModel):
    success: bool
    message: str
    token: str
    user: dict


# ============================================================
# CATEGORY SCHEMAS
# ============================================================

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    image: Optional[str] = None
    icon: Optional[str] = "💊"
    badge: Optional[str] = None
    is_active: bool = True


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    icon: Optional[str] = None
    badge: Optional[str] = None
    is_active: Optional[bool] = None


class CategoryResponse(CategoryBase):
    id: int

    class Config:
        from_attributes = True


# ============================================================
# PRODUCT SCHEMAS
# ============================================================

class ProductBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    generic_name: Optional[str] = None
    brand: Optional[str] = None
    manufacturer: Optional[str] = None
    strength: Optional[str] = None
    pack_size: Optional[str] = None
    form: Optional[str] = None
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    mrp: Optional[float] = None
    discount_percent: Optional[int] = 0
    stock: int = Field(default=0, ge=0)
    image: Optional[str] = None
    category_id: Optional[int] = None
    prescription_required: bool = False
    is_active: bool = True
    rating: Optional[float] = 4.8
    reviews_count: Optional[int] = 120


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    generic_name: Optional[str] = None
    brand: Optional[str] = None
    manufacturer: Optional[str] = None
    strength: Optional[str] = None
    pack_size: Optional[str] = None
    form: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(default=None, gt=0)
    mrp: Optional[float] = None
    discount_percent: Optional[int] = None
    stock: Optional[int] = Field(default=None, ge=0)
    image: Optional[str] = None
    category_id: Optional[int] = None
    prescription_required: Optional[bool] = None
    is_active: Optional[bool] = None


class ProductResponse(ProductBase):
    id: int
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True


# ============================================================
# INVENTORY SCHEMAS
# ============================================================

class InventoryAdjustRequest(BaseModel):
    product_id: int
    adjustment_type: str = Field(..., description="ADD | DEDUCT | SET") # ADD, DEDUCT, SET
    quantity: int = Field(..., ge=0)
    reason: str = Field(..., min_length=3)


class StockMovementResponse(BaseModel):
    id: int
    product_id: int
    movement_type: str
    quantity: int
    previous_qty: int
    new_qty: int
    reason: Optional[str] = None
    reference_id: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class InventoryResponse(BaseModel):
    id: int
    product_id: int
    product_name: Optional[str] = None
    available_quantity: int
    reserved_quantity: int
    sold_quantity: int
    reorder_level: int
    status: str
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================
# CART SCHEMAS
# ============================================================

class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., ge=1)


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1)


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    id: int
    session_id: str
    items: List[CartItemResponse] = []

    class Config:
        from_attributes = True


# ============================================================
# ADDRESS SCHEMAS
# ============================================================

class AddressCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=10, max_length=15)
    house: str = Field(..., min_length=1, max_length=200)
    area: str = Field(..., min_length=1, max_length=200)
    city: str = Field(..., min_length=2, max_length=100)
    pincode: str = Field(..., min_length=6, max_length=10)
    is_default: bool = False


class AddressResponse(AddressCreate):
    id: int

    class Config:
        from_attributes = True


# ============================================================
# ORDER ITEM & ORDER SCHEMAS
# ============================================================

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., ge=1)


class OrderItemResponse(BaseModel):
    id: int
    product_id: Optional[int] = None
    product_name: str
    price: float
    quantity: int
    subtotal: float

    class Config:
        from_attributes = True


class OrderStatusHistoryResponse(BaseModel):
    id: int
    previous_status: Optional[str] = None
    new_status: str
    changed_by_name: Optional[str] = None
    user_role: Optional[str] = None
    reason: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    name: str
    phone: str
    house: str
    area: str
    city: str
    pincode: str
    payment_method: str = "cod" # upi, card, netbanking, cod
    payment_id: Optional[str] = None
    payment_signature: Optional[str] = None
    gateway_name: Optional[str] = "SV Care Gateway"
    prescription_uploaded: bool = False
    prescription_url: Optional[str] = None
    items: List[OrderItemCreate]


class OrderStatusUpdate(BaseModel):
    new_status: str = Field(..., description="ACCEPTED, REJECTED, PACKING, PACKED, READY_FOR_DISPATCH, OUT_FOR_DELIVERY, DELIVERED, CANCELLED")
    reason: Optional[str] = None
    rejection_reason: Optional[str] = None


class OrderResponse(BaseModel):
    id: int
    order_number: str
    user_id: Optional[int] = None
    address_id: Optional[int] = None
    payment_method: str
    payment_status: str
    order_status: str
    payment_id: Optional[str] = None
    payment_signature: Optional[str] = None
    gateway_name: Optional[str] = None
    paid_at: Optional[datetime] = None
    prescription_required: bool = False
    prescription_status: str = "NOT_REQUIRED"
    rejection_reason: Optional[str] = None
    subtotal: float
    delivery_fee: float
    total: float
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    address: Optional[AddressResponse] = None
    items: List[OrderItemResponse] = []
    status_history: List[OrderStatusHistoryResponse] = []

    class Config:
        from_attributes = True


# ============================================================
# PRESCRIPTION SCHEMAS
# ============================================================

class PrescriptionReview(BaseModel):
    status: str = Field(..., description="APPROVED | REJECTED")
    notes: Optional[str] = None


class PrescriptionResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    order_id: Optional[int] = None
    file_path: str
    original_filename: Optional[str] = None
    file_type: Optional[str] = None
    status: str
    pharmacist_name: Optional[str] = None
    pharmacist_notes: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================
# DELIVERY SCHEMAS
# ============================================================

class DeliveryAssignRequest(BaseModel):
    rider_user_id: int
    rider_name: str
    rider_phone: str
    delivery_notes: Optional[str] = None


class DeliveryStatusUpdate(BaseModel):
    status: str = Field(..., description="OUT_FOR_DELIVERY | DELIVERED")
    notes: Optional[str] = None


class DeliveryResponse(BaseModel):
    id: int
    order_id: int
    rider_name: Optional[str] = None
    rider_phone: Optional[str] = None
    status: str
    assigned_at: Optional[datetime] = None
    dispatched_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    delivery_notes: Optional[str] = None

    class Config:
        from_attributes = True


# ============================================================
# NOTIFICATION & AUDIT SCHEMAS
# ============================================================

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    notification_type: str
    order_id: Optional[int] = None
    is_read: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AuditLogResponse(BaseModel):
    id: int
    user_name: Optional[str] = None
    user_role: Optional[str] = None
    action: str
    entity: str
    entity_id: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================
# ANALYTICS DASHBOARD SCHEMAS
# ============================================================

class DashboardAnalyticsResponse(BaseModel):
    total_orders: int
    todays_orders: int
    total_revenue: float
    pending_orders: int
    accepted_orders: int
    packing_orders: int
    dispatched_orders: int
    delivered_orders: int
    cancelled_orders: int
    total_medicines: int
    low_stock_count: int
    out_of_stock_count: int
    total_customers: int
    top_selling_medicines: List[dict] = []
    recent_orders: List[dict] = []


# ============================================================
# PAYMENT GATEWAY SCHEMAS
# ============================================================

class PaymentCreateOrderRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Order total in INR")
    currency: str = Field(default="INR", description="Currency code")
    customer_name: str
    customer_phone: str
    order_id: Optional[str] = None
    payment_method: str = "upi"


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