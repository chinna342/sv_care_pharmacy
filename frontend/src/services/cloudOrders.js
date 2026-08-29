import { collection, doc, setDoc, updateDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

const ORDERS_COLLECTION = "orders";

export const cloudOrdersService = {
  /**
   * Real-time multi-device subscription to all orders.
   * Runs instantaneously when any user on any device places or updates an order.
   */
  subscribe: (onOrdersUpdate, onError) => {
    try {
      const colRef = collection(db, ORDERS_COLLECTION);
      
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          const ordersList = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            ordersList.push({ ...data, id: docSnap.id });
          });
          // Sort client-side by date safely
          ordersList.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
            const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
            return dateB - dateA;
          });
          onOrdersUpdate(ordersList);
        },
        (error) => {
          console.warn("[FIRESTORE SYNC NOTICE]: Falling back to standard API sync:", error.message);
          if (onError) onError(error);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.warn("[FIRESTORE INIT NOTICE]:", err.message);
      return () => {};
    }
  },

  /**
   * Save a newly placed order to the cloud so all devices (Pharmacist, Delivery, Admin) receive it immediately.
   */
  saveOrder: async (order) => {
    try {
      const orderId = order.order_number || order.id || `SV${Date.now()}`;
      const docRef = doc(db, ORDERS_COLLECTION, orderId);
      
      const cleanOrder = JSON.parse(
        JSON.stringify({
          ...order,
          id: orderId,
          order_number: orderId,
          createdAt: order.createdAt || order.created_at || new Date().toISOString(),
          created_at: order.created_at || order.createdAt || new Date().toISOString(),
        })
      );

      await setDoc(docRef, cleanOrder, { merge: true });
      return cleanOrder;
    } catch (err) {
      console.warn("[FIRESTORE SAVE NOTICE]:", err.message);
      return order;
    }
  },

  /**
   * Update an order's status across all devices instantly (e.g. ACCEPTED, PACKED, OUT_FOR_DELIVERY, DELIVERED).
   */
  updateStatus: async (orderId, newStatus, reason = "", rejectionReason = "") => {
    try {
      const cleanId = String(orderId);
      const docRef = doc(db, ORDERS_COLLECTION, cleanId);
      const payload = {
        status: newStatus,
        order_status: newStatus,
        updatedAt: new Date().toISOString(),
      };
      if (reason) payload.reason = reason;
      if (rejectionReason) payload.rejection_reason = rejectionReason;

      await updateDoc(docRef, payload);
    } catch (err) {
      console.warn("[FIRESTORE UPDATE STATUS NOTICE]:", err.message);
    }
  },
};
