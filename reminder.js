import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC9y61dLJ_mcw3S3h6s1nOfkkFz53mpIRQ",
  authDomain: "reminder-db-57529.firebaseapp.com",
  projectId: "reminder-db-57529",
  storageBucket: "reminder-db-57529.firebasestorage.app",
  messagingSenderId: "287428931967",
  appId: "1:287428931967:web:06153c840d818745002a4a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM
const list = document.getElementById("list");
const text = document.getElementById("text");
const dateInput = document.getElementById("date");

// ---------- DATUM / URA: samo od "zdaj" naprej ----------

// vrne ISO string za datetime-local (YYYY-MM-DDTHH:MM)
function nowISO() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // timezone fix
  return now.toISOString().slice(0, 16);
}

// nastavi value + min na "zdaj"
function setNowAndMin() {
  const iso = nowISO();
  dateInput.value = iso;
  dateInput.min = iso;
}

// ob loadu
setNowAndMin();

// posodabljaj min, če ima user stran dolgo odprto (na 30s)
setInterval(() => {
  dateInput.min = nowISO();
}, 30_000);

// če user izbere čas v preteklosti
dateInput.addEventListener("change", () => {
  const selected = new Date(dateInput.value);
  const now = new Date();

  if (selected < now) {
    alert("Ne moreš nastaviti časa, ki je že mimo ⏱️");
    setNowAndMin();
  }
});

// ---------- AUTH / TASKI ----------

onAuthStateChanged(auth, user => {
  if (!user) window.location.replace("login.html");
  else loadTasks(user.uid);
});

document.getElementById("add").addEventListener("click", async () => {
  if (!text.value || !dateInput.value) {
    alert("Vnesi task in datum!");
    return;
  }

  // zadnja kontrola pred shranjevanjem
  const selected = new Date(dateInput.value);
  const now = new Date();
  if (selected < now) {
    alert("Izberi čas v prihodnosti!");
    setNowAndMin();
    return;
  }

  await addDoc(collection(db, "tasks"), {
    text: text.value,
    datetime: dateInput.value,
    status: "due",
    userId: auth.currentUser.uid
  });

  text.value = "";
  setNowAndMin();
  loadTasks(auth.currentUser.uid);
});

async function loadTasks(uid) {
  list.innerHTML = "";
  const snap = await getDocs(collection(db, "tasks"));

  snap.forEach(d => {
    const data = d.data();
    if (data.userId !== uid) return;

    // datum v lep format
    let lepsiDatum = data.datetime;
    if (data.datetime) {
      const datumObjekt = new Date(data.datetime);
      lepsiDatum = new Intl.DateTimeFormat("sl-SI", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(datumObjekt);
    }

    const li = document.createElement("li");
    const stil =
      data.status === "completed"
        ? "text-decoration: line-through; opacity: 0.6;"
        : "";

    li.innerHTML = `
      <div class="taskContainer">
        <span style="${stil}">${data.text} — ${lepsiDatum}</span>
        <div class="buttonContainer">
          <button onclick="toggle('${d.id}', '${data.status}')">✔ Completed</button>
          <button onclick="del('${d.id}')">🗑 Delete</button>
        </div>
      </div>
    `;

    list.appendChild(li);
  });
}

window.toggle = async (id, status) => {
  await updateDoc(doc(db, "tasks", id), {
    status: status === "due" ? "completed" : "due"
  });
  loadTasks(auth.currentUser.uid);
};

window.del = async id => {
  await deleteDoc(doc(db, "tasks", id));
  loadTasks(auth.currentUser.uid);
};

document.getElementById("logout").addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.replace("login.html");
  } catch (error) {
    alert("Napaka pri odjavi");
    console.error(error);
  }
});
