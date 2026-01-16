import { db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const list = document.getElementById("list");

onAuthStateChanged(auth, user => {
  if (!user) location.href = "login.html";
  loadTasks(user.uid);
});

document.getElementById("add").addEventListener("click", async () => {
  await addDoc(collection(db, "tasks"), {
    text: text.value,
    datetime: date.value,
    status: "due",
    userId: auth.currentUser.uid
  });
  loadTasks(auth.currentUser.uid);
});

async function loadTasks(uid) {
  list.innerHTML = "";
  const snap = await getDocs(collection(db, "tasks"));

  snap.forEach(d => {
    if (d.data().userId !== uid) return;

    const li = document.createElement("li");
    li.innerHTML = `
      ${d.data().text}
      <button onclick="toggle('${d.id}', '${d.data().status}')">✔</button>
      <button onclick="del('${d.id}')">🗑</button>
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
