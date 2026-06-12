import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            "AIzaSyCX57eTfyyQGqn8sVvqA0-Uplwzj5Ly4VY",
  authDomain:        "golfmanager-544e0.firebaseapp.com",
  projectId:         "golfmanager-544e0",
  storageBucket:     "golfmanager-544e0.firebasestorage.app",
  messagingSenderId: "507026527153",
  appId:             "1:507026527153:web:2aba4ce7e9d2d4c6042390",
  measurementId:     "G-P3F13CT5HF",
};

const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signOutUser      = () => signOut(auth);
export const onAuthChange     = (cb) => onAuthStateChanged(auth, cb);

const SHARED_DOC = "shared/golf";

export async function loadFirestoreData() {
  try {
    const snap = await getDoc(doc(db, SHARED_DOC));
    if (snap.exists()) return snap.data();
    return null;
  } catch (e) {
    console.error("Firestore load error:", e);
    return null;
  }
}

export async function saveFirestoreData(data) {
  try {
    await setDoc(doc(db, SHARED_DOC), data, { merge: false });
  } catch (e) {
    console.error("Firestore save error:", e);
  }
}

export function subscribeToData(callback) {
  return onSnapshot(doc(db, SHARED_DOC), (snap) => {
    if (snap.exists()) callback(snap.data());
  });
}
