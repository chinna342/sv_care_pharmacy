import { categories } from "../data/categories";

function SearchBar({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  rxFilter,
  setRxFilter,
  sortBy,
  setSortBy,
}) {
  const quickSymptoms = [
    { label: "Fever & Pain", term: "Fever", icon: "🌡️" },
    { label: "Headache", term: "Headache", icon: "💆" },
    { label: "Cough & Cold", term: "Cough", icon: "🤧" },
    { label: "Acidity & Gas", term: "Acidity", icon: "🔥" },
    { label: "Allergy", term: "Allergy", icon: "🌿" },
    { label: "Diabetes Care", term: "Diabetes", icon: "🩸" },
    { label: "Blood Pressure", term: "Blood Pressure", icon: "❤️" },
    { label: "Vitamins", term: "Vitamins", icon: "🍊" },
  ];

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    document.getElementById("medicines")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSymptomSelect = (term, isSelected) => {
    if (isSelected) {
      setSearchTerm("");
    } else {
      setSearchTerm(term);
      document.getElementById("medicines")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8 shadow-xs sticky top-0 z-30">
      <div className="mx-auto max-w-7xl space-y-3.5">
        {/* 1. Main Search Row + OTC/Rx Filter + Sorting */}
        <div className="grid gap-2.5 lg:grid-cols-[1fr_auto_auto] items-center">
          {/* Universal Search Input (Zepto Style) */}
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
              🔍
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for medicines, salt compositions, symptoms (e.g. Dolo 650, Paracetamol, Metformin)..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3 pl-12 pr-10 text-xs sm:text-sm text-slate-800 font-semibold shadow-xs outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-300 transition"
              >
                ✕
              </button>
            )}
          </div>

          {/* Rx Filter (OTC vs Rx Required) */}
          <div className="flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setRxFilter("all")}
              className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${
                rxFilter === "all"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Types
            </button>
            <button
              type="button"
              onClick={() => setRxFilter("otc")}
              className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${
                rxFilter === "otc"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🟢 OTC
            </button>
            <button
              type="button"
              onClick={() => setRxFilter("rx")}
              className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${
                rxFilter === "rx"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🔴 Rx Only
            </button>
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-0.5">
            <span className="text-[11px] font-bold text-slate-400 mr-1.5">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent py-2 text-xs font-black text-slate-800 outline-none cursor-pointer"
            >
              <option value="featured">Popular & Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="discount">Highest Discount %</option>
              <option value="rating">Top Rated (4.8+)</option>
            </select>
          </div>
        </div>

        {/* 2. Zepto-Style Clean Horizontal Category Shelf */}
        <div className="border-t border-slate-100 pt-2">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {/* All Category Tab */}
            <button
              type="button"
              onClick={() => handleCategorySelect("All")}
              className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-black transition shrink-0 border ${
                selectedCategory === "All"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs ring-1 ring-emerald-600"
                  : "border-transparent bg-slate-50/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className="text-base">💊</span>
              <span>All Medicines</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                  selectedCategory === "All"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                40+
              </span>
            </button>

            {/* Dynamic Categories */}
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.name)}
                  className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-black transition shrink-0 border ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs ring-1 ring-emerald-600"
                      : "border-transparent bg-slate-50/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span className="whitespace-nowrap">{cat.name}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                      isSelected
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Quick Symptoms Pill Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs no-scrollbar">
          <span className="font-extrabold text-slate-400 text-[10px] uppercase tracking-wider shrink-0 mr-1">
            ⚡ Quick Symptoms:
          </span>
          {quickSymptoms.map((item) => {
            const isSelected = searchTerm.toLowerCase() === item.term.toLowerCase();
            return (
              <button
                key={item.term}
                type="button"
                onClick={() => handleSymptomSelect(item.term, isSelected)}
                className={`whitespace-nowrap flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition shadow-xs shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-emerald-600/20"
                    : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200/80"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default SearchBar;