document.addEventListener("DOMContentLoaded", async () => {
  const select = document.getElementById("campaignSelect");
  if (!select) return;

  try {
    const res = await fetch("/api/ui/contactlists");
    if (!res.ok) throw new Error("HTTP " + res.status);

    const data = await res.json();

    // reset
    select.innerHTML = "";

    // placeholder
    const ph = document.createElement("option");
    ph.value = "";
    ph.textContent = "Seleccione una lista...";
    select.appendChild(ph);

    // opciones
    data.forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item.id;     // id real
      opt.textContent = item.name; // name real
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("Error cargando listas:", err);
    select.innerHTML = `<option>Error cargando listas</option>`;
  }
});