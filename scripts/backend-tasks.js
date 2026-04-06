import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBmuTnjiq0SjSKXwtFK1DDu25UQ2VKzBUw",
    authDomain: "join-developer-akademie-35d8f.firebaseapp.com",
    projectId: "join-developer-akademie-35d8f",
    storageBucket: "join-developer-akademie-35d8f.firebasestorage.app",
    messagingSenderId: "767040328238",
    appId: "1:767040328238:web:e78b51dcb15c516304c5bf"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


/**
 * Saves a new task to the Firestore database.
 * @param {Object} taskData - The data of the task.
 * @returns {Promise<string>} The ID of the newly created document.
 */
export async function saveTask(taskData) {
    console.log(taskData)
    try {
        const docRef = await addDoc(collection(db, "tasks"), taskData);
        return docRef.id;
    } catch (error) {
        console.error(error);
    }
}


/**
 * Loads all tasks from the Firestore database.
 * @returns {Promise<Array>} An array containing all task objects.
 */
export async function loadTasks() {
    try {
        const querySnapshot = await getDocs(collection(db, "tasks"));
        let tasks = [];
        querySnapshot.forEach((doc) => {
            tasks.push({ id: doc.id, ...doc.data() });
        });
        return tasks;
    } catch (error) {
        console.error(error);
    }
}


/**
 * Deletes a specific task from the Firestore database.
 * @param {string} taskId - The unique Firebase ID of the task.
 */
export async function deleteTask(taskId) {
    try {
        await deleteDoc(doc(db, "tasks", taskId));
    } catch (error) {
        console.error(error);
    }
}