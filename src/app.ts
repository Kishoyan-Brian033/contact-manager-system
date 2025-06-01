interface ContactData {
    id: number;
    name: string;
    phone: string;
    email: string;
}

class Contact implements ContactData {
    id: number;
    name: string;
    phone: string;
    email: string;

    constructor(name: string, phone: string, email: string) {
        this.id = Date.now();
        this.name = name;
        this.phone = phone;
        this.email = email;
    }
}

class ContactManager {
    contacts: Contact[] = [];
    private formContainer: HTMLElement;
    private form: HTMLFormElement;

    constructor() {
        this.formContainer = document.querySelector(".form-container") as HTMLElement;
        this.form = document.querySelector(".form") as HTMLFormElement;
        this.loadFromStorage();
        this.displayContacts();
        this.setupEventListeners();
    }

    addContact(contact: Contact) {
        this.contacts.push(contact);
        this.saveToStorage();
        this.displayContacts();
    }

    updateContact(id: number, updatedData: ContactData) {
        const index = this.contacts.findIndex(c => c.id === id);
        if (index > -1) {
            this.contacts[index] = { ...updatedData };
            this.saveToStorage();
            this.displayContacts();
        }
    }

    deleteContact(id: number) {
        this.contacts = this.contacts.filter(c => c.id !== id);
        this.saveToStorage();
        this.displayContacts();
    }

    private saveToStorage() {
        localStorage.setItem("contacts", JSON.stringify(this.contacts));
    }

    private loadFromStorage() {
        const stored = localStorage.getItem("contacts");
        if (stored) {
            this.contacts = JSON.parse(stored);
        }
    }

    displayContacts() {
        const list = document.querySelector(".contact-list") as HTMLElement;
        if (!list) return;

        list.innerHTML = "";

        if (this.contacts.length === 0) {
            list.innerHTML = "<p>No contacts found. Add your first contact!</p>";
            return;
        }

        this.contacts.forEach(contact => {
            const div = document.createElement("div");
            div.className = "contact-card";
            div.innerHTML = `
                <p><strong>Name:</strong> ${contact.name}</p>
                <p><strong>Phone:</strong> ${contact.phone}</p>
                <p><strong>Email:</strong> ${contact.email}</p>
                <button data-action="edit" data-id="${contact.id}">Edit</button>
                <button data-action="delete" data-id="${contact.id}">Delete</button>
            `;
            list.appendChild(div);
        });
    }

    private setupEventListeners() {
        const toggleBtn = document.getElementById("btn") as HTMLButtonElement;

        toggleBtn.addEventListener("click", () => {
            this.formContainer.classList.toggle("hidden");
            if (!this.formContainer.classList.contains("hidden")) {
                this.form.reset();
                this.form.removeAttribute("data-editing");
            }
        });

    
        this.form.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = (document.getElementById("username") as HTMLInputElement).value;
            const phone = (document.getElementById("phone_number") as HTMLInputElement).value;
            const email = (document.getElementById("email") as HTMLInputElement).value;

            const editId = this.form.getAttribute("data-editing");

            if (editId) {
                this.updateContact(Number(editId), {
                    id: Number(editId),
                    name,
                    phone,
                    email
                });
                this.form.removeAttribute("data-editing");
            } else {
                const newContact = new Contact(name, phone, email);
                this.addContact(newContact);
            }

            this.form.reset();
            this.formContainer.classList.add("hidden");
        });

        const list = document.querySelector(".contact-list");
        if (list) {
            list.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
             
                if (target.matches('button[data-action="edit"]') || target.closest('button[data-action="edit"]')) {
                    const button = target.matches('button[data-action="edit"]') ? 
                        target as HTMLButtonElement : 
                        target.closest('button[data-action="edit"]') as HTMLButtonElement;
                    if (button) {
                        const id = parseInt(button.dataset.id || '0');
                        this.handleEditContact(id);
                    }
                }
                
                if (target.matches('button[data-action="delete"]') || target.closest('button[data-action="delete"]')) {
                    const button = target.matches('button[data-action="delete"]') ? 
                        target as HTMLButtonElement : 
                        target.closest('button[data-action="delete"]') as HTMLButtonElement;
                    if (button) {
                        const id = parseInt(button.dataset.id || '0');
                        this.handleDeleteContact(id);
                    }
                }
            });
        }
    }

    private handleEditContact(id: number) {
        const contact = this.contacts.find(c => c.id === id);
        if (contact) {
            (document.getElementById("username") as HTMLInputElement).value = contact.name;
            (document.getElementById("phone_number") as HTMLInputElement).value = contact.phone;
            (document.getElementById("email") as HTMLInputElement).value = contact.email;
            this.form.setAttribute("data-editing", contact.id.toString());
            this.formContainer.classList.remove("hidden");
        }
    }

    private handleDeleteContact(id: number) {
        if (confirm("Are you sure you want to delete this contact?")) {
            this.deleteContact(id);
        }
    }
}


const manager = new ContactManager();