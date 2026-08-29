import { useState, useRef, useEffect } from "react";
import { aiPharmacistResponses } from "../data/healthData";
import products from "../data/products";

function HealthAssistantChat({ isOpen, onClose, onAddToCart }) {
  const [messages, setMessages] = useState([
    {
      id: "m-1",
      sender: "bot",
      text: "Hello! I am **Dr. SV Care AI**, your 24/7 certified digital pharmacist. How are you feeling today? You can describe your symptoms or ask about medicine dosages, generic alternatives, or dietary advice.",
      time: "Just now",
      productIds: [],
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef(null);
  const counterRef = useRef(100);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    "Fever & Body Pain",
    "Dry Cough & Cold",
    "Stomach Acidity / Gas",
    "Immunity & Energy Boosters",
    "Blood Sugar Control",
    "High Blood Pressure Advice",
  ];

  const handleSend = (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    counterRef.current += 1;
    const currentId = counterRef.current;
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Add user message
    const userMsg = {
      id: `u-${currentId}`,
      sender: "user",
      text: query,
      time: formattedTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Analyze query against knowledge base
    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      const matched = aiPharmacistResponses.find((r) =>
        r.keywords.some((k) => lowerQuery.includes(k))
      );

      let responseText;
      let productIds;

      if (matched) {
        responseText = matched.response;
        productIds = matched.suggestedProductIds;
      } else {
        responseText = `Thank you for sharing. For **"${query}"**, we advise staying well hydrated and monitoring your symptoms. We have verified remedies available below in our licensed inventory. If symptoms persist or worsen, please consult a physician promptly.`;
        productIds = [1, 32, 34]; // Safe fallback remedies
      }

      counterRef.current += 1;
      const botMsg = {
        id: `b-${counterRef.current}`,
        sender: "bot",
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        productIds: productIds,
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, botMsg]);
    }, 650);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 flex h-[85vh] sm:h-[620px] w-full sm:max-w-md flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border border-emerald-200 bg-white shadow-2xl pb-safe">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 text-xl font-bold backdrop-blur">
              👨‍⚕️
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm">Dr. SV Care AI</h3>
              <span className="rounded-full bg-emerald-400/30 px-2 py-0.2 text-[10px] font-bold text-emerald-100 border border-emerald-300/40">
                24/7 Live
              </span>
            </div>
            <p className="text-[11px] text-emerald-100">Certified Clinical Pharmacist Assistant</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 text-sm font-bold"
        >
          ✕
        </button>
      </div>

      {/* Quick Prompts Bar */}
      <div className="border-b border-slate-100 bg-slate-50 px-3 py-2 flex gap-1.5 overflow-x-auto">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(prompt)}
            className="whitespace-nowrap rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-600 hover:text-white transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          const isBot = msg.sender === "bot";
          return (
            <div key={msg.id} className={`flex flex-col ${isBot ? "items-start" : "items-end"}`}>
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                  isBot
                    ? "rounded-tl-none bg-white text-slate-800 border border-slate-200"
                    : "rounded-tr-none bg-emerald-600 text-white font-medium"
                }`}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: msg.text
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      .replace(/\n/g, "<br/>"),
                  }}
                />

                {/* Suggested Medicines Cards inside Chat */}
                {isBot && msg.productIds && msg.productIds.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    <p className="font-bold text-[11px] text-emerald-800 uppercase tracking-wider">
                      💊 Recommended Formulations:
                    </p>
                    <div className="space-y-1.5">
                      {msg.productIds.map((pid) => {
                        const prod = products.find((p) => p.id === pid);
                        if (!prod) return null;
                        return (
                          <div
                            key={pid}
                            className="flex items-center justify-between gap-2 rounded-xl border border-emerald-100 bg-emerald-50/70 p-2 text-[11px]"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-slate-800 truncate">{prod.name}</p>
                              <p className="text-emerald-700 font-extrabold">₹{prod.price}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                onAddToCart(prod);
                                alert(`Added ${prod.name} to cart!`);
                              }}
                              className="rounded-full bg-emerald-600 hover:bg-emerald-700 border border-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-xs active:scale-95 transition"
                            >
                              + Add to cart
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-1.5 rounded-2xl bg-white border border-slate-200 p-3 w-fit text-xs text-slate-500">
            <span className="animate-bounce">●</span>
            <span className="animate-bounce delay-100">●</span>
            <span className="animate-bounce delay-200">●</span>
            <span className="ml-1 text-[11px] font-semibold text-emerald-700">Dr. SV Care is analyzing...</span>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="border-t border-slate-200 bg-white p-3 flex gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask Dr. SV Care (e.g. 'fever with headache', 'dosage for dolo')..."
          className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
        />
        <button
          type="submit"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold transition hover:bg-emerald-700 active:scale-95 shadow-md shadow-emerald-600/20"
        >
          ➤
        </button>
      </form>
    </div>
  );
}

export default HealthAssistantChat;
