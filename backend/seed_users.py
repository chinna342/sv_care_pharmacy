from database import SessionLocal, engine
from models import Base, User, Product, Category, Inventory, CustomerProfile, PharmacistProfile, DeliveryProfile
from jwt_handler import hash_password

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Users
        users_to_seed = [
            {
                "phone": "6303180717",
                "email": "venkatc283@gmail.com",
                "name": "Chinna Venkatarao",
                "role": "ADMIN",
                "password_hash": hash_password("955040"),
                "is_active": True,
                "is_verified": True
            },
            {
                "phone": "8888888888",
                "email": "pharmacist@svcare.com",
                "name": "Chinna Venkatarao (Lead Pharmacist)",
                "role": "PHARMACIST",
                "password_hash": hash_password("955040"),
                "is_active": True,
                "is_verified": True
            },
            {
                "phone": "9876543210",
                "email": "customer@svcare.com",
                "name": "Venkatesh Rao",
                "role": "CUSTOMER",
                "password_hash": hash_password("customer2026"),
                "is_active": True,
                "is_verified": True
            },
            {
                "phone": "9123456780",
                "email": "delivery@svcare.com",
                "name": "Ramesh Express Rider",
                "role": "DELIVERY",
                "password_hash": hash_password("rider2026"),
                "is_active": True,
                "is_verified": True
            }
        ]

        for u_data in users_to_seed:
            existing = db.query(User).filter((User.email == u_data["email"]) | (User.phone == u_data["phone"])).first()
            if not existing:
                u = User(**u_data)
                db.add(u)
                db.flush()
                if u.role == "CUSTOMER":
                    db.add(CustomerProfile(user_id=u.id, preferred_pincode="500081"))
                elif u.role == "PHARMACIST":
                    db.add(PharmacistProfile(user_id=u.id, license_number="TS/HYD/2026/8942-R"))
                elif u.role == "DELIVERY":
                    db.add(DeliveryProfile(user_id=u.id, vehicle_number="TS-09-EV-8942"))
                print(f"[SEEDED USER] {u_data['role']}: {u_data['email']} ({u_data['phone']})")
            else:
                existing.name = u_data["name"]
                existing.role = u_data["role"]
                existing.password_hash = u_data["password_hash"]
                existing.email = u_data["email"]
                existing.phone = u_data["phone"]
                print(f"[UPDATED USER] {u_data['role']}: {u_data['name']} ({u_data['email']} / {u_data['phone']})")

        # 2. Ensure Inventory for all existing products
        products = db.query(Product).all()
        for p in products:
            inv = db.query(Inventory).filter(Inventory.product_id == p.id).first()
            if not inv:
                inv = Inventory(
                    product_id=p.id,
                    available_quantity=p.stock,
                    reserved_quantity=0,
                    sold_quantity=0,
                    reorder_level=15,
                    status="OUT_OF_STOCK" if p.stock <= 0 else ("LOW_STOCK" if p.stock <= 15 else "IN_STOCK")
                )
                db.add(inv)

        db.commit()
        print("[SUCCESS] SV Care platform seed completed successfully!")

    except Exception as e:
        print("[ERROR during seed]:", e)
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
