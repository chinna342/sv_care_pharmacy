from sqlalchemy import text
from database import engine

def run_migrations():
    with engine.connect() as conn:
        print("[MIGRATION] Adding missing columns to existing tables...")
        
        # 1. Product table columns
        product_columns = [
            ("generic_name", "VARCHAR(200)"),
            ("brand", "VARCHAR(100)"),
            ("manufacturer", "VARCHAR(150)"),
            ("strength", "VARCHAR(100)"),
            ("pack_size", "VARCHAR(100)"),
            ("form", "VARCHAR(50)"),
            ("mrp", "NUMERIC(10, 2)"),
            ("discount_percent", "INTEGER DEFAULT 0"),
            ("rating", "NUMERIC(3, 1) DEFAULT 4.8"),
            ("reviews_count", "INTEGER DEFAULT 120")
        ]
        for col, col_type in product_columns:
            try:
                conn.execute(text(f"ALTER TABLE products ADD COLUMN IF NOT EXISTS {col} {col_type};"))
                conn.commit()
            except Exception as err:
                print(f"Notice on products.{col}: {err}")

        # 2. Category table columns
        cat_columns = [
            ("image", "VARCHAR(500)"),
            ("icon", "VARCHAR(50)"),
            ("badge", "VARCHAR(50)"),
            ("is_active", "BOOLEAN DEFAULT TRUE")
        ]
        for col, col_type in cat_columns:
            try:
                conn.execute(text(f"ALTER TABLE categories ADD COLUMN IF NOT EXISTS {col} {col_type};"))
                conn.commit()
            except Exception as err:
                print(f"Notice on categories.{col}: {err}")

        # 3. Order table columns
        order_columns = [
            ("user_id", "INTEGER REFERENCES users(id) ON DELETE SET NULL"),
            ("prescription_required", "BOOLEAN DEFAULT FALSE"),
            ("prescription_status", "VARCHAR(30) DEFAULT 'NOT_REQUIRED'"),
            ("rejection_reason", "TEXT"),
            ("payment_id", "VARCHAR(100)"),
            ("payment_signature", "VARCHAR(255)"),
            ("gateway_name", "VARCHAR(50) DEFAULT 'SV Care Gateway'"),
            ("paid_at", "TIMESTAMP WITH TIME ZONE")
        ]
        for col, col_type in order_columns:
            try:
                conn.execute(text(f"ALTER TABLE orders ADD COLUMN IF NOT EXISTS {col} {col_type};"))
                conn.commit()
            except Exception as err:
                print(f"Notice on orders.{col}: {err}")

        # 4. User table columns
        user_columns = [
            ("avatar", "VARCHAR(500)"),
            ("is_verified", "BOOLEAN DEFAULT TRUE")
        ]
        for col, col_type in user_columns:
            try:
                conn.execute(text(f"ALTER TABLE users ADD COLUMN IF NOT EXISTS {col} {col_type};"))
                conn.commit()
            except Exception as err:
                print(f"Notice on users.{col}: {err}")

        # 5. Address table columns
        address_columns = [
            ("user_id", "INTEGER REFERENCES users(id) ON DELETE CASCADE"),
            ("is_default", "BOOLEAN DEFAULT FALSE")
        ]
        for col, col_type in address_columns:
            try:
                conn.execute(text(f"ALTER TABLE addresses ADD COLUMN IF NOT EXISTS {col} {col_type};"))
                conn.commit()
            except Exception as err:
                print(f"Notice on addresses.{col}: {err}")

        print("[MIGRATION] Migration finished successfully!")

if __name__ == "__main__":
    run_migrations()
