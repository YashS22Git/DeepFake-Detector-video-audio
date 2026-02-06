import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDttDXV3FCj4nAb9Khs4fEAUp_Lw0QPlnY",
    authDomain: "micrososft-s.firebaseapp.com",
    projectId: "micrososft-s",
    storageBucket: "micrososft-s.firebasestorage.app",
    messagingSenderId: "752995522746",
    appId: "1:752995522746:web:decb610783369e2bb08a83",
    measurementId: "G-TMBJP42YHV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
