import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyCKVqgyi6dB37mg9OMnxuKPjygDDcibYyQ",
  authDomain: "svarkaapp.firebaseapp.com",
  projectId: "svarkaapp",
  storageBucket: "svarkaapp.appspot.com",
  messagingSenderId: "599450533609",
  appId: "1:599450533609:web:22834cd4ebaf44fd62fa78",
  measurementId: "G-3D8K3EJ4Z7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

export { auth, db, functions }; 