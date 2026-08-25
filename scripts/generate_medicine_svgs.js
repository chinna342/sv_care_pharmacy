import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, '..', 'frontend', 'public', 'medicines');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const medicineDesigns = [
  {
    id: 1,
    filename: 'dolo-650.svg',
    name: 'DOLO 650',
    salt: 'Paracetamol IP 650 mg',
    mfg: 'MICRO LABS LIMITED',
    type: 'TABLETS',
    badge: 'FAST FEVER RELIEF',
    accentColor: '#0284c7',
    secondaryColor: '#0369a1',
    bgGrad1: '#f0f9ff',
    bgGrad2: '#e0f2fe',
    pills: 15,
    pillColor: '#ffffff',
    pillShape: 'oblong',
    rx: false
  },
  {
    id: 2,
    filename: 'combiflam.svg',
    name: 'COMBIFLAM',
    salt: 'Ibuprofen 400mg + Paracetamol 325mg',
    mfg: 'SANOFI INDIA',
    type: 'PLUS TABLETS',
    badge: 'DUAL ACTION PAIN',
    accentColor: '#dc2626',
    secondaryColor: '#b91c1c',
    bgGrad1: '#fef2f2',
    bgGrad2: '#fee2e2',
    pills: 20,
    pillColor: '#ffffff',
    pillShape: 'oblong',
    rx: false
  },
  {
    id: 3,
    filename: 'tramadol.svg',
    name: 'TRAMADOL HCl',
    salt: 'Tramadol Hydrochloride 50 mg',
    mfg: 'CADILA PHARMA',
    type: 'CAPSULES / TABS',
    badge: 'PRESCRIPTION PAIN',
    accentColor: '#7c3aed',
    secondaryColor: '#6d28d9',
    bgGrad1: '#faf5ff',
    bgGrad2: '#f3e8ff',
    pills: 10,
    pillColor: '#ede9fe',
    pillShape: 'capsule',
    rx: true
  },
  {
    id: 4,
    filename: 'volini.svg',
    name: 'VOLINI MAXX',
    salt: 'Diclofenac Diethylamine Gel',
    mfg: 'SUN PHARMA',
    type: 'PAIN RELIEF GEL 50g',
    badge: 'INSTANT JOINT ACTION',
    accentColor: '#ea580c',
    secondaryColor: '#c2410c',
    bgGrad1: '#fff7ed',
    bgGrad2: '#ffedd5',
    form: 'tube',
    rx: false
  },
  {
    id: 5,
    filename: 'naprosyn.svg',
    name: 'NAPROSYN 500',
    salt: 'Naproxen Sodium 500 mg',
    mfg: 'RPG LIFE SCIENCES',
    type: 'ANTI-INFLAMMATORY',
    badge: '12-HR ARTHRITIS CARE',
    accentColor: '#2563eb',
    secondaryColor: '#1d4ed8',
    bgGrad1: '#eff6ff',
    bgGrad2: '#dbeafe',
    pills: 10,
    pillColor: '#ffffff',
    pillShape: 'oblong',
    rx: true
  },
  {
    id: 6,
    filename: 'saridon.svg',
    name: 'SARIDON',
    salt: 'Paracetamol + Propyphenazone + Caffeine',
    mfg: 'PIRAMAL HEALTHCARE',
    type: 'HEADACHE EXPERT',
    badge: 'RELIEF IN 15 MINS',
    accentColor: '#e11d48',
    secondaryColor: '#be123c',
    bgGrad1: '#fff1f2',
    bgGrad2: '#ffe4e6',
    pills: 10,
    pillColor: '#ffffff',
    pillShape: 'round',
    rx: false
  },
  {
    id: 7,
    filename: 'augmentin-625.svg',
    name: 'AUGMENTIN 625',
    salt: 'Amoxicillin 500mg + Clavulanate 125mg',
    mfg: 'GSK PHARMA',
    type: 'DUO TABLETS',
    badge: 'GOLD STANDARD ANTIBIOTIC',
    accentColor: '#0d9488',
    secondaryColor: '#0f766e',
    bgGrad1: '#f0fdfa',
    bgGrad2: '#ccfbf1',
    pills: 10,
    pillColor: '#ffffff',
    pillShape: 'oblong',
    rx: true
  },
  {
    id: 8,
    filename: 'azee-500.svg',
    name: 'AZEE 500',
    salt: 'Azithromycin Tablets IP 500 mg',
    mfg: 'CIPLA LIMITED',
    type: '3-DAY COURSE',
    badge: 'RESPIRATORY CARE',
    accentColor: '#0891b2',
    secondaryColor: '#0e7490',
    bgGrad1: '#ecfeff',
    bgGrad2: '#cffafe',
    pills: 5,
    pillColor: '#ffffff',
    pillShape: 'capsule',
    rx: true
  },
  {
    id: 9,
    filename: 'ciplox-500.svg',
    name: 'CIPLOX 500',
    salt: 'Ciprofloxacin Tablets IP 500 mg',
    mfg: 'CIPLA LIMITED',
    type: 'ANTI-BACTERIAL',
    badge: 'CLINICAL GRADE',
    accentColor: '#0284c7',
    secondaryColor: '#0369a1',
    bgGrad1: '#f0f9ff',
    bgGrad2: '#e0f2fe',
    pills: 10,
    pillColor: '#ffffff',
    pillShape: 'round',
    rx: true
  },
  {
    id: 10,
    filename: 'taxim-o-200.svg',
    name: 'TAXIM-O 200',
    salt: 'Cefixime Trihydrate 200 mg',
    mfg: 'ALKEM LABS',
    type: 'CEPHALOSPORIN',
    badge: 'ENTERIC INFECTIONS',
    accentColor: '#4f46e5',
    secondaryColor: '#4338ca',
    bgGrad1: '#eef2ff',
    bgGrad2: '#e0e7ff',
    pills: 10,
    pillColor: '#ffffff',
    pillShape: 'oblong',
    rx: true
  },
  {
    id: 11,
    filename: 'flagyl-400.svg',
    name: 'FLAGYL 400',
    salt: 'Metronidazole Tablets IP 400 mg',
    mfg: 'ABBOTT HEALTHCARE',
    type: 'ANTIPROTOZOAL',
    badge: 'GASTRO INFECTION',
    accentColor: '#d97706',
    secondaryColor: '#b45309',
    bgGrad1: '#fffbeb',
    bgGrad2: '#fef3c7',
    pills: 15,
    pillColor: '#ffffff',
    pillShape: 'round',
    rx: true
  },
  {
    id: 12,
    filename: 'telma-40.svg',
    name: 'TELMA 40',
    salt: 'Telmisartan Tablets IP 40 mg',
    mfg: 'GLENMARK PHARMA',
    type: 'CARDIAC CARE',
    badge: '24-HR BP CONTROL',
    accentColor: '#be123c',
    secondaryColor: '#9f1239',
    bgGrad1: '#fff1f2',
    bgGrad2: '#ffe4e6',
    pills: 15,
    pillColor: '#ffffff',
    pillShape: 'oblong',
    rx: true
  },
  {
    id: 13,
    filename: 'amlong-5.svg',
    name: 'AMLONG 5',
    salt: 'Amlodipine Besylate 5 mg',
    mfg: 'MICRO LABS LIMITED',
    type: 'CALCIUM CHANNEL BLOCKER',
    badge: 'HEART VASCULAR CARE',
    accentColor: '#c026d3',
    secondaryColor: '#a21caf',
    bgGrad1: '#fdf4ff',
    bgGrad2: '#fae8ff',
    pills: 15,
    pillColor: '#ffffff',
    pillShape: 'round',
    rx: true
  },
  {
    id: 14,
    filename: 'atorva-10.svg',
    name: 'ATORVA 10',
    salt: 'Atorvastatin Calcium 10 mg',
    mfg: 'ZYDUS CADILA',
    type: 'STATIN CHOLESTEROL',
    badge: 'LIPID LOWERING',
    accentColor: '#059669',
    secondaryColor: '#047857',
    bgGrad1: '#ecfdf5',
    bgGrad2: '#d1fae5',
    pills: 15,
    pillColor: '#ffffff',
    pillShape: 'round',
    rx: true
  },
  {
    id: 15,
    filename: 'ecosprin-75.svg',
    name: 'ECOSPRIN 75',
    salt: 'Aspirin Gastro-Resistant 75 mg',
    mfg: 'USV PRIVATE LIMITED',
    type: 'CARDIO-PROTECTIVE',
    badge: 'ANTI-CLOT DEFENSE',
    accentColor: '#e11d48',
    secondaryColor: '#be123c',
    bgGrad1: '#fff1f2',
    bgGrad2: '#ffe4e6',
    pills: 14,
    pillColor: '#ffffff',
    pillShape: 'round',
    rx: true
  },
  {
    id: 16,
    filename: 'concor-5.svg',
    name: 'CONCOR 5',
    salt: 'Bisoprolol Fumarate 5 mg',
    mfg: 'MERCK HEALTHCARE',
    type: 'BETA-BLOCKER',
    badge: 'HEART RHYTHM REGULATION',
    accentColor: '#9333ea',
    secondaryColor: '#7e22ce',
    bgGrad1: '#faf5ff',
    bgGrad2: '#f3e8ff',
    pills: 10,
    pillColor: '#ffffff',
    pillShape: 'round',
    rx: true
  },
  {
    id: 17,
    filename: 'glycomet-500.svg',
    name: 'GLYCOMET 500 SR',
    salt: 'Metformin Hydrochloride 500 mg SR',
    mfg: 'USV PRIVATE LIMITED',
    type: 'DIABETES CARE',
    badge: 'GLYCEMIC BALANCE',
    accentColor: '#0284c7',
    secondaryColor: '#0369a1',
    bgGrad1: '#f0f9ff',
    bgGrad2: '#e0f2fe',
    pills: 20,
    pillColor: '#ffffff',
    pillShape: 'oblong',
    rx: true
  },
  {
    id: 18,
    filename: 'amaryl-1.svg',
    name: 'AMARYL 1mg',
    salt: 'Glimepiride Tablets IP 1 mg',
    mfg: 'SANOFI INDIA',
    type: 'INSULIN STIMULATOR',
    badge: 'POST-MEAL GLUCOSE',
    accentColor: '#0d9488',
    secondaryColor: '#0f766e',
    bgGrad1: '#f0fdfa',
    bgGrad2: '#ccfbf1',
    pills: 15,
    pillColor: '#ffffff',
    pillShape: 'oblong',
    rx: true
  },
  {
    id: 19,
    filename: 'accu-chek.svg',
    name: 'ACCU-CHEK ACTIVE',
    salt: 'Blood Glucose Test Strips 50s',
    mfg: 'ROCHE DIABETES CARE',
    type: 'SELF-TEST STRIPS',
    badge: 'ISO 15197 ACCURACY',
    accentColor: '#16a34a',
    secondaryColor: '#15803d',
    bgGrad1: '#f0fdf4',
    bgGrad2: '#dcfce7',
    form: 'strips_box',
    rx: false
  },
  {
    id: 20,
    filename: 'januvia-100.svg',
    name: 'JANUVIA 100',
    salt: 'Sitagliptin Phosphate 100 mg',
    mfg: 'MSD PHARMA',
    type: 'DPP-4 INHIBITOR',
    badge: 'WEIGHT NEUTRAL DIABETES',
    accentColor: '#4f46e5',
    secondaryColor: '#4338ca',
    bgGrad1: '#eef2ff',
    bgGrad2: '#e0e7ff',
    pills: 7,
    pillColor: '#ffffff',
    pillShape: 'round',
    rx: true
  },
  {
    id: 21,
    filename: 'lantus-solostar.svg',
    name: 'LANTUS SoloStar',
    salt: 'Insulin Glargine 100 IU/ml',
    mfg: 'SANOFI INDIA',
    type: '3ml PRE-FILLED PEN',
    badge: '24-HR BASAL INSULIN',
    accentColor: '#2563eb',
    secondaryColor: '#1d4ed8',
    bgGrad1: '#eff6ff',
    bgGrad2: '#dbeafe',
    form: 'insulin_pen',
    rx: true
  },
  {
    id: 22,
    filename: 'montair-lc.svg',
    name: 'MONTAIR-LC',
    salt: 'Montelukast 10mg + Levocetirizine 5mg',
    mfg: 'CIPLA LIMITED',
    type: 'DUAL ALLERGY CARE',
    badge: 'NIGHT ALLERGY RELIEF',
    accentColor: '#0891b2',
    secondaryColor: '#0e7490',
    bgGrad1: '#ecfeff',
    bgGrad2: '#cffafe',
    pills: 10,
    pillColor: '#ffffff',
    pillShape: 'oblong',
    rx: true
  },
  {
    id: 23,
    filename: 'asthalin-inhaler.svg',
    name: 'ASTHALIN INHALER',
    salt: 'Salbutamol 100mcg / puff',
    mfg: 'CIPLA RESPIRATORY',
    type: '200 METERED DOSES',
    badge: 'RESCUE AIRWAY EXPANDER',
    accentColor: '#0284c7',
    secondaryColor: '#0369a1',
    bgGrad1: '#f0f9ff',
    bgGrad2: '#e0f2fe',
    form: 'inhaler',
    rx: true
  },
  {
    id: 24,
    filename: 'cetzine-10.svg',
    name: 'CETZINE 10',
    salt: 'Cetirizine Hydrochloride 10 mg',
    mfg: 'DR. REDDYS LABS',
    type: 'ANTIHISTAMINE',
    badge: 'NON-DROWSY ALLERGY',
    accentColor: '#059669',
    secondaryColor: '#047857',
    bgGrad1: '#ecfdf5',
    bgGrad2: '#d1fae5',
    pills: 10,
    pillColor: '#ffffff',
    pillShape: 'round',
    rx: false
  },
  {
    id: 25,
    filename: 'benadryl.svg',
    name: 'BENADRYL',
    salt: 'Dextromethorphan + Chlorpheniramine',
    mfg: 'JOHNSON & JOHNSON',
    type: 'DRY COUGH SYRUP 100ml',
    badge: 'TARGETED COUGH RELIEF',
    accentColor: '#dc2626',
    secondaryColor: '#b91c1c',
    bgGrad1: '#fef2f2',
    bgGrad2: '#fee2e2',
    form: 'syrup_bottle',
    rx: false
  },
  {
    id: 26,
    filename: 'otrivin.svg',
    name: 'OTRIVIN OXY',
    salt: 'Oxymetazoline HCl 0.05%',
    mfg: 'GSK HEALTHCARE',
    type: 'NASAL SPRAY 10ml',
    badge: 'CLEAR NOSE IN 25 SEC',
    accentColor: '#0d9488',
    secondaryColor: '#0f766e',
    bgGrad1: '#f0fdfa',
    bgGrad2: '#ccfbf1',
    form: 'spray_bottle',
    rx: false
  },
  {
    id: 27,
    filename: 'pan-40.svg',
    name: 'PAN 40',
    salt: 'Pantoprazole Sodium 40 mg',
    mfg: 'ALKEM LABS',
    type: 'GASTRO-RESISTANT',
    badge: 'PPI ACIDITY BLOCKER',
    accentColor: '#eab308',
    secondaryColor: '#ca8a04',
    bgGrad1: '#fefce8',
    bgGrad2: '#fef9c3',
    pills: 15,
    pillColor: '#fef08a',
    pillShape: 'round',
    rx: false
  },
  {
    id: 28,
    filename: 'omez-20.svg',
    name: 'OMEZ 20',
    salt: 'Omeprazole Capsules IP 20 mg',
    mfg: 'DR. REDDYS LABS',
    type: 'CAPSULES',
    badge: 'HEARTBURN & GERD RELIEF',
    accentColor: '#ea580c',
    secondaryColor: '#c2410c',
    bgGrad1: '#fff7ed',
    bgGrad2: '#ffedd5',
    pills: 20,
    pillColor: '#fdba74',
    pillShape: 'capsule',
    rx: false
  },
  {
    id: 29,
    filename: 'digene.svg',
    name: 'DIGENE GEL',
    salt: 'Magnesium + Aluminium Hydroxide',
    mfg: 'ABBOTT INDIA',
    type: 'MINT SYRUP 200ml',
    badge: 'INSTANT SOOTHING ACTION',
    accentColor: '#ec4899',
    secondaryColor: '#db2777',
    bgGrad1: '#fdf2f8',
    bgGrad2: '#fce7f3',
    form: 'syrup_bottle',
    rx: false
  },
  {
    id: 30,
    filename: 'eno.svg',
    name: 'ENO FRUIT SALT',
    salt: 'Sodium Bicarbonate + Citric Acid',
    mfg: 'GSK CONSUMER',
    type: 'REGULAR 100g JAR',
    badge: 'RELIEF IN 6 SECONDS',
    accentColor: '#16a34a',
    secondaryColor: '#15803d',
    bgGrad1: '#f0fdf4',
    bgGrad2: '#dcfce7',
    form: 'eno_jar',
    rx: false
  },
  {
    id: 31,
    filename: 'duphalac.svg',
    name: 'DUPHALAC',
    salt: 'Lactulose Solution 3.33g/5ml',
    mfg: 'ABBOTT HEALTHCARE',
    type: 'ORAL SOLUTION 200ml',
    badge: 'GENTLE PREBIOTIC RELIEF',
    accentColor: '#2563eb',
    secondaryColor: '#1d4ed8',
    bgGrad1: '#eff6ff',
    bgGrad2: '#dbeafe',
    form: 'syrup_bottle',
    rx: false
  },
  {
    id: 32,
    filename: 'limcee-500.svg',
    name: 'LIMCEE 500',
    salt: 'Ascorbic Acid Vitamin C 500mg',
    mfg: 'ABBOTT HEALTHCARE',
    type: 'ORANGE CHEWABLE',
    badge: 'IMMUNITY & COLLAGEN',
    accentColor: '#ea580c',
    secondaryColor: '#c2410c',
    bgGrad1: '#fff7ed',
    bgGrad2: '#ffedd5',
    pills: 15,
    pillColor: '#fed7aa',
    pillShape: 'round',
    rx: false
  },
  {
    id: 33,
    filename: 'calcirol-60k.svg',
    name: 'CALCIROL 60K',
    salt: 'Cholecalciferol Vitamin D3 60,000 IU',
    mfg: 'CADILA HEALTHCARE',
    type: '4 SACHET PACK',
    badge: 'MEGA BONE VITALITY',
    accentColor: '#ca8a04',
    secondaryColor: '#a16207',
    bgGrad1: '#fefce8',
    bgGrad2: '#fef08a',
    form: 'sachet_box',
    rx: false
  },
  {
    id: 34,
    filename: 'zincovit.svg',
    name: 'ZINCOVIT',
    salt: 'Multivitamin + Minerals + Grape Seed',
    mfg: 'APEX LABORATORIES',
    type: 'DAILY NUTRIENTS',
    badge: 'ALL-DAY STAMINA',
    accentColor: '#16a34a',
    secondaryColor: '#15803d',
    bgGrad1: '#f0fdf4',
    bgGrad2: '#dcfce7',
    pills: 15,
    pillColor: '#bbf7d0',
    pillShape: 'oblong',
    rx: false
  },
  {
    id: 35,
    filename: 'omega-3.svg',
    name: 'OMEGA 3 FISH OIL',
    salt: 'EPA 550mg + DHA 350mg 1000mg',
    mfg: 'TRUEBASICS NUTRITION',
    type: '60 SOFTGELS BOTTLE',
    badge: 'TRIPLE STRENGTH HEART',
    accentColor: '#0284c7',
    secondaryColor: '#0369a1',
    bgGrad1: '#f0f9ff',
    bgGrad2: '#e0f2fe',
    form: 'omega_bottle',
    rx: false
  },
  {
    id: 36,
    filename: 'neurobion-forte.svg',
    name: 'NEUROBION FORTE',
    salt: 'Vitamin B1 + B6 + B12 Complex',
    mfg: 'P&G HEALTH',
    type: 'NERVE NOURISHMENT',
    badge: 'NERVE HEALTH & TINGLING',
    accentColor: '#dc2626',
    secondaryColor: '#b91c1c',
    bgGrad1: '#fef2f2',
    bgGrad2: '#fee2e2',
    pills: 30,
    pillColor: '#fca5a5',
    pillShape: 'round',
    rx: false
  },
  {
    id: 37,
    filename: 'betnovate-c.svg',
    name: 'BETNOVATE-C',
    salt: 'Betamethasone + Clioquinol Cream',
    mfg: 'GSK DERMA',
    type: '30g SKIN CREAM',
    badge: 'ECZEMA & DERMATITIS',
    accentColor: '#0d9488',
    secondaryColor: '#0f766e',
    bgGrad1: '#f0fdfa',
    bgGrad2: '#ccfbf1',
    form: 'tube',
    rx: true
  },
  {
    id: 38,
    filename: 'candid-b.svg',
    name: 'CANDID-B',
    salt: 'Clotrimazole + Beclomethasone',
    mfg: 'GLENMARK PHARMA',
    type: '20g ANTIFUNGAL TUBE',
    badge: 'FAST ITCH & RINGWORM',
    accentColor: '#0284c7',
    secondaryColor: '#0369a1',
    bgGrad1: '#f0f9ff',
    bgGrad2: '#e0f2fe',
    form: 'tube',
    rx: false
  },
  {
    id: 39,
    filename: 'dettol.svg',
    name: 'DETTOL ANTISEPTIC',
    salt: 'Chloroxylenol 4.8% w/v Liquid',
    mfg: 'RECKITT BENCKISER',
    type: '250ml DISINFECTANT',
    badge: '100% FIRST AID PROTECTION',
    accentColor: '#15803d',
    secondaryColor: '#166534',
    bgGrad1: '#f0fdf4',
    bgGrad2: '#dcfce7',
    form: 'dettol_bottle',
    rx: false
  },
  {
    id: 40,
    filename: 'lacto-calamine.svg',
    name: 'LACTO CALAMINE',
    salt: 'Kaolin + Zinc Oxide + Glycerin',
    mfg: 'PIRAMAL PHARMA',
    type: '120ml OIL BALANCE LOTION',
    badge: 'CALM & CLEAR SKIN',
    accentColor: '#f43f5e',
    secondaryColor: '#e11d48',
    bgGrad1: '#fff1f2',
    bgGrad2: '#ffe4e6',
    form: 'lotion_bottle',
    rx: false
  }
];

