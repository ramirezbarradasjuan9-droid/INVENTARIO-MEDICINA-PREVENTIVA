import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase para el proyecto: inventarioMPHGSC
const firebaseConfig = {
  apiKey: "AIzaSyAbJHxiK1G38zRz8Ti7EJyLesBxcdgmQDs",
  authDomain: "inventariomphgsc.firebaseapp.com",
  projectId: "inventariomphgsc",
  storageBucket: "inventariomphgsc.firebasestorage.app",
  messagingSenderId: "825147498372",
  appId: "1:825147498372:web:ca2542ad7395b0d47847d1",
  measurementId: "G-2RLNNK1MMY"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const analytics = getAnalytics(app);
export const db = getFirestore(app);