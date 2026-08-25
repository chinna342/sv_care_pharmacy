import React from "react";

function TaxInvoiceModal({ order, onClose }) {
  if (!order) return null;

  const items = order.items || [];
  const subtotal = order.subtotal || items.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0);
  const gstAmount = Math.round(subtotal * 0.05); // 5% GST on medicines
  const deliveryFee = order.deliveryFee || 0;
  const grandTotal = order.total || (subtotal + deliveryFee);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-md">
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col">
        {/* Header Controls (Hidden on Print) */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-6 py-4 text-white print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-lg">🧾</span>
            <h3 className="text-sm font-extrabold tracking-wide">Official Pharmacy Tax Invoice & Bill</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 active:scale-95 transition"
            >
              <span>🖨️</span>
              <span>Print Invoice</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-slate-800 font-sans print:p-0">
          {/* Pharmacy Top Branding & Meta */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white font-black text-base">
                  💊
                </span>
                <h1 className="text-xl font-black tracking-tight text-slate-900">
                  SV Care Healthcare Pvt. Ltd.
                </h1>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                Plot #42, Mindspace Tech Park, HITEC City, Hyderabad, Telangana – 500081
              </p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                GSTIN: <span className="font-bold text-slate-700">36AAACS1234F1Z8</span> • Drug Lic: <span className="font-bold text-slate-700">TS/HYD/2026/8942-R</span>
              </p>
            </div>

            <div className="text-right">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-800">
                ORIGINAL TAX INVOICE
              </span>
              <p className="text-xs font-mono font-black text-slate-900 mt-2">
                Invoice #: INV-{order.id || "SV53493587"}
              </p>
              <p className="text-[11px] text-slate-500">
                Date: {new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
              <p className="text-[11px] font-semibold text-emerald-700">
                Payment: {order.paymentMethod === "cod" ? "Cash on Delivery" : "Prepaid Online"}
              </p>
            </div>
          </div>

          {/* Billed To / Patient Information */}
          <div className="grid gap-4 sm:grid-cols-2 rounded-2xl bg-slate-50 p-4 border border-slate-200 text-xs">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Patient & Delivery Info</p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{order.customer?.name || "Verified Member"}</p>
              <p className="text-slate-600 mt-0.5 leading-tight">
                {order.customer?.house}, {order.customer?.area}
              </p>
              <p className="text-slate-600">
                {order.customer?.city} – {order.customer?.pincode}
              </p>
              <p className="text-slate-500 mt-1">📞 Contact: {order.customer?.phone}</p>
            </div>

            <div className="space-y-1 sm:text-right">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Fulfillment Verification</p>
              <p className="text-emerald-700 font-bold">✓ Pharmacist Audited & Verified</p>
              <p className="text-slate-500 text-[11px]">Cold-Chain Packaging: Standard (18°C–24°C)</p>
              <p className="text-slate-500 text-[11px]">Express Dispatch Hub: Madhapur Central</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-slate-300 bg-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-600">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Medicine Description</th>
                  <th className="py-2.5 px-3">HSN Code</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit MRP</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{item.genericName || "Pharmaceutical Grade"}</p>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">300490</td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800">{item.quantity || 1}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">₹{item.price}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      ₹{item.price * (item.quantity || 1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-t border-slate-200 pt-4">
            <div className="text-[11px] text-slate-500 max-w-sm space-y-1">
              <p className="font-bold text-slate-700">Terms & Conditions:</p>
              <p>1. Medicines sold are non-transferrable and verified by licensed pharmacists.</p>
              <p>2. Keep in a cool, dry place away from direct sunlight.</p>
              <p>3. This is a computer-generated tax invoice and requires no physical signature.</p>
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (5% Inclusive):</span>
                <span>₹{gstAmount}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Express Cold-Chain Delivery:</span>
                <span className="text-emerald-700 font-bold">{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between border-t-2 border-slate-800 pt-2 text-sm font-black text-slate-950">
                <span>Grand Total:</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>
          </div>

          {/* Authorized Seal */}
          <div className="flex items-center justify-between border-t border-dashed border-slate-300 pt-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-emerald-600 text-emerald-700 font-black text-xs">
                SV
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Authorized Pharmacist Signatory</p>
                <p className="text-xs font-extrabold text-slate-800">Dr. Rajesh Varma, B.Pharm (Reg #TS-4921)</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-slate-400">24/7 Helpline</p>
              <p className="text-xs font-bold text-slate-800">1800-200-CARE</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaxInvoiceModal;
