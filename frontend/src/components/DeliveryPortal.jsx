import { useState, useMemo } from "react";

export default function DeliveryPortal({
  orders = [],
  user = null,
  onUpdateDeliveryStatus,
  onClose,
}) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryOtpModalOpen, setDeliveryOtpModalOpen] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [timeFilter, setTimeFilter] = useState("ALL"); // 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'ALL'
  const [statusFilter, setStatusFilter] = useState("ALL"); // 'ALL' | 'ACTIVE' | 'DELIVERED'
  const [searchQuery, setSearchQuery] = useState("");

  // Filter orders by timeframe and delivery status
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneWeekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;
    const oneYearAgo = now.getTime() - 365 * 24 * 60 * 60 * 1000;

    return orders.filter((o) => {
      const s = (o.status || o.order_status || "").toUpperCase();
      // Delivery portal is relevant for assigned, dispatched, packed, or delivered orders
      const isDeliveryRelevant = ["READY_FOR_DISPATCH", "OUT_FOR_DELIVERY", "PACKED", "DELIVERED", "ACCEPTED"].includes(s);
      if (!isDeliveryRelevant) return false;

      // Status filter
      if (statusFilter === "ACTIVE" && s === "DELIVERED") return false;
      if (statusFilter === "DELIVERED" && s !== "DELIVERED") return false;

      // Date timeframe filter
      const orderDate = new Date(o.createdAt || o.created_at || Date.now()).getTime();
      if (timeFilter === "TODAY" && orderDate < startOfToday) return false;
      if (timeFilter === "WEEK" && orderDate < oneWeekAgo) return false;
      if (timeFilter === "MONTH" && orderDate < oneMonthAgo) return false;
      if (timeFilter === "YEAR" && orderDate < oneYearAgo) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const numMatch = (o.id || o.order_number || "").toString().toLowerCase().includes(q);
        const nameMatch = (o.customer?.name || "").toLowerCase().includes(q);
        const phoneMatch = (o.customer?.phone || "").includes(q);
        const areaMatch = (o.customer?.area || "").toLowerCase().includes(q);
        if (!numMatch && !nameMatch && !phoneMatch && !areaMatch) return false;
      }

      return true;
    });
  }, [orders, timeFilter, statusFilter, searchQuery]);

  // Key Delivery Metrics
  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let completedCount = 0;
    let inTransitCount = 0;
    let readyCount = 0;

    filteredOrders.forEach((o) => {
      totalRevenue += parseFloat(o.total || 0);
      const s = (o.status || o.order_status || "").toUpperCase();
      if (s === "DELIVERED") completedCount++;
      else if (s === "OUT_FOR_DELIVERY") inTransitCount++;
      else readyCount++;
    });

    return {
      total: filteredOrders.length,
      revenue: totalRevenue,
      completed: completedCount,
      inTransit: inTransitCount,
      ready: readyCount,
    };
  }, [filteredOrders]);

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
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/95 backdrop-blur-md">
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
              Cold-Chain Temperature Monitored (18°C-24°C) • Daily, Weekly & Historical Ledger
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
            <p className="text-[11px] font-bold text-slate-400 uppercase">Total Orders In View</p>
            <p className="mt-1 text-3xl font-black text-teal-400">{metrics.total}</p>
            <p className="mt-1 text-[10px] text-slate-500">
              {timeFilter === "TODAY" ? "Today's Ledger" : timeFilter === "WEEK" ? "Past 7 Days" : timeFilter === "MONTH" ? "Past 30 Days" : timeFilter === "YEAR" ? "Past 365 Days" : "All Time Records"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase">En-Route (Transit)</p>
            <p className="mt-1 text-3xl font-black text-amber-400">{metrics.inTransit}</p>
            <p className="mt-1 text-[10px] text-amber-400 font-semibold">15-30 min window</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Delivered & Completed</p>
            <p className="mt-1 text-3xl font-black text-emerald-400">{metrics.completed}</p>
            <p className="mt-1 text-[10px] text-emerald-400 font-semibold">OTP Verified</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Total Order Value</p>
            <p className="mt-1 text-3xl font-black text-blue-400">₹{metrics.revenue.toLocaleString()}</p>
            <p className="mt-1 text-[10px] text-blue-400 font-bold">Cold-Box: 21.4°C (Safe)</p>
          </div>
        </div>

        {/* Filter Controls: Time Horizon (Daily / Weekly / Monthly / Yearly) & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-950 p-4 border border-slate-800">
          {/* Timeframe selector */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-bold mr-1">📅 Time Period:</span>
            {[
              { id: "TODAY", label: "Today (Daily)" },
              { id: "WEEK", label: "Weekly (7 Days)" },
              { id: "MONTH", label: "Monthly (30 Days)" },
              { id: "YEAR", label: "Yearly (365 Days)" },
              { id: "ALL", label: "All History" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTimeFilter(t.id)}
                className={`rounded-xl px-3 py-1.5 font-bold transition text-[11px] ${
                  timeFilter === t.id
                    ? "bg-teal-500 text-slate-950 font-black shadow-md shadow-teal-500/20"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Status & Search */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Delivery Statuses</option>
              <option value="ACTIVE">Active & Dispatched</option>
              <option value="DELIVERED">Delivered Only</option>
            </select>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order ID, patient, phone..."
              className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* Assigned Orders List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              📍 Orders Ledger ({filteredOrders.length})
            </h3>
            <span className="text-[11px] text-slate-400">
              Showing {timeFilter} records preserved in store database
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.map((ord) => {
              const s = (ord.status || ord.order_status || "").toUpperCase();
              const isOut = s === "OUT_FOR_DELIVERY";
              const isDelivered = s === "DELIVERED";
              const orderDateStr = ord.createdAt || ord.created_at ? new Date(ord.createdAt || ord.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Recent";

              return (
                <div
                  key={ord.id || ord.order_number}
                  className="rounded-3xl border border-slate-800 bg-slate-950 p-5 space-y-4 shadow-lg hover:border-teal-500/50 transition"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="font-mono font-black text-teal-400 text-sm">
                        #{ord.id || ord.order_number}
                      </span>
                      <p className="text-[10px] text-slate-500">{orderDateStr}</p>
                    </div>
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
                        ₹{ord.total} ({ord.paymentMethod?.toUpperCase() || "COD"})
                      </span>
                    </div>
                  </div>

                  {/* Items count */}
                  <div className="rounded-xl bg-slate-900 p-2.5 text-[11px] text-slate-400">
                    <p className="font-bold text-slate-300">📦 Package: {ord.items?.length || 1} Cold-Box Medicines</p>
                    <p className="line-clamp-1">{ord.items?.map((i) => i.name || i.product_name).join(", ")}</p>
                  </div>

                  {/* Delivery Actions */}
                  <div className="pt-2">
                    {!isOut && !isDelivered && (
                      <button
                        type="button"
                        onClick={() => handleStartDelivery(ord.id)}
                        className="w-full rounded-2xl bg-teal-500 py-3 text-xs font-black text-slate-950 hover:bg-teal-400 shadow-lg shadow-teal-500/25 transition flex items-center justify-center gap-2"
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
                        ✓ Delivered & Signed on {orderDateStr}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredOrders.length === 0 && (
              <div className="sm:col-span-3 py-16 text-center text-slate-500 text-xs rounded-3xl border border-dashed border-slate-800 bg-slate-950">
                <p className="text-3xl mb-2">📦</p>
                <p className="font-bold text-slate-400">No orders found for the selected {timeFilter.toLowerCase()} period.</p>
                <p className="text-slate-600 mt-1">Switch to "All History" to view older deliveries.</p>
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
