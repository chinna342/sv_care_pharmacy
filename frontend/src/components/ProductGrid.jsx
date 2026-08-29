import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";

const INITIAL_COUNT = 15;
const STEP_COUNT = 15;

function ProductGrid({
  products = [],
  cart = [],
  onAddToCart,
  onIncrease,
  onDecrease,
  onOpenDetails,
  selectedCategory,
  onResetFilters,
}) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Reset to initial count whenever the filter/category or list changes
  useEffect(() => {
    setVisibleCount(INITIAL_COUNT);
  }, [selectedCategory, products.length]);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + STEP_COUNT);
      setIsLoadingMore(false);
    }, 180);
  };

  const handleShowAll = () => {
    setVisibleCount(products.length);
  };

  const handleCollapse = () => {
    setVisibleCount(INITIAL_COUNT);
    document.getElementById("medicines")?.scrollIntoView({ behavior: "smooth" });
  };

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;
  const progressPercent =
    products.length > 0
      ? Math.min(100, Math.round((visibleProducts.length / products.length) * 100))
      : 0;

  return (
    <section id="medicines" className="mx-auto max-w-7xl scroll-mt-24 px-3 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-24 md:pb-8">
      {/* Section Header */}
      <div className="mb-6 sm:mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-emerald-600">
              Verified Pharmacy Inventory
            </p>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-800">
              ⚡ Live Stock
            </span>
          </div>

          <h2 className="mt-1 text-2xl sm:text-4xl font-black tracking-tight text-slate-800">
            {selectedCategory === "All" ? "All Medicines & Healthcare" : selectedCategory}
          </h2>

          <p className="mt-1.5 max-w-2xl text-xs sm:text-sm text-slate-500">
            Certified pharmaceuticals, antibiotics, chronic illness therapies, and healthcare essentials.
          </p>
        </div>

        {/* Count & Reset */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {selectedCategory !== "All" && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              Reset to All
            </button>
          )}
          <div className="rounded-xl sm:rounded-2xl border border-emerald-200 bg-emerald-50 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-extrabold text-emerald-800 shadow-xs flex items-center gap-1.5 sm:gap-2">
            <span>💊</span>
            <span>
              Showing {Math.min(visibleProducts.length, products.length)} of {products.length} Medicines
            </span>
          </div>
        </div>
      </div>

      {/* Grid */}
      {products.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-sm">
          <div className="text-4xl sm:text-5xl">🔍</div>
          <h3 className="mt-3 sm:mt-4 text-lg sm:text-xl font-extrabold text-slate-800">No medicines matched your query</h3>
          <p className="mt-2 text-xs text-slate-500 max-w-md mx-auto">
            Try searching for a different generic salt (e.g. Paracetamol, Metformin), health symptom, or reset the filters.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-5 rounded-xl bg-emerald-600 px-5 sm:px-6 py-2.5 sm:py-3 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
          >
            Show All Medicines
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
            {visibleProducts.map((product) => {
              const cartItem = cart.find(
                (item) => item.id === product.id && item.name === product.name
              );
              const cartQuantity = cartItem ? cartItem.quantity : 0;

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  cartQuantity={cartQuantity}
                  onAddToCart={onAddToCart}
                  onIncrease={onIncrease}
                  onDecrease={onDecrease}
                  onOpenDetails={onOpenDetails}
                />
              );
            })}
          </div>

          {/* ============================================================ */}
          {/* LOAD MORE / PAGINATION CONTROLS & PROGRESS */}
          {/* ============================================================ */}
          {products.length > INITIAL_COUNT && (
            <div className="mt-8 mb-2 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 text-center shadow-xs">
              {/* Progress text & Bar */}
              <div className="mx-auto max-w-md space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-600">
                  <span>
                    Showing {visibleProducts.length} of {products.length} medicines
                  </span>
                  <span className="text-emerald-700 font-black">{progressPercent}% Loaded</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {hasMore ? (
                  <>
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-7 py-3.5 text-xs font-black text-white shadow-md shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition disabled:opacity-70 cursor-pointer"
                    >
                      {isLoadingMore ? (
                        <>
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Loading Medicines...</span>
                        </>
                      ) : (
                        <>
                          <span>⚡</span>
                          <span>Load 15 More Medicines</span>
                          <span className="rounded-full bg-emerald-500/40 px-2 py-0.5 text-[10px] font-extrabold">
                            +{Math.min(STEP_COUNT, products.length - visibleCount)}
                          </span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleShowAll}
                      className="rounded-2xl border-2 border-slate-200 bg-slate-50 px-6 py-3.5 text-xs font-black text-slate-700 hover:border-emerald-500 hover:bg-emerald-50/50 hover:text-emerald-800 transition active:scale-95 cursor-pointer"
                    >
                      👁️ View All {products.length} Medicines
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-2.5 text-xs font-bold text-emerald-800">
                      <span>🎉</span>
                      <span>You have viewed all {products.length} medicines in this section.</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCollapse}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                    >
                      Show Top 15 ↑
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default ProductGrid;