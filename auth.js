import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const email = document.getElementById("email");
const password = document.getElementById("password");

document.getElementById("signup")?.addEventListener("click", async () => {
  await createUserWithEmailAndPassword(auth, email.value, password.value);
  window.location = "index.html";
});

document.getElementById("login")?.addEventListener("click", async () => {
  await signInWithEmailAndPassword(auth, email.value, password.value);
  window.location = "index.html";
});
