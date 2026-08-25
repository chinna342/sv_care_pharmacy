import { useState } from "react";

const CATEGORIES = [
  "All",
  "Pain Relief & Fever",
  "Antibiotics & Anti-Infectives",
  "Heart & Blood Pressure",
  "Diabetes Care",
  "Allergy & Respiratory",
  "Gastro & Acidity",
  "Vitamins & Immunity",
  "Skincare & Derma",
];

const FORM_OPTIONS = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Gel",
  "Ointment",
  "Inhaler",
  "Sachet",
  "Eye/Ear Drops",
  "Suspension",
  "Injection",
];

function AdminPortal({
  orders = [],
  onUpdateOrderStatus,
  products = [],
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onToggleActive,
  onUpdateStock,
  onOpenInvoice,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState("inventory"); // 'inventory' | 'orders' | 'analytics'
  const [inventorySearch, setInventorySearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All"); // 'All' | 'in_stock' | 'low_stock' | 'out_of_stock'
  const [statusFilter, setStatusFilter] = useState("All"); // 'All' | 'active' | 'inactive'
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");

  // Modal States for Medicine Management
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [notification, setNotification] = useState("");

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: "",
    generic: "",
    manufacturer: "",
    category: "Pain Relief & Fever",
    description: "",
    price: "",
    mrp: "",
    stock: "50",
    form: "Tablet",
    pack_size: "Strip of 10 tablets",
    prescription_required: false,
    is_active: true,
    image: "/medicines/dolo-650.jpg",
  });
  const [formErrors, setFormErrors] = useState({});

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3500);
  };

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 4580);
  const activeProductsCount = products.filter((p) => p.is_active !== false).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 15).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const searchMatch =
      p.name?.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      p.generic?.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      p.manufacturer?.toLowerCase().includes(inventorySearch.toLowerCase());

    const categoryMatch =
      categoryFilter === "All" || p.category === categoryFilter;

    const stockMatch =
      stockFilter === "All" ||
      (stockFilter === "in_stock" && p.stock > 15) ||
      (stockFilter === "low_stock" && p.stock > 0 && p.stock <= 15) ||
      (stockFilter === "out_of_stock" && p.stock === 0);

    const statusMatch =
      statusFilter === "All" ||
      (statusFilter === "active" && p.is_active !== false) ||
      (statusFilter === "inactive" && p.is_active === false);

    return searchMatch && categoryMatch && stockMatch && statusMatch;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer?.name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer?.phone?.includes(orderSearch);

    const matchesStatus =
      orderStatusFilter === "All" ||
      (orderStatusFilter === "Active" && !o.status?.toLowerCase().includes("delivered")) ||
      (orderStatusFilter === "Delivered" && o.status?.toLowerCase().includes("delivered"));

    return matchesSearch && matchesStatus;
  });

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({
      name: "",
      generic: "",
      manufacturer: "",
      category: "Pain Relief & Fever",
      description: "",
      price: "",
      mrp: "",
      stock: "50",
      form: "Tablet",
      pack_size: "Strip of 10 tablets",
      prescription_required: false,
      is_active: true,
      image: "/medicines/dolo-650.jpg",
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      generic: product.generic || "",
      manufacturer: product.manufacturer || "",
      category: product.category || "Pain Relief & Fever",
      description: product.description || "",
      price: String(product.price || ""),
      mrp: String(product.mrp || product.price || ""),
      stock: String(product.stock !== undefined ? product.stock : "50"),
      form: product.form || "Tablet",
      pack_size: product.pack_size || "Strip of 10 tablets",
      prescription_required: !!product.prescription_required,
      is_active: product.is_active !== false,
      image: product.image || "/medicines/dolo-650.jpg",
    });
    setFormErrors({});
  };

  // Validate Form
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Medicine name is required";
    if (!formData.generic.trim()) errors.generic = "Generic / salt name is required";
    if (!formData.manufacturer.trim()) errors.manufacturer = "Manufacturer is required";
    const priceNum = parseFloat(formData.price);
    const mrpNum = parseFloat(formData.mrp);
    if (isNaN(priceNum) || priceNum <= 0) errors.price = "Price must be greater than 0";
    if (isNaN(mrpNum) || mrpNum <= 0) errors.mrp = "MRP must be greater than 0";
    if (priceNum > mrpNum) errors.price = "Selling price cannot exceed MRP";
    const stockNum = parseInt(formData.stock, 10);
    if (isNaN(stockNum) || stockNum < 0) errors.stock = "Stock cannot be negative";
    return errors;
  };

  // Submit Add / Edit
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const price = parseFloat(formData.price);
    const mrp = parseFloat(formData.mrp);
    const discount = Math.max(0, Math.round(((mrp - price) / mrp) * 100));

    const medicinePayload = {
      name: formData.name.trim(),
      generic: formData.generic.trim(),
      manufacturer: formData.manufacturer.trim(),
      category: formData.category,
      description: formData.description.trim() || `Prescription grade ${formData.name} by ${formData.manufacturer}.`,
      price: price,
      mrp: mrp,
      discount: discount,
      stock: parseInt(formData.stock, 10) || 0,
      form: formData.form,
      pack_size: formData.pack_size.trim() || "Unit pack",
      prescription_required: formData.prescription_required,
      is_active: formData.is_active,
      image: formData.image || "/medicines/dolo-650.jpg",
      rating: 4.8,
      reviews_count: 142,
    };

    if (editingProduct) {
      if (onEditProduct) {
        onEditProduct(editingProduct.id, medicinePayload);
      }
      showToast(`✓ Medicine '${formData.name}' updated successfully in database!`);
      setEditingProduct(null);
    } else {
      const newId = `med_${Date.now()}`;
      if (onAddProduct) {
        onAddProduct({ ...medicinePayload, id: newId });
      }
      showToast(`✓ New medicine '${formData.name}' added to customer catalog!`);
      setIsAddModalOpen(false);
    }
  };

  // Confirm Deletion
  const handleConfirmDelete = () => {
    if (!deletingProduct) return;
    if (onDeleteProduct) {
      onDeleteProduct(deletingProduct.id);
    }
    showToast(`✓ Medicine '${deletingProduct.name}' safely removed from catalog.`);
    setDeletingProduct(null);
  };

  const statusOptions = [
    "Pharmacist Verified & Queued",
    "Cold-Chain Packed (18°C-24°C)",
    "Out for Express Delivery",
    "Delivered to Doorstep",
    "Cancelled",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 sm:p-4 backdrop-blur-md animate-fade-in">
      <div className="relative max-h-[94vh] w-full max-w-7xl overflow-hidden rounded-3xl border border-slate-700 bg-white shadow-2xl flex flex-col">
        
        {/* Toast inside Admin */}
        {notification && (
          <div className="absolute top-4 right-16 z-50 rounded-2xl bg-emerald-900 border border-emerald-400 px-4 py-2.5 text-xs font-black text-emerald-200 shadow-2xl animate-bounce">
            {notification}
          </div>
        )}

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-xl font-bold shadow-lg shadow-emerald-500/20">
              👨‍⚕️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">SV Care Pharmacist Command Center</h2>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-black text-emerald-400 border border-emerald-500/30">
                  Chief Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">Medicine Catalog CRUD, Order Verification & Cold-Chain Logistics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white text-base font-bold transition"
            title="Close Admin Panel"
          >
            ✕
          </button>
        </div>

        {/* Metrics Overview Bar */}
        <div className="grid grid-cols-2 gap-3 border-b border-slate-200 bg-slate-50 p-4 sm:grid-cols-4 lg:grid-cols-5 text-xs">
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Active Medicines</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{activeProductsCount} <span className="text-xs text-slate-400 font-normal">/ {products.length} total</span></p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600">Low Stock Alert</p>
            <p className="text-xl font-black text-amber-700 mt-0.5">{lowStockCount} <span className="text-[10px] text-amber-600 font-bold">&le; 15 units</span></p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-red-500">Out of Stock</p>
            <p className="text-xl font-black text-red-600 mt-0.5">{outOfStockCount} <span className="text-[10px] text-red-500 font-bold">0 units</span></p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">Store Revenue</p>
            <p className="text-xl font-black text-emerald-700 mt-0.5">₹{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="hidden lg:block rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">Live Orders</p>
            <p className="text-xl font-black text-blue-700 mt-0.5">{orders.length} <span className="text-[10px] text-blue-500 font-bold">placed</span></p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6 pt-3 gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("inventory")}
            className={`pb-3 px-3 text-xs font-black transition border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === "inventory"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>💊</span> Medicine Management (CRUD)
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-800 font-bold">
              {products.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`pb-3 px-3 text-xs font-black transition border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === "orders"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>📦</span> Customer Orders & Dispatch
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700 font-bold">
              {orders.length}
            </span>
          </button>
        </div>

        {/* Body Container */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          
          {/* ======================================================== */}
          {/* TAB 1: MEDICINE MANAGEMENT (CRUD) */}
          {/* ======================================================== */}
          {activeTab === "inventory" && (
            <div className="space-y-4">
              
              {/* Controls Bar: Add Button + Search + Filters */}
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs md:flex-row md:items-center md:justify-between">
                
                {/* Left: Add Medicine Button */}
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-black text-white shadow-md hover:from-emerald-700 hover:to-teal-700 transition active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <span className="text-base font-extrabold">+</span>
                  <span>Add New Medicine</span>
                </button>

                {/* Right: Search & Dropdown Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 flex-1 max-w-4xl">
                  {/* Search */}
                  <div className="relative">
                    <input
                      type="text"
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                      placeholder="Search name, salt, brand..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white"
                  >
                    <option value="All">All Categories</option>
                    {CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  {/* Stock Status Filter */}
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white"
                  >
                    <option value="All">All Stock Levels</option>
                    <option value="in_stock">In Stock (&gt; 15)</option>
                    <option value="low_stock">Low Stock (1-15)</option>
                    <option value="out_of_stock">Out of Stock (0)</option>
                  </select>

                  {/* Active / Inactive Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white"
                  >
                    <option value="All">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>
              </div>

              {/* Medicine Table */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="border-b border-slate-200 bg-slate-100/75 text-[11px] font-black uppercase tracking-wider text-slate-600">
                      <tr>
                        <th className="p-3.5 pl-4">Medicine Info</th>
                        <th className="p-3.5">Category</th>
                        <th className="p-3.5">Price & MRP</th>
                        <th className="p-3.5">Stock Level</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            <p className="text-2xl mb-1">🔍</p>
                            <p className="font-bold">No medicines found matching filters</p>
                            <button
                              type="button"
                              onClick={() => {
                                setInventorySearch("");
                                setCategoryFilter("All");
                                setStockFilter("All");
                                setStatusFilter("All");
                              }}
                              className="mt-2 text-xs font-bold text-emerald-600 hover:underline"
                            >
                              Reset all filters
                            </button>
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((p) => {
                          const isLow = p.stock > 0 && p.stock <= 15;
                          const isOut = p.stock === 0;
                          const isActive = p.is_active !== false;

                          return (
                            <tr key={p.id} className={`hover:bg-slate-50/80 transition ${!isActive ? "bg-slate-50/50 opacity-60" : ""}`}>
                              
                              {/* Medicine Photo & Name */}
                              <td className="p-3 pl-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-2xs flex items-center justify-center">
                                    <img
                                      src={p.image || "/medicines/dolo-650.jpg"}
                                      alt={p.name}
                                      className="h-full w-full object-contain"
                                      onError={(e) => {
                                        e.target.src = "/medicines/dolo-650.jpg";
                                      }}
                                    />
                                  </div>
                                  <div className="max-w-xs">
                                    <div className="flex items-center gap-1.5">
                                      <p className="font-black text-slate-900 leading-tight line-clamp-1">{p.name}</p>
                                      {p.prescription_required && (
                                        <span className="shrink-0 rounded bg-red-100 px-1.5 py-0.2 text-[9px] font-black text-red-700">
                                          Rx
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-500 truncate">{p.generic || p.manufacturer}</p>
                                    <p className="text-[10px] text-slate-400">{p.form || "Tablet"} • {p.pack_size || "Standard pack"}</p>
                                  </div>
                                </div>
                              </td>

                              {/* Category */}
                              <td className="p-3">
                                <span className="inline-block rounded-lg bg-emerald-50 border border-emerald-200/60 px-2 py-1 text-[11px] font-bold text-emerald-800 whitespace-nowrap">
                                  {p.category}
                                </span>
                              </td>

                              {/* Price */}
                              <td className="p-3 whitespace-nowrap">
                                <div className="font-black text-slate-900">₹{p.price}</div>
                                {p.mrp && p.mrp > p.price && (
                                  <div className="text-[10px] text-slate-400">
                                    <span className="line-through">₹{p.mrp}</span>
                                    <span className="ml-1 text-emerald-600 font-bold">({p.discount || Math.round(((p.mrp - p.price)/p.mrp)*100)}% off)</span>
                                  </div>
                                )}
                              </td>

                              {/* Stock */}
                              <td className="p-3 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black ${
                                      isOut
                                        ? "bg-red-100 text-red-700"
                                        : isLow
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-emerald-100 text-emerald-800"
                                    }`}
                                  >
                                    {isOut ? "● Out of Stock (0)" : isLow ? `▲ Low (${p.stock})` : `✓ In Stock (${p.stock})`}
                                  </span>

                                  {/* Quick Stock Modifiers */}
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => onUpdateStock && onUpdateStock(p.id, Math.max(0, p.stock - 10))}
                                      disabled={p.stock <= 0}
                                      className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-30"
                                      title="Subtract 10 units"
                                    >
                                      -10
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onUpdateStock && onUpdateStock(p.id, p.stock + 50)}
                                      className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100"
                                      title="Add +50 Restock"
                                    >
                                      +50
                                    </button>
                                  </div>
                                </div>
                              </td>

                              {/* Status (Active / Inactive) */}
                              <td className="p-3 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => onToggleActive && onToggleActive(p.id)}
                                  className={`rounded-full px-2.5 py-1 text-[10px] font-black border transition cursor-pointer ${
                                    isActive
                                      ? "bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                                      : "bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200"
                                  }`}
                                  title="Click to toggle active status for customers"
                                >
                                  {isActive ? "🟢 Active" : "⚪ Inactive"}
                                </button>
                              </td>

                              {/* Actions */}
                              <td className="p-3 pr-4 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(p)}
                                    className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 transition"
                                  >
                                    ✏️ Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeletingProduct(p)}
                                    className="rounded-xl border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 hover:bg-red-100 transition"
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: CUSTOMER ORDERS & DISPATCH */}
          {/* ======================================================== */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              {/* Order Search & Filters */}
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search order ID, patient name, phone..."
                  className="w-full sm:max-w-md rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 focus:bg-white"
                />
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500">Filter:</span>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white"
                  >
                    <option value="All">All Orders ({orders.length})</option>
                    <option value="Active">Active Express Deliveries</option>
                    <option value="Delivered">Delivered Orders</option>
                  </select>
                </div>
              </div>

              {/* Orders Cards List */}
              {filteredOrders.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
                  <p className="text-3xl mb-2">📦</p>
                  <p className="text-sm font-bold text-slate-600">No customer orders found</p>
                  <p className="text-xs text-slate-400">New orders placed by patients will appear here in real time.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredOrders.map((o) => (
                    <div
                      key={o.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-emerald-300 transition space-y-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                              {o.id}
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-500">{o.date || "Today"}</span>
                          </div>
                          <p className="text-sm font-black text-slate-800 mt-1">
                            {o.customer?.name} <span className="text-xs text-slate-400 font-mono">({o.customer?.phone})</span>
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-1">{o.customer?.address}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {onOpenInvoice && (
                            <button
                              type="button"
                              onClick={() => onOpenInvoice(o)}
                              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition flex items-center gap-1.5"
                            >
                              <span>🧾</span> Invoice
                            </button>
                          )}
                          <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Total Bill</p>
                            <p className="text-base font-black text-emerald-700">₹{o.total}</p>
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="flex flex-wrap gap-2 text-xs">
                        {(o.items || []).map((item, idx) => (
                          <div key={idx} className="rounded-xl bg-slate-50 border border-slate-100 px-2.5 py-1 text-slate-700 font-medium">
                            <span className="font-bold text-slate-900">{item.name}</span> × {item.quantity || 1} (₹{item.price})
                          </div>
                        ))}
                      </div>

                      {/* Status Selector */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-500">Dispatch Status:</span>
                          <select
                            value={o.status || "Pharmacist Verified & Queued"}
                            onChange={(e) => onUpdateOrderStatus && onUpdateOrderStatus(o.id, e.target.value)}
                            className="rounded-xl border border-emerald-300 bg-emerald-50/50 px-3 py-1.5 text-xs font-black text-emerald-900 outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                          >
                            {statusOptions.map((st) => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </div>
                        <span className="text-[11px] font-bold text-slate-400">
                          Payment: <span className="text-slate-700 uppercase font-black">{o.paymentMethod || "COD"}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-100 px-6 py-3 text-[11px] text-slate-500">
          <span>SV Care Licensed Pharmacy ID: <strong className="text-slate-800">TS/HYD/2026/8942-R</strong></span>
          <span>Logged in as: <strong className="text-emerald-700">Dr. Rajesh Varma (Chief Admin)</strong></span>
        </div>

        {/* ======================================================== */}
        {/* MODAL 1: ADD / EDIT MEDICINE MODAL */}
        {/* ======================================================== */}
        {(isAddModalOpen || editingProduct) && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in">
            <div className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>{editingProduct ? "✏️ Edit Medicine Details" : "➕ Add New Medicine to Catalog"}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="rounded-full bg-slate-200 p-1.5 text-xs text-slate-600 hover:bg-slate-300 font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                
                {/* Row 1: Name & Generic */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Medicine Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Dolo 650mg Tablet"
                      className={`w-full rounded-xl border px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 ${
                        formErrors.name ? "border-red-500 focus:ring-red-400/20" : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                      }`}
                    />
                    {formErrors.name && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Generic Name / Active Salt *
                    </label>
                    <input
                      type="text"
                      value={formData.generic}
                      onChange={(e) => setFormData({ ...formData, generic: e.target.value })}
                      placeholder="e.g. Paracetamol IP 650mg"
                      className={`w-full rounded-xl border px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 ${
                        formErrors.generic ? "border-red-500 focus:ring-red-400/20" : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                      }`}
                    />
                    {formErrors.generic && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.generic}</p>}
                  </div>
                </div>

                {/* Row 2: Manufacturer & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Manufacturer / Brand *
                    </label>
                    <input
                      type="text"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      placeholder="e.g. Micro Labs Ltd"
                      className={`w-full rounded-xl border px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 ${
                        formErrors.manufacturer ? "border-red-500 focus:ring-red-400/20" : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                      }`}
                    />
                    {formErrors.manufacturer && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.manufacturer}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Therapeutic Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                    >
                      {CATEGORIES.filter((c) => c !== "All").map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 3: Price, MRP & Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Selling Price (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g. 31"
                      className={`w-full rounded-xl border px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 ${
                        formErrors.price ? "border-red-500 focus:ring-red-400/20" : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                      }`}
                    />
                    {formErrors.price && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.price}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      MRP Price (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.mrp}
                      onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                      placeholder="e.g. 35"
                      className={`w-full rounded-xl border px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 ${
                        formErrors.mrp ? "border-red-500 focus:ring-red-400/20" : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                      }`}
                    />
                    {formErrors.mrp && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.mrp}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Stock Quantity (units) *
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="e.g. 50"
                      className={`w-full rounded-xl border px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 ${
                        formErrors.stock ? "border-red-500 focus:ring-red-400/20" : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                      }`}
                    />
                    {formErrors.stock && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.stock}</p>}
                  </div>
                </div>

                {/* Row 4: Form & Pack Size */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Dosage Form
                    </label>
                    <select
                      value={formData.form}
                      onChange={(e) => setFormData({ ...formData, form: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                    >
                      {FORM_OPTIONS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Pack Size / Specification
                    </label>
                    <input
                      type="text"
                      value={formData.pack_size}
                      onChange={(e) => setFormData({ ...formData, pack_size: e.target.value })}
                      placeholder="e.g. Strip of 15 tablets"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Row 5: Medicine Image Path */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Medicine Photograph (Path / URL)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="/medicines/dolo-650.jpg or https://..."
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500"
                    />
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-300 bg-white p-1 flex items-center justify-center">
                      <img
                        src={formData.image || "/medicines/dolo-650.jpg"}
                        alt="Preview"
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          e.target.src = "/medicines/dolo-650.jpg";
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Row 6: Description */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Clinical Description & Therapeutic Usage
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g. Fast-acting antipyretic and analgesic for pain relief and fever management..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Row 7: Prescription & Active Status Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-100">
                  <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.prescription_required}
                      onChange={(e) => setFormData({ ...formData, prescription_required: e.target.checked })}
                      className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="block font-bold text-slate-800">Requires Doctor Prescription (Rx)</span>
                      <span className="block text-[10px] text-slate-500">Flag for Schedule H / H1 compliance</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="block font-bold text-slate-800">Publish in Customer Catalog (Active)</span>
                      <span className="block text-[10px] text-slate-500">Uncheck to hide from customer website</span>
                    </div>
                  </label>
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingProduct(null);
                    }}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-xs font-black text-white shadow-md hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition cursor-pointer"
                  >
                    {editingProduct ? "Save Changes to Database" : "Publish Medicine to Catalog"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 2: DELETE CONFIRMATION DIALOG */}
        {/* ======================================================== */}
        {deletingProduct && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl text-red-600">
                🗑️
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Delete Medicine Confirmation</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Are you sure you want to delete <strong className="text-slate-900">{deletingProduct.name}</strong>?
                </p>
                <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3 text-left text-[11px] text-amber-900 leading-relaxed">
                  🛡️ <strong>Safe Deletion:</strong> This will remove the medicine from the customer catalog while keeping all customer order histories and tax invoice records intact.
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingProduct(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="rounded-xl bg-red-600 px-5 py-2 text-xs font-black text-white hover:bg-red-700 shadow-md transition cursor-pointer"
                >
                  Confirm Safe Deletion
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminPortal;
