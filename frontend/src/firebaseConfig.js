// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration (replace with your own)
const firebaseConfig = {
    apiKey: "AIzaSyAvGsf4H3Qakw33gg1JvGtxlXHD2J_rBPU",
    authDomain: "eth-insurance-policies.firebaseapp.com",
    projectId: "eth-insurance-policies",
    storageBucket: "eth-insurance-policies.appspot.com",
    messagingSenderId: "152094369076",
    appId: "1:152094369076:web:62f7ef2ce11de3fbad7161",
    measurementId: "G-QK9FVD8YJY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Storage and Firestore
const storage = getStorage(app);
const db = getFirestore(app);

export { storage, db };
