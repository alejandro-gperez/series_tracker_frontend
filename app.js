const API = "http://localhost:3000";

let selectedId = null;

// 🔄 LOAD
async function loadSeries(query = "") {
  const res = await fetch(`${API}/series?q=${query}`);
  const data = await res.json();
  renderSeries(data);
}

// 📄 RENDER
function renderSeries(series) {
  const list = document.getElementById("series-list");
  list.innerHTML = "";

  series.forEach(s => {
    const li = document.createElement("li");
    li.className = "series-item";
    li.textContent = s.name;

    li.onclick = () => selectSeries(s, li);

    list.appendChild(li);
  });
}

// 👀 VIEW
function showDetailsView(s) {
  document.getElementById("details-view").classList.remove("hidden");
  document.getElementById("series-form").classList.add("hidden");

  document.getElementById("view-name").textContent = s.name;
  document.getElementById("view-description").textContent = s.description;

  const img = document.getElementById("view-image");
  img.src = s.image;
  img.style.display = s.image ? "block" : "none";
}

// 🖱️ SELECT
function selectSeries(s, el) {
  selectedId = s.id;

  showDetailsView(s);

  document.getElementById("delete").disabled = false;

  document.querySelectorAll(".series-item").forEach(e => {
    e.classList.remove("active");
  });

  el.classList.add("active");
}

// ✏️ EDIT
document.getElementById("edit-btn").onclick = () => {
  document.getElementById("details-view").classList.add("hidden");
  document.getElementById("series-form").classList.remove("hidden");

  // llenar form
  document.getElementById("name").value = document.getElementById("view-name").textContent;
  document.getElementById("description").value = document.getElementById("view-description").textContent;
  document.getElementById("image").value = document.getElementById("view-image").src;
};

// ➕ NEW
document.getElementById("new-btn").onclick = () => {
  resetForm();

  document.getElementById("details-view").classList.add("hidden");
  document.getElementById("series-form").classList.remove("hidden");
};

// 💾 SAVE
document.getElementById("series-form").onsubmit = async (e) => {
  e.preventDefault();

  const s = {
    name: name.value,
    description: description.value,
    image: image.value
  };

  if (selectedId) {
    await fetch(`${API}/series/${selectedId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s)
    });
  } else {
    await fetch(`${API}/series`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s)
    });
  }

  resetForm();
  loadSeries();
};

// 💀 DELETE
document.getElementById("delete").onclick = async () => {
  if (!selectedId) return;

  await fetch(`${API}/series/${selectedId}`, {
    method: "DELETE"
  });

  resetForm();
  loadSeries();
};

// 🔍 SEARCH
document.getElementById("search").oninput = (e) => {
  loadSeries(e.target.value);
};

// 📄 CSV
document.getElementById("export").onclick = async () => {
  const res = await fetch(`${API}/series`);
  const data = await res.json();

  let csv = "id,name,description,image\n";

  data.forEach(s => {
    csv += `${s.id},${s.name},${s.description},${s.image}\n`;
  });

  const blob = new Blob([csv]);
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "series.csv";
  a.click();
};

// 🧹 RESET
function resetForm() {
  selectedId = null;
  document.getElementById("series-form").reset();
  document.getElementById("delete").disabled = true;

  document.querySelectorAll(".series-item").forEach(el => {
    el.classList.remove("active");
  });
}

// 🚀 INIT
loadSeries();