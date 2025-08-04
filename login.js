// DOM elements
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");

const loginError = document.getElementById("loginError");
const registerError = document.getElementById("registerError");

// Switch forms
showRegister.onclick = () => {
  loginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");
  loginError.textContent = "";
};

showLogin.onclick = () => {
  registerForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
  registerError.textContent = "";
};

// Register
registerForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("registerEmail").value.trim();
  const username = document.getElementById("registerUsername").value.trim();
  const password = document.getElementById("registerPassword").value.trim();

  const users = JSON.parse(localStorage.getItem("users")) || [];

  // Check if username already exists
  const exists = users.find(user => user.username === username);
  if (exists) {
    registerError.textContent = "Username already exists!";
    return;
  }

  // Save user
  users.push({ email, username, password });
  localStorage.setItem("users", JSON.stringify(users));

  // নতুন ইউজারের জন্য balance 0 সেট করো
  let balances = JSON.parse(localStorage.getItem("userBalances") || "{}");
  balances[username] = 0;
  localStorage.setItem("userBalances", JSON.stringify(balances));

  registerError.style.color = "limegreen";
  registerError.textContent = "Registration successful! Please login.";

  setTimeout(() => {
    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
    registerError.textContent = "";
  }, 1500);
});

// Login
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  const users = JSON.parse(localStorage.getItem("users")) || [];

  const validUser = users.find(
    user => user.username === username && user.password === password
  );

  if (validUser) {
    localStorage.setItem("currentUser", JSON.stringify(validUser));
    window.location.href = "home.html";
  } else {
    loginError.textContent = "Invalid username or password.";
  }
});
