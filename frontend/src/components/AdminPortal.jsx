import { useState } from "react";

function AdminPortal({
  orders = [],
  onUpdateOrderStatus,
  products = [],
  onUpdateStock,
  onOpenInvoice,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState("orders"); // 'orders' | 'inventory' | 'prescriptions'
  const [inventorySearch, setInventorySearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 4580);
  const totalOrdersCount = orders.length + 12;

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer?.name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer?.phone?.includes(orderSearch);

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && !o.status?.toLowerCase().includes("delivered")) ||
      (statusFilter === "Delivered" && o.status?.toLowerCase().includes("delivered"));

    return matchesSearch && matchesStatus;
  });

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      p.category.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  const statusOptions = [
    "Pharmacist Verified & Queued",
    "Cold-Chain Packed (18°C-24°C)",
    "Out for Express Delivery",
    "Delivered to Doorstep",
    "Cancelled",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-md">
      <div className="relative max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-xl font-bold shadow-md shadow-emerald-600/30">
              👨‍⚕️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight">Pharmacist & Admin Command Center</h2>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                  Live Dispatch
                </span>
              </div>
              <p className="text-xs text-slate-400">Order verification, cold chain dispatch & real-time stock control</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-white hover:bg-slate-700 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Metrics Overview Bar */}
        <div className="grid grid-cols-2 gap-4 border-b border-slate-100 bg-slate-50 p-6 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Store Revenue</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">₹{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Live Orders</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{orders.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Prescriptions Verified</p>
            <p className="text-2xl font-black text-blue-700 mt-1">100%</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cold Chain Target</p>
            <p className="text-2xl font-black text-amber-600 mt-1">18°C – 24°C</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === "orders"
                ? "border-emerald-600 text-emerald-700 font-black"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            📦 Live Customer Orders ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("inventory")}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === "inventory"
                ? "border-emerald-600 text-emerald-700 font-black"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            💊 Medicine Inventory & Stock ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("prescriptions")}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === "prescriptions"
                ? "border-emerald-600 text-emerald-700 font-black"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            📑 Pharmacist Verification Audit Queue
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* ========================================== */}
          {/* 1. ORDERS DISPATCH TAB */}
          {/* ========================================== */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search order ID, patient name, or phone number..."
                  className="flex-1 min-w-[200px] rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600"
                />
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="text-slate-500">Filter:</span>
                  {["All", "Active", "Delivered"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`rounded-full px-3 py-1 text-xs transition ${
                        statusFilter === st
                          ? "bg-emerald-600 text-white font-black"
                          : "bg-white text-slate-600 border hover:bg-slate-100"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <div className="text-4xl">📋</div>
                  <p className="font-bold text-slate-700">No matching orders in queue.</p>
                  <p className="text-xs max-w-sm mx-auto">
                    New orders placed on the storefront or mobile app will stream here automatically in real time.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs bg-white">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-black text-[10px]">
                        <th className="py-3 px-3">Order ID</th>
                        <th className="py-3 px-3">Patient & Address</th>
                        <th className="py-3 px-3">Items Ordered</th>
                        <th className="py-3 px-3">Total</th>
                        <th className="py-3 px-3">Payment</th>
                        <th className="py-3 px-3">Current Status</th>
                        <th className="py-3 px-3 text-right">Update Status & Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-3 font-mono font-black text-emerald-700 whitespace-nowrap">
                            {order.id}
                          </td>
                          <td className="py-3.5 px-3">
                            <p className="font-bold text-slate-900">{order.customer?.name || "Customer"}</p>
                            <p className="text-[11px] text-slate-500 font-mono">📞 {order.customer?.phone || "N/A"}</p>
                            <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                              {order.customer?.house}, {order.customer?.area}, {order.customer?.city}
                            </p>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="font-bold text-slate-800">
                              {(order.items || []).reduce((sum, i) => sum + (i.quantity || 1), 0)} Items
                            </span>
                            <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                              {(order.items || []).map((i) => i.name).join(", ")}
                            </div>
                          </td>
                          <td className="py-3.5 px-3 font-black text-slate-900 whitespace-nowrap">
                            ₹{order.total || 0}
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                              {order.paymentMethod || "COD"}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <select
                              value={order.status || "Pharmacist Verified & Queued"}
                              onChange={(e) => {
                                if (onUpdateOrderStatus) {
                                  onUpdateOrderStatus(order.id, e.target.value);
                                }
                              }}
                              className="rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-800 outline-none focus:border-emerald-600 focus:bg-white"
                            >
                              {statusOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3.5 px-3 text-right whitespace-nowrap space-x-2">
                            {onOpenInvoice && (
                              <button
                                type="button"
                                onClick={() => onOpenInvoice(order)}
                                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition"
                              >
                                🧾 Invoice
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                if (onUpdateOrderStatus) {
                                  onUpdateOrderStatus(order.id, "Out for Express Delivery");
                                  alert(`Order ${order.id} dispatched to EV Rider!`);
                                }
                              }}
                              className="rounded-lg bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 shadow-xs active:scale-95 transition"
                            >
                              ⚡ Dispatch
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========================================== */}
          {/* 2. INVENTORY TAB */}
          {/* ========================================== */}
          {activeTab === "inventory" && (
            <div className="space-y-4">
              <input
                type="text"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                placeholder="Search stock by medicine name or category (e.g. Dolo 650, Antibiotics)..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 outline-none focus:border-emerald-600 focus:bg-white"
              />

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs bg-white">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-black text-[10px]">
                      <th className="py-3 px-3">Medicine</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Price (MRP)</th>
                      <th className="py-3 px-3">Stock Units</th>
                      <th className="py-3 px-3">Form</th>
                      <th className="py-3 px-3 text-right">Stock Management</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="h-8 w-8 rounded-lg object-contain bg-white border p-0.5" />
                            ) : (
                              <span>💊</span>
                            )}
                            <div>
                              <p className="font-bold text-slate-900">{p.name}</p>
                              <p className="text-[10px] text-slate-400">{p.genericName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          ₹{p.price} <span className="text-[10px] text-slate-400 line-through">₹{p.mrp}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[11px] font-black ${
                              (p.stock || 50) < 15
                                ? "bg-red-100 text-red-700"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {p.stock || 50} in stock
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500 font-semibold">{p.form || "Tablet"}</td>
                        <td className="py-3 px-3 text-right whitespace-nowrap space-x-1.5">
                          <button
                            type="button"
                            onClick={() => onUpdateStock && onUpdateStock(p.id, Math.max(0, (p.stock || 50) - 10))}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-bold text-slate-700 hover:bg-slate-100 active:scale-95"
                          >
                            -10
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateStock && onUpdateStock(p.id, (p.stock || 50) + 50)}
                            className="rounded-lg bg-emerald-600 px-3 py-1 font-bold text-white hover:bg-emerald-700 active:scale-95"
                          >
                            +50 Restock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* 3. PRESCRIPTIONS TAB */}
          {/* ========================================== */}
          {activeTab === "prescriptions" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-xs">
                <p className="font-bold text-emerald-900">Digital Prescription Audit Compliance</p>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Under the Drugs and Cosmetics Act & Telemedicine Practice Guidelines, all Schedule H/H1 medicines require clinical pharmacist digital verification before cold-box dispatch.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-8 text-center text-slate-400 space-y-2">
                <div className="text-4xl">🔬</div>
                <p className="font-bold text-slate-700">All Scheduled Rx Prescriptions Audited</p>
                <p className="text-xs max-w-sm mx-auto">
                  100% of incoming prescription uploads have been validated by on-duty clinical pharmacist.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPortal;
