
// Give Balance to user
function giveBalance() {
  const user = document.getElementById("targetUser").value.trim();
  const amount = parseFloat(document.getElementById("targetAmount").value);

  if (!user || isNaN(amount) || amount <= 0) {
    return alert("Enter valid username and positive amount");
  }

  let balances = JSON.parse(localStorage.getItem("userBalances") || "{}");
  balances[user] = (balances[user] || 0) + amount;
  localStorage.setItem("userBalances", JSON.stringify(balances));

  document.getElementById("balanceSent").innerText = `✅ ৳${amount} given to ${user}`;
}

// Update payment numbers
function updatePaymentNumbers() {
  const bkash = document.getElementById("bkashNumber").value.trim();
  const nagad = document.getElementById("nagadNumber").value.trim();
  const rocket = document.getElementById("rocketNumber").value.trim();

  const numbers = { bkash, nagad, rocket };
  localStorage.setItem("paymentNumbers", JSON.stringify(numbers));
  document.getElementById("paymentUpdated").innerText = "✅ Payment numbers updated!";
}

// Update win rate
function updateWinRate() {
  const rate = parseInt(document.getElementById("winRate").value);
  if (isNaN(rate) || rate < 0 || rate > 100) {
    return alert("Enter a valid win rate between 0 and 100");
  }

  localStorage.setItem("winRate", rate);
  document.getElementById("winRateUpdated").innerText = `✅ Win rate set to ${rate}%`;
}

// Approve deposit
function approveDeposit(username) {
  const deposits = JSON.parse(localStorage.getItem("deposits") || "[]");
  const balances = JSON.parse(localStorage.getItem("userBalances") || "{}");

  const deposit = deposits.find(d => d.username === username);
  if (!deposit) return;

  balances[username] = (balances[username] || 0) + deposit.amount;
  localStorage.setItem("userBalances", JSON.stringify(balances));

  const updatedDeposits = deposits.filter(d => d.username !== username);
  localStorage.setItem("deposits", JSON.stringify(updatedDeposits));

  loadDeposits(); // refresh list
}

// Load deposit requests
function loadDeposits() {
  const deposits = JSON.parse(localStorage.getItem("deposits") || "[]");
  const container = document.getElementById("depositList");
  container.innerHTML = "";

  deposits.forEach(dep => {
    const div = document.createElement("div");
    div.innerHTML = `
      <p><b>${dep.username}</b> wants to deposit ৳${dep.amount}
      <button onclick="approveDeposit('${dep.username}')">Approve</button></p>
    `;
    container.appendChild(div);
  });
}

// Load on page load
window.onload = function () {
  loadDeposits();
};
