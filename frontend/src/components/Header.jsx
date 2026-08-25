function Header({ onScrollToMedicines }) {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-[#062c26] via-[#08332c] to-[#041a16] text-white">
      {/* Subtle Background Glow Elements */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-teal-500/10 blur-[100px]" />

      {/* Main Hero Container */}
      <div className="relative mx-auto grid max-w-[1400px] items-center gap-8 lg:gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-12 lg:px-8">
        
        {/* LEFT COLUMN (approx 58% width) */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-5">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>YOUR HEALTH, DELIVERED FAST</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.15] tracking-tight text-white max-w-2xl">
            Medicines Delivered to Your Door in{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
              15–30 Minutes.
            </span>
          </h1>

          {/* Supporting text */}
          <p className="max-w-xl text-sm sm:text-base leading-relaxed text-emerald-100/80">
            Genuine medicines and everyday healthcare essentials from trusted brands, delivered quickly to your doorstep.
          </p>

          {/* Compact Horizontal CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Primary CTA */}
            <button
              type="button"
              onClick={onScrollToMedicines}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 px-6 py-3 text-xs sm:text-sm font-black text-slate-950 shadow-lg shadow-emerald-500/20 hover:from-emerald-300 hover:to-teal-300 active:scale-95 transition cursor-pointer"
            >
              <span>💊</span>
              <span>Shop Medicines →</span>
            </button>

            {/* Secondary CTA: Upload Prescription */}
            <label className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-xs sm:text-sm font-bold text-white backdrop-blur-md hover:bg-white/15 active:scale-95 transition cursor-pointer">
              <span>📤</span>
              <span>Upload Prescription</span>
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    alert(`Prescription "${e.target.files[0].name}" received! Our pharmacist is verifying it.`);
                  }
                }}
              />
            </label>
          </div>
        </div>

        {/* RIGHT COLUMN (approx 42% width) - Neutral Delivery Tracking Card */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-sm">
            {/* ONLY ONE Subtle Floating Badge */}
            <div className="absolute -top-3.5 right-2 z-10 hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-slate-950/90 px-3 py-1 text-[11px] font-black text-emerald-300 shadow-xl backdrop-blur-md">
              <span>⚡</span>
              <span>18 min average delivery</span>
            </div>

            {/* Single Rounded Glass Panel */}
            <div className="rounded-2xl sm:rounded-3xl border border-white/15 bg-white/[0.08] p-5 sm:p-6 backdrop-blur-xl shadow-2xl space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-300">
                    SV CARE EXPRESS
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-200/70">
                  Live Status
                </span>
              </div>

              {/* Order Card Row */}
              <div className="flex items-center gap-3.5 rounded-xl bg-white/95 p-3.5 text-slate-900 shadow-md">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-xl shadow-xs">
                  🛍️
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Verified Healthcare Order</p>
                  <h3 className="font-extrabold text-sm text-slate-900 truncate">Your Healthcare Order</h3>
                </div>
                <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700 border border-emerald-200/60">
                  ⚡ Express
                </span>
              </div>

              {/* Simple Delivery Progress Timeline */}
              <div className="rounded-xl bg-white/[0.06] border border-white/10 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span>✓</span> Order confirmed
                  </span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span>✓</span> Packed
                  </span>
                  <span className="text-white bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/40 flex items-center gap-1 font-extrabold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping inline-block" /> Out for delivery
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-300" />
                </div>

                {/* Bottom Status */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="font-extrabold text-emerald-300 flex items-center gap-1.5">
                    <span>⚡</span> Arriving in ~18 min
                  </span>
                  <span className="text-slate-400 text-[11px] flex items-center gap-1 font-medium">
                    <span>🛵</span> Express Rider Dispatch
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}

export default Header;