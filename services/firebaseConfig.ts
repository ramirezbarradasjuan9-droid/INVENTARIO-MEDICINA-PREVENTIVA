import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDYMGJu0iaGTE1pNbjE-k8Z9s7rKLl3J6s",
  authDomain: "inventariomedprevhgsc.firebaseapp.com",
  projectId: "inventariomedprevhgsc",
  storageBucket: "inventariomedprevhgsc.firebasestorage.app",
  messagingSenderId: "736727518542",
  appId: "1:736727518542:web:c2b337e034c820c9e9e21f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and export it
export const db = getFirestore(app);