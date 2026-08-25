import { useState, useEffect } from "react";

export default function DeliveryTracker({ orderId = "SV894210", orderStatus = null, onClose }) {
  const [etaMinutes, setEtaMinutes] = useState(18);

  useEffect(() => {
    const timer = setInterval(() => {
      setEtaMinutes((prev) => (prev <= 1 ? 1 : prev - 1));
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  // Map order status string to 1-7 step index
  const getStepIndex = (statusStr) => {
    if (!statusStr) return 3;
    const s = statusStr.toUpperCase();
    if (s.includes("PENDING")) return 1;
    if (s === "ACCEPTED") return 2;
    if (s === "PACKING") return 3;
    if (s === "PACKED") return 4;
    if (s === "READY_FOR_DISPATCH") return 5;
    if (s === "OUT_FOR_DELIVERY") return 6;
    if (s === "DELIVERED") return 7;
    return 3;
  };

  const currentStep = getStepIndex(orderStatus);

  const steps = [
    { id: 1, key: "PENDING_PHARMACIST_REVIEW", title: "Order Placed", time: "Confirmed", icon: "📝", desc: "Order received & queued for clinical pharmacist review" },
    { id: 2, key: "ACCEPTED", title: "Pharmacist Verified", time: "Audited", icon: "👨‍⚕️", desc: "Batch #, dosage, and interactions approved by Licensed Pharmacist" },
    { id: 3, key: "PACKING", title: "Cold-Chain Packing", time: "In Progress", icon: "🧊", desc: "Placed in 18°C - 24°C insulated cold-box with ice packs" },
    { id: 4, key: "PACKED", title: "Tamper-Proof Sealed", time: "Sealed", icon: "📦", desc: "Packed in barcoded clinical security pouch" },
    { id: 5, key: "READY_FOR_DISPATCH", title: "Ready for Dispatch", time: "Staged", icon: "🏢", desc: "Transferred to SV Care express dispatch hub" },
    { id: 6, key: "OUT_FOR_DELIVERY", title: "Rider Out for Delivery", time: `~${etaMinutes} mins`, icon: "⚡", desc: "Electric express EV rider en-route to your address" },
    { id: 7, key: "DELIVERED", title: "Doorstep Delivered", time: "Final", icon: "🏡", desc: "Contactless delivery verified with digital OTP" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 px-6 py-5 text-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h2 className="text-xl font-extrabold tracking-tight">Live Cold-Chain GPS Tracker</h2>
            </div>
            <p className="text-xs text-emerald-100 mt-0.5">
              Order ID: <span className="font-mono font-bold tracking-wider">{orderId}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xl text-white transition hover:bg-white/20"
            aria-label="Close tracker"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Live ETA Banner */}
          <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur">
                ⚡ Express 15-30 Min Flash Dispatch
              </span>
              <h3 className="mt-2 text-3xl font-black">
                {currentStep >= 7 ? "Order Delivered Successfully!" : `Arriving in ~${etaMinutes} Mins`}
              </h3>
              <p className="mt-1 text-xs text-emerald-100">
                Preserved in temperature-monitored cold-box (18°C - 24°C) with GPS tracking.
              </p>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur-md">
              🛵
            </div>
          </div>

          {/* 7-Step Interactive State Machine Timeline */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              7-Stage Fulfillment State Machine
            </h4>
            <div className="space-y-3.5">
              {steps.map((step) => {
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;

                return (
                  <div key={step.id} className="flex items-start gap-4">
                    {/* Step Icon */}
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition ${
                        isCompleted
                          ? "bg-emerald-600 text-white shadow-xs"
                          : isCurrent
                          ? "bg-amber-500 text-white animate-pulse shadow-md ring-4 ring-amber-100"
                          : "bg-slate-200 text-slate-400"
                      }`}
                    >
                      {isCompleted ? "✓" : step.icon}
                    </div>

                    {/* Step Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-xs font-bold ${
                            isCurrent ? "text-amber-700" : isCompleted ? "text-emerald-800" : "text-slate-500"
                          }`}
                        >
                          {step.title}
                        </p>
                        <span className="text-[11px] font-semibold text-slate-400">{step.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
          <p className="text-xs text-slate-500">
            Emergency helpline: <span className="font-bold text-slate-800">1800-SV-CARE (24x7)</span>
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
          >
            Close Tracker
          </button>
        </div>
      </div>
    </div>
  );
}
