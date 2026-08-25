from enum import Enum as PyEnum
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


# ============================================================
# ENUMS
# ============================================================

class UserRole(str, PyEnum):
    CUSTOMER = "CUSTOMER"
    PHARMACIST = "PHARMACIST"
    ADMIN = "ADMIN"
    DELIVERY = "DELIVERY"


class OrderStatusEnum(str, PyEnum):
    PENDING_PHARMACIST_REVIEW = "PENDING_PHARMACIST_REVIEW"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    PACKING = "PACKING"
    PACKED = "PACKED"
    READY_FOR_DISPATCH = "READY_FOR_DISPATCH"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


class PrescriptionStatusEnum(str, PyEnum):
    PENDING_REVIEW = "PENDING_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class StockMovementType(str, PyEnum):
    STOCK_ADDED = "STOCK_ADDED"
    STOCK_RESERVED = "STOCK_RESERVED"
    STOCK_RELEASED = "STOCK_RELEASED"
    STOCK_SOLD = "STOCK_SOLD"
    STOCK_ADJUSTED = "STOCK_ADJUSTED"


# ============================================================
# USER & PROFILES
# ============================================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(150), unique=True, nullable=True, index=True)
    phone = Column(String(20), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)
    name = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False, default="CUSTOMER", index=True)
    is_active = Column(Boolean, nullable=False, default=True)
    is_verified = Column(Boolean, nullable=False, default=True)
    avatar = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    orders = relationship("Order", back_populates="user", foreign_keys="[Order.user_id]")
    addresses = relationship("Address", back_populates="user", cascade="all, delete-orphan")
    prescriptions = relationship("Prescription", back_populates="user", foreign_keys="[Prescription.user_id]")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


# ============================================================
# CATEGORY
# ============================================================

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    image = Column(String(500), nullable=True)
    icon = Column(String(50), nullable=True)
    badge = Column(String(50), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    products = relationship("Product", back_populates="category")


# ============================================================
# PRODUCT
# ============================================================

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    generic_name = Column(String(200), nullable=True, index=True)
    brand = Column(String(100), nullable=True)
    manufacturer = Column(String(150), nullable=True)
    strength = Column(String(100), nullable=True)
    pack_size = Column(String(100), nullable=True)
    form = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    image = Column(String(500), nullable=True)
    
    price = Column(Numeric(10, 2), nullable=False) # Selling price
    mrp = Column(Numeric(10, 2), nullable=True)
    discount_percent = Column(Integer, nullable=True, default=0)
    stock = Column(Integer, nullable=False, default=0)
    
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    prescription_required = Column(Boolean, nullable=False, default=False)
    is_active = Column(Boolean, nullable=False, default=True)
    rating = Column(Numeric(3, 1), nullable=True, default=4.8)
    reviews_count = Column(Integer, nullable=True, default=120)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    category = relationship("Category", back_populates="products")
    cart_items = relationship("CartItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
    inventory = relationship("Inventory", back_populates="product", uselist=False)


# ============================================================
# INVENTORY & STOCK MOVEMENTS
# ============================================================

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), unique=True, nullable=False)
    available_quantity = Column(Integer, nullable=False, default=0)
    reserved_quantity = Column(Integer, nullable=False, default=0)
    sold_quantity = Column(Integer, nullable=False, default=0)
    reorder_level = Column(Integer, nullable=False, default=15)
    status = Column(String(30), nullable=False, default="IN_STOCK") # IN_STOCK, LOW_STOCK, OUT_OF_STOCK
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    product = relationship("Product", back_populates="inventory")
    movements = relationship("StockMovement", back_populates="inventory", cascade="all, delete-orphan")


