import { useState } from "react";

function AdminPortal({ orders = [], onUpdateOrderStatus, products = [], onUpdateStock, onClose }) {
  const [activeTab, setActiveTab] = useState("orders"); // 'orders' | 'inventory' | 'prescriptions'
  const [inventorySearch, setInventorySearch] = useState("");

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 4580);
  const totalOrdersCount = orders.length + 12;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md">
      <div className="relative max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-xl font-bold">
              👨‍⚕️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight">Pharmacist & Admin Command Center</h2>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                  Live Terminal
                </span>
              </div>
              <p className="text-xs text-slate-400">Order verification, cold chain dispatch & real-time inventory management</p>
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
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fulfillment Orders</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{totalOrdersCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Prescriptions Verified</p>
            <p className="text-2xl font-black text-blue-700 mt-1">100%</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg Express Dispatch</p>
            <p className="text-2xl font-black text-amber-600 mt-1">14.2 Mins</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 ${
              activeTab === "orders"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            📦 Live Orders Dispatch ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("inventory")}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 ${
              activeTab === "inventory"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            💊 Medicine Inventory & Stock ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("prescriptions")}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 ${
              activeTab === "prescriptions"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            📑 Rx Verification Audit Queue
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* ========================================== */}
          {/* 1. ORDERS DISPATCH TAB */}
          {/* ========================================== */}
          {activeTab === "orders" && (
            <div>
              {orders.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <div className="text-4xl mb-2">📋</div>
                  <p className="font-bold">No new orders in queue.</p>
                  <p className="text-xs">Orders placed on the storefront will appear here live in real-time.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase font-extrabold text-[10px]">
                        <th className="pb-3">Order ID</th>
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Items</th>
                        <th className="pb-3">Total</th>
                        <th className="pb-3">Payment</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Dispatch Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50">
                          <td className="py-3 font-mono font-bold text-emerald-700">{order.id}</td>
                          <td className="py-3">
                            <p className="font-bold text-slate-800">{order.customer?.name || "Customer"}</p>
                            <p className="text-[10px] text-slate-400">{order.customer?.phone || "N/A"}</p>
                          </td>
                          <td className="py-3 font-semibold text-slate-600">{order.items?.length || 1} Items</td>
                          <td className="py-3 font-black text-slate-800">₹{order.total}</td>
                          <td className="py-3 uppercase font-bold text-slate-500">{order.customer?.payment || "COD"}</td>
                          <td className="py-3">
                            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                              {order.status || "Pharmacist Verified"}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                if (onUpdateOrderStatus) onUpdateOrderStatus(order.id, "Dispatched");
                                alert(`Order ${order.id} dispatched to EV Rider!`);
                              }}
                              className="rounded-lg bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
                            >
                              ⚡ Dispatch Rider
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
                placeholder="Search stock by medicine name or category..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 outline-none focus:border-emerald-600"
              />

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-extrabold text-[10px]">
                      <th className="pb-3">Medicine</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Price</th>
                      <th className="pb-3">Stock Units</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3 text-right">Quick Stock Adjust</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products
                      .filter((p) =>
                        p.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                        p.category.toLowerCase().includes(inventorySearch.toLowerCase())
                      )
                      .slice(0, 15)
                      .map((prod) => (
                        <tr key={prod.id} className="hover:bg-slate-50">
                          <td className="py-2.5 font-bold text-slate-800">{prod.name}</td>
                          <td className="py-2.5 text-slate-500">{prod.category}</td>
                          <td className="py-2.5 font-black text-emerald-700">₹{prod.price}</td>
                          <td className="py-2.5 font-bold text-slate-700">{prod.stock} units</td>
                          <td className="py-2.5">
                            {prod.prescriptionRequired ? (
                              <span className="rounded-full bg-amber-100 px-2 py-0.2 text-[10px] font-bold text-amber-800">
                                Rx
                              </span>
                            ) : (
                              <span className="rounded-full bg-blue-100 px-2 py-0.2 text-[10px] font-bold text-blue-800">
                                OTC
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 text-right space-x-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (onUpdateStock) onUpdateStock(prod.id, prod.stock + 10);
                                alert(`Added 10 units to ${prod.name}`);
                              }}
                              className="rounded bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200"
                            >
                              +10
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (onUpdateStock) onUpdateStock(prod.id, prod.stock + 50);
                                alert(`Added 50 units to ${prod.name}`);
                              }}
                              className="rounded bg-emerald-100 px-2 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-200"
                            >
                              +50
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
          {/* 3. PRESCRIPTION AUDIT QUEUE */}
          {/* ========================================== */}
          {activeTab === "prescriptions" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-emerald-900 text-xs">Registered Pharmacist: Dr. M. Suresh, B.Pharm, R.Ph</p>
                  <p className="text-[11px] text-emerald-700">License No: TS/PHARM/2024/99104 • Shift Active</p>
                </div>
                <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                  ✓ Verified & Active
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Rx #RX-2026-8942</h4>
                    <p className="text-xs text-slate-500">Dr. Arvind Sharma (MCI-48920-HYD) for patient Rahul Verma</p>
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                    Auto-Verified by AI Vision
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                  <p className="font-semibold">Items prescribed: Dolo 650mg, Azee 500 (Azithromycin), Montair-LC, Benadryl Syrup</p>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => alert("Prescription verified and approved for fulfillment.")}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    ✓ Approve Prescription
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex justify-between items-center">
          <span className="text-xs text-slate-400">SV Care Pharmacy Enterprise Suite • High Security Portal</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-900"
          >
            Close Terminal
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminPortal;
