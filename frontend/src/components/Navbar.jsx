import { useState } from "react";
import { categories } from "../data/categories";

function Navbar({
  cartCount = 0,
  ordersCount = 0,
  user = null,
  onOpenLogin,
  onLogout,
  onCartClick,
  onOpenOrders,
  onOpenAdmin,
  onOpenLiveTracker,
  activeOrder = null,
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

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs backdrop-blur-md">
      {/* 1. Main Navbar Row: Logo + Delivering To + Search Bar + Profile + Cart */}
      <nav className="border-b border-slate-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-4 shrink-0">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-xl text-white shadow-md shadow-emerald-600/30 group-hover:scale-105 transition">
                💊
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-800 flex items-center gap-1">
                  SV <span className="text-emerald-600">Care</span>
                </h1>
                <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-emerald-700">
                  Global Pharmacy #1
                </p>
              </div>
            </a>

            {/* Delivering To Location Selector */}
            <div className="hidden lg:flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-3 py-1.5 text-xs">
              <span className="text-base">📍</span>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">Delivering to</p>
                <button
                  type="button"
                  onClick={() => setIsEditingPin(true)}
                  className="font-extrabold text-slate-800 hover:text-emerald-700 flex items-center gap-1 leading-tight"
                >
                  <span>{pincode}</span>
                  <span className="text-[10px] text-emerald-600 underline font-semibold">Change</span>
                </button>
              </div>
              <span className="ml-1 rounded-full bg-emerald-200/70 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
                {pinStatus}
              </span>
            </div>
          </div>

          {/* Center: Search Bar directly after Delivering To (Zepto Style) */}
          {setSearchTerm && (
            <div className="flex-1 max-w-2xl mx-1 sm:mx-3">
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-slate-400">
                  🔍
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for medicines, salt compositions, health needs (e.g. Dolo 650, Paracetamol, Metformin)..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/90 py-2.5 pl-10 pr-24 text-xs font-semibold text-slate-800 shadow-xs outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-300 transition"
                    >
                      ✕
                    </button>
                  )}

                  {/* Compact Sort Selector */}
                  {setSortBy && (
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="hidden sm:block bg-slate-100 rounded-xl px-2 py-1 text-[10px] font-bold text-slate-700 outline-none cursor-pointer border border-slate-200"
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

          {/* Right: Login & Cart Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* User Login / Profile Button */}
            {!user ? (
              <button
                type="button"
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-black text-slate-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-800 transition active:scale-95 shadow-xs"
              >
                <span className="text-sm">👤</span>
                <span className="hidden sm:inline">Login</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-black text-emerald-800 hover:bg-emerald-100 transition active:scale-95"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px]">
                    ✓
                  </span>
                  <span>{user.name.split(" ")[0]}</span>
                  <span className="text-[10px] text-emerald-600">▼</span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl z-50 space-y-2 text-xs">
                    <div className="border-b border-slate-100 pb-2">
                      <p className="font-extrabold text-slate-800">{user.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{user.phone}</p>
                      <span className="inline-block mt-1 rounded bg-emerald-100 px-2 py-0.5 text-[9px] font-black text-emerald-800">
                        🛡️ Verified Patient
                      </span>
                    </div>

                    <div className="space-y-1 text-slate-600 text-[11px]">
                      <p className="font-bold text-slate-400 text-[10px] uppercase">Default Address</p>
                      <p className="line-clamp-2 text-slate-700">
                        {user.house}, {user.area}, {user.city} - {user.pincode}
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-2 space-y-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          if (onOpenOrders) onOpenOrders();
                        }}
                        className="w-full flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
                      >
                        <span className="flex items-center gap-2">
                          <span>📦</span> My Orders
                        </span>
                        <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] text-white">
                          {ordersCount}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          if (onOpenAdmin) onOpenAdmin();
                        }}
                        className="w-full flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                      >
                        <span>👨‍⚕️</span> Pharmacist Admin
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full rounded-xl bg-red-50 py-2 text-center text-xs font-bold text-red-600 hover:bg-red-100 transition mt-1"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Orders Button if orders exist */}
            {ordersCount > 0 && onOpenOrders && (
              <button
                type="button"
                onClick={onOpenOrders}
                className="hidden md:flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
              >
                <span>📦</span>
                <span>Orders</span>
                <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-black text-emerald-800">
                  {ordersCount}
                </span>
              </button>
            )}

            {/* Pharmacist Admin Quick Access */}
            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="hidden xl:flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 transition"
                title="Pharmacist & Store Admin Command Center"
              >
                <span>👨‍⚕️</span>
                <span>Admin</span>
              </button>
            )}

            {/* Cart Button (Zepto Style) */}
            <button
              type="button"
              onClick={onCartClick}
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md shadow-emerald-600/25 hover:bg-emerald-700 active:scale-95 transition"
            >
              <span className="text-sm sm:text-base">🛒</span>
              <span className="hidden sm:inline">My Cart</span>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-black text-emerald-700">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Zepto-Style Clean Horizontal Category Bar (No quick symptoms, sleek tabs) */}
      <div className="border-b border-slate-200 bg-white/95">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 no-scrollbar">
            {/* All Medicines Tab */}
            <button
              type="button"
              onClick={() => handleCategoryClick("All")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition shrink-0 cursor-pointer ${
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
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition shrink-0 cursor-pointer ${
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

      {/* Pincode Change Modal */}
      {isEditingPin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-base font-extrabold text-slate-800">Check Delivery Serviceability</h3>
            <p className="mt-1 text-xs text-slate-500">
              Enter your 6-digit delivery PIN code to confirm 15-30 minute flash dispatch.
            </p>
            <form onSubmit={handlePinSubmit} className="mt-4 space-y-3">
              <input
                type="text"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="e.g. 500081, 110001, 560001"
                className="w-full rounded-xl border border-slate-300 p-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-600"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingPin(false)}
                  className="flex-1 rounded-xl border border-slate-300 py-2.5 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-extrabold text-white hover:bg-emerald-700"
                >
                  Verify PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;