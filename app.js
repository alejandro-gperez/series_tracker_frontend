const API = "http://localhost:3000";

let selectedId = null;
let currentSeries = null;

/* Load series */
async function loadSeries(query = "") {
  const res = await fetch(`${API}/series?q=${query}`);
  const data = await res.json();
  renderSeries(data);
}

/* Render list */
function renderSeries(series) {
  const list = document.getElementById("series-list");
  const empty = document.getElementById("empty-state");

  list.innerHTML = "";

  if (series.length === 0) {
    empty.classList.remove("hidden");
  } else {
    empty.classList.add("hidden");
  }

  series.forEach(s => {
    const li = document.createElement("li");
    li.className = "series-item";
    li.textContent = s.name;

    li.onclick = () => selectSeries(s, li);

    list.appendChild(li);
  });
}

/* Select series */
function selectSeries(s, el) {
  selectedId = s.id;

  currentSeries = {
    id: s.id,
    name: s.name,
    description: s.description,
    image: s.image
  };

  showDetailsView(currentSeries);

  document.getElementById("delete").disabled = false;

  document.querySelectorAll(".series-item").forEach(e => e.classList.remove("active"));
  el.classList.add("active");
}

/* Show view */
function showDetailsView(s) {
  document.getElementById("details-view").classList.remove("hidden");
  document.getElementById("series-form").classList.add("hidden");

  document.getElementById("view-name").textContent = s.name;
  document.getElementById("view-description").textContent = s.description;

  const img = document.getElementById("view-image");
  img.src = s.image;

  img.onerror = () => img.style.display = "none";
  img.onload = () => img.style.display = "block";
}

/* Edit */
document.getElementById("edit-btn").onclick = () => {
  if (!currentSeries) return;

  document.getElementById("details-view").classList.add("hidden");
  document.getElementById("series-form").classList.remove("hidden");

  // 🔥 SIEMPRE usar currentSeries
  document.getElementById("name").value = currentSeries.name || "";
  document.getElementById("description").value = currentSeries.description || "";
  document.getElementById("image").value = currentSeries.image || "";
};

/* Save */
document.getElementById("series-form").onsubmit = async (e) => {
  e.preventDefault();

  const nameVal = document.getElementById("name").value.trim();

  if (!nameVal) {
    alert("Name is required");
    return;
  }

  const s = {
    name: document.getElementById("name").value.trim(),
    description: document.getElementById("description").value,
    image: document.getElementById("image").value
  };

  let res;

  try {
    if (selectedId) {
      res = await fetch(`${API}/series/${selectedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s)
      });
    } else {
      res = await fetch(`${API}/series`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s)
      });
    }

    if (!res.ok) {
      const text = await res.text();
      console.error(text);
      alert("Error saving series");
      return;
    }

    // 🔥 traer versión actualizada
    const updated = selectedId
      ? await fetch(`${API}/series/${selectedId}`).then(r => r.json())
      : await res.json();

    currentSeries = updated;
    selectedId = updated.id;

    showDetailsView(updated);
    loadSeries();

  } catch (err) {
    console.error(err);
    alert("Network error");
  }
};

/* Delete */
document.getElementById("delete").onclick = async () => {
  if (!selectedId) return;

  if (!confirm("Delete this series?")) return;

  await fetch(`${API}/series/${selectedId}`, { method: "DELETE" });

  resetUI();
  loadSeries();
};

/* New */
document.getElementById("new-btn").onclick = () => {
  resetUI();

  document.getElementById("series-form").classList.remove("hidden");
};

/* Reset UI */
function resetUI() {
  selectedId = null;
  currentSeries = null;

  document.getElementById("series-form").reset();
  document.getElementById("series-form").classList.add("hidden");
  document.getElementById("details-view").classList.add("hidden");

  document.getElementById("delete").disabled = true;

  document.querySelectorAll(".series-item").forEach(el => el.classList.remove("active"));
}

/* Search */
document.getElementById("search").oninput = (e) => {
  loadSeries(e.target.value);
};

/* CSV */
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

/* Init */
loadSeries();