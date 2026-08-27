"""
Principal QA / SDET Concurrency & Race Condition Verification Suite
Simulates 20 simultaneous customer checkouts against a single stock item
to ensure ACID row-level locking (SELECT ... FOR UPDATE) prevents overselling.
"""

import threading
import time
from decimal import Decimal
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, Product, Inventory, User, Order, OrderItem

def setup_concurrency_test_fixture():
    db: Session = SessionLocal()
    try:
        # Create a test high-demand medicine with exactly 5 stock
        test_product = db.query(Product).filter(Product.name == "QA-Concurrency-Test-Drug").first()
        if not test_product:
            test_product = Product(
                name="QA-Concurrency-Test-Drug",
                generic_name="Paracetamol 650mg QA",
                price=Decimal("30.00"),
                stock=5,
                prescription_required=False,
                is_active=True
            )
            db.add(test_product)
            db.commit()
            db.refresh(test_product)
        else:
            test_product.stock = 5
            db.commit()
            db.refresh(test_product)

        print(f"[QA Fixture] Created/Reset test product '{test_product.name}' with Stock = {test_product.stock} (ID: {test_product.id})")
        return test_product.id
    finally:
        db.close()

def run_concurrent_checkout_simulation(product_id: int, num_requests: int = 20):
    success_count = 0
    failure_count = 0
    lock = threading.Lock()
    results = []

    def attempt_purchase(customer_idx: int):
        nonlocal success_count, failure_count
        db: Session = SessionLocal()
        try:
            # Emulate the exact transaction logic in orders.py with SELECT ... FOR UPDATE
            with db.begin():
                product = (
                    db.query(Product)
                    .filter(Product.id == product_id, Product.is_active == True)
                    .with_for_update()
                    .first()
                )

                if product and product.stock >= 1:
                    product.stock -= 1
                    with lock:
                        success_count += 1
                        results.append((customer_idx, "SUCCESS", product.stock))
                else:
                    with lock:
                        failure_count += 1
                        results.append((customer_idx, "INSUFFICIENT_STOCK", product.stock if product else 0))
        except Exception as e:
            with lock:
                failure_count += 1
                results.append((customer_idx, "EXCEPTION", str(e)))
        finally:
            db.close()

    threads = []
    print(f"\n[QA Test] Launching {num_requests} concurrent threads for 5 stock units...")
    start_time = time.time()

    for i in range(num_requests):
        t = threading.Thread(target=attempt_purchase, args=(i + 1,))
        threads.append(t)

    for t in threads:
        t.start()

    for t in threads:
        t.join()

    duration = time.time() - start_time

    print(f"\n[QA Results] Completed in {duration:.3f}s:")
    print(f"  • Successful Checkouts: {success_count} (Expected: 5)")
    print(f"  • Rejected (Out of Stock): {failure_count} (Expected: {num_requests - 5})")

    # Verify database final state
    db: Session = SessionLocal()
    try:
        final_product = db.query(Product).filter(Product.id == product_id).first()
        print(f"  • Final Database Stock: {final_product.stock} (Expected: 0)")

        assert success_count == 5, f"Overselling detected! Expected 5 successes, got {success_count}"
        assert failure_count == (num_requests - 5), f"Expected {num_requests - 5} failures, got {failure_count}"
        assert final_product.stock == 0, f"Expected final stock 0, got {final_product.stock}"
        print("\n[PASSED] Zero double-booking confirmed. Pessimistic concurrency locks verified.")
    finally:
        db.close()

if __name__ == "__main__":
    prod_id = setup_concurrency_test_fixture()
    run_concurrent_checkout_simulation(prod_id, num_requests=20)
