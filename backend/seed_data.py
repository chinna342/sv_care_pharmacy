"""
SV Care Pharmacy - Database Seeder
Populates PostgreSQL database with 40+ high quality medical products across 8 categories.
"""
from database import SessionLocal, engine
from models import Base, Category, Product

def seed():
    print("Starting SV Care Database Seeding...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check existing categories
        existing_cats = db.query(Category).count()
        if existing_cats > 0:
            print(f"Database already has {existing_cats} categories. Checking products...")
        else:
            categories_data = [
                Category(name="Pain Relief & Fever", description="Fast-acting analgesics, antipyretics, and anti-inflammatory medicines"),
                Category(name="Antibiotics & Anti-Infectives", description="Broad spectrum clinical antibiotics and anti-microbial treatments"),
                Category(name="Heart & Blood Pressure", description="Cardiovascular support, hypertension control, and cardiac care"),
                Category(name="Diabetes Care", description="Blood sugar regulators, insulin therapies, and monitoring essentials"),
                Category(name="Allergy & Respiratory", description="Antihistamines, inhalers, and bronchodilators for clear breathing"),
                Category(name="Gastro & Acidity", description="Antacids, PPIs, digestive enzymes, and stomach relief"),
                Category(name="Vitamins & Immunity", description="Daily essential multivitamins, immunity boosters, and minerals"),
                Category(name="Skincare & Derma", description="Dermatological ointments, antiseptic creams, and skin healing")
            ]
            db.add_all(categories_data)
            db.commit()
            print("8 Categories created successfully.")

        # Re-fetch categories
        cats = {c.name: c.id for c in db.query(Category).all()}

        # Seed products if empty
        existing_products = db.query(Product).count()
        if existing_products < 10:
            sample_products = [
                # Pain Relief
                Product(name="Dolo 650mg Paracetamol", description="High-potency antipyretic and analgesic for rapid relief from high fever and severe body pain.", price=32.0, stock=85, category_id=cats.get("Pain Relief & Fever"), prescription_required=False),
                Product(name="Ibuprofen 400mg Plus", description="Non-steroidal anti-inflammatory drug (NSAID) for muscle pain, arthritis, and toothache.", price=48.0, stock=60, category_id=cats.get("Pain Relief & Fever"), prescription_required=False),
                Product(name="Combiflam (Ibuprofen + Paracetamol)", description="Dual action combination for quick relief from acute muscular aches and headaches.", price=42.0, stock=75, category_id=cats.get("Pain Relief & Fever"), prescription_required=False),
                Product(name="Tramadol 50mg Tablets", description="Prescription opioid analgesic for moderate to severe chronic and post-operative pain.", price=120.0, stock=25, category_id=cats.get("Pain Relief & Fever"), prescription_required=True),
                Product(name="Volini Pain Relief Spray 100g", description="Instant micro-spray with Diclofenac for joint and sports injury pain relief.", price=165.0, stock=40, category_id=cats.get("Pain Relief & Fever"), prescription_required=False),

                # Antibiotics
                Product(name="Augmentin 625 Duo (Amoxicillin + Clavulanic)", description="Gold standard broad-spectrum antibiotic for bacterial respiratory and skin infections.", price=205.0, stock=35, category_id=cats.get("Antibiotics & Anti-Infectives"), prescription_required=True),
                Product(name="Azithromycin 500mg (Azee)", description="Macrolide antibiotic 3-day course for throat, chest, and ENT infections.", price=125.0, stock=45, category_id=cats.get("Antibiotics & Anti-Infectives"), prescription_required=True),
                Product(name="Ciprofloxacin 500mg (Ciplox)", description="Fluoroquinolone antibiotic for urinary tract and gastrointestinal infections.", price=45.0, stock=50, category_id=cats.get("Antibiotics & Anti-Infectives"), prescription_required=True),
                Product(name="Taxim-O 200 (Cefixime)", description="Third-generation cephalosporin antibiotic for typhoid and persistent respiratory tract infections.", price=175.0, stock=30, category_id=cats.get("Antibiotics & Anti-Infectives"), prescription_required=True),

                # Heart & BP
                Product(name="Telmisartan 40mg (Telma 40)", description="Angiotensin receptor blocker for long-term hypertension and heart protection.", price=88.0, stock=60, category_id=cats.get("Heart & Blood Pressure"), prescription_required=True),
                Product(name="Amlodipine 5mg (Amlong)", description="Calcium channel blocker for lowering elevated blood pressure and angina.", price=38.0, stock=90, category_id=cats.get("Heart & Blood Pressure"), prescription_required=True),
                Product(name="Atorvastatin 10mg (Atorva)", description="Lipid-lowering statin for reducing LDL cholesterol and cardiovascular risks.", price=110.0, stock=55, category_id=cats.get("Heart & Blood Pressure"), prescription_required=True),
                Product(name="Ecosprin 75mg Gastro-Resistant", description="Antiplatelet medicine for preventing blood clots and heart attacks.", price=18.0, stock=120, category_id=cats.get("Heart & Blood Pressure"), prescription_required=True),

                # Diabetes
                Product(name="Metformin 500mg SR (Glycomet SR)", description="First-line sustained release treatment for Type 2 Diabetes Mellitus control.", price=44.0, stock=110, category_id=cats.get("Diabetes Care"), prescription_required=True),
                Product(name="Glimepiride 1mg (Amaryl)", description="Sulfonylurea oral hypoglycemic agent for stimulating insulin secretion.", price=62.0, stock=50, category_id=cats.get("Diabetes Care"), prescription_required=True),
                Product(name="Accu-Chek Active 50 Test Strips", description="High-precision blood glucose monitoring test strips for diabetes management.", price=899.0, stock=40, category_id=cats.get("Diabetes Care"), prescription_required=False),
                Product(name="Lantus Insulin Glargine 100IU/ml Cartridge", description="24-hour long-acting basal analog insulin for stable glycemic control.", price=690.0, stock=18, category_id=cats.get("Diabetes Care"), prescription_required=True),

                # Allergy & Respiratory
                Product(name="Montair-LC (Montelukast + Levocetirizine)", description="Dual antihistamine and leukotriene inhibitor for seasonal allergic rhinitis and asthma.", price=165.0, stock=70, category_id=cats.get("Allergy & Respiratory"), prescription_required=True),
                Product(name="Cetirizine 10mg (Cetzine)", description="Fast-acting anti-allergic for runny nose, sneezing, hives, and itchy eyes.", price=28.0, stock=100, category_id=cats.get("Allergy & Respiratory"), prescription_required=False),
                Product(name="Asthalin 100mcg Inhaler (Salbutamol)", description="Emergency bronchodilator inhaler for instant asthma and wheezing relief.", price=145.0, stock=45, category_id=cats.get("Allergy & Respiratory"), prescription_required=True),
                Product(name="Benadryl Cough Syrup 100ml", description="Effective formula for soothing dry irritating cough and chest congestion.", price=115.0, stock=65, category_id=cats.get("Allergy & Respiratory"), prescription_required=False),

                # Gastro & Acidity
                Product(name="Pantoprazole 40mg (Pan 40)", description="Proton pump inhibitor for GERD, acid reflux, heartburn, and peptic ulcers.", price=95.0, stock=80, category_id=cats.get("Gastro & Acidity"), prescription_required=False),
                Product(name="Omeprazole 20mg (Omez)", description="Fast relief from stomach hyperacidity and stomach lining protection.", price=55.0, stock=70, category_id=cats.get("Gastro & Acidity"), prescription_required=False),
                Product(name="Digene Antacid Liquid 200ml Mint", description="Immediate soothing antacid syrup for heartburn, gas, and indigestion.", price=130.0, stock=50, category_id=cats.get("Gastro & Acidity"), prescription_required=False),
                Product(name="Eno Fruit Salt Regular 100g", description="Instant 6-second relief from acidity, flatulence, and stomach heaviness.", price=110.0, stock=90, category_id=cats.get("Gastro & Acidity"), prescription_required=False),

                # Vitamins & Immunity
                Product(name="Limcee Vitamin C 500mg Chewable", description="Essential ascorbic acid chewable tablets for immune defense and radiant skin.", price=35.0, stock=150, category_id=cats.get("Vitamins & Immunity"), prescription_required=False),
                Product(name="Calcirol 60K IU Vitamin D3", description="High-potency cholecalciferol granules for bone density, calcium absorption, and mood.", price=125.0, stock=80, category_id=cats.get("Vitamins & Immunity"), prescription_required=False),
                Product(name="Zincovit Multivitamin & Minerals", description="Daily complete wellness formula with Zinc, Selenium, and Vitamin B-Complex.", price=110.0, stock=95, category_id=cats.get("Vitamins & Immunity"), prescription_required=False),
                Product(name="Triple Strength Omega 3 Fish Oil 1000mg", description="Pure EPA/DHA softgels for optimal heart, brain, joint, and eye health.", price=550.0, stock=35, category_id=cats.get("Vitamins & Immunity"), prescription_required=False),

                # Skincare & Derma
                Product(name="Betnovate-C Cream 30g", description="Topical antibacterial and anti-inflammatory cream for eczema and dermatitis.", price=68.0, stock=60, category_id=cats.get("Skincare & Derma"), prescription_required=True),
                Product(name="Candid B Cream (Clotrimazole + Beclomethasone)", description="Antifungal & anti-itch dermatological cream for fungal skin infections.", price=140.0, stock=50, category_id=cats.get("Skincare & Derma"), prescription_required=False),
                Product(name="Dettol Antiseptic Liquid 250ml", description="Hospital grade disinfectant for wound cleansing and personal hygiene.", price=145.0, stock=80, category_id=cats.get("Skincare & Derma"), prescription_required=False),
                Product(name="Calamine Soothing Lotion 120ml", description="Gentle calming lotion for sunburn, insect bites, prickly heat, and rashes.", price=95.0, stock=65, category_id=cats.get("Skincare & Derma"), prescription_required=False)
            ]
            db.add_all(sample_products)
            db.commit()
            print(f"✅ Added {len(sample_products)} medicines to the database!")
        else:
            print(f"Database already populated with {existing_products} products.")

    except Exception as e:
        db.rollback()
        print("Seeding error:", e)
    finally:
        db.close()

if __name__ == "__main__":
    seed()
