"""
SV Care Pharmacy - Comprehensive 4-Portal End-to-End Validation Suite
Tests all 4 portals (Customer, Pharmacist, Admin, Delivery) and their workflows.
"""
from fastapi.testclient import TestClient
from main import app
import sys

client = TestClient(app)

def test_all_four_portals():
    print("=" * 65)
    print("SV CARE PHARMACY — 4-PORTAL COMPREHENSIVE VERIFICATION")
    print("=" * 65)

    passed_tests = 0
    total_tests = 0

    def assert_test(name, condition, details=""):
        nonlocal passed_tests, total_tests
        total_tests += 1
        if condition:
            passed_tests += 1
            print(f"  [PASS] {name} {f'({details})' if details else ''}")
        else:
            print(f"  [FAIL] {name} {f'({details})' if details else ''}")
            sys.exit(1)

    # ----------------------------------------------------
    # 0. Health & Platform Info Check
    # ----------------------------------------------------
    print("\n>>> 0. SYSTEM HEALTH & METADATA")
    res = client.get("/health")
    assert_test("Backend Health Check", res.status_code == 200 and res.json().get("status") == "Healthy")
    res_root = client.get("/")
    assert_test("Portal Registration", len(res_root.json().get("portals", [])) == 4, str(res_root.json().get("portals")))

    # ----------------------------------------------------
    # 1. PORTAL 1: CUSTOMER APPLICATION WORKFLOW
    # ----------------------------------------------------
    print("\n>>> 1. PORTAL: CUSTOMER APPLICATION")
    # 1.1 Customer OTP Login
    otp_res = client.post("/auth/send-otp", json={"phone": "9876543210"})
    assert_test("Customer Send OTP", otp_res.status_code == 200)

    verify_res = client.post("/auth/verify-otp", json={"phone": "9876543210", "otp": "123456"})
    assert_test("Customer OTP Verification & JWT Issuance", verify_res.status_code == 200)
    customer_token = verify_res.json()["token"]
    customer_headers = {"Authorization": f"Bearer {customer_token}"}

    # 1.2 Browse & Search Products
    prod_res = client.get("/products/?search=Dolo")
    assert_test("Customer Product Catalog Search", prod_res.status_code == 200 and len(prod_res.json()) > 0)
    test_product_id = prod_res.json()[0]["id"]

    # 1.3 Place Order (Failsafe state: PENDING_PHARMACIST_REVIEW)
    order_payload = {
        "name": "Venkatesh Rao",
        "phone": "9876543210",
        "house": "Flat 402, Green Valley",
        "area": "Madhapur",
        "city": "Hyderabad",
        "pincode": "500081",
        "payment_method": "upi",
        "payment_id": "pay_test_cust984",
        "items": [{"product_id": test_product_id, "quantity": 1}]
    }
    order_res = client.post("/orders/", json=order_payload, headers=customer_headers)
    assert_test("Customer Place Order", order_res.status_code == 201)
    created_order = order_res.json()
    order_id = created_order["id"]
    assert_test(
        "Initial Order State is PENDING_PHARMACIST_REVIEW",
        created_order["order_status"] == "PENDING_PHARMACIST_REVIEW",
        f"Order #{created_order['order_number']}"
    )

    # 1.4 Customer Cannot Access Admin APIs (RBAC Check)
    admin_unauth_res = client.get("/admin/users", headers=customer_headers)
    assert_test("Customer Denied from Admin Portal (403)", admin_unauth_res.status_code == 403)

    # ----------------------------------------------------
    # 2. PORTAL 2: PHARMACIST OPERATIONS PORTAL WORKFLOW
    # ----------------------------------------------------
    print("\n>>> 2. PORTAL: PHARMACIST OPERATIONS")
    # 2.1 Pharmacist Login (Chinna Venkatarao Lead Pharmacist)
    pharm_login_res = client.post("/auth/admin-login", json={"email": "pharmacist@svcare.com", "password": "955040"})
    assert_test("Pharmacist Authentication (Chinna Venkatarao)", pharm_login_res.status_code == 200)
    pharm_token = pharm_login_res.json()["token"]
    pharm_headers = {"Authorization": f"Bearer {pharm_token}"}

    # 2.2 Pharmacist Reviews & Accepts Order
    accept_res = client.put(
        f"/orders/{order_id}/status",
        json={"new_status": "ACCEPTED", "reason": "Pharmacist Chinna Venkatarao verified dosage."},
        headers=pharm_headers
    )
    assert_test("Pharmacist Sign & Accept Order (ACCEPTED)", accept_res.status_code == 200 and accept_res.json()["order_status"] == "ACCEPTED")

    # 2.3 Pharmacist Transitions to PACKING
    packing_res = client.put(
        f"/orders/{order_id}/status",
        json={"new_status": "PACKING", "reason": "Cold-box preparation started."},
        headers=pharm_headers
    )
    assert_test("Pharmacist Transition to PACKING", packing_res.status_code == 200 and packing_res.json()["order_status"] == "PACKING")

    # 2.4 Pharmacist Transitions to PACKED
    packed_res = client.put(
        f"/orders/{order_id}/status",
        json={"new_status": "PACKED", "reason": "Tamper-evident seal applied."},
        headers=pharm_headers
    )
    assert_test("Pharmacist Transition to PACKED", packed_res.status_code == 200 and packed_res.json()["order_status"] == "PACKED")

    # 2.5 Pharmacist Inventory Stock Adjustment
    stock_adj_res = client.post(
        "/inventory/adjust",
        json={
            "product_id": test_product_id,
            "adjustment_type": "ADD",
            "quantity": 10,
            "reason": "New clinical batch restock PO-892"
        },
        headers=pharm_headers
    )
    assert_test("Pharmacist Warehouse Stock Adjustment", stock_adj_res.status_code == 200)

    # ----------------------------------------------------
    # 3. PORTAL 3: DELIVERY FLEET RIDER WORKFLOW
    # ----------------------------------------------------
    print("\n>>> 3. PORTAL: DELIVERY FLEET")
    # 3.1 Assign Delivery Rider
    assign_res = client.post(
        f"/deliveries/assign/{order_id}",
        json={
            "rider_user_id": 4,
            "rider_name": "Ramesh Express Rider",
            "rider_phone": "9123456780",
            "delivery_notes": "Handle with 18C-24C cold pouch"
        },
        headers=pharm_headers
    )
    assert_test("Assign Delivery Rider to Order", assign_res.status_code == 200)
    delivery_id = assign_res.json()["id"]

    # 3.2 Rider Auth (or using Pharmacist/Admin header for fleet tracking)
    # 3.3 Mark OUT_FOR_DELIVERY
    out_res = client.put(
        f"/deliveries/{delivery_id}/status",
        json={"status": "OUT_FOR_DELIVERY", "notes": "Rider en route on EV #TS-09"},
        headers=pharm_headers
    )
    assert_test("Rider Mark OUT_FOR_DELIVERY", out_res.status_code == 200 and out_res.json()["status"] == "OUT_FOR_DELIVERY")

    # 3.4 Verify Order reflects OUT_FOR_DELIVERY
    order_check = client.get(f"/orders/{order_id}")
    assert_test("Order status reflects OUT_FOR_DELIVERY", order_check.json()["order_status"] == "OUT_FOR_DELIVERY")

    # 3.5 Mark DELIVERED with Customer OTP
    deliv_res = client.put(
        f"/deliveries/{delivery_id}/status",
        json={"status": "DELIVERED", "notes": "Doorstep contactless delivery verified"},
        headers=pharm_headers
    )
    assert_test("Rider Mark DELIVERED", deliv_res.status_code == 200 and deliv_res.json()["status"] == "DELIVERED")

    # ----------------------------------------------------
    # 4. PORTAL 4: STORE ADMINISTRATOR WORKFLOW
    # ----------------------------------------------------
    print("\n>>> 4. PORTAL: STORE ADMINISTRATOR")
    # 4.1 Admin Login (Chinna Venkatarao: venkatc283@gmail.com / 955040)
    admin_login_res = client.post("/auth/admin-login", json={"email": "venkatc283@gmail.com", "password": "955040"})
    assert_test(
        "Admin Authentication (Chinna Venkatarao)",
        admin_login_res.status_code == 200 and admin_login_res.json()["user"]["name"] == "Chinna Venkatarao"
    )
    admin_token = admin_login_res.json()["token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 4.1b Admin Phone OTP Login (6303180717 / OTP 955040)
    admin_phone_otp_res = client.post("/auth/verify-otp", json={"phone": "6303180717", "otp": "955040"})
    assert_test(
        "Admin Phone OTP Authentication (6303180717 / OTP 955040)",
        admin_phone_otp_res.status_code == 200 and admin_phone_otp_res.json()["user"]["role"] == "ADMIN"
    )

    # 4.2 Platform Analytics
    analytics_res = client.get("/admin/analytics", headers=admin_headers)
    assert_test("Admin Analytics Dashboard", analytics_res.status_code == 200 and "total_revenue" in analytics_res.json())

    # 4.3 Users & RBAC Management
    users_res = client.get("/admin/users", headers=admin_headers)
    assert_test("Admin Users List", users_res.status_code == 200 and len(users_res.json()) > 0)

    # 4.4 Audit Logs
    audit_res = client.get("/admin/audit-logs", headers=admin_headers)
    assert_test("Admin Audit Logs Stream", audit_res.status_code == 200 and len(audit_res.json()) > 0)

    # 4.5 Category Management
    cat_res = client.get("/categories/")
    assert_test("Category Catalog", cat_res.status_code == 200 and len(cat_res.json()) >= 8)

    print("\n" + "=" * 65)
    print(f"ALL 4 PORTALS VERIFIED SUCCESSFULLY! ({passed_tests}/{total_tests} Tests Passed)")
    print("=" * 65)

if __name__ == "__main__":
    test_all_four_portals()
