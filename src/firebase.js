// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBkZNRLBAq_ZHcGRc8KSf5ARz3zHy7UJFo",
  authDomain: "onemore-ace5b.firebaseapp.com",
  projectId: "onemore-ace5b",
  storageBucket: "onemore-ace5b.firebasestorage.app",
  messagingSenderId: "652138744372",
  appId: "1:652138744372:web:1151a3941a54315ceed861",
  measurementId: "G-LC2XL58H3J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
