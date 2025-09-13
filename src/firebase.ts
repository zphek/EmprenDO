import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"

const firebaseConfig = {
    apiKey: "AIzaSyDh7a6l9p_fy_m0gA8fiwYcpmP0XXwuZxU",
    authDomain: "emprendo-17910.firebaseapp.com",
    projectId: "emprendo-17910",
    storageBucket: "emprendo-17910.firebasestorage.app",
    messagingSenderId: "1031480096938",
    appId: "1:1031480096938:web:5c25a16a15a4c8aed338d3",
    measurementId: "G-LERK2NFL2V"
  };

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app, "gs://emprendo-17910.firebasestorage.app");
export default app;