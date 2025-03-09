// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAYWRKmnNyhObMz08CkDPhW6Vv4bn3oah8",
  authDomain: "taskinator1615.firebaseapp.com",
  projectId: "taskinator1615",
  storageBucket: "taskinator1615.firebasestorage.app",
  messagingSenderId: "874019378166",
  appId: "1:874019378166:web:ad814f5e42951b38e8add7",
  measurementId: "G-T3YWKL5VCB",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
