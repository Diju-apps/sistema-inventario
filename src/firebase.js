import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDotznacJ7AyPTxbEBdOEcvQfP95CWz1i0",
  authDomain: "gestioninv-88f2e.firebaseapp.com",
  projectId: "gestioninv-88f2e",
  storageBucket: "gestioninv-88f2e.firebasestorage.app",
  messagingSenderId: "438305996866",
  appId: "1:438305996866:web:8bf155bcc437d279c0addb"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
