import { useState } from "react";
import { bmiAdviceMap } from "../data/healthData";
import products from "../data/products";

function HealthTools({ isOpen, onClose, onAddToCart }) {
  const [activeTool, setActiveTool] = useState("bmi"); // 'bmi' | 'savings' | 'reminder'

  // BMI State
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(68);
  const [bmiResult, setBmiResult] = useState(null);

  // Generic Comparator State
  const [selectedBrandMedId, setSelectedBrandMedId] = useState(7); // Augmentin default

  // Pill Reminder State
  const [reminders, setReminders] = useState([
    { id: 1, medName: "Dolo 650mg", time: "08:00 AM", slot: "Morning after breakfast", enabled: true },
    { id: 2, medName: "Telma 40", time: "09:00 AM", slot: "Morning with water", enabled: true },
    { id: 3, medName: "Zincovit Multivitamin", time: "01:30 PM", slot: "After lunch", enabled: true },
  ]);
  const [newMedName, setNewMedName] = useState("");
  const [newTime, setNewTime] = useState("08:00");
  const [newSlot, setNewSlot] = useState("Morning");
  const [alarmPlaying, setAlarmPlaying] = useState(false);

  // Calculate BMI
  const calculateBmi = (e) => {
    e?.preventDefault();
    const hMeter = height / 100;
    const val = (weight / (hMeter * hMeter)).toFixed(1);

    let category;
    if (val < 18.5) category = "underweight";
    else if (val <= 24.9) category = "normal";
    else if (val <= 29.9) category = "overweight";
    else category = "obese";

    setBmiResult({
      score: val,
      ...bmiAdviceMap[category],
    });
  };

  // Add Reminder
  const addReminder = (e) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    setReminders((prev) => [
      ...prev,
      {
        id: Date.now(),
        medName: newMedName.trim(),
        time: newTime,
        slot: newSlot,
        enabled: true,
      },
    ]);
    setNewMedName("");
  };

  const toggleReminder = (id) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const deleteReminder = (id) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const testAlarm = () => {
    setAlarmPlaying(true);
    // Simple Web Audio synth beep
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio context fallback
    }
    setTimeout(() => setAlarmPlaying(false), 1200);
  };

  if (!isOpen) return null;

  // Selected Brand Product for Savings Calculator
  const selectedProduct = products.find((p) => p.id === Number(selectedBrandMedId)) || products[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-2xl backdrop-blur-md">
              🧮
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Interactive Health Suite</h2>
              <p className="text-xs text-emerald-100">Calculators, dosage alarms & generic medicine cost optimizers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Tool Switcher Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTool("bmi")}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 ${
              activeTool === "bmi"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            ⚖️ BMI & Wellness Advisor
          </button>
          <button
            type="button"
            onClick={() => setActiveTool("savings")}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 ${
              activeTool === "savings"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            💡 Generic Medicine Savings
          </button>
          <button
            type="button"
            onClick={() => setActiveTool("reminder")}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 ${
              activeTool === "reminder"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            ⏰ Daily Pill & Dose Reminder
          </button>
        </div>

        {/* Tool Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* ========================================== */}
          {/* 1. BMI CALCULATOR */}
          {/* ========================================== */}
          {activeTool === "bmi" && (
            <div className="space-y-6">
              <form onSubmit={calculateBmi} className="grid gap-5 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <label className="text-xs font-bold text-slate-700 block">Height (in cm): {height} cm</label>
                  <input
                    type="range"
                    min="120"
                    max="220"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full mt-3 accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>120 cm</span>
                    <span>170 cm</span>
                    <span>220 cm</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <label className="text-xs font-bold text-slate-700 block">Weight (in kg): {weight} kg</label>
                  <input
                    type="range"
                    min="35"
                    max="150"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full mt-3 accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>35 kg</span>
                    <span>70 kg</span>
                    <span>150 kg</span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-emerald-600 py-3.5 text-xs font-extrabold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition"
                  >
                    Calculate BMI & Personalized Health Plan →
                  </button>
                </div>
              </form>

              {/* BMI Output */}
              {bmiResult && (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase">Your Body Mass Index</span>
                      <p className="text-4xl font-black text-emerald-700">{bmiResult.score}</p>
                    </div>
                    <span className={`rounded-2xl px-4 py-2 text-xs font-extrabold border ${bmiResult.badgeColor}`}>
                      {bmiResult.title}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-700 font-medium">{bmiResult.advice}</p>

                  {/* Recommended Products */}
                  {bmiResult.recommendedProducts && (
                    <div className="pt-3 border-t border-emerald-200">
                      <p className="text-xs font-bold text-emerald-900 mb-2">
                        🌿 Clinical Supplements Recommended for Your Profile:
                      </p>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {bmiResult.recommendedProducts.map((pid) => {
                          const prod = products.find((p) => p.id === pid);
                          if (!prod) return null;
                          return (
                            <div key={pid} className="rounded-xl border border-emerald-100 bg-white p-3 text-xs flex flex-col justify-between">
                              <div>
                                <p className="font-bold text-slate-800 truncate">{prod.name}</p>
                                <p className="text-emerald-700 font-black mt-1">₹{prod.price}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  onAddToCart(prod);
                                  alert(`Added ${prod.name} to cart!`);
                                }}
                                className="mt-2 w-full rounded-full bg-emerald-600 hover:bg-emerald-700 border border-emerald-600 py-1.5 text-[11px] font-bold text-white shadow-xs active:scale-95 transition"
                              >
                                🛒 Add to cart
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================== */}
          {/* 2. GENERIC SAVINGS CALCULATOR */}
          {/* ========================================== */}
          {activeTool === "savings" && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Select a Branded Prescription Medicine to Compare:
                </label>
                <select
                  value={selectedBrandMedId}
                  onChange={(e) => setSelectedBrandMedId(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-bold text-slate-800 outline-none focus:border-emerald-600"
                >
                  {products
                    .filter((p) => p.genericSubstitute)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (₹{p.price}) — {p.category}
                      </option>
                    ))}
                </select>
              </div>

              {selectedProduct.genericSubstitute && (
                <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Branded */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Branded Medication
                      </span>
                      <h4 className="text-base font-extrabold text-slate-800 mt-1">{selectedProduct.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{selectedProduct.manufacturer}</p>
                      <p className="text-2xl font-black text-slate-800 mt-4">₹{selectedProduct.price}</p>
                      <p className="text-[11px] text-slate-400">Monthly (3 strips): ₹{selectedProduct.price * 3}</p>
                      <p className="text-[11px] text-slate-400">Annual: ₹{selectedProduct.price * 36}</p>
                    </div>

                    {/* Generic */}
                    <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 p-5 relative overflow-hidden">
                      <span className="absolute top-0 right-0 rounded-bl-xl bg-emerald-600 px-3 py-1 text-[10px] font-extrabold text-white">
                        {selectedProduct.genericSubstitute.savings}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                        SV Certified Bio-Generic
                      </span>
                      <h4 className="text-base font-extrabold text-slate-800 mt-1">
                        {selectedProduct.genericSubstitute.name}
                      </h4>
                      <p className="text-xs text-emerald-700 mt-0.5">Identical Active Chemical & Quality</p>
                      <p className="text-2xl font-black text-emerald-700 mt-4">
                        ₹{selectedProduct.genericSubstitute.price}
                      </p>
                      <p className="text-[11px] text-emerald-800 font-semibold">
                        Monthly (3 strips): ₹{selectedProduct.genericSubstitute.price * 3}
                      </p>
                      <p className="text-[11px] text-emerald-800 font-bold">
                        Annual Savings: ₹
                        {(selectedProduct.price - selectedProduct.genericSubstitute.price) * 36} / year!
                      </p>
                    </div>
                  </div>

                  {/* Add Generic Button */}
                  <button
                    type="button"
                    onClick={() => {
                      onAddToCart({
                        ...selectedProduct,
                        name: selectedProduct.genericSubstitute.name,
                        price: selectedProduct.genericSubstitute.price,
                      });
                      alert(`Added ${selectedProduct.genericSubstitute.name} to cart!`);
                    }}
                    className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700 border border-emerald-600 py-3 text-xs font-extrabold text-white shadow-md hover:shadow-lg shadow-emerald-600/30 transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>🛒</span>
                    <span>
                      Add {selectedProduct.genericSubstitute.name} to cart (₹
                      {selectedProduct.genericSubstitute.price})
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================== */}
          {/* 3. PILL & DOSE REMINDER */}
          {/* ========================================== */}
          {activeTool === "reminder" && (
            <div className="space-y-6">
              {/* Add Reminder Form */}
              <form onSubmit={addReminder} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_120px_130px_auto]">
                <input
                  type="text"
                  placeholder="Medicine name (e.g. Paracetamol)"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-600"
                />
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-600"
                />
                <select
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none"
                >
                  <option>Morning</option>
                  <option>Afternoon</option>
                  <option>Evening</option>
                  <option>Bedtime</option>
                </select>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
                >
                  + Add Dose
                </button>
              </form>

              {/* Reminders List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Active Daily Dosages ({reminders.length})
                  </h4>
                  <button
                    type="button"
                    onClick={testAlarm}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                      alarmPlaying
                        ? "bg-amber-500 text-white animate-bounce"
                        : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                    }`}
                  >
                    <span>🔔</span> {alarmPlaying ? "Alarm Sounding..." : "Test Alarm Chime"}
                  </button>
                </div>

                <div className="space-y-2">
                  {reminders.map((rem) => (
                    <div
                      key={rem.id}
                      className={`flex items-center justify-between rounded-2xl border p-4 transition ${
                        rem.enabled
                          ? "border-emerald-200 bg-emerald-50/40"
                          : "border-slate-200 bg-white opacity-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={rem.enabled}
                          onChange={() => toggleReminder(rem.id)}
                          className="h-4 w-4 rounded accent-emerald-600"
                        />
                        <div>
                          <p className="font-extrabold text-slate-800 text-xs">{rem.medName}</p>
                          <p className="text-[11px] text-slate-500">
                            ⏰ {rem.time} • {rem.slot}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteReminder(rem.id)}
                        className="text-xs font-bold text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex justify-between items-center">
          <span className="text-xs text-slate-400">SV Care Intelligent Clinical Tools v2.0</span>
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

export default HealthTools;
