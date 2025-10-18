import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyAJRMClM7LrRUxIj6v3IlAGOXFdik4u4ys",
  authDomain: "shelterlink-969bc.firebaseapp.com",
  projectId: "shelterlink-969bc",
  storageBucket: "shelterlink-969bc.firebasestorage.app",
  messagingSenderId: "871583637861",
  appId: "1:871583637861:web:4da0edcd795f39f0aa018c",
  measurementId: "G-RLHHS6E445"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export default app;
