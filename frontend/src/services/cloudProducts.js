import { collection, doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const PRODUCTS_COLLECTION = "products";

export const cloudProductsService = {
  /**
   * Subscribe to real-time products updates across all devices.
   * Whenever any device adds, edits, or adjusts stock, all connected devices update.
   */
  subscribe: (onProductsUpdate, onError) => {
    try {
      const colRef = collection(db, PRODUCTS_COLLECTION);
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          const productsList = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            productsList.push({
              ...data,
              id: data.id !== undefined ? data.id : docSnap.id,
            });
          });
          if (productsList.length > 0) {
            onProductsUpdate(productsList);
          }
        },
        (error) => {
          console.warn("[FIRESTORE PRODUCTS NOTICE]:", error.message);
          if (onError) onError(error);
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn("[FIRESTORE PRODUCTS INIT NOTICE]:", err.message);
      return () => {};
    }
  },

  /**
   * Add or overwrite a product in the cloud.
   */
  saveProduct: async (product) => {
    try {
      const docId = String(product.id || `prod_${Date.now()}`);
      const docRef = doc(db, PRODUCTS_COLLECTION, docId);
      const cleanProduct = {
        ...product,
        id: product.id || docId,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(docRef, cleanProduct, { merge: true });
      return cleanProduct;
    } catch (err) {
      console.warn("[FIRESTORE SAVE PRODUCT NOTICE]:", err.message);
      return product;
    }
  },

  /**
   * Update specific fields of a product in the cloud.
   */
  updateProduct: async (productId, fields) => {
    try {
      const docId = String(productId);
      const docRef = doc(db, PRODUCTS_COLLECTION, docId);
      await setDoc(docRef, { ...fields, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      console.warn("[FIRESTORE UPDATE PRODUCT NOTICE]:", err.message);
    }
  },

  /**
   * Adjust product stock across all devices.
   */
  adjustStock: async (productId, nextStock) => {
    try {
      const docId = String(productId);
      const docRef = doc(db, PRODUCTS_COLLECTION, docId);
      await setDoc(docRef, { stock: nextStock, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      console.warn("[FIRESTORE STOCK NOTICE]:", err.message);
    }
  },
};
