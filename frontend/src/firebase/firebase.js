import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDL75V3g-TpR5_DwGxGJR0jgIPbTwa-9OE",
  authDomain: "diet-phase3.firebaseapp.com",
  projectId: "diet-phase3",
  storageBucket: "diet-phase3.appspot.com",
  messagingSenderId: "303921537706",
  appId: "1:303921537706:web:3f6f54620d6f68f57f66d3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

