import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDc-b0Vgp9S8L8rYr7kSuFlm3D2Ws-TLf0",
  authDomain: "sv-care.firebaseapp.com",
  projectId: "sv-care",
  storageBucket: "sv-care.firebasestorage.app",
  messagingSenderId: "855063906584",
  appId: "1:855063906584:web:fab24836d647714d04366d",
  measurementId: "G-0XQMN4WEY0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export default app;
