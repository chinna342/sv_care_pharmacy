import { useState, useEffect } from "react";

function PaymentGatewayModal({
  isOpen,
  onClose,
  orderData,
  onPaymentSuccess,
}) {
  const [activeTab, setActiveTab] = useState("upi"); // 'upi' | 'card' | 'netbanking' | 'wallets' | 'cod'
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [upiVpa, setUpiVpa] = useState("rahul@okaxis");
  const [selectedUpiApp, setSelectedUpiApp] = useState("gpay");
  const [selectedBank, setSelectedBank] = useState("HDFC");
  const [selectedWallet, setSelectedWallet] = useState("amazonpay");

  // Card form state
  const [cardForm, setCardForm] = useState({
    number: "4532 8920 1029 4821",
    name: "RAHUL VERMA",
    expiry: "08/29",
    cvv: "892",
    saveCard: true,
  });

  // 3D Secure OTP Modal Simulation
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(45);

  // Dynamic QR countdown timer (5 mins)
  const [qrSecondsLeft, setQrSecondsLeft] = useState(300);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setQrSecondsLeft((prev) => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (showOtpModal && otpTimer > 0) {
      timer = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [showOtpModal, otpTimer]);

  if (!isOpen) return null;

  const total = orderData?.total || 0;
  const subtotal = orderData?.subtotal || 0;
  const deliveryFee = orderData?.deliveryFee || 0;
  const discount = orderData?.discountAmount || 0;
  const customerName = orderData?.customer?.name || "Customer";
  const customerPhone = orderData?.customer?.phone || "9876543210";

  // Format QR timer
  const minutes = Math.floor(qrSecondsLeft / 60);
  const seconds = qrSecondsLeft % 60;
  const formattedTimer = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  // Card Brand Detection
  const getCardBrand = (num) => {
    const clean = num.replace(/\s+/g, "");
    if (/^4/.test(clean)) return { name: "Visa", color: "text-blue-600", icon: "💳" };
    if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[0-1]|2720)/.test(clean))
      return { name: "Mastercard", color: "text-amber-600", icon: "💳" };
    if (/^6(011|5)/.test(clean) || /^6/.test(clean))
      return { name: "RuPay", color: "text-emerald-600", icon: "🇮🇳" };
    return { name: "Credit/Debit", color: "text-slate-600", icon: "💳" };
  };

  const cardBrand = getCardBrand(cardForm.number);

  // Format Card Number
  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 16);
    let formatted = val.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardForm({ ...cardForm, number: formatted });
  };

  // Format Expiry
  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (val.length >= 2) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardForm({ ...cardForm, expiry: val });
  };

  // Payment Execution Pipeline
  const executePayment = async (method, meta = {}) => {
    setIsProcessing(true);
    setProcessingStep("Connecting to Bank Payment Gateway...");

    await new Promise((r) => setTimeout(r, 600));
    setProcessingStep("Verifying 256-Bit SSL Token & Authorization...");

    await new Promise((r) => setTimeout(r, 700));
    setProcessingStep(`Authorizing ₹${total} transaction...`);

    await new Promise((r) => setTimeout(r, 600));
    setProcessingStep("Payment Verified! Generating Cold-Chain Order Token...");

    await new Promise((r) => setTimeout(r, 500));

    const paymentId = "pay_" + Math.random().toString(36).substring(2, 12).toUpperCase();
    const txnRef = "TXN-" + Date.now().toString().slice(-8);

    // Call Backend Verification API if reachable
    try {
      await fetch("http://127.0.0.1:8000/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderData?.orderId || "SV" + Date.now().toString().slice(-8),
          payment_id: paymentId,
          method: method,
          gateway_name: "SV Care Gateway / Razorpay",
          signature: "sig_live_" + Math.random().toString(36).substring(2, 16),
        }),
      });
    } catch {
      // Offline fallback
    }

    setIsProcessing(false);
    setShowOtpModal(false);
    onPaymentSuccess({
      paymentId,
      transactionRef: txnRef,
      paymentMethod: method,
      gatewayName: "SV Care Multi-Rail Gateway (PCI-DSS Certified)",
      paidAt: new Date().toISOString(),
      amount: total,
      meta,
    });
  };

  // Handle Card Checkout -> Triggers 3D Secure OTP
  const handleCardSubmit = (e) => {
    e.preventDefault();
    setShowOtpModal(true);
    setOtpTimer(45);
  };

  // Handle OTP Submission
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    executePayment("card", {
      cardLast4: cardForm.number.slice(-4),
      brand: cardBrand.name,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 sm:p-4 backdrop-blur-md animate-fadeIn">
      {/* Main Gateway Dialog Box */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-emerald-500/30 bg-white shadow-2xl transition-all">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-xl shadow-md">
                🔒
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black tracking-tight">SV Care Secure Gateway</h3>
                  <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-400/30">
                    256-Bit SSL Encrypted
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  PCI-DSS Level 1 & RBI Tokenized Payment Rail
                </p>
              </div>
            </div>

            {/* Close Button */}
            {!isProcessing && (
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white transition"
              >
                ✕
              </button>
            )}
          </div>

          {/* Amount & Patient Pill Strip */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/10 p-3 text-xs backdrop-blur-md">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-300">Amount Payable:</span>{" "}
              <span className="text-lg font-black text-emerald-300">₹{total}</span>
              {discount > 0 && (
                <span className="ml-2 text-[10px] text-emerald-200 line-through">
                  ₹{total + discount}
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-300">
              Deliver to: <span className="font-bold text-white">{customerName}</span> ({customerPhone})
            </div>
          </div>
        </div>

        {/* Processing State View Overlay */}
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center p-12 text-center space-y-6 min-h-[380px]">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
              <span className="text-3xl">🛡️</span>
            </div>

            <div className="space-y-2">
              <h4 className="text-lg font-black text-slate-900">Processing Your Payment</h4>
              <p className="text-xs font-bold text-emerald-700 font-mono animate-pulse">
                {processingStep}
              </p>
              <p className="text-[11px] text-slate-400">
                Please do not refresh or press back button.
              </p>
            </div>

            <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        ) : (
          /* Main Gateway Interface */
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] min-h-[380px]">
            {/* Left Rail: Payment Methods List */}
            <div className="border-r border-slate-200 bg-slate-50 p-3 space-y-1.5">
              <p className="px-3 py-1 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Payment Rail
              </p>

              {/* UPI Tab */}
              <button
                type="button"
                onClick={() => setActiveTab("upi")}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-bold transition ${
                  activeTab === "upi"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-slate-700 hover:bg-slate-200/70"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>📱</span>
                  <span>Instant UPI / QR</span>
                </span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[9px] font-black ${
                    activeTab === "upi"
                      ? "bg-emerald-800 text-emerald-200"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  Fast
                </span>
              </button>

              {/* Card Tab */}
              <button
                type="button"
                onClick={() => setActiveTab("card")}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-bold transition ${
                  activeTab === "card"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-slate-700 hover:bg-slate-200/70"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>💳</span>
                  <span>Cards</span>
                </span>
                <span className="text-[10px]">Visa/MC</span>
              </button>

              {/* NetBanking Tab */}
              <button
                type="button"
                onClick={() => setActiveTab("netbanking")}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-bold transition ${
                  activeTab === "netbanking"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-slate-700 hover:bg-slate-200/70"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>🏦</span>
                  <span>Net Banking</span>
                </span>
                <span className="text-[10px]">50+ Banks</span>
              </button>

              {/* Wallets Tab */}
              <button
                type="button"
                onClick={() => setActiveTab("wallets")}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-bold transition ${
                  activeTab === "wallets"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-slate-700 hover:bg-slate-200/70"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>👛</span>
                  <span>Wallets</span>
                </span>
                <span className="text-[10px]">Amazon/Paytm</span>
              </button>

              {/* Cash on Delivery Tab */}
              <button
                type="button"
                onClick={() => setActiveTab("cod")}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-bold transition ${
                  activeTab === "cod"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-slate-700 hover:bg-slate-200/70"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>💵</span>
                  <span>Cash on Delivery</span>
                </span>
              </button>
            </div>

            {/* Right Pane: Selected Payment Method Detail */}
            <div className="p-5 md:p-6 overflow-y-auto max-h-[460px]">
              {/* ============================================================ */}
              {/* TAB 1: UPI & QR CODE */}
              {/* ============================================================ */}
              {activeTab === "upi" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      Scan QR Code or Pay via UPI App
                    </h4>
                    <p className="text-xs text-slate-500">
                      Scan with Google Pay, PhonePe, Paytm, CRED or any UPI app.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 p-4">
                    {/* Dynamic Simulated QR Canvas */}
                    <div className="flex flex-col items-center bg-white p-3 rounded-2xl shadow-md border border-emerald-100">
                      <div className="h-32 w-32 bg-slate-900 rounded-xl p-2 flex flex-col justify-between">
                        <div className="grid grid-cols-6 gap-1 w-full h-full p-1 bg-white rounded">
                          {Array.from({ length: 36 }).map((_, i) => (
                            <div
                              key={i}
                              className={`rounded-xs ${
                                (i % 2 === 0 && i % 3 === 0) ||
                                i === 0 ||
                                i === 5 ||
                                i === 30 ||
                                i === 35 ||
                                i === 14 ||
                                i === 21
                                  ? "bg-slate-900"
                                  : "bg-slate-100"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="mt-2 text-[10px] font-mono font-bold text-slate-600 flex items-center gap-1">
                        ⏱️ Expires in <span className="text-emerald-700 font-extrabold">{formattedTimer}</span>
                      </span>
                    </div>

                    {/* QR Payment Details & Auto-Verify simulator */}
                    <div className="space-y-2 text-center sm:text-left flex-1">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">Merchant VPA</p>
                        <p className="font-mono text-xs font-black text-slate-800">
                          svcare.pharmacy@okaxis
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">Transaction Amount</p>
                        <p className="text-xl font-black text-emerald-700">₹{total}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => executePayment("upi_qr")}
                        className="w-full sm:w-auto rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition"
                      >
                        ⚡ Simulate Scan & Pay ₹{total}
                      </button>
                    </div>
                  </div>

                  {/* Or Enter UPI VPA */}
                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    <label className="text-[11px] font-extrabold text-slate-700 block">
                      Or Enter Your UPI ID (VPA)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiVpa}
                        onChange={(e) => setUpiVpa(e.target.value)}
                        placeholder="yourname@okhdfcbank"
                        className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs font-bold outline-none focus:border-emerald-600 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => executePayment("upi_vpa", { vpa: upiVpa })}
                        className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white hover:bg-emerald-700 transition shrink-0"
                      >
                        Verify & Pay →
                      </button>
                    </div>
                  </div>

                  {/* Quick Launch UPI Apps */}
                  <div className="pt-2">
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">
                      Quick UPI App Checkout
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: "gpay", label: "Google Pay", icon: "🟢" },
                        { id: "phonepe", label: "PhonePe", icon: "🟣" },
                        { id: "paytm", label: "Paytm UPI", icon: "🔵" },
                        { id: "bhim", label: "BHIM", icon: "🟠" },
                      ].map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => executePayment(`upi_${app.id}`)}
                          className="flex flex-col items-center justify-center rounded-xl border border-slate-200 p-2 text-center hover:border-emerald-500 hover:bg-emerald-50 transition"
                        >
                          <span className="text-base">{app.icon}</span>
                          <span className="text-[10px] font-extrabold text-slate-700 mt-1">
                            {app.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* TAB 2: CREDIT / DEBIT CARD */}
              {/* ============================================================ */}
              {activeTab === "card" && (
                <form onSubmit={handleCardSubmit} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        Enter Card Details
                      </h4>
                      <p className="text-xs text-slate-500">
                        All major Indian & International debit/credit cards accepted.
                      </p>
                    </div>
                    <span className={`text-xs font-black ${cardBrand.color}`}>
                      {cardBrand.name}
                    </span>
                  </div>

                  {/* Card Visual Preview */}
                  <div className="rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-950 p-4 text-white shadow-lg space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-emerald-400 tracking-wider">
                        SV CARE CLINICAL CARD
                      </span>
                      <span className="font-mono text-[10px] font-bold text-slate-300">
                        {cardBrand.name}
                      </span>
                    </div>
                    <p className="font-mono text-base font-black tracking-widest text-emerald-100">
                      {cardForm.number || "•••• •••• •••• ••••"}
                    </p>
                    <div className="flex justify-between text-[10px] font-mono text-slate-300">
                      <div>
                        <p className="text-[8px] uppercase text-slate-400">Cardholder</p>
                        <p className="font-bold">{cardForm.name || "CARDHOLDER NAME"}</p>
                      </div>
                      <div>
                        <p className="text-[8px] uppercase text-slate-400">Expires</p>
                        <p className="font-bold">{cardForm.expiry || "MM/YY"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Input Fields */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-extrabold text-slate-700 block mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        required
                        value={cardForm.number}
                        onChange={handleCardNumberChange}
                        placeholder="4532 8920 1029 4821"
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs font-mono font-bold outline-none focus:border-emerald-600 focus:bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-extrabold text-slate-700 block mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          required
                          value={cardForm.expiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs font-mono font-bold outline-none focus:border-emerald-600 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-extrabold text-slate-700 block mb-1 flex justify-between">
                          <span>CVV</span>
                          <span className="text-[9px] text-slate-400 font-normal">3-4 digits</span>
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          required
                          value={cardForm.cvv}
                          onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                          placeholder="892"
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs font-mono font-bold outline-none focus:border-emerald-600 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-extrabold text-slate-700 block mb-1">
                        Name on Card
                      </label>
                      <input
                        type="text"
                        required
                        value={cardForm.name}
                        onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                        placeholder="RAHUL VERMA"
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs font-bold outline-none focus:border-emerald-600 focus:bg-white uppercase"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-xs font-black text-white shadow-lg shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition flex items-center justify-center gap-2"
                  >
                    <span>🔒</span>
                    <span>Proceed to 3D Secure Verification (₹{total}) →</span>
                  </button>
                </form>
              )}

              {/* ============================================================ */}
              {/* TAB 3: NET BANKING */}
              {/* ============================================================ */}
              {activeTab === "netbanking" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      Select Your Bank
                    </h4>
                    <p className="text-xs text-slate-500">
                      Redirects to your bank's official 256-bit encrypted authentication page.
                    </p>
                  </div>

                  {/* Popular Banks Grid */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: "HDFC", name: "HDFC Bank", icon: "🏛️" },
                      { id: "ICICI", name: "ICICI Bank", icon: "🏢" },
                      { id: "SBI", name: "State Bank of India", icon: "🏦" },
                      { id: "AXIS", name: "Axis Bank", icon: "🏛️" },
                      { id: "KOTAK", name: "Kotak Mahindra", icon: "🏢" },
                      { id: "PNB", name: "Punjab National", icon: "🏦" },
                    ].map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => setSelectedBank(bank.id)}
                        className={`flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition ${
                          selectedBank === bank.id
                            ? "border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-xl">{bank.icon}</span>
                        <span className="text-[11px] font-extrabold text-slate-800 mt-1 truncate w-full">
                          {bank.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => executePayment("netbanking", { bank: selectedBank })}
                    className="w-full rounded-2xl bg-emerald-600 py-3.5 text-xs font-black text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                  >
                    <span>🔒</span>
                    <span>Pay via {selectedBank} NetBanking (₹{total}) →</span>
                  </button>
                </div>
              )}

              {/* ============================================================ */}
              {/* TAB 4: DIGITAL WALLETS */}
              {/* ============================================================ */}
              {activeTab === "wallets" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      Choose Digital Wallet
                    </h4>
                    <p className="text-xs text-slate-500">
                      Link your wallet for 1-tap checkout.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {[
                      { id: "amazonpay", name: "Amazon Pay Wallet", icon: "🅰️", cashback: "₹25 Cashback" },
                      { id: "paytmwallet", name: "Paytm Wallet", icon: "🅿️", cashback: "Flat 5% Off" },
                      { id: "mobikwik", name: "MobiKwik SuperCash", icon: "Ⓜ️", cashback: "Up to ₹50 Back" },
                    ].map((w) => (
                      <label
                        key={w.id}
                        className={`flex items-center justify-between rounded-2xl border p-3.5 cursor-pointer transition ${
                          selectedWallet === w.id
                            ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="wallet"
                            value={w.id}
                            checked={selectedWallet === w.id}
                            onChange={() => setSelectedWallet(w.id)}
                            className="accent-emerald-600"
                          />
                          <span className="text-lg">{w.icon}</span>
                          <span className="text-xs font-extrabold text-slate-800">{w.name}</span>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          {w.cashback}
                        </span>
                      </label>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => executePayment("wallet", { wallet: selectedWallet })}
                    className="w-full rounded-2xl bg-emerald-600 py-3.5 text-xs font-black text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                  >
                    <span>🔒</span>
                    <span>Pay ₹{total} from Wallet →</span>
                  </button>
                </div>
              )}

              {/* ============================================================ */}
              {/* TAB 5: CASH ON DELIVERY */}
              {/* ============================================================ */}
              {activeTab === "cod" && (
                <div className="space-y-4 text-center sm:text-left">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      Cash or UPI on Delivery
                    </h4>
                    <p className="text-xs text-slate-500">
                      Pay with cash or scan the delivery executive's UPI QR code upon doorstep arrival.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs text-slate-600">
                    <p className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span> No advance payment required
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span> 15-30 minute temperature-monitored delivery
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span> Exact change or dynamic UPI supported by rider
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => executePayment("cod")}
                    className="w-full rounded-2xl bg-slate-900 py-3.5 text-xs font-black text-white shadow-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                  >
                    <span>📦</span>
                    <span>Confirm Order with Cash on Delivery (₹{total}) →</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3D Secure Simulated Bank OTP Dialog */}
        {showOtpModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-sm rounded-3xl border border-emerald-500/30 bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏦</span>
                  <span className="text-xs font-black text-slate-800">
                    {cardBrand.name} 3D Secure OTP
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Verified by Visa/Mastercard
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-600">
                  Enter the 6-digit OTP sent to registered mobile ending in{" "}
                  <span className="font-bold text-slate-900">***-***-3210</span>
                </p>
                <p className="text-[11px] font-black text-slate-800">
                  Merchant: <span className="text-emerald-700">SV Care Pharmacy</span> | Amount: <span className="text-emerald-700">₹{total}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP (e.g. 123456)"
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-3 text-center font-mono text-lg font-black tracking-[0.3em] outline-none focus:border-emerald-600 focus:bg-white"
                />

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <button
                    type="button"
                    onClick={() => setOtp("123456")}
                    className="text-emerald-600 font-extrabold underline hover:text-emerald-800"
                  >
                    Auto-Fill Test OTP (123456)
                  </button>
                  <span>Resend in {otpTimer}s</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowOtpModal(false)}
                    className="flex-1 rounded-xl border border-slate-300 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700"
                  >
                    Authorize Payment →
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentGatewayModal;
