let members = JSON.parse(localStorage.getItem("members")) || [];
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
function save() {
localStorage.setItem("members", JSON.stringify(members));
localStorage.setItem("expenses", JSON.stringify(expenses));
}
function addMember() {
let name = document.getElementById("member_name").value.trim();
if (!name || members.length >= 10 || members.some(m => m.toLowerCase() === name.toLowerCase())) {
document.getElementById("memberError").innerText = "Invalid or duplicate name (maximum 10 members)";
return;
}members.push(name);
document.getElementById("member_name").value = "";
save();
show();
}
function removeMember(name) {
if (expenses.some(e => e.paidBy === name || e.splitAmong.includes(name))) {
document.getElementById("memberError").innerText = "Member has expenses";
return;
}
members = members.filter(m => m !== name);
save();
show();
}
function addExpense() {
let title = document.getElementById("expenseTitle").value.trim();
let amount = document.getElementById("expense_amount").value;
let payer = document.getElementById("paidBy").value;
let selected = [...document.querySelectorAll("#splitMembers input:checked")].map(c => c.value);
let error = document.getElementById("expenseError");
if (!title || !/^\d+(\.\d{1,2})?$/.test(amount) || Number(amount) <= 0 || !payer || !selected.length) {
error.innerText = "Please enter valid expense details";
return;
}
expenses.push({
id: Date.now(),
title,
amount: Math.round(Number(amount) * 100),
paidBy: payer,
splitAmong: selected
});
document.getElementById("expenseTitle").value = "";
document.getElementById("expense_amount").value = "";
error.innerText = "";
save();
show();
}
function deleteExpense(id) {
expenses = expenses.filter(e => e.id !== id);
save();
show();
}
function calculate() {let balance = {};
members.forEach(m => balance[m] = { paid: 0, share: 0, net: 0 });
expenses.forEach(e => {
balance[e.paidBy].paid += e.amount;
let share = Math.floor(e.amount / e.splitAmong.length);
let extra = e.amount % e.splitAmong.length;
e.splitAmong.forEach((m, i) => {
balance[m].share += share + (i < extra ? 1 : 0);
});});
members.forEach(m => {
balance[m].net = balance[m].paid - balance[m].share;});
return balance;}
function show() {
let list = document.getElementById("memberList");
let payer = document.getElementById("paidBy");
let split = document.getElementById("splitMembers");
list.innerHTML = "";
payer.innerHTML = '<option value="">Select Member</option>';
split.innerHTML = "";
members.forEach(m => {
list.innerHTML += `<li>${m} <button onclick='removeMember(${JSON.stringify(m)})'>Remove</button></li>`;
payer.innerHTML += `<option>${m}</option>`;
split.innerHTML += `<label><input type="checkbox" value="${m}" checked>${m}</label>`;
});
let balance = calculate();
let rows = document.getElementById("balanceList");
rows.innerHTML = "";
members.forEach(m => {
let b = balance[m];
rows.innerHTML += `<tr><td>${m}</td><td>₹${(b.paid / 100).toFixed(2)}</td><td>₹${(b.share / 100).toFixed(2)}</td><td>₹${(b.net / 100).toFixed(2)}</td></tr>`;
});
let expensesHTML = document.getElementById("expenseList");
expensesHTML.innerHTML = "";
[...expenses].reverse().forEach(e => {
expensesHTML.innerHTML += `<div><h3>${e.title}</h3><p>₹${(e.amount / 100).toFixed(2)}</p><p>Paid by: ${e.paidBy}</p><p>Split: ${e.splitAmong.join(", ")}</p><button onclick="deleteExpense(${e.id})">Delete</button></div>`;
});
settle(balance);
}
function settle(balance) {
let debtors = [];
let creditors = [];
members.forEach(m => {
if (balance[m].net < 0) debtors.push({ name: m, amount: -balance[m].net });
if (balance[m].net > 0) creditors.push({ name: m, amount: balance[m].net });
});
let result = document.getElementById("settleList");
result.innerHTML = "";
let i = 0, j = 0;
while (i < debtors.length && j < creditors.length) {
let amount = Math.min(debtors[i].amount, creditors[j].amount);
result.innerHTML += `<p>${debtors[i].name} pays ${creditors[j].name} ₹${(amount / 100).toFixed(2)}</p>`;
debtors[i].amount -= amount;
creditors[j].amount -= amount;
if (debtors[i].amount === 0) i++;
if (creditors[j].amount === 0) j++;
}
if (debtors.length === 0) result.innerHTML = "Everyone is settled!";
}
function resetGroup() {
members = [];
expenses = [];
save();
show();
}
show();
