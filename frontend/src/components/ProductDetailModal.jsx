import { useState } from "react";

function ProductDetailModal({ product, onClose, onAddToCart }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedVariant, setSelectedVariant] = useState("brand"); // 'brand' or 'generic'
  const [quantity, setQuantity] = useState(1);
  const [showAddedAlert, setShowAddedAlert] = useState(false);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const generic = product.genericSubstitute;

  const currentPrice = selectedVariant === "generic" && generic ? generic.price : product.price;
  const currentName = selectedVariant === "generic" && generic ? generic.name : product.name;

  const handleAdd = () => {
    const itemToAdd = {
      ...product,
      name: currentName,
      price: currentPrice,
      isGeneric: selectedVariant === "generic",
    };
    onAddToCart(itemToAdd, quantity);
    setShowAddedAlert(true);
    setTimeout(() => setShowAddedAlert(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/90 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              {product.category}
            </span>
            {product.prescriptionRequired ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-300">
                🔴 Rx Required
              </span>
            ) : (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                🟢 OTC Approved
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-slate-700 transition hover:bg-slate-300 text-lg font-bold"
            aria-label="Close details"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Info */}
          <div className="grid gap-6 md:grid-cols-[220px_1fr]">
            {/* Image / Icon container */}
            <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 border border-emerald-100 text-center">
              <div className="flex h-44 w-44 items-center justify-center overflow-hidden rounded-2xl bg-white p-3 shadow-md border border-slate-100">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain rounded-xl"
                  />
                ) : (
                  <span className="text-6xl">💊</span>
                )}
              </div>
              <p className="mt-3 text-xs font-bold text-emerald-800">{product.form || "Tablet"}</p>
              <p className="text-[11px] text-slate-500">{product.packSize || "Standard Packaging"}</p>
            </div>

            {/* Title & Pricing */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {product.manufacturer || "SV Care Certified Lab"}
              </p>
              <h2 className="text-2xl font-extrabold text-slate-800 mt-0.5">
                {product.name}
              </h2>
              {product.genericName && (
                <p className="mt-1 text-xs font-semibold text-emerald-700">
                  🔬 Active Salt: <span className="text-slate-700">{product.genericName}</span>
                </p>
              )}

              {/* Rating & Reviews */}
              <div className="mt-3 flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 rounded-lg bg-amber-500 px-2 py-0.5 font-bold text-white">
                  ★ {product.rating || 4.8}
                </span>
                <span className="text-slate-500">({product.reviewsCount || 1200} verified patients)</span>
                <span className="text-emerald-600 font-semibold">• 100% Genuine Certified</span>
              </div>

              {/* Price & Savings */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-black text-emerald-700">₹{currentPrice}</span>
                {product.mrp && (
                  <>
                    <span className="text-base text-slate-400 line-through">₹{product.mrp}</span>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800">
                      {product.discountPercent || 20}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <p className="mt-1.5 text-xs text-slate-500">
                {isOutOfStock ? (
                  <span className="font-bold text-red-600">🔴 Out of Stock</span>
                ) : (
                  <span className="font-medium text-emerald-700">
                    🟢 In Stock ({product.stock} units available for 15-30 min delivery)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* ========================================================= */}
          {/* GENERIC ALTERNATIVE / COST SAVINGS COMPARATOR BOX */}
          {/* ========================================================= */}
          {generic && (
            <div className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    💡 Smart Health Savings
                  </span>
                  <h3 className="mt-1 text-sm font-bold text-slate-800">
                    Save Money with Generic Equivalent
                  </h3>
                </div>
                <span className="rounded-xl bg-emerald-700 px-3 py-1 text-xs font-black text-white shadow-sm">
                  {generic.savings}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {/* Branded Option */}
                <button
                  type="button"
                  onClick={() => setSelectedVariant("brand")}
                  className={`rounded-2xl border p-3.5 text-left transition ${
                    selectedVariant === "brand"
                      ? "border-emerald-600 bg-white ring-2 ring-emerald-500 shadow-sm"
                      : "border-slate-200 bg-white/70 opacity-70"
                  }`}
                >
                  <p className="text-xs font-bold text-slate-500 uppercase">Original Brand</p>
                  <p className="font-extrabold text-slate-800 text-sm mt-0.5">{product.name}</p>
                  <p className="text-base font-black text-slate-800 mt-1">₹{product.price}</p>
                </button>

                {/* Generic Option */}
                <button
                  type="button"
                  onClick={() => setSelectedVariant("generic")}
                  className={`rounded-2xl border p-3.5 text-left transition ${
                    selectedVariant === "generic"
                      ? "border-emerald-600 bg-white ring-2 ring-emerald-500 shadow-sm"
                      : "border-slate-200 bg-white/70 opacity-70"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-emerald-700 uppercase">SV Certified Generic</p>
                    <span className="text-[10px] font-bold text-emerald-700">Identical Bio-Salt</span>
                  </div>
                  <p className="font-extrabold text-slate-800 text-sm mt-0.5">{generic.name}</p>
                  <p className="text-base font-black text-emerald-700 mt-1">₹{generic.price}</p>
                </button>
              </div>
            </div>
          )}

          {/* Navigation Tabs for Clinical Info */}
          <div>
            <div className="flex border-b border-slate-200 text-xs font-bold gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`pb-3 px-3 transition border-b-2 ${
                  activeTab === "overview"
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Therapeutic Uses & Benefits
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("dosage")}
                className={`pb-3 px-3 transition border-b-2 ${
                  activeTab === "dosage"
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Dosage & Directions
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("safety")}
                className={`pb-3 px-3 transition border-b-2 ${
                  activeTab === "safety"
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Safety Advice & Precautions
              </button>
            </div>

            {/* Tab Contents */}
            <div className="pt-4 text-xs leading-relaxed text-slate-600">
              {activeTab === "overview" && (
                <div className="space-y-3">
                  <p>{product.description}</p>
                  {product.uses && (
                    <div>
                      <p className="font-bold text-slate-800 mb-1.5">Primary Clinical Indications:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {product.uses.map((use, idx) => (
                          <li key={idx}>{use}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {product.sideEffects && (
                    <div className="mt-3 rounded-xl bg-slate-50 p-3">
                      <p className="font-bold text-slate-700">Possible Side Effects (Rare):</p>
                      <p className="text-slate-500 mt-1">{product.sideEffects.join(", ")}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "dosage" && (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                    <p className="font-bold text-emerald-900">Recommended Administration:</p>
                    <p className="mt-1 text-slate-700">{product.dosage || "Take as directed by your physician or pharmacist."}</p>
                  </div>
                  <p className="text-slate-500">
                    Always swallow tablets with plenty of water. Do not crush or chew sustained release formulations unless prescribed.
                  </p>
                </div>
              )}

              {activeTab === "safety" && product.safetyAdvice && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 p-3 bg-white">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span>🤰</span> Pregnancy & Lactation
                    </p>
                    <p className="mt-1 text-slate-600">{product.safetyAdvice.pregnancy}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3 bg-white">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span>🍷</span> Alcohol Interaction
                    </p>
                    <p className="mt-1 text-slate-600">{product.safetyAdvice.alcohol}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3 bg-white">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span>🚗</span> Driving & Machinery
                    </p>
                    <p className="mt-1 text-slate-600">{product.safetyAdvice.driving}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3 bg-white">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span>🫘</span> Kidney & Liver Precaution
                    </p>
                    <p className="mt-1 text-slate-600">{product.safetyAdvice.kidney}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="border-t border-slate-100 bg-slate-50/90 p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Quantity Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600">Quantity:</span>
            <div className="flex items-center rounded-xl border border-slate-300 bg-white p-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
              >
                −
              </button>
              <span className="w-8 text-center text-xs font-extrabold text-slate-800">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700"
              >
                +
              </button>
            </div>
          </div>

          {/* Add Button */}
          <div className="flex w-full sm:w-auto gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none rounded-full border border-slate-300 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-100 transition active:scale-95"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={isOutOfStock}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-full px-8 py-3 text-xs font-extrabold text-slate-950 shadow-md border transition active:scale-95 ${
                isOutOfStock
                  ? "bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed"
                  : "bg-[#FFD814] hover:bg-[#F7CA00] border-[#FCD200] hover:border-[#F2C200] hover:shadow-lg shadow-amber-400/20"
              }`}
            >
              <span className="text-sm">🛒</span>
              <span>
                Add {quantity > 1 ? `${quantity} Items` : "to cart"} • ₹{currentPrice * quantity}
              </span>
            </button>
          </div>
        </div>

        {/* Added Alert */}
        {showAddedAlert && (
          <div className="absolute inset-x-0 bottom-6 mx-auto w-fit rounded-full bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white shadow-2xl animate-bounce flex items-center gap-2">
            <span>✓</span> {currentName} added to cart!
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetailModal;
