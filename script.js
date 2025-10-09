import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, serverTimestamp, doc, updateDoc, query, where, onSnapshot, getDocs
} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";

// ------------------
// 1. Firebase Config
// ------------------
const firebaseConfig = {
  apiKey: "AIzaSyAqhQpO-7ySrD-sMxWTTcUOn8K-4M7Q6qE",
  authDomain: "bet-le-bet-bookings.firebaseapp.com",
  projectId: "bet-le-bet-bookings",
  storageBucket: "bet-le-bet-bookings.firebasestorage.app",
  messagingSenderId: "992638149407",
  appId: "1:992638149407:web:88e7ed22c9f83308fc462a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ------------------
// 2. Services
// ------------------
const services = [
  "Home Care & Health Counseling",
  "Hairdressing & Beauty",
  "Online & In-Person Tutoring",
  "Day Maid / Domestic Help",
  "Consultancy & Professional Support"
];

const providerServiceSelect = document.getElementById('providerService');
if (providerServiceSelect) {
  services.forEach(service => {
    const option = document.createElement('option');
    option.value = service;
    option.textContent = service;
    providerServiceSelect.appendChild(option);
  });
}

// ------------------
// 3. Provider Form
// ------------------
const providerForm = document.getElementById('providerForm');
if (providerForm) {
  providerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(providerForm);
    const data = Object.fromEntries(formData.entries());
    data.timestamp = serverTimestamp();

    try {
      await addDoc(collection(db, "providers"), data);
      alert("Provider registered successfully!");
      providerForm.reset();
    } catch (err) {
      alert("Failed to register provider.");
    }
  });
}

// ------------------
// 4. Booking Form
// ------------------
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(bookingForm);
    const data = Object.fromEntries(formData.entries());
    data.timestamp = serverTimestamp();

    try {
      await addDoc(collection(db, "bookings"), data);
      alert("Booking submitted successfully!");
      bookingForm.reset();
    } catch (err) {
      alert("Failed to submit booking.");
    }
  });
}

// ------------------
// 5. Admin Dashboard
// ------------------
const providersListEl = document.querySelector('#providersList ul');
const bookingsContainer = document.getElementById('bookingsContainer');

if (providersListEl) {
  onSnapshot(collection(db, "providers"), snapshot => {
    providersListEl.innerHTML = '';
    snapshot.docs.forEach(docSnap => {
      const p = docSnap.data();
      const li = document.createElement('li');
      li.textContent = `${p.name} - ${p.service} - ${p.phone} - ${p.email} - ${p.location}`;
      providersListEl.appendChild(li);
    });
  });
}

if (bookingsContainer) {
  onSnapshot(collection(db, "bookings"), async snapshot => {
    bookingsContainer.innerHTML = '';
    for (const docSnap of snapshot.docs) {
      const booking = docSnap.data();
      const bookingId = docSnap.id;

      const q = query(collection(db, "providers"), where("service", "==", booking.service));
      const providersSnap = await getDocs(q);
      const matchingProviders = providersSnap.docs.map(p => ({ id: p.id, name: p.data().name }));

      const div = document.createElement('div');
      div.className = 'booking-item';
      div.innerHTML = `
        <strong>${booking.clientName}</strong> - ${booking.service} - ${booking.bookingDate || 'N/A'} <br/>
        Provider: <span class="provider-name">${booking.providerId ? matchingProviders.find(p => p.id === booking.providerId)?.name || 'Not assigned' : 'Not assigned'}</span>
        <select class="assign-provider">
          <option value="">Assign Provider</option>
          ${matchingProviders.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
        </select>
        <button class="assign-btn">Assign</button>
      `;

      div.querySelector('.assign-btn').addEventListener('click', async () => {
        const selectedProviderId = div.querySelector('.assign-provider').value;
        if (!selectedProviderId) return alert('Please select a provider');

        try {
          await updateDoc(doc(db, "bookings", bookingId), { providerId: selectedProviderId });
          div.querySelector('.provider-name').textContent = matchingProviders.find(p => p.id === selectedProviderId).name;
          alert('Provider assigned successfully!');
        } catch {
          alert("Failed to assign provider.");
        }
      });

      bookingsContainer.appendChild(div);
    }
  });
}

// ------------------
// 6. Smooth Scroll
// ------------------
window.scrollToSection = function(event, id) {
  event.preventDefault();
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
};

// ------------------
// 7. Private Admin Access
// ------------------
const urlParams = new URLSearchParams(window.location.search);
const isAdminMode = urlParams.has('admin');

const adminLoginForm = document.getElementById("adminLoginForm");
const adminSection = document.getElementById("dashboard");
const adminLoginSection = document.getElementById("adminLogin");

if (isAdminMode && adminLoginForm) {
  adminLoginSection.style.display = "block"; // Show login form only when ?admin=1 is present

  adminLoginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const password = document.getElementById("adminPass").value.trim();

    if (password === "betlebet2025") { // change this password anytime
      adminLoginSection.style.display = "none";
      adminSection.style.display = "block";
    } else {
      alert("Incorrect password.");
    }

    adminLoginForm.reset();
  });
}
