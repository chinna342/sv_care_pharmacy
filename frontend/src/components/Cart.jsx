import { useState } from "react";

function Cart({
  cart,
  user,
  onIncrease,
  onDecrease,
  onRemove,
  onClose,
  onCheckout,
  onClearCart,
  onOpenLogin,
}) {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [autoRefill, setAutoRefill] = useState(false);

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const hasRxItem = cart.some((item) => item.prescriptionRequired);

  // Free delivery threshold is ₹500
  const freeShippingThreshold = 500;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  // Calculate discounts
  let discountAmount = 0;
  if (appliedCoupon === "SVCARE20") {
    discountAmount = Math.round(subtotal * 0.2); // 20% off
  } else if (appliedCoupon === "FIRSTMED") {
    discountAmount = Math.min(subtotal, 100); // ₹100 off
  }

  // Auto-refill extra 10% off
  const autoRefillDiscount = autoRefill ? Math.round(subtotal * 0.1) : 0;
  const totalDiscounts = discountAmount + autoRefillDiscount;

  let deliveryFee = subtotal >= freeShippingThreshold ? 0 : 40;
  if (appliedCoupon === "EXPRESSFREE") {
    deliveryFee = 0;
  }

  const finalTotal = Math.max(0, subtotal - totalDiscounts + deliveryFee);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError("");
    const code = couponCode.trim().toUpperCase();

    if (code === "SVCARE20") {
      setAppliedCoupon("SVCARE20");
      setCouponCode("");
    } else if (code === "FIRSTMED") {
      setAppliedCoupon("FIRSTMED");
      setCouponCode("");
    } else if (code === "EXPRESSFREE") {
      setAppliedCoupon("EXPRESSFREE");
      setCouponCode("");
    } else {
      setCouponError("Invalid coupon. Try 'SVCARE20', 'FIRSTMED', or 'EXPRESSFREE'.");
    }
  };

  const handleProceedClick = () => {
    if (!user) {
      if (onOpenLogin) {
        onOpenLogin();
      }
      return;
    }

    onCheckout({
      subtotal,
      discountAmount: totalDiscounts,
      deliveryFee,
      total: finalTotal,
      appliedCoupon,
      autoRefill,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Zepto-Style Compact Cart Drawer */}
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-slate-100 shadow-2xl">
        {/* 1. Header (< Cart) */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-bold transition"
              aria-label="Back"
            >
              ←
            </button>
            <h2 className="text-base font-black text-slate-900">Cart</h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-800">
              {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}
            </span>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={onClearCart}
                className="text-[11px] font-bold text-slate-400 hover:text-red-600 transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Free Shipping Progress Indicator */}
        {cart.length > 0 && (
          <div className="bg-emerald-50 border-b border-emerald-100 px-5 py-2.5 text-xs">
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900">
              <span>
                {amountNeededForFreeShipping === 0 ? (
                  <span className="text-emerald-700 font-black">🎉 FREE Cold-Chain Delivery Unlocked!</span>
                ) : (
                  <span>Add ₹{amountNeededForFreeShipping} more for FREE Delivery</span>
                )}
              </span>
              <span className="text-emerald-700 font-extrabold">₹500 Goal</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-emerald-200">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Rx Requirement Notice */}
        {hasRxItem && (
          <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 flex items-center gap-2 text-[11px] text-amber-900">
            <span>⚠️</span>
            <span>Rx medicines in cart: Pharmacist will verify prescription upon dispatch.</span>
          </div>
        )}

        {/* Main Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {cart.length === 0 ? (
            /* Empty State */
            <div className="flex h-full flex-col items-center justify-center text-center p-6 bg-white rounded-3xl border border-slate-200 shadow-sm my-auto">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-4xl shadow-sm">
                🛒
              </div>
              <h3 className="mt-4 text-base font-black text-slate-800">Your Cart is Empty</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-xs">
                Explore our catalog of certified medicines, antibiotics, and healthcare essentials.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-5 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-black text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
              >
                Browse Medicines →
              </button>
            </div>
          ) : (
            <>
              {/* 2. Coupons & Offers Box (Zepto Style) */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <span>🎟️</span> Coupons & Offers
                  </span>
                  {appliedCoupon && (
                    <button
                      type="button"
                      onClick={() => setAppliedCoupon(null)}
                      className="text-[11px] font-bold text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {!user ? (
                  /* Login to View Coupons (Zepto Pattern) */
                  <div
                    onClick={onOpenLogin}
                    className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-3 cursor-pointer hover:bg-emerald-50/60 hover:border-emerald-200 transition"
                  >
                    <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700">
                      <span>🔒</span>
                      <span>Login to view coupons & unlock offers</span>
                    </div>
                    <span className="text-xs font-black text-emerald-700">Login →</span>
                  </div>
                ) : appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs font-bold text-emerald-800">
                    <span>✓ '{appliedCoupon}' applied (-₹{discountAmount})</span>
                    <span className="text-[10px] font-black uppercase text-emerald-700">Applied</span>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter SVCARE20 / FIRSTMED"
                      className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold uppercase text-slate-800 outline-none focus:border-emerald-600 focus:bg-white"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-black text-white hover:bg-emerald-800 shadow-sm"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[10px] text-red-500 font-bold">{couponError}</p>}
              </div>

              {/* 3. Delivering in minutes Header Card (Zepto Style) */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-sm font-bold">
                      ⚡
                    </span>
                    <div>
                      <p className="text-xs font-black text-slate-800">Delivering in 15-30 mins</p>
                      <p className="text-[10px] text-slate-400">
                        {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"} • Cold-Chain Box
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Flash Hub Active
                  </span>
                </div>

                {/* 4. Compact Item List */}
                <div className="divide-y divide-slate-100 pt-1">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-3 gap-3">
                      {/* Left: Thumbnail & Details */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-50 to-teal-50 text-2xl border border-slate-100">
                          💊
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-slate-800 truncate">{item.name}</h4>
                          <p className="text-[10px] text-slate-400">
                            {item.form || "Tablet"} • {item.category || "General"}
                          </p>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-xs font-black text-slate-900">₹{item.price}</span>
                            {item.mrp && (
                              <span className="text-[10px] text-slate-400 line-through">₹{item.mrp}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Zepto-Style Compact Stepper */}
                      <div className="flex items-center rounded-xl border border-emerald-600 bg-white shadow-xs overflow-hidden shrink-0">
                        <button
                          type="button"
                          onClick={() => onDecrease(item.id)}
                          className="flex h-7 w-7 items-center justify-center bg-emerald-50 text-emerald-800 font-black hover:bg-emerald-100 active:scale-90 transition text-xs"
                          title="Decrease"
                        >
                          −
                        </button>
                        <span className="w-7 text-center font-black text-emerald-900 text-xs">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onIncrease(item.id)}
                          className="flex h-7 w-7 items-center justify-center bg-emerald-600 text-white font-black hover:bg-emerald-700 active:scale-90 transition text-xs"
                          title="Increase"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Forgot something link */}
                <div className="border-t border-slate-100 pt-3 text-center">
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                  >
                    Forgot something? <span className="font-black">+ Add More Items</span>
                  </button>
                </div>
              </div>

              {/* 5. Auto-Refill Subscription Option */}
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-emerald-200 bg-white p-3.5 text-xs shadow-sm">
                <input
                  type="checkbox"
                  checked={autoRefill}
                  onChange={(e) => setAutoRefill(e.target.checked)}
                  className="h-4 w-4 rounded accent-emerald-600"
                />
                <div className="flex-1">
                  <span className="font-black text-emerald-950">
                    🔄 Auto-Refill Monthly (Save Extra 10%)
                  </span>
                  <p className="text-[10px] text-slate-500">
                    Hassle-free automated monthly delivery for chronic medicines.
                  </p>
                </div>
              </label>

              {/* 6. Bill Summary Card (Zepto Style) */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2.5">
                <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <span>📄</span> Bill Summary
                </h3>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Item Total</span>
                    <span className="font-bold text-slate-800">₹{subtotal}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Coupon Discount</span>
                      <span>- ₹{discountAmount}</span>
                    </div>
                  )}

                  {autoRefillDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Auto-Refill 10% Discount</span>
                      <span>- ₹{autoRefillDiscount}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Delivery Fee (Cold-Chain)</span>
                    <span className={`font-bold ${deliveryFee === 0 ? "text-emerald-700" : "text-slate-800"}`}>
                      {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-2 flex justify-between items-baseline font-black">
                    <span className="text-slate-900">Grand Total</span>
                    <span className="text-lg text-emerald-700">₹{finalTotal}</span>
                  </div>
                </div>

                {!user && (
                  <p className="text-[10px] text-slate-400 bg-slate-50 p-2 rounded-xl text-center">
                    Log in to see your exact total. Delivery address will be confirmed upon login.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* 7. Bottom Sticky CTA Button */}
        {cart.length > 0 && (
          <div className="border-t border-slate-200 bg-white p-4 shadow-lg">
            {!user ? (
              /* If unauthenticated -> Prominent Login to Proceed button (Zepto Style) */
              <button
                type="button"
                onClick={handleProceedClick}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 py-3.5 text-xs font-black text-white shadow-xl shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-800 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <span>👤</span>
                <span>Login to Proceed</span>
              </button>
            ) : (
              /* If authenticated -> Proceed to Checkout button */
              <button
                type="button"
                onClick={handleProceedClick}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 py-3.5 text-xs font-black text-white shadow-xl shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-800 transition active:scale-95 flex items-center justify-between px-5"
              >
                <div className="text-left">
                  <p className="text-[10px] text-emerald-100 uppercase font-bold">Total Payable</p>
                  <p className="text-base font-black">₹{finalTotal}</p>
                </div>
                <span className="flex items-center gap-1 font-black text-xs">
                  Proceed to Checkout →
                </span>
              </button>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}

export default Cart;