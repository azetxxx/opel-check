import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAlB4FZ3Ck10N3FKIocD4RajOh511_zQfE",
  authDomain: "opel-check.firebaseapp.com",
  projectId: "opel-check",
  storageBucket: "opel-check.firebasestorage.app",
  messagingSenderId: "350504595763",
  appId: "1:350504595763:web:8e94f12d14344482034e46"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
