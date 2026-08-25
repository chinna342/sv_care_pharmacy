// ==========================================
// SAMPLE PRESCRIPTIONS FOR DEMO OCR SCANNER
// ==========================================
export const samplePrescriptions = [
  {
    id: "rx-101",
    title: "Acute Respiratory & Fever Rx",
    doctorName: "Dr. Arvind Sharma, MD (Internal Medicine)",
    hospital: "Apollo Healthcare, Hyderabad",
    regNo: "MCI-48920-HYD",
    patientName: "Rahul Verma",
    patientAge: 32,
    patientGender: "Male",
    date: "19 Aug 2026",
    diagnosis: "Acute Bronchitis with High Grade Fever & Productive Cough",
    medicinesExtracted: [
      { id: 1, name: "Dolo 650mg Paracetamol", dosage: "1 tablet TDS (3 times/day) after food for 3 days", qty: 1, matchedId: 1 },
      { id: 8, name: "Azee 500 (Azithromycin)", dosage: "1 tablet OD (Once daily) 1 hr before meal for 5 days", qty: 1, matchedId: 8 },
      { id: 22, name: "Montair-LC", dosage: "1 tablet HS (Night at bedtime) for 7 days", qty: 1, matchedId: 22 },
      { id: 25, name: "Benadryl Dry Cough Syrup 100ml", dosage: "10ml TDS for 5 days", qty: 1, matchedId: 25 },
    ],
    doctorNotes: "Drink plenty of warm fluids. Avoid cold beverages. Review in 5 days if fever persists.",
  },
  {
    id: "rx-102",
    title: "Cardio & Diabetes Maintenance Rx",
    doctorName: "Dr. Sunita Reddy, DM (Cardiology)",
    hospital: "Care Heart Institute, Banjara Hills",
    regNo: "TSMC-21045",
    patientName: "Kavita Rao",
    patientAge: 54,
    patientGender: "Female",
    date: "18 Aug 2026",
    diagnosis: "Type 2 Diabetes Mellitus & Primary Hypertension",
    medicinesExtracted: [
      { id: 12, name: "Telma 40 (Telmisartan)", dosage: "1 tablet OD morning with breakfast", qty: 2, matchedId: 12 },
      { id: 17, name: "Glycomet 500 SR (Metformin)", dosage: "1 tablet BD after meals (Morning & Dinner)", qty: 2, matchedId: 17 },
      { id: 14, name: "Atorva 10 (Atorvastatin)", dosage: "1 tablet HS at night", qty: 1, matchedId: 14 },
      { id: 19, name: "Accu-Chek Active 50 Glucose Strips", dosage: "Check fasting & 2hr PP twice weekly", qty: 1, matchedId: 19 },
    ],
    doctorNotes: "Maintain strict low sodium and low glycemic index diet. 30 mins brisk walking daily.",
  },
];

// ==========================================
// BMI ADVISOR RECOMMENDATIONS
// ==========================================
export const bmiAdviceMap = {
  underweight: {
    title: "Underweight (BMI < 18.5)",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    advice: "You may need nutrient-dense healthy calorie intake and muscle-building proteins.",
    recommendedCategory: "Vitamins & Immunity",
    recommendedProducts: [34, 35, 32], // Zincovit, Omega 3, Vitamin C
  },
  normal: {
    title: "Healthy & Optimal (BMI 18.5 - 24.9)",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    advice: "Great job! Maintain your balanced nutrition, regular exercise, and daily micronutrient support.",
    recommendedCategory: "Vitamins & Immunity",
    recommendedProducts: [32, 33, 34], // Vitamin C, Calcirol D3, Zincovit
  },
  overweight: {
    title: "Overweight (BMI 25.0 - 29.9)",
    badgeColor: "bg-orange-100 text-orange-800 border-orange-300",
    advice: "Focus on aerobic cardiovascular exercises, low GI diet, and lipid management.",
    recommendedCategory: "Heart & Blood Pressure",
    recommendedProducts: [35, 33, 17], // Omega 3, D3, Metformin/Sugar care
  },
  obese: {
    title: "Obesity Range (BMI ≥ 30.0)",
    badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
    advice: "We recommend consulting our clinical nutritionist and monitoring blood pressure and glucose levels regularly.",
    recommendedCategory: "Diabetes Care",
    recommendedProducts: [19, 35, 12], // Glucose strips, Omega 3, Telma
  },
};

// ==========================================
// AI PHARMACIST KNOWLEDGE ENGINE
// ==========================================
export const aiPharmacistResponses = [
  {
    keywords: ["fever", "temperature", "body pain", "headache", "dolo", "paracetamol"],
    response: "For acute fever and mild-to-moderate body pain, **Dolo 650mg (Paracetamol)** is the first-line antipyretic. Adults can take 1 tablet every 6-8 hours after food (max 4 tablets/24h). Stay hydrated with electrolytes. If fever stays above 102°F for more than 48 hours, please consult a physician immediately.",
    suggestedProductIds: [1, 2, 6],
  },
  {
    keywords: ["cough", "cold", "sneeze", "throat", "congestion", "runny nose", "benadryl", "asthma"],
    response: "For dry irritating cough, **Benadryl Dry Cough Syrup (10ml TDS)** soothes the throat reflex. For nasal congestion and sneezing, **Cetirizine 10mg** or **Montair-LC** provides 24-hour relief. Inhale steam 2-3 times daily.",
    suggestedProductIds: [25, 24, 22, 26],
  },
  {
    keywords: ["acidity", "gas", "heartburn", "stomach", "reflux", "digene", "pan 40", "pantoprazole", "eno"],
    response: "For persistent acid reflux or heartburn, **Pan 40 (Pantoprazole)** taken 30 minutes before breakfast provides superior gastric acid suppression. For instant emergency relief in seconds, you can take **Eno Regular** or 2 spoons of **Digene Mint Gel** after meals.",
    suggestedProductIds: [27, 29, 30, 28],
  },
  {
    keywords: ["vitamin", "immunity", "fatigue", "tired", "weakness", "hair", "skin", "zinc", "d3"],
    response: "To boost immune resilience and energy, a combination of **Limcee Vitamin C 500mg (chewable daily)**, **Calcirol Vitamin D3 60,000 IU (weekly)**, and **Triple Strength Omega 3 (daily)** is clinically proven to support vital stamina and reduce cellular fatigue.",
    suggestedProductIds: [32, 33, 34, 35],
  },
  {
    keywords: ["diabetes", "sugar", "insulin", "metformin", "glycomet", "glucose"],
    response: "For blood sugar management, regular glycemic monitoring with **Accu-Chek Active Strips** is essential. **Glycomet 500 SR (Metformin)** improves insulin sensitivity. Remember that diabetes medicines require strict adherence and a valid doctor's prescription.",
    suggestedProductIds: [17, 19, 18],
  },
  {
    keywords: ["bp", "blood pressure", "hypertension", "heart", "telma", "cholesterol", "statin"],
    response: "Maintaining healthy blood pressure (< 120/80 mmHg) is critical for cardio-protection. **Telma 40 (Telmisartan)** and **Atorva 10 (Atorvastatin)** help regulate vascular pressure and reduce plaque risks. Please upload your prescription to order Rx cardiac medications.",
    suggestedProductIds: [12, 13, 14, 15],
  },
];
