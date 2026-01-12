document.addEventListener("DOMContentLoaded", async () => {
  const select = document.getElementById("contactListSelect");

  if (!select) return;

  // Estado inicial
  select.innerHTML = `<option>Cargando...</option>`;
  select.disabled = true;

  try {
    const res = await fetch(
      "https://custom-activity-service-demo.vercel.app/api/ui/contactlists"
    );

    if (!res.ok) throw new Error("HTTP error");

    const data = await res.json();

    select.innerHTML = "";

    data.forEach(item => {
      const opt = document.createElement("option");
      opt.value = item.id;
      opt.textContent = item.name;
      select.appendChild(opt);
    });

    select.disabled = false;

  } catch (err) {
    console.error("Error cargando listas", err);
    select.innerHTML = `<option>Error cargando listas</option>`;
  }
});