function generateSVG(item) {
  const {
    name,
    salt,
    mfg,
    type,
    badge,
    accentColor,
    secondaryColor,
    bgGrad1,
    bgGrad2,
    pills = 10,
    pillColor = '#ffffff',
    pillShape = 'oblong',
    form = 'strip',
    rx = false
  } = item;

  let graphicContent = '';

  if (form === 'tube') {
    graphicContent = `
      <!-- Ointment / Gel Tube Mockup -->
      <g transform="translate(140, 105)">
        <path d="M 0 50 L 120 15 L 120 85 L 0 50 Z" fill="url(#tubeGrad)" filter="url(#dropShadow)" />
        <rect x="120" y="25" width="20" height="50" rx="4" fill="${accentColor}" />
        <rect x="140" y="32" width="14" height="36" rx="3" fill="#334155" />
        <!-- Tube Brand Label -->
        <text x="50" y="54" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="14" fill="#ffffff" transform="rotate(-16, 50, 54)">${name.split(' ')[0]}</text>
      </g>
    `;
  } else if (form === 'syrup_bottle' || form === 'dettol_bottle' || form === 'lotion_bottle' || form === 'omega_bottle' || form === 'eno_jar') {
    const isAmber = form === 'dettol_bottle';
    const isLotion = form === 'lotion_bottle';
    const bottleColor = isAmber ? '#b45309' : isLotion ? '#fda4af' : '#ffffff';
    graphicContent = `
      <!-- Bottle Mockup -->
      <g transform="translate(150, 90)">
        <!-- Cap -->
        <rect x="30" y="0" width="40" height="22" rx="4" fill="${accentColor}" filter="url(#dropShadow)" />
        <rect x="35" y="20" width="30" height="8" fill="#cbd5e1" />
        <!-- Body -->
        <rect x="10" y="26" width="80" height="130" rx="16" fill="${bottleColor}" stroke="#cbd5e1" stroke-width="2" filter="url(#dropShadow)" />
        <!-- Label -->
        <rect x="14" y="50" width="72" height="75" rx="8" fill="#ffffff" stroke="${accentColor}" stroke-width="1.5" />
        <rect x="18" y="55" width="64" height="18" rx="4" fill="${accentColor}" />
        <text x="50" y="68" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="9" fill="#ffffff" text-anchor="middle">${name.split(' ')[0]}</text>
        <text x="50" y="85" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="700" font-size="7" fill="#64748b" text-anchor="middle">${type.substring(0, 16)}</text>
        <circle cx="50" cy="105" r="10" fill="${bgGrad2}" />
        <text x="50" y="108" font-size="11" text-anchor="middle">🧪</text>
      </g>
    `;
  } else if (form === 'inhaler') {
    graphicContent = `
      <!-- Inhaler Shape Mockup -->
      <g transform="translate(130, 85)">
        <!-- L-Shape Body -->
        <path d="M 30 10 L 80 10 L 80 80 L 130 90 L 130 135 L 30 135 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="2" filter="url(#dropShadow)" />
        <!-- Canister Top -->
        <rect x="40" y="0" width="30" height="20" rx="5" fill="${accentColor}" />
        <!-- Mouthpiece Cap -->
        <rect x="110" y="85" width="25" height="52" rx="6" fill="${accentColor}" />
        <!-- Inhaler Label -->
        <text x="55" y="60" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="11" fill="${accentColor}">ASTHALIN</text>
        <text x="55" y="74" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="7" fill="#64748b">100 mcg</text>
      </g>
    `;
  } else if (form === 'spray_bottle') {
    graphicContent = `
      <!-- Nasal Spray Mockup -->
      <g transform="translate(150, 85)">
        <!-- Nozzle -->
        <polygon points="50,0 44,30 56,30" fill="${accentColor}" />
        <rect x="35" y="30" width="30" height="15" rx="3" fill="#64748b" />
        <!-- Flange Finger Grip -->
        <rect x="20" y="45" width="60" height="10" rx="4" fill="${accentColor}" />
        <!-- Bottle -->
        <rect x="25" y="55" width="50" height="90" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" filter="url(#dropShadow)" />
        <!-- Spray Label -->
        <rect x="28" y="70" width="44" height="50" rx="6" fill="${bgGrad1}" />
        <text x="50" y="88" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="8" fill="${accentColor}" text-anchor="middle">OTRIVIN</text>
        <text x="50" y="102" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="6" fill="#64748b" text-anchor="middle">OXY FAST</text>
      </g>
    `;
  } else if (form === 'insulin_pen') {
    graphicContent = `
      <!-- Insulin Pen Mockup -->
      <g transform="translate(100, 110)">
        <rect x="0" y="20" width="200" height="30" rx="10" fill="#ffffff" stroke="#94a3b8" stroke-width="2" filter="url(#dropShadow)" />
        <rect x="0" y="20" width="60" height="30" rx="10" fill="${accentColor}" />
        <rect x="140" y="23" width="40" height="24" rx="4" fill="#f1f5f9" stroke="#cbd5e1" />
        <text x="160" y="38" font-family="monospace" font-weight="bold" font-size="11" fill="#0f172a" text-anchor="middle">100U</text>
        <rect x="190" y="27" width="16" height="16" rx="4" fill="#a855f7" />
        <!-- Insulin Label -->
        <text x="75" y="38" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="10" fill="${accentColor}">LANTUS SoloStar</text>
      </g>
    `;
  } else if (form === 'strips_box' || form === 'sachet_box') {
    graphicContent = `
      <!-- Test Strips / Sachet Box Mockup -->
      <g transform="translate(130, 85)">
        <rect x="0" y="0" width="140" height="150" rx="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" filter="url(#dropShadow)" />
        <rect x="0" y="0" width="140" height="40" rx="16" fill="${accentColor}" />
        <text x="70" y="26" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="12" fill="#ffffff" text-anchor="middle">${name.split(' ')[0]}</text>
        <rect x="15" y="55" width="110" height="75" rx="10" fill="${bgGrad2}" />
        <text x="70" y="85" font-size="28" text-anchor="middle">🩺</text>
        <text x="70" y="112" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="9" fill="${secondaryColor}" text-anchor="middle">${badge}</text>
      </g>
    `;
  } else {
    // Standard Pharmaceutical Blister Strip
    let pillNodes = '';
    const cols = pills > 10 ? 5 : pills > 6 ? 5 : pills === 5 ? 5 : pills === 7 ? 7 : 4;
    const rows = Math.ceil(pills / cols);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        if (idx >= pills) break;
        const px = 115 + c * 35;
        const py = 100 + r * 35;

        if (pillShape === 'capsule') {
          pillNodes += `
            <g transform="translate(${px - 10}, ${py - 12}) rotate(45, 12, 12)">
              <rect x="0" y="0" width="12" height="24" rx="6" fill="${accentColor}" />
              <rect x="12" y="0" width="12" height="24" rx="6" fill="${pillColor}" />
            </g>
          `;
        } else if (pillShape === 'oblong') {
          pillNodes += `
            <rect x="${px - 14}" y="${py - 8}" width="28" height="16" rx="8" fill="${pillColor}" stroke="#cbd5e1" stroke-width="1.5" filter="url(#dropShadow)" />
            <line x1="${px}" y1="${py - 7}" x2="${px}" y2="${py + 7}" stroke="#cbd5e1" stroke-width="1" />
          `;
        } else {
          pillNodes += `
            <circle cx="${px}" cy="${py}" r="11" fill="${pillColor}" stroke="#cbd5e1" stroke-width="1.5" filter="url(#dropShadow)" />
            <line x1="${px - 8}" y1="${py}" x2="${px + 8}" y2="${py}" stroke="#cbd5e1" stroke-width="1" />
          `;
        }
      }
    }

    graphicContent = `
      <!-- Metallic Silver Blister Foil -->
      <g transform="translate(0, 0)">
        <rect x="90" y="80" width="220" height="${rows * 40 + 30}" rx="16" fill="url(#foilGrad)" stroke="#94a3b8" stroke-width="1.5" filter="url(#dropShadow)" />
        <!-- Pockets Pattern -->
        ${pillNodes}
      </g>
    `;
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgGrad1}" />
      <stop offset="100%" stop-color="${bgGrad2}" />
    </linearGradient>

    <!-- Metallic Foil Gradient -->
    <linearGradient id="foilGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc" />
      <stop offset="25%" stop-color="#e2e8f0" />
      <stop offset="50%" stop-color="#cbd5e1" />
      <stop offset="75%" stop-color="#f1f5f9" />
      <stop offset="100%" stop-color="#94a3b8" />
    </linearGradient>

    <!-- Tube Gradient -->
    <linearGradient id="tubeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${accentColor}" />
      <stop offset="60%" stop-color="${secondaryColor}" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>

    <!-- Shadow -->
    <filter id="dropShadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.12" />
    </filter>

    <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="15" result="blur" />
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="400" height="300" rx="24" fill="url(#bgGrad)" />

  <!-- Background Decorative Medical Grid/Glow -->
  <circle cx="200" cy="150" r="110" fill="${accentColor}" opacity="0.08" filter="url(#subtleGlow)" />
  <circle cx="360" cy="40" r="70" fill="${secondaryColor}" opacity="0.06" filter="url(#subtleGlow)" />

  <!-- Top Banner / Prescription Badge -->
  <g transform="translate(24, 24)">
    <rect x="0" y="0" width="${rx ? 80 : 125}" height="24" rx="8" fill="${rx ? '#ef4444' : '#059669'}" />
    <text x="${rx ? 40 : 62.5}" y="16" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="10" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">
      ${rx ? '🔴 Rx REQUIRED' : '🟢 100% GENUINE'}
    </text>
  </g>

  <!-- Top Right Pharma Category Badge -->
  <g transform="translate(270, 24)">
    <rect x="0" y="0" width="105" height="24" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
    <text x="52.5" y="16" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="9" fill="${secondaryColor}" text-anchor="middle">
      ${type.split(' ')[0]}
    </text>
  </g>

  <!-- Center 3D Medicine Graphic Representation -->
  ${graphicContent}

  <!-- Bottom Brand Card Stage -->
  <g transform="translate(24, 215)">
    <rect x="0" y="0" width="352" height="62" rx="16" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" filter="url(#dropShadow)" />
    
    <!-- Accent Left Bar -->
    <rect x="0" y="0" width="6" height="62" rx="3" fill="${accentColor}" />

    <!-- Brand Name -->
    <text x="18" y="24" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="15" fill="#0f172a" letter-spacing="-0.3">
      ${name}
    </text>

    <!-- Active Salt Composition -->
    <text x="18" y="40" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="700" font-size="10" fill="${accentColor}">
      🔬 ${salt}
    </text>

    <!-- Manufacturer & Type -->
    <text x="18" y="53" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="600" font-size="8.5" fill="#64748b">
      ${mfg} • ${type}
    </text>

    <!-- Security Hologram Seal Icon -->
    <g transform="translate(305, 12)">
      <circle cx="18" cy="18" r="16" fill="${bgGrad1}" stroke="${accentColor}" stroke-width="1.5" />
      <text x="18" y="23" font-size="16" text-anchor="middle">🛡️</text>
    </g>
  </g>
</svg>
  `.trim();
}

console.log('Generating 40 branded SVGs...');

medicineDesigns.forEach((item) => {
  const svgContent = generateSVG(item);
  const filePath = path.join(outputDir, item.filename);
  fs.writeFileSync(filePath, svgContent, 'utf-8');
});

console.log(`Successfully generated all ${medicineDesigns.length} authentic medicine image assets in ${outputDir}!`);
