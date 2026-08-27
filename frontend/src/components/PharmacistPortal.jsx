import { useState, useMemo, useEffect, useRef } from "react";
import { realtimeWS } from "../services/websocket";
import { soundEffects } from "../services/soundEffects";
import { getTallManName, getDosageBadge } from "../utils/lasaDrugs";

export default function PharmacistPortal({
  orders = [],
  products = [],
  prescriptions = [],
  inventory = [],
  user = null,
  isSyncing = false,
  onRefreshOrders,
  onUpdateOrderStatus,
  onReviewPrescription,
  onAdjustStock,
  onOpenInvoice,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard | orders | prescriptions | inventory | medicines
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
  const [rejectReasonModalOpen, setRejectReasonModalOpen] = useState(false);
  const [rejectionReasonText, setRejectionReasonText] = useState("");
  const [stockAdjustModalProduct, setStockAdjustModalProduct] = useState(null);
  const [stockAdjustType, setStockAdjustType] = useState("ADD");
  const [stockAdjustQty, setStockAdjustQty] = useState(10);
  const [stockAdjustReason, setStockAdjustReason] = useState("");
  const [selectedRxForReview, setSelectedRxForReview] = useState(null);
  const [rxReviewNotes, setRxReviewNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [wsConnected, setWsConnected] = useState(false);
  const searchInputRef = useRef(null);

  // ==========================================
  // REAL-TIME WEBSOCKET SUBSCRIPTIONS & SOUND ALERTS
  // ==========================================
  useEffect(() => {
    realtimeWS.connect("pharmacist");

    const unsubStatus = realtimeWS.on("connection_status", (status) => {
      setWsConnected(status.status === "connected");
    });

    const unsubOrderCreated = realtimeWS.on("ORDER_CREATED", (data) => {
      if (data.prescription_required) {
        soundEffects.playEmergencyChime();
      } else {
        soundEffects.playNormalOrderChime();
      }
      if (onRefreshOrders) {
        onRefreshOrders();
      }
    });

    const unsubStatusChanged = realtimeWS.on("ORDER_STATUS_CHANGED", () => {
      if (onRefreshOrders) {
        onRefreshOrders();
      }
    });

    return () => {
      unsubStatus();
      unsubOrderCreated();
      unsubStatusChanged();
    };
  }, [onRefreshOrders]);

  // ==========================================
  // PHARMACIST WORKSTATION KEYBOARD HOTKEYS
  // [Space] Accept top pending or selected order
  // [Enter] Proceed / Next step
  // [F] or [/] Focus search bar
  // ==========================================
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if typing in an input or textarea
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) {
        return;
      }

      if (e.key === "f" || e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.code === "Space") {
        e.preventDefault();
        if (selectedOrderForReview) {
          handleAcceptOrder(selectedOrderForReview);
        } else {
          // Find first pending order
          const firstPending = orders.find(
            (o) => (o.status || o.order_status || "").toUpperCase().includes("PENDING")
          );
          if (firstPending) {
            setSelectedOrderForReview(firstPending);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedOrderForReview, orders]);

  // ==========================================
  // METRICS COMPUTATION
  // ==========================================
  const metrics = useMemo(() => {
    const counts = {
      pending: 0,
      accepted: 0,
      packing: 0,
      packed: 0,
      ready_dispatch: 0,
      out_delivery: 0,
      delivered: 0,
      rejected: 0,
      cancelled: 0,
      lowStock: 0,
      outOfStock: 0,
      pendingRx: 0,
    };

    orders.forEach((o) => {
      const s = (o.status || o.order_status || "").toUpperCase();
      if (s.includes("PENDING") || s === "PENDING_PHARMACIST_REVIEW") counts.pending++;
      else if (s === "ACCEPTED") counts.accepted++;
      else if (s === "PACKING") counts.packing++;
      else if (s === "PACKED") counts.packed++;
      else if (s === "READY_FOR_DISPATCH") counts.ready_dispatch++;
      else if (s === "OUT_FOR_DELIVERY") counts.out_delivery++;
      else if (s === "DELIVERED") counts.delivered++;
      else if (s === "REJECTED") counts.rejected++;
      else if (s === "CANCELLED") counts.cancelled++;
    });

    products.forEach((p) => {
      if (p.stock <= 0) counts.outOfStock++;
      else if (p.stock <= 15) counts.lowStock++;
    });

    prescriptions.forEach((rx) => {
      if (rx.status === "PENDING_REVIEW") counts.pendingRx++;
    });

    return counts;
  }, [orders, products, prescriptions]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const s = (o.status || o.order_status || "").toUpperCase();
      if (orderStatusFilter !== "ALL") {
        if (orderStatusFilter === "PENDING" && !s.includes("PENDING")) return false;
        if (orderStatusFilter === "IN_PROGRESS" && !["ACCEPTED", "PACKING", "PACKED"].includes(s)) return false;
        if (orderStatusFilter === "DISPATCHED" && !["READY_FOR_DISPATCH", "OUT_FOR_DELIVERY"].includes(s)) return false;
        if (orderStatusFilter === "DELIVERED" && s !== "DELIVERED") return false;
        if (orderStatusFilter === "CANCELLED_REJECTED" && !["CANCELLED", "REJECTED"].includes(s)) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const idMatch = (o.id || o.order_number || "").toLowerCase().includes(q);
        const nameMatch = (o.customer?.name || "").toLowerCase().includes(q);
        const phoneMatch = (o.customer?.phone || "").toLowerCase().includes(q);
        return idMatch || nameMatch || phoneMatch;
      }
      return true;
    });
  }, [orders, orderStatusFilter, searchQuery]);

  // Status Action Handlers
  const handleAcceptOrder = (order) => {
    if (onUpdateOrderStatus) {
      onUpdateOrderStatus(order.id, "ACCEPTED", "Pharmacist verified dosage & drug interactions. Order approved.");
    }
    setSelectedOrderForReview(null);
  };

  const handleOpenRejectModal = (order) => {
    setSelectedOrderForReview(order);
    setRejectionReasonText("");
    setRejectReasonModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!rejectionReasonText.trim()) {
      alert("Rejection reason is required by clinical pharmacy guidelines.");
      return;
    }
    if (onUpdateOrderStatus && selectedOrderForReview) {
      onUpdateOrderStatus(
        selectedOrderForReview.id,
        "REJECTED",
        rejectionReasonText,
        rejectionReasonText
      );
    }
    setRejectReasonModalOpen(false);
    setSelectedOrderForReview(null);
  };

  const handleStartPacking = (orderId) => {
    if (onUpdateOrderStatus) {
      onUpdateOrderStatus(orderId, "PACKING", "Pharmacist initiated barcode scanning and cold-box packing.");
    }
  };

  const handleMarkPacked = (orderId) => {
    if (onUpdateOrderStatus) {
      onUpdateOrderStatus(orderId, "PACKED", "Order sealed in tamper-evident clinical pouch.");
    }
  };

  const handleMarkReadyForDispatch = (orderId) => {
    if (onUpdateOrderStatus) {
      onUpdateOrderStatus(orderId, "READY_FOR_DISPATCH", "Handed over to SV Care Cold-Chain Dispatch Desk.");
    }
  };

  const handleStockAdjustmentSubmit = (e) => {
    e.preventDefault();
    if (!stockAdjustReason.trim()) {
      alert("Please provide an audit reason for the inventory adjustment.");
      return;
    }
    if (onAdjustStock && stockAdjustModalProduct) {
      onAdjustStock(
        stockAdjustModalProduct.id,
        stockAdjustType,
        stockAdjustQty,
        stockAdjustReason
      );
    }
    setStockAdjustModalProduct(null);
    setStockAdjustReason("");
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/90 backdrop-blur-md">
      {/* 1. TOP PHARMACY APP HEADER */}
      <header className="flex items-center justify-between border-b border-emerald-500/20 bg-slate-900 px-6 py-3.5 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 font-black text-slate-950 shadow-md">
            ⚕️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white sm:text-lg">
                SV Care Pharmacy Portal
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-black text-emerald-400 border border-emerald-500/30">
                CLINICAL DISPATCH
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Licensed Pharmacist Station • Temperature Controlled Cold-Chain Logistics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Live WebSocket Status & Hotkey Indicators */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-slate-800/80 px-2.5 py-1 border border-slate-700 text-[10px] font-bold">
              <span className={`h-2 w-2 rounded-full ${wsConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}></span>
              <span className={wsConnected ? "text-emerald-300" : "text-amber-300"}>
                {wsConnected ? "LIVE WEBSOCKETS" : "CONNECTING..."}
              </span>
            </div>

            <button
              type="button"
              onClick={() => soundEffects.playNormalOrderChime()}
              title="Test audio alert sound"
              className="flex items-center gap-1 rounded-lg bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-300 hover:bg-slate-700 transition"
            >
              🔔 Sound Test
            </button>

            <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-800/50 px-2 py-1 rounded-md border border-slate-800">
              <span className="bg-slate-700 text-slate-200 px-1 rounded font-mono">[Space]</span> Accept
              <span className="ml-1 bg-slate-700 text-slate-200 px-1 rounded font-mono">[F]</span> Search
            </div>
          </div>

          <div className="hidden text-right sm:block">
            <p className="text-xs font-bold text-slate-200">
              {user?.name || "Dr. Rajesh Varma"}
            </p>
            <p className="text-[10px] text-emerald-400 font-mono">
              Reg #TS/HYD/2026/8942-R • Active Duty
            </p>
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

      {/* 2. NAVIGATION BAR */}
      <nav className="flex items-center gap-1 border-b border-slate-800 bg-slate-950/80 px-6 py-2">
        <button
          type="button"
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
            activeTab === "dashboard"
              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          📊 Dashboard Overview
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
            activeTab === "orders"
              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          📦 Incoming Orders
          {metrics.pending > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white">
              {metrics.pending}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("prescriptions")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
            activeTab === "prescriptions"
              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          📄 Prescription Audits
          {metrics.pendingRx > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-slate-950">
              {metrics.pendingRx}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("inventory")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
            activeTab === "inventory"
              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          🏷️ Inventory & Stock
          {metrics.lowStock > 0 && (
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
              {metrics.lowStock} Low
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("medicines")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
            activeTab === "medicines"
              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          💊 Medicine Catalog
        </button>

        {/* Live Production DB Sync Status & Manual Refresh */}
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 text-[11px] text-emerald-400">
            <span className={`h-2 w-2 rounded-full ${isSyncing ? "bg-amber-400 animate-spin" : "bg-emerald-400 animate-pulse"}`}></span>
            <span className="font-mono font-bold">
              {isSyncing ? "Syncing PostgreSQL..." : "PostgreSQL Live Connected"}
            </span>
          </div>

          {onRefreshOrders && (
            <button
              type="button"
              onClick={onRefreshOrders}
              disabled={isSyncing}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-emerald-600 hover:text-white transition disabled:opacity-50 cursor-pointer"
            >
              <span className={isSyncing ? "animate-spin" : ""}>🔄</span>
              <span>Sync Orders</span>
            </button>
          )}
        </div>
      </nav>

      {/* 3. MAIN BODY CONTAINER */}
      <main className="flex-1 overflow-y-auto bg-slate-900 p-6">
        {/* ========================================== */}
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {/* ========================================== */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Operational Alert Banner */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className="text-sm font-bold text-emerald-200">
                    SV Care 15-30 Min Flash Fulfillment Engine Active
                  </h3>
                  <p className="text-xs text-emerald-400/80">
                    All incoming orders require clinical validation within 3 minutes of customer checkout.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOrderStatusFilter("PENDING");
                  setActiveTab("orders");
                }}
                className="rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-black text-slate-950 hover:bg-emerald-400 transition"
              >
                Review Pending ({metrics.pending}) →
              </button>
            </div>

            {/* Metrics Grid Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Pending Review
                </p>
                <p className="mt-1 text-3xl font-black text-amber-400">
                  {metrics.pending}
                </p>
                <p className="mt-1 text-[10px] text-slate-500">Requires Pharmacist signoff</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Accepted Orders
                </p>
                <p className="mt-1 text-3xl font-black text-blue-400">
                  {metrics.accepted}
                </p>
                <p className="mt-1 text-[10px] text-slate-500">Ready to pack</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Packing in Progress
                </p>
                <p className="mt-1 text-3xl font-black text-indigo-400">
                  {metrics.packing}
                </p>
                <p className="mt-1 text-10px text-slate-500">In cold-box sorting</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Ready for Dispatch
                </p>
                <p className="mt-1 text-3xl font-black text-purple-400">
                  {metrics.ready_dispatch + metrics.packed}
                </p>
                <p className="mt-1 text-[10px] text-slate-500">Awaiting rider pickup</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Out for Delivery
                </p>
                <p className="mt-1 text-3xl font-black text-teal-400">
                  {metrics.out_delivery}
                </p>
                <p className="mt-1 text-[10px] text-slate-500">Riders en-route</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Low Stock Items
                </p>
                <p className="mt-1 text-3xl font-black text-rose-400">
                  {metrics.lowStock}
                </p>
                <p className="mt-1 text-[10px] text-slate-500">Reorder triggered</p>
              </div>
            </div>

            {/* Quick Priority Queues */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Urgent Incoming Orders */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    🚨 Urgent Order Queue (Waiting for Confirmation)
                  </h3>
                  <span className="text-xs text-slate-400">{metrics.pending} pending</span>
                </div>

                <div className="mt-4 space-y-3">
                  {orders
                    .filter((o) => (o.status || o.order_status || "").toUpperCase().includes("PENDING"))
                    .slice(0, 4)
                    .map((ord) => (
                      <div
                        key={ord.id}
                        className="flex items-center justify-between rounded-xl bg-slate-900 p-3.5 border border-slate-800 hover:border-emerald-500/50 transition"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-emerald-400 text-xs">
                              {ord.id || ord.order_number}
                            </span>
                            <span className="text-xs text-slate-300 font-semibold">
                              {ord.customer?.name}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {ord.items?.length || 0} items • ₹{ord.total} • {ord.paymentMethod?.toUpperCase()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedOrderForReview(ord)}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition"
                          >
                            Review & Verify
                          </button>
                        </div>
                      </div>
                    ))}

                  {metrics.pending === 0 && (
                    <p className="text-xs text-slate-500 py-6 text-center">
                      ✓ All incoming orders have been reviewed by the clinical team!
                    </p>
                  )}
                </div>
              </div>

              {/* Warehouse Low Stock Alerts */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    ⚠️ Critical Warehouse Inventory Alerts
                  </h3>
                  <span className="text-xs text-amber-400">{metrics.lowStock} items</span>
                </div>

                <div className="mt-4 space-y-2.5">
                  {products
                    .filter((p) => p.stock <= 15)
                    .slice(0, 4)
                    .map((prod) => (
                      <div
                        key={prod.id}
                        className="flex items-center justify-between rounded-xl bg-slate-900 p-3 border border-slate-800"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.image || "/medicines/dolo-650.jpg"}
                            alt={prod.name}
                            className="h-10 w-10 rounded-lg object-contain bg-white p-1"
                          />
                          <div>
                            <p className="text-xs font-bold text-white line-clamp-1">{prod.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              Stock:{" "}
                              <span className={prod.stock <= 0 ? "text-rose-400 font-bold" : "text-amber-400 font-bold"}>
                                {prod.stock} units left
                              </span>
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setStockAdjustModalProduct(prod);
                            setStockAdjustType("ADD");
                            setStockAdjustQty(50);
                          }}
                          className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
                        >
                          + Restock
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 2: ORDERS MANAGEMENT */}
        {/* ========================================== */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {/* Filters Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-950 p-4 border border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: "ALL", label: "All Orders" },
                  { key: "PENDING", label: `Pending Review (${metrics.pending})` },
                  { key: "IN_PROGRESS", label: "Accepted & Packing" },
                  { key: "DISPATCHED", label: "Dispatched / Delivery" },
                  { key: "DELIVERED", label: "Delivered" },
                  { key: "CANCELLED_REJECTED", label: "Cancelled / Rejected" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setOrderStatusFilter(tab.key)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      orderStatusFilter === tab.key
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search order ID, patient, phone... (Press / or F)"
                className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 w-72"
              />
            </div>

            {/* Orders Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 bg-slate-900 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3.5">Order ID & Date</th>
                    <th className="px-4 py-3.5">Patient / Customer</th>
                    <th className="px-4 py-3.5">Prescription</th>
                    <th className="px-4 py-3.5">Medicines & Qty</th>
                    <th className="px-4 py-3.5">Total & Payment</th>
                    <th className="px-4 py-3.5">Current Status</th>
                    <th className="px-4 py-3.5 text-right">Fulfillment Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredOrders.map((ord) => {
                    const st = (ord.status || ord.order_status || "").toUpperCase();
                    const isPending = st.includes("PENDING") || st === "PENDING_PHARMACIST_REVIEW";
                    const isAccepted = st === "ACCEPTED";
                    const isPacking = st === "PACKING";
                    const isPacked = st === "PACKED";
                    const isReady = st === "READY_FOR_DISPATCH";

                    return (
                      <tr key={ord.id} className="hover:bg-slate-900/60 transition">
                        <td className="px-4 py-3.5">
                          <p className="font-mono font-bold text-emerald-400">
                            {ord.id || ord.order_number}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {new Date(ord.createdAt || Date.now()).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </td>

                        <td className="px-4 py-3.5">
                          <p className="font-bold text-white">{ord.customer?.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{ord.customer?.phone}</p>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{ord.customer?.area}, {ord.customer?.city}</p>
                        </td>

                        <td className="px-4 py-3.5">
                          {ord.prescription_required ? (
                            <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                              Rx Required
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500">OTC Safe</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <p className="font-bold text-slate-200">
                            {ord.items?.length || 0} medicines
                          </p>
                          <p className="text-[10px] text-slate-400 line-clamp-1">
                            {ord.items?.map((i) => i.name).join(", ")}
                          </p>
                        </td>

                        <td className="px-4 py-3.5">
                          <p className="font-bold text-white">₹{ord.total}</p>
                          <span className="text-[10px] uppercase text-emerald-400 font-bold">
                            {ord.paymentStatus || "PAID"} • {ord.paymentMethod}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${
                              isPending
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : isAccepted
                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                : isPacking
                                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                : isPacked || isReady
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {st.replace(/_/g, " ")}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right space-x-1.5">
                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => setSelectedOrderForReview(ord)}
                                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-xs"
                              >
                                ✓ Accept / Review
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenRejectModal(ord)}
                                className="rounded-lg bg-rose-900/40 text-rose-300 border border-rose-700/50 px-2.5 py-1.5 text-xs font-bold hover:bg-rose-900 transition"
                              >
                                ✕ Reject
                              </button>
                            </>
                          )}

                          {isAccepted && (
                            <button
                              type="button"
                              onClick={() => handleStartPacking(ord.id)}
                              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition"
                            >
                              Start Packing →
                            </button>
                          )}

                          {isPacking && (
                            <button
                              type="button"
                              onClick={() => handleMarkPacked(ord.id)}
                              className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-500 transition"
                            >
                              Seal & Mark Packed →
                            </button>
                          )}

                          {isPacked && (
                            <button
                              type="button"
                              onClick={() => handleMarkReadyForDispatch(ord.id)}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition"
                            >
                              Ready for Dispatch 🚀
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onOpenInvoice && onOpenInvoice(ord)}
                            className="rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 transition"
                          >
                            🖨️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredOrders.length === 0 && (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No orders found matching the selected filter.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 3: INVENTORY & STOCK MANAGEMENT */}
        {/* ========================================== */}
        {activeTab === "inventory" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-slate-950 p-4 border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">Warehouse Inventory Control</h3>
                <p className="text-xs text-slate-400">
                  Track physical units, reserve holds, and reorder levels with automatic audit logs.
                </p>
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicine or brand..."
                className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 w-64"
              />
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 bg-slate-900 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3.5">Medicine Name</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Available Stock</th>
                    <th className="px-4 py-3.5">Reorder Level</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {products
                    .filter((p) => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-900/60 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.image || "/medicines/dolo-650.jpg"}
                              alt={prod.name}
                              className="h-9 w-9 rounded-lg object-contain bg-white p-1"
                            />
                            <div>
                              <p className="font-bold text-white">{prod.name}</p>
                              <p className="text-[10px] text-slate-400">{prod.genericName || prod.generic || "Active Salt"}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-slate-300">{prod.category || "General"}</td>

                        <td className="px-4 py-3">
                          <span className="font-mono text-sm font-black text-emerald-400">
                            {prod.stock}
                          </span>{" "}
                          <span className="text-[10px] text-slate-500">units</span>
                        </td>

                        <td className="px-4 py-3 text-slate-400 font-mono">15 units</td>

                        <td className="px-4 py-3">
                          {prod.stock <= 0 ? (
                            <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-black text-rose-400 border border-rose-500/30">
                              OUT OF STOCK
                            </span>
                          ) : prod.stock <= 15 ? (
                            <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black text-amber-400 border border-amber-500/30">
                              LOW STOCK
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-black text-emerald-400 border border-emerald-500/30">
                              IN STOCK
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setStockAdjustModalProduct(prod);
                              setStockAdjustType("ADD");
                              setStockAdjustQty(25);
                            }}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition"
                          >
                            ⚙️ Adjust Stock
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
        {/* TAB 4: PRESCRIPTION AUDITS */}
        {/* ========================================== */}
        {activeTab === "prescriptions" && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800">
              <h3 className="text-sm font-bold text-white">Patient Prescription Verification Queue</h3>
              <p className="text-xs text-slate-400">
                Prescription verification required under Drugs and Cosmetics Act 1940.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {prescriptions.map((rx) => (
                <div key={rx.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono">RX #{rx.id}</span>
                    <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                      {rx.status}
                    </span>
                  </div>

                  <div className="h-40 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 text-xs">
                    📄 Clinical Prescription Document
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onReviewPrescription && onReviewPrescription(rx.id, "APPROVED", "Approved by licensed pharmacist")}
                      className="flex-1 rounded-lg bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-500"
                    >
                      ✓ Approve Rx
                    </button>
                    <button
                      type="button"
                      onClick={() => onReviewPrescription && onReviewPrescription(rx.id, "REJECTED", "Prescription is illegible or expired")}
                      className="flex-1 rounded-lg bg-rose-900/50 border border-rose-700/50 py-2 text-xs font-bold text-rose-300 hover:bg-rose-900"
                    >
                      ✕ Reject Rx
                    </button>
                  </div>
                </div>
              ))}

              {prescriptions.length === 0 && (
                <div className="sm:col-span-3 py-12 text-center text-slate-500 text-xs">
                  ✓ No pending prescription audits in queue.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ========================================== */}
      {/* MODAL 1: CLINICAL ORDER REVIEW MODAL */}
      {/* ========================================== */}
      {selectedOrderForReview && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900 p-6 text-white shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-emerald-400">
                  Clinical Order Review • #{selectedOrderForReview.id || selectedOrderForReview.order_number}
                </h3>
                <p className="text-xs text-slate-400">Verify medicines, patient profile, and contraindications</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForReview(null)}
                className="rounded-lg bg-slate-800 p-1.5 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Patient & Address Details */}
            <div className="grid gap-3 sm:grid-cols-2 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-500">Patient Details</p>
                <p className="text-sm font-bold text-white mt-0.5">{selectedOrderForReview.customer?.name}</p>
                <p className="text-slate-400">{selectedOrderForReview.customer?.phone}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-500">Delivery Address</p>
                <p className="text-slate-300 mt-0.5">
                  {selectedOrderForReview.customer?.house}, {selectedOrderForReview.customer?.area},{" "}
                  {selectedOrderForReview.customer?.city} - {selectedOrderForReview.customer?.pincode}
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Prescribed Medicines ({selectedOrderForReview.items?.length || 0})
              </p>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-950">
                {selectedOrderForReview.items?.map((item, idx) => {
                  const tallMan = getTallManName(item.name);
                  const isLasa = tallMan !== item.name;
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white tracking-wide">
                            {tallMan}
                          </p>
                          {isLasa && (
                            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-black text-amber-300 border border-amber-500/30">
                              LASA Tall-Man
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">{item.genericName || "Standard clinical formulation"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-emerald-400">Qty: {item.quantity}</p>
                        <p className="text-[10px] text-slate-500">₹{item.price * item.quantity}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleAcceptOrder(selectedOrderForReview)}
                className="flex-1 rounded-2xl bg-emerald-600 py-3 text-xs font-black text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition"
              >
                ✓ Sign & Accept Order
              </button>
              <button
                type="button"
                onClick={() => handleOpenRejectModal(selectedOrderForReview)}
                className="rounded-2xl border border-rose-700/50 bg-rose-950/40 px-5 py-3 text-xs font-bold text-rose-300 hover:bg-rose-900 transition"
              >
                ✕ Reject with Reason
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 2: REJECT REASON REQUIRED MODAL */}
      {/* ========================================== */}
      {rejectReasonModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-rose-500/40 bg-slate-900 p-6 text-white shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-rose-400">
              🚨 Clinical Rejection Reason Required
            </h3>
            <p className="text-xs text-slate-400">
              Under medical dispensing regulations, you must specify the exact reason for rejection (e.g. invalid prescription, out of stock, dosage contraindication).
            </p>

            <textarea
              rows={3}
              value={rejectionReasonText}
              onChange={(e) => setRejectionReasonText(e.target.value)}
              placeholder="e.g. Prescription expired / Incompatible drug interaction detected with patient history."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500"
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleConfirmReject}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-500 transition"
              >
                Confirm Rejection
              </button>
              <button
                type="button"
                onClick={() => setRejectReasonModalOpen(false)}
                className="rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 3: INVENTORY ADJUSTMENT MODAL */}
      {/* ========================================== */}
      {stockAdjustModalProduct && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleStockAdjustmentSubmit}
            className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 text-white shadow-2xl space-y-4"
          >
            <div>
              <h3 className="text-sm font-black text-emerald-400">
                Adjust Physical Stock • {stockAdjustModalProduct.name}
              </h3>
              <p className="text-xs text-slate-400">Current available stock: {stockAdjustModalProduct.stock} units</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Adjustment Action</label>
                <div className="grid grid-cols-3 gap-2">
                  {["ADD", "DEDUCT", "SET"].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setStockAdjustType(mode)}
                      className={`rounded-xl py-2 font-bold text-xs ${
                        stockAdjustType === mode
                          ? "bg-emerald-500 text-slate-950 font-black"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {mode === "ADD" ? "+ Add Stock" : mode === "DEDUCT" ? "- Deduct" : "= Set Exact"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={stockAdjustQty}
                  onChange={(e) => setStockAdjustQty(parseInt(e.target.value, 10) || 0)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Audit Reason (Required)</label>
                <input
                  type="text"
                  required
                  value={stockAdjustReason}
                  onChange={(e) => setStockAdjustReason(e.target.value)}
                  placeholder="e.g. New shipment batch PO-9482 received / Damaged goods written off"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-black text-white hover:bg-emerald-500 transition"
              >
                Apply Inventory Adjustment
              </button>
              <button
                type="button"
                onClick={() => setStockAdjustModalProduct(null)}
                className="rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white"
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
