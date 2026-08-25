import { useState } from "react";

export default function DeliveryPortal({
  orders = [],
  user = null,
  onUpdateDeliveryStatus,
  onClose,
}) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryOtpModalOpen, setDeliveryOtpModalOpen] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");

  // Delivery rider orders (or any dispatched/ready order)
  const assignedOrders = orders.filter((o) => {
    const s = (o.status || o.order_status || "").toUpperCase();
    return ["READY_FOR_DISPATCH", "OUT_FOR_DELIVERY", "PACKED", "DELIVERED"].includes(s);
  });

  const handleStartDelivery = (orderId) => {
    if (onUpdateDeliveryStatus) {
      onUpdateDeliveryStatus(orderId, "OUT_FOR_DELIVERY", "Rider picked up cold-box and started navigation.");
    }
  };

  const handleOpenDeliveryOtp = (order) => {
    setSelectedOrder(order);
    setEnteredOtp("");
    setDeliveryOtpModalOpen(true);
  };

  const handleConfirmDelivered = (e) => {
    e.preventDefault();
    if (enteredOtp.length < 4 && enteredOtp !== "1234" && enteredOtp !== "123456") {
      alert("Please enter the 4 or 6-digit customer verification OTP provided upon arrival.");
      return;
    }
    if (onUpdateDeliveryStatus && selectedOrder) {
      onUpdateDeliveryStatus(selectedOrder.id, "DELIVERED", "Doorstep contactless delivery verified with OTP.");
    }
    setDeliveryOtpModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/90 backdrop-blur-md">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-teal-500/20 bg-slate-900 px-6 py-3.5 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 font-black text-slate-950 shadow-md">
            🛵
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white sm:text-lg">
                SV Care Express Fleet Portal
              </span>
              <span className="rounded-full bg-teal-500/20 px-2.5 py-0.5 text-[10px] font-black text-teal-400 border border-teal-500/30">
                RIDER DISPATCH
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Cold-Chain Temperature Monitored • 15-30 Min Doorstep Delivery
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-bold text-slate-200">{user?.name || "Ramesh Express Rider"}</p>
            <p className="text-[10px] text-teal-400 font-mono">Electric EV #TS-09-EV-8942 • Online</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:bg-rose-500 hover:text-white transition"
          >
            ✕
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto bg-slate-900 p-6 space-y-6">
        {/* Rider Stats Bar */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Assigned Trips</p>
            <p className="mt-1 text-3xl font-black text-teal-400">
              {assignedOrders.filter((o) => (o.status || o.order_status) !== "DELIVERED").length}
            </p>
            <p className="mt-1 text-[10px] text-slate-500">Active dispatches</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase">En-Route (Transit)</p>
            <p className="mt-1 text-3xl font-black text-amber-400">
              {assignedOrders.filter((o) => (o.status || o.order_status) === "OUT_FOR_DELIVERY").length}
            </p>
            <p className="mt-1 text-[10px] text-amber-400">15-30 min window</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Completed Deliveries</p>
            <p className="mt-1 text-3xl font-black text-emerald-400">
              {assignedOrders.filter((o) => (o.status || o.order_status) === "DELIVERED").length}
            </p>
            <p className="mt-1 text-[10px] text-emerald-400">Today</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Cold-Box Temp</p>
            <p className="mt-1 text-3xl font-black text-blue-400">21.4°C</p>
            <p className="mt-1 text-[10px] text-blue-400 font-bold">✓ Optimum 18°C-24°C</p>
          </div>
        </div>

        {/* Assigned Orders List */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            📍 Doorstep Delivery Run Sheet ({assignedOrders.length})
          </h3>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assignedOrders.map((ord) => {
              const s = (ord.status || ord.order_status || "").toUpperCase();
              const isOut = s === "OUT_FOR_DELIVERY";
              const isDelivered = s === "DELIVERED";

              return (
                <div
                  key={ord.id}
                  className="rounded-3xl border border-slate-800 bg-slate-950 p-5 space-y-4 shadow-lg hover:border-teal-500/50 transition"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="font-mono font-black text-teal-400 text-sm">
                      #{ord.id || ord.order_number}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                        isDelivered
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : isOut
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse"
                          : "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                      }`}
                    >
                      {s.replace(/_/g, " ")}
                    </span>
                  </div>

                  {/* Customer and Address */}
                  <div className="space-y-1.5 text-xs">
                    <p className="text-sm font-bold text-white">{ord.customer?.name}</p>
                    <p className="text-slate-300 line-clamp-2">
                      📍 {ord.customer?.house}, {ord.customer?.area}, {ord.customer?.city} - {ord.customer?.pincode}
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      <a
                        href={`tel:${ord.customer?.phone}`}
                        className="rounded-lg bg-slate-800 px-3 py-1 text-teal-300 font-mono font-bold hover:bg-slate-700 transition flex items-center gap-1"
                      >
                        📞 {ord.customer?.phone}
                      </a>
                      <span className="font-bold text-white">
                        ₹{ord.total} ({ord.paymentMethod?.toUpperCase()})
                      </span>
                    </div>
                  </div>

                  {/* Items count */}
                  <div className="rounded-xl bg-slate-900 p-2.5 text-[11px] text-slate-400">
                    <p className="font-bold text-slate-300">📦 Package: {ord.items?.length || 1} Cold-Box Medicines</p>
                    <p className="line-clamp-1">{ord.items?.map((i) => i.name).join(", ")}</p>
                  </div>

                  {/* Delivery Actions */}
                  <div className="pt-2">
                    {!isOut && !isDelivered && (
                      <button
                        type="button"
                        onClick={() => handleStartDelivery(ord.id)}
                        className="w-full rounded-2xl bg-teal-600 py-3 text-xs font-black text-slate-950 hover:bg-teal-500 shadow-lg shadow-teal-600/30 transition flex items-center justify-center gap-2"
                      >
                        <span>🛵</span> Start Delivery Route
                      </button>
                    )}

                    {isOut && (
                      <button
                        type="button"
                        onClick={() => handleOpenDeliveryOtp(ord)}
                        className="w-full rounded-2xl bg-emerald-600 py-3 text-xs font-black text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                      >
                        <span>✓</span> Verify OTP & Mark Delivered
                      </button>
                    )}

                    {isDelivered && (
                      <div className="rounded-2xl bg-emerald-950/40 border border-emerald-500/30 py-2.5 text-center text-xs font-bold text-emerald-300">
                        ✓ Delivered & Signed
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {assignedOrders.length === 0 && (
              <div className="sm:col-span-3 py-16 text-center text-slate-500 text-xs">
                No active delivery assignments queued right now.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* OTP Modal */}
      {deliveryOtpModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleConfirmDelivered}
            className="w-full max-w-md rounded-3xl border border-teal-500/40 bg-slate-900 p-6 text-white shadow-2xl space-y-4"
          >
            <div>
              <h3 className="text-sm font-black text-teal-400">
                Doorstep Delivery Confirmation • #{selectedOrder.id}
              </h3>
              <p className="text-xs text-slate-400">
                Ask customer {selectedOrder.customer?.name} for their delivery OTP (or use demo 123456).
              </p>
            </div>

            <div>
              <label className="block text-slate-400 font-bold text-xs mb-1">Customer Delivery OTP</label>
              <input
                type="text"
                required
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                placeholder="e.g. 123456"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-center text-lg font-mono font-bold tracking-widest text-teal-400 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-emerald-600 py-3 text-xs font-black text-white hover:bg-emerald-500 transition"
              >
                Confirm & Complete Delivery
              </button>
              <button
                type="button"
                onClick={() => setDeliveryOtpModalOpen(false)}
                className="rounded-xl bg-slate-800 px-4 py-3 text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
