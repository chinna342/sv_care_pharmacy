import { useState, useEffect } from "react";

function DeliveryTracker({ orderId = "SV894210", onClose }) {
  const [currentStep, setCurrentStep] = useState(3); // 1 to 5
  const [etaMinutes, setEtaMinutes] = useState(18);

  // Simulate progress step countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setEtaMinutes((prev) => {
        if (prev <= 1) return 1;
        return prev - 1;
      });
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    { id: 1, title: "Order Placed", time: "2 mins ago", icon: "📝", desc: "Order received and queued at local SV Care Hub" },
    { id: 2, title: "Pharmacist Verified", time: "Just now", icon: "👨‍⚕️", desc: "Batch # & expiry audited by licensed Pharmacist" },
    { id: 3, title: "Cold-Chain Packed", time: "In Progress", icon: "📦", desc: "Packed in temperature-controlled tamper-evident seal" },
    { id: 4, title: "Rider Dispatched", time: `ETA: ${etaMinutes} mins`, icon: "⚡", desc: "Rider en route on eco electric express EV" },
    { id: 5, title: "Doorstep Delivery", time: "Pending", icon: "🏡", desc: "Contactless delivery with OTP verification" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 px-6 py-5 text-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h2 className="text-xl font-extrabold tracking-tight">Live Delivery GPS Tracker</h2>
            </div>
            <p className="text-xs text-emerald-100 mt-0.5">
              Order ID: <span className="font-mono font-bold tracking-wider">{orderId}</span>
            </p>
          </div>
          <button
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
          <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur">
                ⚡ Express 15-30 Min Flash Dispatch
              </span>
              <h3 className="mt-2 text-3xl font-black">
                Arriving in ~{etaMinutes} Mins
              </h3>
              <p className="mt-1 text-xs text-emerald-100">
                Your order is currently being transported in a certified cold-chain box (18°C - 24°C).
              </p>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur-md">
              🛵
            </div>
          </div>

          {/* Interactive Delivery Steps Timeline */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              Real-Time Fulfillment Timeline
            </h4>
            <div className="space-y-4">
              {steps.map((step) => {
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;

                return (
                  <div key={step.id} className="flex items-start gap-4">
                    {/* Circle Icon */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-lg font-bold transition ${
                        isCompleted
                          ? "bg-emerald-600 text-white shadow-sm"
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
                        <p className={`text-sm font-bold ${isCurrent ? "text-amber-700" : isCompleted ? "text-emerald-800" : "text-slate-500"}`}>
                          {step.title}
                        </p>
                        <span className="text-xs font-semibold text-slate-500">{step.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Step Simulator Switchers for Demonstration */}
            <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-slate-200">
              <span className="text-[11px] font-bold text-slate-400">Simulation Controls:</span>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setCurrentStep(s)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    currentStep === s
                      ? "bg-emerald-700 text-white"
                      : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Stage {s}
                </button>
              ))}
            </div>
          </div>

          {/* Assigned Driver Profile Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl font-bold text-emerald-800">
                👨‍✈️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-800">Vikram S. (SV Express Executive)</p>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.2 text-[10px] font-bold text-emerald-800">
                    ★ 4.97 (1,840 Deliveries)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Eco Electric Vehicle: <span className="font-mono font-semibold">TS 09 EV 4820</span> • Vaccinated & Sanitized
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => alert("Calling delivery executive Vikram (+91 98765 43210)...")}
              className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
            >
              📞 Call Rider
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex justify-between items-center">
          <span className="text-xs text-slate-500">
            🛡️ 100% On-Time Guarantee or ₹100 Cashback credited to SV Wallet.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-900"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeliveryTracker;
