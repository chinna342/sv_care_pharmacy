import { useState } from "react";

function MyOrdersModal({ orders = [], onClose, onTrackOrder, onReorder, onOpenInvoice }) {
  const [selectedOrder, setSelectedOrder] = useState(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-800 to-teal-800 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-xl font-bold">
              📦
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight">My Medicine Orders</h2>
                <span className="rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-xs font-bold text-emerald-200 border border-emerald-400/30">
                  {orders.length} {orders.length === 1 ? "Order" : "Orders"} Placed
                </span>
              </div>
              <p className="text-xs text-emerald-100/80">Track active deliveries, print GST tax invoices & 1-click reorder</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xl text-white transition hover:bg-white/20"
            aria-label="Close orders"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-4xl shadow-inner">
                💊
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">No Orders Placed Yet</h3>
                <p className="mt-1 max-w-sm text-xs text-slate-500">
                  Explore our verified 40+ authentic pharmaceutical catalog and get medicines delivered in 15–30 minutes!
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] px-6 py-2.5 text-xs font-bold text-slate-950 shadow-sm active:scale-95 transition"
              >
                Browse Medicines Now →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const isExpanded = selectedOrder === order.id;
                const itemsCount = (order.items || []).reduce((sum, i) => sum + (i.quantity || 1), 0);
                const isDelivering = !order.status?.toLowerCase().includes("delivered");

                return (
                  <div
                    key={order.id}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 hover:border-emerald-300 hover:shadow-md space-y-4"
                  >
                    {/* Top Row: Order ID, Date, Status */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm">
                          📄
                        </span>
                        <div>
                          <p className="text-xs font-black text-slate-900 font-mono tracking-wider">
                            Order #{order.id}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Recent Order"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-extrabold flex items-center gap-1.5 ${
                            isDelivering
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          }`}
                        >
                          <span className={`h-2 w-2 rounded-full ${isDelivering ? "bg-amber-500 animate-ping" : "bg-emerald-500"}`} />
                          {order.status || "Pharmacist Verified & Dispatched"}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Items Summary & Delivery Address */}
                    <div className="grid gap-4 sm:grid-cols-2 text-xs">
                      {/* Left: Ordered Items Preview */}
                      <div className="space-y-2">
                        <p className="font-extrabold uppercase tracking-wider text-slate-400 text-[10px]">
                          Ordered Medicines ({itemsCount} {itemsCount === 1 ? "Item" : "Items"})
                        </p>
                        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                          {(order.items || []).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-2">
                              <div className="flex items-center gap-2 min-w-0">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="h-7 w-7 rounded-lg object-contain bg-white p-0.5 border" />
                                ) : (
                                  <span className="text-xs">💊</span>
                                )}
                                <span className="font-bold text-slate-800 truncate">{item.name}</span>
                              </div>
                              <span className="font-mono text-slate-500 shrink-0">
                                x{item.quantity} • ₹{item.price * (item.quantity || 1)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Address & Total */}
                      <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 space-y-2 flex flex-col justify-between">
                        <div>
                          <p className="font-extrabold uppercase tracking-wider text-slate-400 text-[10px]">
                            Delivery Destination
                          </p>
                          <p className="font-bold text-slate-800 mt-0.5">
                            {order.customer?.name || "Member Customer"}
                          </p>
                          <p className="text-[11px] text-slate-500 leading-tight">
                            {order.customer?.house}, {order.customer?.area}, {order.customer?.city} – {order.customer?.pincode}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            📞 {order.customer?.phone} • <span className="font-semibold text-emerald-700">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Prepaid Online"}</span>
                          </p>
                        </div>

                        <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
                          <span className="font-bold text-slate-600 text-xs">Total Bill:</span>
                          <span className="text-base font-black text-slate-900">₹{order.total || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3">
                      {onTrackOrder && isDelivering && (
                        <button
                          type="button"
                          onClick={() => onTrackOrder(order.id)}
                          className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition"
                        >
                          <span>🚴</span>
                          <span>Live GPS Track</span>
                        </button>
                      )}

                      {onOpenInvoice && (
                        <button
                          type="button"
                          onClick={() => onOpenInvoice(order)}
                          className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition shadow-2xs"
                        >
                          <span>🖨️</span>
                          <span>View Tax Invoice</span>
                        </button>
                      )}

                      {onReorder && (
                        <button
                          type="button"
                          onClick={() => onReorder(order)}
                          className="flex items-center gap-1.5 rounded-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] px-5 py-2 text-xs font-bold text-slate-950 shadow-xs active:scale-95 transition"
                        >
                          <span>🛒</span>
                          <span>Re-order All Items</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="text-emerald-600">✓</span> All orders backed by SV Care 100% genuine medicine guarantee.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-200 hover:bg-slate-300 px-5 py-2 text-xs font-bold text-slate-700 transition active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default MyOrdersModal;
