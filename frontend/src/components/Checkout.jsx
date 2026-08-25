import { useState } from "react";

function Checkout({
  cart = [],
  checkoutMeta = {},
  user = null,
  onBack,
  onPlaceOrder,
}) {
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone ? user.phone.replace(/[^\d]/g, "").slice(-10) : "",
    house: user?.house || "",
    area: user?.area || "",
    city: user?.city || "Hyderabad",
    pincode: user?.pincode || "500081",
    deliverySlot: "express", // 'express' | 'sameday' | 'scheduled'
    paymentMethod: "cod", // 'cod' | 'upi'
  });

  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [prescriptionUploaded, setPrescriptionUploaded] = useState(false);
  const [errors, setErrors] = useState({});

  const subtotal = checkoutMeta.subtotal || cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = checkoutMeta.discountAmount || 0;
  const deliveryFee = checkoutMeta.deliveryFee !== undefined ? checkoutMeta.deliveryFee : subtotal >= 500 ? 0 : 40;
  const total = Math.max(0, subtotal - discountAmount + deliveryFee);
  const hasRxItem = cart.some((item) => item.prescriptionRequired || item.prescription_required);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePrescriptionSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPrescriptionFile(file);
      setPrescriptionUploaded(true);
    }
  };

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = "Full name is required.";
    if (!/^[6-9]\d{9}$/.test(form.phone)) err.phone = "Enter a valid 10-digit mobile number.";
    if (!form.house.trim()) err.house = "House/Flat number is required.";
    if (!form.area.trim()) err.area = "Area or street is required.";
    if (!form.city.trim()) err.city = "City is required.";
    if (!/^\d{6}$/.test(form.pincode)) err.pincode = "Enter a valid 6-digit PIN code.";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const isCod = form.paymentMethod === "cod";
    const paymentId = isCod
      ? "COD_" + Math.random().toString(36).substring(2, 10).toUpperCase()
      : "PAY_UPI_" + Math.random().toString(36).substring(2, 10).toUpperCase();

    onPlaceOrder({
      customer: form,
      subtotal,
      discountAmount,
      deliveryFee,
      total,
      items: cart,
      autoRefill: checkoutMeta.autoRefill || false,
      deliverySlot: form.deliverySlot,
      paymentMethod: form.paymentMethod,
      paymentId,
      transactionRef: "TXN_" + Date.now(),
      gatewayName: isCod ? "Cash on Delivery" : "SV Care Instant UPI Gateway",
      paidAt: isCod ? null : new Date().toISOString(),
      paymentStatus: isCod ? "pending" : "paid",
      prescriptionUploaded,
      prescriptionFileName: prescriptionFile?.name || (hasRxItem ? "Prescription_Attached.pdf" : null),
    });
  };

  const inputClass = (field) =>
    `w-full rounded-2xl border px-4 py-3.5 text-xs font-semibold outline-none transition ${
      errors[field]
        ? "border-red-400 bg-red-50/50 focus:ring-2 focus:ring-red-100"
        : "border-slate-300 bg-slate-50 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
    }`;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-100 shadow-sm transition"
        >
          ← Back to Healthcare Cart
        </button>

        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* LEFT COLUMN: Customer, Slot, Prescription, Payment */}
          <div className="space-y-6">
            {/* Header Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 uppercase tracking-wider">
                ⚡ Express Cold-Chain Delivery
              </span>
              <h1 className="mt-3 text-2xl md:text-3xl font-black text-slate-900">
                Delivery & Order Details
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Your order is fulfilled under temperature-controlled cold-chain standards.
              </p>

              {/* 1. Customer & Delivery Address */}
              <div className="mt-8 space-y-4">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs">
                    1
                  </span>
                  Delivery Address & Patient Info
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-700 block mb-1">
                      Patient / Recipient Name
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Rahul Verma"
                      className={inputClass("name")}
                    />
                    {errors.name && <p className="mt-1 text-[11px] text-red-500 font-bold">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-700 block mb-1">
                      Mobile Number (For Delivery OTP)
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      maxLength={10}
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile"
                      className={inputClass("phone")}
                    />
                    {errors.phone && <p className="mt-1 text-[11px] text-red-500 font-bold">{errors.phone}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-extrabold text-slate-700 block mb-1">
                      House / Flat / Building / Street
                    </label>
                    <input
                      name="house"
                      value={form.house}
                      onChange={handleChange}
                      placeholder="Flat 402, Green Meadows Residency"
                      className={inputClass("house")}
                    />
                    {errors.house && <p className="mt-1 text-[11px] text-red-500 font-bold">{errors.house}</p>}
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-700 block mb-1">
                      Area / Landmark
                    </label>
                    <input
                      name="area"
                      value={form.area}
                      onChange={handleChange}
                      placeholder="Madhapur, Hitech City"
                      className={inputClass("area")}
                    />
                    {errors.area && <p className="mt-1 text-[11px] text-red-500 font-bold">{errors.area}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-extrabold text-slate-700 block mb-1">City</label>
                      <input
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="Hyderabad"
                        className={inputClass("city")}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-extrabold text-slate-700 block mb-1">PIN Code</label>
                      <input
                        name="pincode"
                        maxLength={6}
                        value={form.pincode}
                        onChange={handleChange}
                        placeholder="500081"
                        className={inputClass("pincode")}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Prescription Upload Section (if prescription required items in cart) */}
              {hasRxItem && (
                <div className="mt-8 space-y-4 pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-black uppercase tracking-wider text-amber-900 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold">
                        📄
                      </span>
                      Doctor's Prescription (Schedule H Item)
                    </h2>
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-black text-amber-800 border border-amber-300">
                      Rx Required
                    </span>
                  </div>

                  <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-5 text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 text-amber-800 font-bold text-xs">
                      <span>📸</span>
                      <span>Upload Prescription Photo / PDF</span>
                    </div>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Please attach your valid doctor prescription for dosage verification by our licensed pharmacist.
                    </p>

                    <input
                      type="file"
                      id="rxUpload"
                      accept="image/*,.pdf"
                      onChange={handlePrescriptionSelect}
                      className="hidden"
                    />

                    <label
                      htmlFor="rxUpload"
                      className="inline-block rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 text-xs font-bold cursor-pointer transition shadow-xs"
                    >
                      {prescriptionFile ? `✓ ${prescriptionFile.name}` : "📁 Select Prescription File"}
                    </label>

                    {prescriptionUploaded && (
                      <p className="text-[10px] text-emerald-700 font-bold">
                        ✓ Prescription document attached securely
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 3. Delivery Speed & Slot Selector */}
              <div className="mt-8 space-y-4 pt-6 border-t border-slate-100">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs">
                    2
                  </span>
                  Select Delivery Speed Slot
                </h2>

                <div className="grid gap-3 sm:grid-cols-3">
                  {/* Express Slot */}
                  <label
                    className={`flex flex-col justify-between rounded-2xl border p-4 cursor-pointer transition ${
                      form.deliverySlot === "express"
                        ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">⚡</span>
                      <input
                        type="radio"
                        name="deliverySlot"
                        value="express"
                        checked={form.deliverySlot === "express"}
                        onChange={handleChange}
                        className="accent-emerald-600"
                      />
                    </div>
                    <div className="mt-3">
                      <p className="font-extrabold text-xs text-slate-800">15-30 Min Flash</p>
                      <p className="text-[10px] text-emerald-700 font-bold mt-0.5">Cold-Chain Dispatch</p>
                    </div>
                  </label>

                  {/* Same Day Slot */}
                  <label
                    className={`flex flex-col justify-between rounded-2xl border p-4 cursor-pointer transition ${
                      form.deliverySlot === "sameday"
                        ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">🚚</span>
                      <input
                        type="radio"
                        name="deliverySlot"
                        value="sameday"
                        checked={form.deliverySlot === "sameday"}
                        onChange={handleChange}
                        className="accent-emerald-600"
                      />
                    </div>
                    <div className="mt-3">
                      <p className="font-extrabold text-xs text-slate-800">Same-Day Evening</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">By 8:00 PM Today</p>
                    </div>
                  </label>

                  {/* Scheduled Slot */}
                  <label
                    className={`flex flex-col justify-between rounded-2xl border p-4 cursor-pointer transition ${
                      form.deliverySlot === "scheduled"
                        ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">📅</span>
                      <input
                        type="radio"
                        name="deliverySlot"
                        value="scheduled"
                        checked={form.deliverySlot === "scheduled"}
                        onChange={handleChange}
                        className="accent-emerald-600"
                      />
                    </div>
                    <div className="mt-3">
                      <p className="font-extrabold text-xs text-slate-800">Tomorrow Morning</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">8:00 AM - 11:00 AM</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* 4. Payment Method */}
              <div className="mt-8 space-y-4 pt-6 border-t border-slate-100">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs">
                    3
                  </span>
                  Choose Payment Method
                </h2>

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Cash on Delivery Card */}
                  <label
                    className={`rounded-2xl border-2 p-4 cursor-pointer flex items-start gap-3 transition ${
                      form.paymentMethod === "cod"
                        ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={form.paymentMethod === "cod"}
                      onChange={handleChange}
                      className="mt-1 accent-emerald-600"
                    />
                    <div>
                      <h4 className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                        <span>💵</span> Cash / UPI on Delivery
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Pay with cash or QR code after doorstep arrival. Zero advance risk.
                      </p>
                    </div>
                  </label>

                  {/* Prepaid UPI Card */}
                  <label
                    className={`rounded-2xl border-2 p-4 cursor-pointer flex items-start gap-3 transition ${
                      form.paymentMethod === "upi"
                        ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={form.paymentMethod === "upi"}
                      onChange={handleChange}
                      className="mt-1 accent-emerald-600"
                    />
                    <div>
                      <h4 className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                        <span>⚡</span> Instant Digital Pay (UPI / Card)
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Secure instant payment with Google Pay, PhonePe, Paytm, or Card.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary & Place Order */}
          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <h3 className="text-base font-black text-slate-900">Order Summary ({cart.length} items)</h3>

            {/* Mini Item List */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 text-xs">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-400">
                      Qty: {item.quantity} × ₹{item.price}
                    </p>
                  </div>
                  <span className="font-black text-slate-900 shrink-0">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing Calculation */}
            <div className="space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800">₹{subtotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discounts Applied</span>
                  <span>- ₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Cold-Chain Express Delivery</span>
                <span className={`font-bold ${deliveryFee === 0 ? "text-emerald-600" : "text-slate-800"}`}>
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline">
                <span className="text-sm font-black text-slate-900">Total Payable</span>
                <span className="text-2xl font-black text-emerald-700">₹{total}</span>
              </div>
            </div>

            {/* Prescription Notice */}
            {hasRxItem && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800 space-y-1">
                <p className="font-bold">⚠️ Rx Clinical Notice:</p>
                <p>This order contains Schedule H medicines. Pharmacist verification will occur before dispatch.</p>
              </div>
            )}

            {/* Place Order CTA */}
            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 py-4 text-xs font-black text-white shadow-xl shadow-emerald-600/25 transition hover:from-emerald-700 hover:to-teal-800 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{form.paymentMethod === "cod" ? "💵" : "⚡"}</span>
              <span>
                {form.paymentMethod === "cod"
                  ? `Confirm Order with Cash on Delivery (₹${total}) →`
                  : `Pay & Place Order Now (₹${total}) →`}
              </span>
            </button>

            <div className="text-center text-[10px] text-slate-400 space-y-1">
              <p>✓ 100% Genuine Cold-Chain Pharmacy Standard</p>
              <p>✓ Temperature Monitored Delivery (18°C - 24°C)</p>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}

export default Checkout;