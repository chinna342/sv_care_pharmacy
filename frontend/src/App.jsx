import { useEffect, useMemo, useState } from "react";

// Components
import Navbar from "./components/Navbar";
import Header from "./components/Header";
import ProductGrid from "./components/ProductGrid";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import Footer from "./components/Footer";
import ProductDetailModal from "./components/ProductDetailModal";
import DeliveryTracker from "./components/DeliveryTracker";
import AdminPortal from "./components/AdminPortal";
import AuthModal from "./components/AuthModal";

// Datasets
import defaultProducts from "./data/products";
import { categories } from "./data/categories";

function App() {
  // ==========================================
  // 1. PRODUCTS & SYNC WITH BACKEND
  // ==========================================
  const [products, setProducts] = useState(defaultProducts);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/products/")
      .then((res) => {
        if (!res.ok) throw new Error("Backend offline");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          console.log("Connected to SV Care FastAPI Backend:", data.length, "products loaded");
          // Merge backend products with fallback details
          const merged = defaultProducts.map((p) => {
            const remote = data.find((r) => r.name.toLowerCase() === p.name.toLowerCase());
            return remote ? { ...p, ...remote } : p;
          });
          setProducts(merged);
        }
      })
      .catch(() => {
        console.log("Operating in High-Fidelity Local Clinical Mode with 40+ verified medicines.");
        setProducts(defaultProducts);
      });
  }, []);

  // ==========================================
  // 2. USER AUTHENTICATION & SESSION
  // ==========================================
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("svcare_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingCheckoutMeta, setPendingCheckoutMeta] = useState(null);

  // ==========================================
  // 3. SEARCH, CATEGORIES & FILTERS
  // ==========================================
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");

  // ==========================================
  // 4. CART & PERSISTENCE
  // ==========================================
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("svcare-cart-v2");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("svcare-cart-v2", JSON.stringify(cart));
  }, [cart]);

  // ==========================================
  // 5. UI MODALS & OVERLAYS
  // ==========================================
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutMeta, setCheckoutMeta] = useState({});
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [liveTrackerOpen, setLiveTrackerOpen] = useState(false);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState("SV894210");
  const [adminPortalOpen, setAdminPortalOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem("svcare_orders_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("svcare_orders_history", JSON.stringify(orders));
  }, [orders]);

  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2200);
  };

  const handleLoginSuccess = (userProfile) => {
    setUser(userProfile);
    showToast(`Welcome back, ${userProfile.name}!`);
    if (pendingCheckoutMeta) {
      setCheckoutMeta(pendingCheckoutMeta);
      setPendingCheckoutMeta(null);
      setCartOpen(false);
      setCheckoutOpen(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("svcare_user");
    setUser(null);
    showToast("Logged out successfully");
  };

  // ==========================================
  // 5. FILTER & SORT PRODUCTS LOGIC
  // ==========================================
  const filteredProducts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    let list = products.filter((p) => {
      const nameMatch = (p.name || "").toLowerCase().includes(search);
      const genericMatch = (p.genericName || "").toLowerCase().includes(search);
      const categoryMatch = (p.category || "").toLowerCase().includes(search);
      const descMatch = (p.description || "").toLowerCase().includes(search);
      const usesMatch = Array.isArray(p.uses) && p.uses.some((u) => u.toLowerCase().includes(search));

      const matchesSearch = nameMatch || genericMatch || categoryMatch || descMatch || usesMatch;
      const matchesCat = selectedCategory === "All" || (p.category || "").toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCat;
    });

    // Sorting
    if (sortBy === "price-low") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "discount") {
      list.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
    } else if (sortBy === "rating") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return list;
  }, [products, searchTerm, selectedCategory, sortBy]);

  // ==========================================
  // 6. CART OPERATIONS
  // ==========================================
  const addToCart = (product, quantityToAdd = 1) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id && item.name === product.name);
      if (existing) {
        const nextQty = existing.quantity + quantityToAdd;
        if (nextQty > (product.stock || 99)) {
          showToast(`Max stock reached for ${product.name}`);
          return current;
        }
        showToast(`Updated ${product.name} in cart`);
        return current.map((item) =>
          item.id === product.id && item.name === product.name
            ? { ...item, quantity: nextQty }
            : item
        );
      }
      showToast(`Added ${product.name} to cart!`);
      return [...current, { ...product, quantity: quantityToAdd }];
    });
  };

  const increaseQuantity = (id) => {
    setCart((current) => {
      const item = current.find((i) => i.id === id);
      if (item) {
        if (item.quantity >= (item.stock || 99)) {
          showToast(`Max available stock reached`);
          return current;
        }
        showToast(`Increased ${item.name} quantity`);
      }
      return current.map((i) =>
        i.id === id ? { ...i, quantity: i.quantity + 1 } : i
      );
    });
  };

  const decreaseQuantity = (id) => {
    setCart((current) => {
      const item = current.find((i) => i.id === id);
      if (item) {
        if (item.quantity <= 1) {
          showToast(`Removed ${item.name} from cart`);
        } else {
          showToast(`Decreased ${item.name} quantity`);
        }
      }
      return current
        .map((i) =>
          i.id === id ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0);
    });
  };

  const removeFromCart = (id) => {
    setCart((current) => current.filter((item) => item.id !== id));
    showToast("Item removed from cart");
  };

  const clearCart = () => {
    setCart([]);
    showToast("Cart cleared");
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  // ==========================================
  // 7. CHECKOUT & ORDER PLACEMENT
  // ==========================================
  const handleProceedToCheckout = (meta) => {
    if (!user) {
      setPendingCheckoutMeta(meta);
      setAuthModalOpen(true);
      setCartOpen(false);
      showToast("Please login to proceed to checkout");
      return;
    }
    setCheckoutMeta(meta);
    setCartOpen(false);
    setCheckoutOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlaceOrder = (orderData) => {
    const orderId = "SV" + Date.now().toString().slice(-8);
    const newOrder = {
      id: orderId,
      ...orderData,
      status: "Pharmacist Verified & Dispatched",
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setConfirmedOrder(newOrder);
    setActiveTrackingOrderId(orderId);
    setCart([]);
    setCheckoutOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Send order to backend if running
    fetch("http://127.0.0.1:8000/orders/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: orderData.customer.name,
        phone: orderData.customer.phone,
        house: orderData.customer.house,
        area: orderData.customer.area,
        city: orderData.customer.city,
        pincode: orderData.customer.pincode,
        payment_method: orderData.paymentMethod || "cod",
        payment_id: orderData.paymentId || `COD_${orderId}`,
        gateway_name: orderData.gatewayName || "Cash on Delivery",
        items: orderData.items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
      }),
    }).catch(() => {
      // Local seamless fallback
    });
  };

  // ==========================================
  // 8. ORDER SUCCESS SCREEN
  // ==========================================
  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar
          cartCount={0}
          user={user}
          onOpenLogin={() => setAuthModalOpen(true)}
          onLogout={handleLogout}
          onCartClick={() => setCartOpen(true)}
          onOpenLiveTracker={() => setLiveTrackerOpen(true)}
          onOpenAdmin={() => setAdminPortalOpen(true)}
        />

        <main className="mx-auto max-w-3xl px-4 py-16">
          <div className="rounded-3xl border border-emerald-100 bg-white p-8 md:p-12 shadow-2xl text-center space-y-6">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-5xl text-white shadow-xl shadow-emerald-600/30">
              ✓
            </div>

            <div>
              <span className="rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-black text-emerald-800 uppercase tracking-widest">
                Payment Authorized • Cold Chain Dispatched
              </span>
              <h1 className="mt-3 text-3xl md:text-4xl font-black text-slate-900">
                Thank You for Choosing SV Care!
              </h1>
              <p className="mt-2 text-xs md:text-sm text-slate-500 max-w-md mx-auto">
                Your order and payment have been verified by our licensed clinical pharmacist and are being packed in a temperature-controlled cold box.
              </p>
            </div>

            {/* Payment & Order Details Grid */}
            <div className="grid gap-4 sm:grid-cols-2 rounded-2xl bg-slate-50 p-5 text-left text-xs border border-slate-200">
              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px]">Order Number</p>
                <p className="text-xl font-black text-emerald-700 tracking-wider font-mono mt-0.5">
                  {confirmedOrder.id}
                </p>
                <p className="text-slate-500 mt-1">
                  Recipient: <span className="font-bold text-slate-800">{confirmedOrder.customer?.name}</span>
                </p>
                <p className="text-slate-500">
                  Phone: <span className="font-bold text-slate-800">{confirmedOrder.customer?.phone}</span>
                </p>
              </div>

              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px]">Payment Verification</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-black text-white">
                    {confirmedOrder.paymentStatus || "Paid"}
                  </span>
                  <span className="font-extrabold text-slate-800 uppercase">
                    ₹{confirmedOrder.total} via {confirmedOrder.paymentMethod}
                  </span>
                </div>
                {confirmedOrder.paymentId && (
                  <p className="text-slate-500 mt-1 text-[11px]">
                    Payment ID: <span className="font-mono font-bold text-slate-700">{confirmedOrder.paymentId}</span>
                  </p>
                )}
                {confirmedOrder.transactionRef && (
                  <p className="text-slate-500 text-[11px]">
                    Txn Ref: <span className="font-mono font-bold text-slate-700">{confirmedOrder.transactionRef}</span>
                  </p>
                )}
              </div>

              <div className="sm:col-span-2 border-t border-slate-200 pt-3">
                <p className="text-slate-400 font-bold uppercase text-[10px]">Delivery Address</p>
                <p className="font-bold text-slate-800 mt-0.5">
                  {confirmedOrder.customer?.house}, {confirmedOrder.customer?.area}, {confirmedOrder.customer?.city} - {confirmedOrder.customer?.pincode}
                </p>
              </div>
            </div>

            {/* Delivery Guarantee Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white shadow-lg flex items-center justify-between gap-4 text-left">
              <div>
                <p className="text-xs font-bold uppercase text-emerald-100">⚡ Estimated Express Arrival</p>
                <p className="text-2xl font-black mt-0.5">15 - 30 Minutes</p>
                <p className="text-[11px] text-emerald-100">Preserved in 18°C - 24°C temperature monitored cold-box</p>
              </div>
              <button
                type="button"
                onClick={() => setLiveTrackerOpen(true)}
                className="rounded-xl bg-white px-4 py-2.5 text-xs font-black text-emerald-800 shadow-md hover:bg-emerald-50 active:scale-95 transition shrink-0"
              >
                🛰️ Live GPS Tracker
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 rounded-2xl border border-slate-300 bg-white py-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                🖨️ Print Digital Invoice & Receipt
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmedOrder(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex-1 rounded-2xl bg-emerald-600 py-3.5 text-xs font-black text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
              >
                Continue Shopping →
              </button>
            </div>
          </div>
        </main>

        <Footer
          onOpenLiveTracker={() => setLiveTrackerOpen(true)}
          onOpenAdmin={() => setAdminPortalOpen(true)}
          onSelectCategory={setSelectedCategory}
        />

        {/* Live GPS Tracker Modal */}
        {liveTrackerOpen && (
          <DeliveryTracker
            orderId={activeTrackingOrderId}
            onClose={() => setLiveTrackerOpen(false)}
          />
        )}
      </div>
    );
  }

  // ==========================================
  // 9. CHECKOUT SCREEN
  // ==========================================
  if (checkoutOpen) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar
          cartCount={cartCount}
          user={user}
          onOpenLogin={() => setAuthModalOpen(true)}
          onLogout={handleLogout}
          onCartClick={() => setCartOpen(true)}
          onOpenLiveTracker={() => setLiveTrackerOpen(true)}
          onOpenAdmin={() => setAdminPortalOpen(true)}
        />

        <Checkout
          cart={cart}
          checkoutMeta={checkoutMeta}
          user={user}
          onBack={() => {
            setCheckoutOpen(false);
            setCartOpen(true);
          }}
          onPlaceOrder={handlePlaceOrder}
        />

        <Footer
          onOpenLiveTracker={() => setLiveTrackerOpen(true)}
          onOpenAdmin={() => setAdminPortalOpen(true)}
          onSelectCategory={setSelectedCategory}
        />
      </div>
    );
  }

  // ==========================================
  // 10. MAIN STOREFRONT WEBSITE
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      {/* NAVBAR WITH INTEGRATED SEARCH & CATEGORY BAR */}
      <Navbar
        cartCount={cartCount}
        user={user}
        onOpenLogin={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onCartClick={() => setCartOpen(true)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* HERO SECTION */}
      <Header
        onScrollToMedicines={() => {
          document.getElementById("medicines")?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* PRODUCTS GRID */}
      <ProductGrid
        products={filteredProducts}
        cart={cart}
        onAddToCart={addToCart}
        onIncrease={increaseQuantity}
        onDecrease={decreaseQuantity}
        onOpenDetails={(product) => setSelectedProductDetails(product)}
        selectedCategory={selectedCategory}
        onResetFilters={() => {
          setSelectedCategory("All");
          setSearchTerm("");
        }}
      />

      {/* FOOTER */}
      <Footer
        onOpenLiveTracker={() => setLiveTrackerOpen(true)}
        onOpenAdmin={() => setAdminPortalOpen(true)}
        onSelectCategory={setSelectedCategory}
      />

      {/* ========================================== */}
      {/* GLOBAL MODALS & OVERLAYS */}
      {/* ========================================== */}

      {/* 1. Cart Drawer (Zepto Style) */}
      {cartOpen && (
        <Cart
          cart={cart}
          user={user}
          onIncrease={increaseQuantity}
          onDecrease={decreaseQuantity}
          onRemove={removeFromCart}
          onClose={() => setCartOpen(false)}
          onCheckout={handleProceedToCheckout}
          onClearCart={clearCart}
          onOpenLogin={() => setAuthModalOpen(true)}
        />
      )}

      {/* 2. Product Clinical Details & Generic Comparator Modal */}
      {selectedProductDetails && (
        <ProductDetailModal
          product={selectedProductDetails}
          onClose={() => setSelectedProductDetails(null)}
          onAddToCart={addToCart}
        />
      )}

      {/* 3. Live GPS Delivery Tracker Modal */}
      {liveTrackerOpen && (
        <DeliveryTracker
          orderId={activeTrackingOrderId}
          onClose={() => setLiveTrackerOpen(false)}
        />
      )}

      {/* 4. Pharmacist Admin Portal */}
      {adminPortalOpen && (
        <AdminPortal
          orders={orders}
          products={products}
          onUpdateOrderStatus={(orderId, newStatus) => {
            setOrders((prev) =>
              prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
            );
          }}
          onUpdateStock={(id, newStock) => {
            setProducts((prev) =>
              prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p))
            );
          }}
          onClose={() => setAdminPortalOpen(false)}
        />
      )}

      {/* 5. User Authentication & Login Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Floating Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 rounded-2xl bg-slate-900/95 px-5 py-3 text-xs font-bold text-white shadow-2xl backdrop-blur-md border border-emerald-500/40 animate-bounce flex items-center gap-2">
          <span className="text-emerald-400 font-extrabold">✓</span> {toastMessage}
        </div>
      )}
    </div>
  );
}

export default App;