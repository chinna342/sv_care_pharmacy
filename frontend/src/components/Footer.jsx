function Footer({
  onOpenLiveTracker,
  onOpenAdmin,
  onSelectCategory,
}) {
  const handleCategoryClick = (catName) => {
    if (onSelectCategory) {
      onSelectCategory(catName);
    }
    document.getElementById("medicines")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-[#0b1329] border-t border-slate-800 text-white mt-8">
      {/* Full-width container with centered inner content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* TOP ROW: 5 BALANCED COLUMNS */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Column 1: Logo & Subtitle */}
          <div className="col-span-2 md:col-span-3 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-lg shadow-sm shadow-emerald-500/20">
                💊
              </div>
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                SV <span className="text-emerald-400">Care</span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Your trusted digital pharmacy
            </p>
          </div>

          {/* Column 2: All Medicines */}
          <div className="col-span-1 md:col-span-2 space-y-2.5">
            <h3 className="text-xs font-black text-emerald-400">All Medicines</h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryClick("All")}
                  className="hover:text-white transition cursor-pointer"
                >
                  All Medicines
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryClick("Pain Relief & Fever")}
                  className="hover:text-white transition cursor-pointer"
                >
                  Pain Relief & Fever
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryClick("Antibiotics & Anti-Infectives")}
                  className="hover:text-white transition cursor-pointer"
                >
                  Antibiotics
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryClick("Heart & Blood Pressure")}
                  className="hover:text-white transition cursor-pointer"
                >
                  Heart & Blood
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Health & Wellness (In-between column) */}
          <div className="col-span-1 md:col-span-2 space-y-2.5">
            <h3 className="text-xs font-black text-emerald-400">Health & Care</h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryClick("Diabetes Care")}
                  className="hover:text-white transition cursor-pointer"
                >
                  Diabetes Care
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryClick("Allergy & Respiratory")}
                  className="hover:text-white transition cursor-pointer"
                >
                  Allergy & Respiratory
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryClick("Gastro & Acidity")}
                  className="hover:text-white transition cursor-pointer"
                >
                  Gastro & Acidity
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryClick("Vitamins & Immunity")}
                  className="hover:text-white transition cursor-pointer"
                >
                  Vitamins & Immunity
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryClick("Skincare & Derma")}
                  className="hover:text-white transition cursor-pointer"
                >
                  Skincare & Derma
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Services */}
          <div className="col-span-1 md:col-span-2 space-y-2.5">
            <h3 className="text-xs font-black text-emerald-400">Services</h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryClick("All")}
                  className="hover:text-white transition cursor-pointer"
                >
                  Medicine Info
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="hover:text-white transition cursor-pointer"
                >
                  Pharmacist Support
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenLiveTracker}
                  className="hover:text-white transition cursor-pointer"
                >
                  Delivery Tracking
                </button>
              </li>
              <li className="hover:text-white transition cursor-pointer">
                Health Articles
              </li>
              <li className="hover:text-white transition cursor-pointer">
                Wellness Tips
              </li>
            </ul>
          </div>

          {/* Column 5: Connect */}
          <div className="col-span-2 md:col-span-3 space-y-2.5">
            <h3 className="text-xs font-black text-emerald-400">Connect</h3>
            <div className="space-y-1 text-xs text-slate-300">
              <p className="flex items-center gap-1.5 text-[11px]">
                <span className="text-red-400">📍</span> Hyderabad, India
              </p>
              <p className="flex items-center gap-1.5 text-[11px] truncate">
                <span className="text-slate-400">✉</span> support@svcarepharmacy.com
              </p>
            </div>
            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href="#facebook"
                aria-label="Facebook"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-300 hover:bg-emerald-600 hover:text-white transition"
              >
                f
              </a>
              <a
                href="#instagram"
                aria-label="Instagram"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs text-slate-300 hover:bg-emerald-600 hover:text-white transition"
              >
                📷
              </a>
              <a
                href="#whatsapp"
                aria-label="WhatsApp"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs text-slate-300 hover:bg-emerald-600 hover:text-white transition"
              >
                💬
              </a>
            </div>
          </div>

        </div>

        {/* BOTTOM STRIP (Single Line Trusted Care + Copyright) */}
        <div className="border-t border-slate-800/80 pt-4 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-slate-300">
              <span className="text-emerald-400">🛡️</span> Trusted Care
            </span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="flex items-center gap-1">
              <span className="text-emerald-400 font-bold">✓</span> Genuine Medicines
            </span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="flex items-center gap-1">
              <span className="text-emerald-400">🔒</span> Secure Payments
            </span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="flex items-center gap-1">
              <span className="text-emerald-400">⚡</span> Fast Delivery
            </span>
          </div>

          <p className="text-slate-400 text-[11px]">
            © 2026 SV Care. All rights reserved
          </p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;