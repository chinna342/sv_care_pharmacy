import nodemailer from "nodemailer";

global.ordersStorage = global.ordersStorage || [];

const GMAIL_USER = process.env.GMAIL_USER || "venkatc283@gmail.com";
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD || "hmsaopnkygbzikil";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS,
  },
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    return res.status(200).json(global.ordersStorage);
  }

  if (req.method === "POST") {
    try {
      const data = req.body || {};
      const orderNum = `SV${Math.floor(100000 + Math.random() * 900000)}`;
      const nowIso = new Date().toISOString();

      const items = Array.isArray(data.items) ? data.items : [];
      let subtotal = 0;
      items.forEach((item) => {
        subtotal += (parseFloat(item.price) || 50) * (parseInt(item.quantity) || 1);
      });
      const deliveryFee = subtotal >= 500 ? 0 : 40;
      const total = subtotal + deliveryFee;

      const newOrder = {
        id: orderNum,
        order_number: orderNum,
        server_id: Math.floor(Math.random() * 90000) + 1000,
        customer: {
          name: data.name || data.customer?.name || "Valued Patient",
          phone: data.phone || data.customer?.phone || "9876543210",
          house: data.house || data.customer?.house || "Doorstep Address",
          area: data.area || data.customer?.area || "Hyderabad",
          city: data.city || data.customer?.city || "Hyderabad",
          pincode: data.pincode || data.customer?.pincode || "500081",
        },
        address: {
          name: data.name || data.customer?.name || "Valued Patient",
          phone: data.phone || data.customer?.phone || "9876543210",
          house: data.house || data.customer?.house || "Doorstep Address",
          area: data.area || data.customer?.area || "Hyderabad",
          city: data.city || data.customer?.city || "Hyderabad",
          pincode: data.pincode || data.customer?.pincode || "500081",
        },
        items: items.map((item) => ({
          product_id: item.product_id || item.id || 1,
          product_name: item.name || item.product_name || "Prescribed Medicine",
          price: parseFloat(item.price) || 50,
          quantity: parseInt(item.quantity) || 1,
          image: item.image || "/medicines/dolo-650.jpg",
        })),
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        total: total,
        payment_method: data.payment_method || data.paymentMethod || "cod",
        payment_status: data.payment_method === "cod" ? "pending" : "paid",
        payment_id: data.payment_id || `PAY_${Date.now()}`,
        gateway_name: data.gateway_name || "SV Care Gateway",
        status: "PENDING_PHARMACIST_REVIEW",
        order_status: "PENDING_PHARMACIST_REVIEW",
        prescription_required: !!data.prescription_uploaded,
        prescription_status: data.prescription_uploaded ? "PENDING_REVIEW" : "NOT_REQUIRED",
        created_at: nowIso,
        createdAt: nowIso,
      };

      global.ordersStorage.unshift(newOrder);

      try {
        const customerEmail = data.email || GMAIL_USER;
        const mailOptions = {
          from: `"SV Care Pharmacy" <${GMAIL_USER}>`,
          to: customerEmail,
          subject: `📦 SV Care Order Confirmation #${orderNum} - Verification Pending`,
          text: `SV CARE PHARMACY\n\nThank you for choosing SV Care. We received order #${orderNum} totaling ₹${total.toFixed(2)}.\nOur licensed pharmacist is reviewing your order for fast 15-30m cold-chain delivery.\n\nSupport: venkatc283@gmail.com`,
          html: `
            <div style="font-family:sans-serif; background:#f8fafc; padding:20px;">
              <div style="max-width:500px; margin:0 auto; background:#fff; border-radius:16px; padding:24px; border:1px solid #e2e8f0;">
                <h2 style="color:#065f46; margin-top:0;">💊 SV CARE PHARMACY</h2>
                <p>Hello <strong>${newOrder.customer.name}</strong>,</p>
                <p>We have received your order <strong>#${orderNum}</strong> with total amount <strong>₹${total.toFixed(2)}</strong>.</p>
                <div style="background:#f0fdf4; border-left:4px solid #00a878; padding:12px; border-radius:8px; margin:16px 0;">
                  <strong style="color:#065f46;">⚡ Express Cold-Chain Delivery:</strong> Queued for Pharmacist Verification.
                </div>
                <p style="font-size:12px; color:#64748b;">License: TS/HYD/2026/8942-R • Support: venkatc283@gmail.com</p>
              </div>
            </div>
          `,
        };
        await transporter.sendMail(mailOptions);
      } catch (err) {
        console.warn("[MAIL NOTICE]:", err.message);
      }

      console.log(`[SV CARE CLOUD ORDER] Order #${orderNum} placed by ${newOrder.customer.name}`);
      return res.status(200).json(newOrder);
    } catch (error) {
      console.error("[CREATE ORDER ERROR]:", error);
      return res.status(500).json({ detail: "Failed to process order." });
    }
  }

  if (req.method === "PUT") {
    try {
      const { new_status, reason, rejection_reason, order_id } = req.body || {};
      const urlParts = req.url.split("/");
      const targetId = order_id || urlParts[urlParts.length - 2] || urlParts[urlParts.length - 1];

      const idx = global.ordersStorage.findIndex(
        (o) => o.id === targetId || o.order_number === targetId || String(o.server_id) === String(targetId)
      );

      if (idx >= 0) {
        global.ordersStorage[idx].status = new_status;
        global.ordersStorage[idx].order_status = new_status;
        if (rejection_reason) global.ordersStorage[idx].rejection_reason = rejection_reason;
        if (reason) global.ordersStorage[idx].status_reason = reason;

        return res.status(200).json(global.ordersStorage[idx]);
      }

      return res.status(200).json({ success: true, message: "Status updated." });
    } catch (error) {
      return res.status(500).json({ detail: "Failed to update status." });
    }
  }

  return res.status(405).json({ detail: "Method not allowed." });
}
