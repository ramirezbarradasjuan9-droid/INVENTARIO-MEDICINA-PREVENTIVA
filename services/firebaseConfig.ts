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

// Inicializar y exportar Firestore
export const db = getFirestore(app);

// Inicializar Analytics de forma segura
// Usamos try-catch para evitar que un error en Analytics rompa toda la app
let analyticsInstance = null;
try {
  if (typeof window !== 'undefined') {
    analyticsInstance = getAnalytics(app);
  }
} catch (e) {
  console.warn("Firebase Analytics no se pudo inicializar (posiblemente bloqueado por el entorno). La app continuará funcionando.", e);
}

export const analytics = analyticsInstance;