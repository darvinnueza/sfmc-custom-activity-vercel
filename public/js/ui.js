document.addEventListener("DOMContentLoaded", async () => {
  const select = document.getElementById("contactListSelect");
  if (!select) return;

  // Estado inicial
  select.innerHTML = `<option>Cargando...</option>`;
  select.disabled = true;

  try {
    const url = "https://custom-activity-service-demo.vercel.app/api/ui/contactlists";

    console.log("Fetching:", url);

    const res = await fetch(url, {
      method: "GET",
      cache: "no-store"
    });

    console.log("Response status:", res.status);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${text}`);
    }

    const data = await res.json();

    // reset
    select.innerHTML = "";

    // placeholder
    const ph = document.createElement("option");
    ph.value = "";
    ph.textContent = "Seleccione una lista...";
    select.appendChild(ph);

    data.forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item.id;
      opt.textContent = item.name;
      select.appendChild(opt);
    });

    select.disabled = false;
  } catch (err) {
    console.error("Error cargando listas:", err);
    select.innerHTML = `<option>Error cargando listas</option>`;
    select.disabled = true;
  }
});