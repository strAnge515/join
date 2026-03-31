import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyBmuTnjiq0SjSKXwtFK1DDu25UQ2VKzBUw',
  authDomain: 'join-developer-akademie-35d8f.firebaseapp.com',
  projectId: 'join-developer-akademie-35d8f',
  storageBucket: 'join-developer-akademie-35d8f.firebasestorage.app',
  messagingSenderId: '767040328238',
  appId: '1:767040328238:web:e78b51dcb15c516304c5bf',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Saves a new contact to the Firestore database.
 * @param {Object} contactData - The data of the contact (name, email, phone).
 * @returns {Promise<string>} The ID of the newly created document.
 */
export async function saveContact(contactData) {
  try {
    const docRef = await addDoc(collection(db, 'contacts'), contactData);
    return docRef.id;
  } catch (error) {
    console.error(error);
  }
}

/**
 * Loads all contacts from the Firestore database.
 * @returns {Promise<Array>} An array containing all contact objects.
 */
export async function loadContacts() {
  try {
    const querySnapshot = await getDocs(collection(db, 'contacts'));
    let contacts = [];
    querySnapshot.forEach((doc) => {
      contacts.push({ id: doc.id, ...doc.data() });
    });
    return contacts;
  } catch (error) {
    console.error(error);
  }
}

/**
 * Deletes a specific contact from the Firestore database.
 * @param {string} contactId - The unique Firebase ID of the contact.
 */
export async function deleteContact(contactId) {
  try {
    await deleteDoc(doc(db, 'contacts', contactId));
  } catch (error) {
    console.error(error);
  }
}

export async function updateContact(contactId, updatedData) {
  try {
    const contactRef = doc(db, 'contacts', contactId);
    await updateDoc(contactRef, updatedData);
  } catch (error) {
    console.error(error);
  }
}
