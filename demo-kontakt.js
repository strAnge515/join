import { saveContact, loadContacts, deleteContact } from './backend-contacts.js';

const form = document.getElementById('test-contact-form');
const listContainer = document.getElementById('contact-list-container');


/**
 * Event listener for the contact form submission.
 * Validates, saves data, and refreshes the list.
 */
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const newContactData = {
        name: document.getElementById('contact-name').value,
        email: document.getElementById('contact-email').value,
        phone: document.getElementById('contact-phone').value
    };

    console.log("Sende Kontakt an Firebase...", newContactData);
    
    await saveContact(newContactData);
    
    form.reset();
    renderAllContacts();
});


/**
 * Fetches all contacts, sorts them alphabetically, and renders them to the HTML.
 */
async function renderAllContacts() {
    listContainer.innerHTML = "<p>Lade Kontakte...</p>";
    
    let contacts = await loadContacts();
    
    listContainer.innerHTML = ""; 

    if (!contacts || contacts.length === 0) {
        listContainer.innerHTML = "<p>Keine Kontakte gefunden.</p>";
        return;
    }

    // Alphabetische Sortierung nach Vorname (A-Z)
    contacts.sort((a, b) => a.name.localeCompare(b.name));

    contacts.forEach(contact => {
        const contactDiv = document.createElement('div');
        contactDiv.className = 'contact-card-test';
        
        const initials = generateInitials(contact.name);
        
        contactDiv.innerHTML = `
            <div class="contact-icon">${initials}</div>
            <div class="contact-details">
                <h3>${contact.name}</h3>
                <p>Email: ${contact.email}</p>
                <p>Phone: ${contact.phone}</p>
            </div>
            <div class="contact-actions">
                <p style="font-size: 10px; color: gray; margin-bottom: 5px;">ID: ${contact.id}</p>
            </div>
        `;

        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = "Kontakt löschen 🗑️";
        deleteBtn.className = "delete-btn";
        
        deleteBtn.addEventListener('click', async () => {
            console.log("Lösche Kontakt:", contact.id);
            await deleteContact(contact.id);
            renderAllContacts();
        });

        contactDiv.querySelector('.contact-actions').appendChild(deleteBtn);
        listContainer.appendChild(contactDiv);
    });
}


/**
 * Utility function to generate initials (AM) from full name (Anton Mayer).
 * @param {string} name - The full name.
 * @returns {string} The initials.
 */
function generateInitials(name) {
    const names = name.split(' ');
    
    const initials = names.slice(0, 2)
                          .map(namePart => namePart[0].toUpperCase())
                          .join('');
                          
    return initials;
}


document.addEventListener('DOMContentLoaded', renderAllContacts);