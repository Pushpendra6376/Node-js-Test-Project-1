let currentTable = null;
let fieldsCount = 0;

// Loading tables initially 
window.onload = loadTables;

async function loadTables() {
  const res = await fetch("/tables/list");
  const tables = await res.json();
  const list = document.getElementById("tablesList");
  list.innerHTML = "";

  tables.forEach(tbl => {
    const li = document.createElement("li");
    li.textContent = tbl;
    li.onclick = () => loadTableData(tbl);
    list.appendChild(li);
  });
}

// jab kisi bhi table par click kr toh uska data load ho 
async function loadTableData(table) {
  currentTable = table;
  document.getElementById("tableTitle").innerText = table;
  document.getElementById("insertRecordBtn").style.display = "inline-block";

  const res = await fetch(`/tables/${table}/details`);
  const { columns, rows } = await res.json();

  const tableHTML = document.getElementById("recordsTable");
  tableHTML.innerHTML = "";

  let header = "<tr>";
  columns.forEach(col => header += `<th>${col}</th>`);
  header += `<th>Action</th></tr>`;
  tableHTML.innerHTML += header;

  rows.forEach(row => {
    let tr = "<tr>";
    columns.forEach(col => tr += `<td>${row[col]}</td>`);
    tr += `<td><button class="deleteBtn" onclick="deleteRecord('${row.id}')">Delete</button></td></tr>`;
    tableHTML.innerHTML += tr;
  });
}

// table ke ander record delete krne ke liye 
async function deleteRecord(id) {
  await fetch(`/tables/${currentTable}/${id}`, { method: "DELETE" });
  loadTableData(currentTable);
}

/* Modal functionality */
const createModal = document.getElementById("createModal");
document.getElementById("openCreateModal").onclick = () => createModal.style.display = "flex";
document.getElementById("closeCreateModal").onclick = () => createModal.style.display = "none";

const insertModal = document.getElementById("insertModal");
document.getElementById("closeInsertModal").onclick = () => insertModal.style.display = "none";

// Create Table par click rkrne ke baad  form pop up and form detials
document.getElementById("addFieldBtn").onclick = () => {
  const div = document.createElement("div");
  div.innerHTML = `
    <input type="text" placeholder="Field Name" id="fname_${fieldsCount}">
    <select id="ftype_${fieldsCount}">
      <option>STRING</option><option>INTEGER</option>
      <option>BOOLEAN</option><option>DOUBLE</option>
    </select>
  `;
  document.getElementById("fieldsContainer").appendChild(div);
  fieldsCount++;
};

document.getElementById("createTableBtn").onclick = async () => {
  const name = document.getElementById("tableName").value;
  const fields = [];

  for (let i = 0; i < fieldsCount; i++) {
    const f = document.getElementById(`fname_${i}`).value;
    const t = document.getElementById(`ftype_${i}`).value;
    if (f) fields.push({ name: f, type: t });
  }

  await fetch("/tables/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tableName: name, fields })
  });

  createModal.style.display = "none";
  loadTables();
};

//inserd button or add record button
document.getElementById("insertRecordBtn").onclick = () => {
  if (!currentTable) {
    alert("⚠ Please select a table first!");
    return;
  }
  console.log("Current Table Selected:", currentTable); // table ko check krega ki kon si table select ha iye inspect krke hum check kr sakte hai 
  openInsertForm();
};

// add record form 
async function openInsertForm() {
  const res = await fetch(`/tables/${currentTable}/details`);
  const { columns } = await res.json();
  const form = document.getElementById("insertForm");
  form.innerHTML = "";

  columns.forEach(col => {
    if (col === "id" || col === "createdAt" || col === "updatedAt") return;
    form.innerHTML += `
      <label>${col}</label>
      <input type="text" placeholder="${col}" id="col_${col}">
    `;
  });

  insertModal.style.display = "flex";
}

// new record ko submit krne ka 
document.getElementById("submitRecordBtn").onclick = async () => {
  let payload = {};

  document.querySelectorAll("#insertForm input").forEach(inp => {
    const key = inp.id.split("col_")[1];
    payload[key] = inp.value;
  });

  console.log("Sending Insert Request =>", `/tables/${currentTable}/insert`, payload);

  await fetch(`/tables/${currentTable}/insert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // reset UI
  document.getElementById("insertForm").innerHTML = "";
  insertModal.style.display = "none";
  loadTableData(currentTable);
};
