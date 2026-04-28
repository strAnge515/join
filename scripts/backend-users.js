import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBmuTnjiq0SjSKXwtFK1DDu25UQ2VKzBUw",
    authDomain: "join-developer-akademie-35d8f.firebaseapp.com",
    projectId: "join-developer-akademie-35d8f",
    storageBucket: "join-developer-akademie-35d8f.firebasestorage.app",
    messagingSenderId: "767040328238",
    appId: "1:767040328238:web:e78b51dcb15c516304c5bf"
};

const app = initializeApp(firebaseConfig, "users-app");
const db = getFirestore(app);


/**
 * Saves a new user to the Firestore database.
 * @param {Object} userData - The user data object (name, email, password).
 * @returns {Promise<string>} The ID of the newly created document.
 */
export async function saveUser(userData) {
    try {
        const docRef = await addDoc(collection(db, "users"), userData);
        return docRef.id;
    } catch (error) {
        console.error(error);
    }
}


/**
 * Finds a user by their email address in the Firestore database.
 * @param {string} email - The email address to search for.
 * @returns {Promise<Object|null>} The user object or null if not found.
 */
export async function findUserByEmail(email) {
    try {
        const q = query(collection(db, "users"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    } catch (error) {
        console.error(error);
    }
}