class StockMovement(Base):
    __tablename__ = "stock_movements"

    id = Column(Integer, primary_key=True, index=True)
    inventory_id = Column(Integer, ForeignKey("inventory.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, nullable=False)
    movement_type = Column(String(30), nullable=False) # STOCK_ADDED, STOCK_RESERVED, STOCK_RELEASED, STOCK_SOLD, STOCK_ADJUSTED
    quantity = Column(Integer, nullable=False)
    previous_qty = Column(Integer, nullable=False)
    new_qty = Column(Integer, nullable=False)
    reason = Column(String(255), nullable=True)
    reference_id = Column(String(100), nullable=True) # e.g. Order ID or PO ID
    user_id = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    inventory = relationship("Inventory", back_populates="movements")


# ============================================================
# CART & ITEMS
# ============================================================

class Cart(Base):
    __tablename__ = "carts"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("carts.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    cart = relationship("Cart", back_populates="items")
    product = relationship("Product", back_populates="cart_items")


# ============================================================
# ADDRESS
# ============================================================

class Address(Base):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    house = Column(String(200), nullable=False)
    area = Column(String(200), nullable=False)
    city = Column(String(100), nullable=False)
    pincode = Column(String(10), nullable=False)
    is_default = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="addresses")
    orders = relationship("Order", back_populates="address")


# ============================================================
# ORDER & ORDER ITEMS
# ============================================================

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(40), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    address_id = Column(Integer, ForeignKey("addresses.id", ondelete="SET NULL"), nullable=True)

    payment_method = Column(String(30), nullable=False, default="cod") # upi, card, netbanking, cod
    payment_status = Column(String(30), nullable=False, default="pending") # pending, authorized, paid, failed, refunded
    order_status = Column(String(40), nullable=False, default="PENDING_PHARMACIST_REVIEW", index=True)

    subtotal = Column(Numeric(10, 2), nullable=False)
    delivery_fee = Column(Numeric(10, 2), nullable=False, default=40)
    total = Column(Numeric(10, 2), nullable=False)

    payment_id = Column(String(100), nullable=True, index=True)
    payment_signature = Column(String(255), nullable=True)
    gateway_name = Column(String(50), nullable=True, default="SV Care Gateway")
    paid_at = Column(DateTime(timezone=True), nullable=True)

    prescription_required = Column(Boolean, nullable=False, default=False)
    prescription_status = Column(String(30), nullable=False, default="NOT_REQUIRED") # NOT_REQUIRED, PENDING_REVIEW, APPROVED, REJECTED
    rejection_reason = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="orders", foreign_keys=[user_id])
    address = relationship("Address", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    status_history = relationship("OrderStatusHistory", back_populates="order", cascade="all, delete-orphan", order_by="OrderStatusHistory.created_at.asc()")
    prescriptions = relationship("Prescription", back_populates="order")
    delivery = relationship("Delivery", back_populates="order", uselist=False)


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    product_name = Column(String(200), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")


class OrderStatusHistory(Base):
    __tablename__ = "order_status_history"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    previous_status = Column(String(40), nullable=True)
    new_status = Column(String(40), nullable=False)
    changed_by_id = Column(Integer, nullable=True)
    changed_by_name = Column(String(100), nullable=True)
    user_role = Column(String(30), nullable=True)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    order = relationship("Order", back_populates="status_history")


# ============================================================
# PRESCRIPTIONS
# ============================================================

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="SET NULL"), nullable=True)
    file_path = Column(String(500), nullable=False)
    original_filename = Column(String(255), nullable=True)
    file_type = Column(String(50), nullable=True)
    status = Column(String(30), nullable=False, default="PENDING_REVIEW") # PENDING_REVIEW, APPROVED, REJECTED
    pharmacist_id = Column(Integer, nullable=True)
    pharmacist_name = Column(String(100), nullable=True)
    pharmacist_notes = Column(Text, nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="prescriptions", foreign_keys=[user_id])
    order = relationship("Order", back_populates="prescriptions")


# ============================================================
# DELIVERY
# ============================================================

class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), unique=True, nullable=False)
    rider_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    rider_name = Column(String(100), nullable=True)
    rider_phone = Column(String(20), nullable=True)
    status = Column(String(30), nullable=False, default="READY_FOR_DISPATCH") # READY_FOR_DISPATCH, ASSIGNED, OUT_FOR_DELIVERY, DELIVERED
    assigned_at = Column(DateTime(timezone=True), nullable=True)
    dispatched_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    delivery_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    order = relationship("Order", back_populates="delivery")


# ============================================================
# NOTIFICATIONS
# ============================================================

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), nullable=False, default="ORDER_UPDATE") # ORDER_UPDATE, PRESCRIPTION_UPDATE, PROMO, SYSTEM
    order_id = Column(Integer, nullable=True)
    is_read = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")


# ============================================================
# AUDIT LOGS
# ============================================================

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    user_name = Column(String(100), nullable=True)
    user_role = Column(String(30), nullable=True)
    action = Column(String(100), nullable=False) # e.g. "ACCEPT_ORDER", "UPDATE_PRICE", "ADJUST_STOCK", "CHANGE_USER_ROLE"
    entity = Column(String(50), nullable=False) # "ORDER", "PRODUCT", "INVENTORY", "USER", "PRESCRIPTION"
    entity_id = Column(String(100), nullable=False)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())