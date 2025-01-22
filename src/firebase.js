// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration

const firebaseConfig = {
    apiKey: "AIzaSyDyKDAG4aFAWYXAF7yOBC2p2xEUERAYpOE",
    authDomain: "esgdashboard-2c535.firebaseapp.com",
    projectId: "esgdashboard-2c535",
    storageBucket: "esgdashboard-2c535.appspot.com",
    messagingSenderId: "585639322807",
    appId: "1:585639322807:web:9f7b670b47d828de58d932"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const firestore = getFirestore(app);

export default app;