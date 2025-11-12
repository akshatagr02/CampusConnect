import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, serverTimestamp } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdYY0KjmH_M73w9BtDg76vFT6XEOQ1d9M",
  authDomain: "campus-co-37d12.firebaseapp.com",
  projectId: "campus-co-37d12",
  storageBucket: "campus-co-37d12.firebasestorage.app",
  messagingSenderId: "114301785845",
  appId: "1:114301785845:web:33b78c3ebb54b0f12dd7bc",
  measurementId: "G-12WYZ65Y2V"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the auth service
export const auth = getAuth(app);

// Get a reference to the Firestore service
export const db = getFirestore(app);

// Export serverTimestamp for use in chat
export { serverTimestamp };