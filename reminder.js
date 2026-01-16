import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 1️⃣ Tvoja Firebase konfiguracija
const firebaseConfig = {
  apiKey: "AIzaSyC9y61dLJ_mcw3S3h6s1nOfkkFz53mpIRQ",
  authDomain: "reminder-db-57529.firebaseapp.com",
  projectId: "reminder-db-57529",
  storageBucket: "reminder-db-57529.firebasestorage.app",
  messagingSenderId: "287428931967",
  appId: "1:287428931967:web:06153c840d818745002a4a"
};

// 2️⃣ Inicializacija Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 3️⃣ DOM elementi
const list = document.getElementById("list");
const text = document.getElementById("text");
const date = document.getElementById("date");

// 4️⃣ Preusmeritev neavtenticiranih uporabnikov
onAuthStateChanged(auth, user => {
  if (!user) window.location.replace("login.html");
  else loadTasks(user.uid);
});

// 5️⃣ Dodajanje novega taska
document.getElementById("add").addEventListener("click", async () => {
  if (!text.value || !date.value) return alert("Vnesi task in datum!");
  await addDoc(collection(db, "tasks"), {
    text: text.value,
    datetime: date.value,
    status: "due",
    userId: auth.currentUser.uid
  });
  text.value = "";
  date.value = "";
  loadTasks(auth.currentUser.uid);
});

// 6️⃣ Naloži vse task-e za trenutnega uporabnika
async function loadTasks(uid) {
  list.innerHTML = "";
  const snap = await getDocs(collection(db, "tasks"));
  snap.forEach(d => {
    if (d.data().userId !== uid) return;
    const li = document.createElement("li");
    li.innerHTML = `
      ${d.data().text} - ${d.data().datetime}
      <button onclick="toggle('${d.id}', '${d.data().status}')">✔</button>
      <button onclick="del('${d.id}')">🗑</button>
    `;
    list.appendChild(li);
  });
}

// 7️⃣ Toggle status
window.toggle = async (id, status) => {
  await updateDoc(doc(db, "tasks", id), {
    status: status === "due" ? "completed" : "due"
  });
  loadTasks(auth.currentUser.uid);
};

// 8️⃣ Brisanje taska
window.del = async id => {
  await deleteDoc(doc(db, "tasks", id));
  loadTasks(auth.currentUser.uid);
};
