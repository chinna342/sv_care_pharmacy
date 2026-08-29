import { useState } from "react";
import { categories } from "../data/categories";

function Navbar({
  cartCount = 0,
  ordersCount = 0,
  user = null,
  notifications = [],
  onOpenLogin,
  onLogout,
  onCartClick,
  onOpenOrders,
  onOpenPharmacist,
  onOpenAdmin,
  onOpenDelivery,
  onOpenLiveTracker,
  onMarkAllNotificationsRead,
  searchTerm = "",
  setSearchTerm,
  selectedCategory = "All",
  setSelectedCategory,
  sortBy = "featured",
  setSortBy,
}) {
  const [pincode, setPincode] = useState("500081");
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinStatus, setPinStatus] = useState("⚡ 15-30 Min Flash");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (/^\d{6}$/.test(pinInput)) {
      setPincode(pinInput);
      setPinStatus("⚡ 15-30 Min Flash");
      setIsEditingPin(false);
    } else {
      alert("Please enter a valid 6-digit PIN code.");
    }
  };

  const handleCategoryClick = (categoryName) => {
    if (setSelectedCategory) {
      setSelectedCategory(categoryName);
    }
    document.getElementById("medicines")?.scrollIntoView({ behavior: "smooth" });
  };

  const userRole = (user?.role || "CUSTOMER").toUpperCase();
  const isAdmin = userRole === "ADMIN";
  const isPharmacist = userRole === "PHARMACIST" || isAdmin;
  const isDelivery = userRole === "DELIVERY" || isAdmin;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white shadow-xs backdrop-blur-md">
        {/* 1. Main Navbar Row: Logo + Delivering To + Desktop Search + Profile + Cart */}
        <nav className="border-b border-slate-200">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:px-6 sm:py-2.5 lg:px-8">
            {/* Left: Brand Logo & Pincode */}
            <div className="flex items-center gap-2 sm:gap-5 shrink-0">
              <a href="#" className="flex items-center gap-2 group">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/25 group-hover:scale-105 transition shrink-0">
                  <span className="text-lg sm:text-xl font-black">⚡</span>
                </div>
                <div>
                  <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 block leading-none">
                    SV CARE
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-700 block">
                    Global Pharmacy
                  </span>
                </div>
              </a>

              {/* Delivering in 15-30 Min Pill */}
              <div className="flex items-center gap-1.5 rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/80 px-2 sm:px-3 py-1 text-[11px] sm:text-xs">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase leading-none hidden sm:block">
                    Delivering to
                  </p>
                  {isEditingPin ? (
                    <form onSubmit={handlePinSubmit} className="flex items-center gap-1 mt-0.5">
                      <input
                        type="text"
                        maxLength={6}
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value)}
                        placeholder="PIN code"
                        className="w-14 sm:w-16 rounded border border-slate-300 px-1 py-0.5 text-xs font-mono font-bold"
                        autoFocus
                      />
                      <button type="submit" className="text-[10px] font-bold text-emerald-600">
                        ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingPin(false)}
                        className="text-[10px] text-slate-400"
                      >
                        ✕
                      </button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setPinInput(pincode);
                        setIsEditingPin(true);
                      }}
                      className="font-extrabold text-slate-800 hover:text-emerald-600 flex items-center gap-1 cursor-pointer"
                    >
                      <span className="text-xs">{pincode}</span>
                      <span className="text-[9px] sm:text-[10px] text-emerald-700 font-bold hidden md:inline">({pinStatus})</span>
                      <span className="text-[8px] sm:text-[9px] text-slate-400">✏️</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop Center: Search Bar (Hidden on mobile < md to prevent squishing) */}
            {setSearchTerm && (
              <div className="hidden md:flex flex-1 max-w-xl mx-4">
                <div className="relative w-full">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    🔍
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search 40+ medicines, generic salts, pain relief, diabetes..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-24 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-3 focus:ring-emerald-500/10 transition shadow-inner"
                  />

                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-300 transition cursor-pointer"
                      >
                        ✕
                      </button>
                    )}

                    {setSortBy && (
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-slate-100 rounded-xl px-2 py-1 text-[10px] font-bold text-slate-700 outline-none cursor-pointer border border-slate-200"
                      >
                        <option value="featured">Popular</option>
                        <option value="price-low">Price: Low-High</option>
                        <option value="price-high">Price: High-Low</option>
                        <option value="discount">Top Discount</option>
                        <option value="rating">Top Rated</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Right: User Login/Dropdown + Cart (Always clearly visible and never pushed off) */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* User Login / Profile Button */}
              {!user ? (
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="flex items-center gap-1 sm:gap-1.5 rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-black text-slate-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-800 transition active:scale-95 shadow-xs cursor-pointer"
                >
                  <span className="text-sm">👤</span>
                  <span className="hidden sm:inline">Member</span>
                </button>
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 rounded-xl sm:rounded-2xl border border-emerald-200 bg-emerald-50 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-black text-emerald-800 hover:bg-emerald-100 transition active:scale-95 cursor-pointer"
                  >
                    <span className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[9px] sm:text-[10px]">
                      ✓
                    </span>
                    <span className="max-w-[70px] sm:max-w-none truncate">{user.name.split(" ")[0]}</span>
                    <span className="text-[9px] text-emerald-600">▼</span>
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-3xl border border-slate-200 bg-white p-3.5 shadow-2xl z-50 space-y-2.5 text-xs">
                      <div className="border-b border-slate-100 pb-2">
                        <p className="font-extrabold text-slate-900">{user.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{user.phone}</p>
                        <span className="inline-block mt-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[9px] font-black text-emerald-800">
                          {isAdmin ? "🛡️ Super Admin" : isPharmacist ? "👨‍⚕️ Licensed Pharmacist" : isDelivery ? "🛵 Express Rider" : "🛡️ Verified Patient"}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {/* Customer Orders */}
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            if (onOpenOrders) onOpenOrders();
                          }}
                          className="w-full flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <span>📦</span> My Orders
                          </span>
                          <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] text-white">
                            {ordersCount}
                          </span>
                        </button>

                        {/* Delivery Rider Portal (Only for Delivery or Admin) */}
                        {isDelivery && onOpenDelivery && (
                          <button
                            type="button"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onOpenDelivery();
                            }}
                            className="w-full flex items-center gap-2 rounded-xl bg-teal-50 border border-teal-200 px-3 py-2 text-xs font-black text-teal-900 hover:bg-teal-100 transition cursor-pointer"
                          >
                            <span>🛵</span> Delivery Fleet Portal
                          </button>
                        )}

                        {/* Pharmacist Portal (Only for Pharmacists or Admin) */}
                        {isPharmacist && onOpenPharmacist && (
                          <button
                            type="button"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onOpenPharmacist();
                            }}
                            className="w-full flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-black text-emerald-900 hover:bg-emerald-100 transition cursor-pointer"
                          >
                            <span>👨‍⚕️</span> Pharmacist Station
                          </button>
                        )}

                        {/* Admin Portal (Only for Super Admin) */}
                        {isAdmin && onOpenAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onOpenAdmin();
                            }}
                            className="w-full flex items-center gap-2 rounded-xl bg-indigo-50 border border-indigo-200 px-3 py-2 text-xs font-black text-indigo-900 hover:bg-indigo-100 transition cursor-pointer"
                          >
                            <span>🛡️</span> Store Admin Portal
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onLogout();
                          }}
                          className="w-full rounded-xl bg-red-50 py-2 text-center text-xs font-bold text-red-600 hover:bg-red-100 transition mt-1 cursor-pointer"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Cart Button (Always visible on mobile & desktop) */}
              <button
                type="button"
                onClick={onCartClick}
                className="flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl bg-emerald-600 px-3 sm:px-4 py-1.5 sm:py-2.5 text-xs font-extrabold text-white shadow-md shadow-emerald-600/25 hover:bg-emerald-700 active:scale-95 transition cursor-pointer"
              >
                <span className="text-sm sm:text-base">🛒</span>
                <span className="hidden sm:inline">My Cart</span>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-black text-emerald-700">
                  {cartCount}
                </span>
              </button>
            </div>
          </div>

          {/* 1B. Full-Width Responsive Search Bar for Mobile Phone (< md) */}
          {setSearchTerm && (
            <div className="block md:hidden border-t border-slate-100 bg-slate-50/80 px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    🔍
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search medicines, generic salts, fever..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-8 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 shadow-inner"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {setSortBy && (
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white rounded-xl px-2.5 py-2 text-[11px] font-bold text-slate-700 border border-slate-200 shadow-xs shrink-0 cursor-pointer"
                  >
                    <option value="featured">Popular</option>
                    <option value="price-low">₹ Low</option>
                    <option value="price-high">₹ High</option>
                    <option value="discount">Discount</option>
                    <option value="rating">Top Rated</option>
                  </select>
                )}
              </div>
            </div>
          )}
        </nav>

        {/* 2. Horizontal Category Bar */}
        <div className="border-b border-slate-200 bg-white/95">
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 no-scrollbar scroll-smooth">
              {/* All Medicines Tab */}
              <button
                type="button"
                onClick={() => handleCategoryClick("All")}
                className={`flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-bold transition shrink-0 cursor-pointer ${
                  selectedCategory === "All"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>💊</span>
                <span>All Medicines</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                    selectedCategory === "All" ? "bg-emerald-800 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  40+
                </span>
              </button>

              {/* Individual Categories */}
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryClick(cat.name)}
                    className={`flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-bold transition shrink-0 cursor-pointer ${
                      isSelected
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="whitespace-nowrap">{cat.name}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                        isSelected ? "bg-emerald-800 text-white" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* 3. Android & Mobile Sticky Bottom Navigation Bar (Quick Commerce Style) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 border-t border-slate-200 backdrop-blur-lg shadow-2xl px-2 py-1.5 pb-safe">
        <div className="flex items-center justify-around text-slate-600">
          {/* Home / Store */}
          <button
            type="button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex flex-col items-center gap-0.5 py-1 px-2 text-[10px] font-bold text-emerald-700 active:scale-95 transition"
          >
            <span className="text-lg leading-none">🏠</span>
            <span>Store</span>
          </button>

          {/* Categories */}
          <button
            type="button"
            onClick={() => {
              document.getElementById("medicines")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex flex-col items-center gap-0.5 py-1 px-2 text-[10px] font-bold text-slate-600 hover:text-emerald-700 active:scale-95 transition"
          >
            <span className="text-lg leading-none">💊</span>
            <span>Medicines</span>
          </button>

          {/* Rx Upload */}
          <label className="flex flex-col items-center gap-0.5 py-1 px-2 text-[10px] font-bold text-slate-600 hover:text-emerald-700 active:scale-95 transition cursor-pointer">
            <span className="text-lg leading-none">📤</span>
            <span>Upload Rx</span>
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  alert(`Prescription "${e.target.files[0].name}" received! Our pharmacist is verifying it.`);
                }
              }}
            />
          </label>

          {/* Orders */}
          <button
            type="button"
            onClick={() => {
              if (onOpenOrders) onOpenOrders();
            }}
            className="relative flex flex-col items-center gap-0.5 py-1 px-2 text-[10px] font-bold text-slate-600 hover:text-emerald-700 active:scale-95 transition"
          >
            <span className="text-lg leading-none">📦</span>
            <span>Orders</span>
            {ordersCount > 0 && (
              <span className="absolute top-0 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[9px] font-black text-white">
                {ordersCount}
              </span>
            )}
          </button>

          {/* Cart */}
          <button
            type="button"
            onClick={onCartClick}
            className="relative flex flex-col items-center gap-0.5 py-1 px-2 text-[10px] font-bold text-slate-600 hover:text-emerald-700 active:scale-95 transition"
          >
            <span className="text-lg leading-none">🛒</span>
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="absolute top-0 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[9px] font-black text-white animate-pulse">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>
    </>
  );
}

export default Navbar;