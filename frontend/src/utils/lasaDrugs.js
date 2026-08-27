/**
 * Look-Alike, Sound-Alike (LASA) Clinical Safety Database & Tall-Man Lettering Map
 * FDA / ISMP Standardized Healthcare Ergonomics
 */
export const TALL_MAN_MAP = {
  "prednisone": "predniSONE",
  "prednisolone": "prednisoLONE",
  "metformin": "metFORMIN",
  "metronidazole": "metroNIDAZOLE",
  "hydroxyzine": "hydrOXYzine",
  "hydralazine": "hydrALAzine",
  "dopamine": "dopAMINE",
  "dobutamine": "dobUTAMINE",
  "vinblastine": "vinBLAStine",
  "vincristine": "vinCRIStine",
  "amiodarone": "amioDARONE",
  "amitriptyline": "amitrIPTYLine",
  "clomiphene": "clomiPHENE",
  "clomipramine": "clomiPRAMINE",
  "glipizide": "glipiZIDE",
  "glyburide": "glyBURIDE",
  "lamivudine": "lamiVUDine",
  "lamotrigine": "lamoTRIgine",
  "paracetamol": "PARACETAMOL",
  "amoxicillin": "amoxiCILLIN",
  "azithromycin": "azithroMYCIN"
};

/**
 * Returns formatted Tall-Man name if it exists in the LASA list, otherwise original name.
 */
export function getTallManName(name = "") {
  if (!name) return "";
  const lower = name.toLowerCase().trim();
  for (const [key, tallMan] of Object.entries(TALL_MAN_MAP)) {
    if (lower.includes(key)) {
      // Replace matching token with Tall-Man
      const regex = new RegExp(key, "gi");
      return name.replace(regex, tallMan);
    }
  }
  return name;
}

/**
 * Returns dosage form badge configuration (color, label, icon)
 */
export function getDosageBadge(form = "Tablet") {
  const f = (form || "tablet").toLowerCase();
  if (f.includes("tablet") || f.includes("tab") || f.includes("strip")) {
    return { label: "Tablets", bg: "bg-blue-500/10 text-blue-400 border-blue-500/30", icon: "💊" };
  }
  if (f.includes("syrup") || f.includes("suspension") || f.includes("liquid")) {
    return { label: "Syrup / Liquid", bg: "bg-purple-500/10 text-purple-400 border-purple-500/30", icon: "🧪" };
  }
  if (f.includes("injection") || f.includes("inj") || f.includes("vial")) {
    return { label: "Injection", bg: "bg-rose-500/10 text-rose-400 border-rose-500/30", icon: "💉" };
  }
  if (f.includes("inhaler") || f.includes("spray") || f.includes("respicap")) {
    return { label: "Inhaler / Spray", bg: "bg-teal-500/10 text-teal-400 border-teal-500/30", icon: "💨" };
  }
  if (f.includes("cream") || f.includes("gel") || f.includes("ointment")) {
    return { label: "Ointment / Gel", bg: "bg-amber-500/10 text-amber-400 border-amber-500/30", icon: "🧴" };
  }
  if (f.includes("drop")) {
    return { label: "Drops", bg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30", icon: "💧" };
  }
  return { label: form || "Medicine", bg: "bg-slate-700/50 text-slate-300 border-slate-600", icon: "🏷️" };
}

/**
 * Calculate Generic Equivalent Savings percentage
 */
export function calculateGenericSavings(brandedPrice, genericPrice) {
  const b = parseFloat(brandedPrice) || 0;
  const g = parseFloat(genericPrice) || 0;
  if (b <= 0 || g <= 0 || b <= g) return null;
  const savings = b - g;
  const percent = Math.round((savings / b) * 100);
  return { savings: savings.toFixed(2), percent };
}
