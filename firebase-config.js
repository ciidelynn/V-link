// firebase-config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCskpROK3OC55EXjDP-ywMiuaOen-fwr2Y",
  authDomain: "v-link-5d0c8.firebaseapp.com",
  projectId: "v-link-5d0c8",
  storageBucket: "v-link-5d0c8.firebasestorage.app",
  messagingSenderId: "797769925158",
  appId: "1:797769925158:web:58c4a32a506494999b5ce7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export instances
export const db = getFirestore(app);
export const auth = getAuth(app);
