/* global Postmonger */
(function () {
  const connection = new Postmonger.Session();

  const select = document.getElementById("contactListSelect");
  const chk = document.getElementById("newListCheck");
  const inp = document.getElementById("newListName");

  let pendingSelectedId = "";

  // Recibe data desde customActivity.js (initActivity)
  connection.on("showUIData", function (data) {
    pendingSelectedId = data?.contactListId || "";

    if (chk) chk.checked = !!data?.useNewList;
    if (inp) inp.value = data?.newListName || "";

    // Si ya cargaron opciones, aplicar selección
    if (select && pendingSelectedId) {
      select.value = pendingSelectedId;
    }
  });

  document.addEventListener("DOMContentLoaded", async () => {
    if (!select) return;

    // estado inicial
    select.innerHTML = `<option value="">Cargando...</option>`;
    select.disabled = true;

    try {
      // ✅ MISMO ORIGEN (evita CORS)
      const res = await fetch("/api/ui/contactlists");
      if (!res.ok) throw new Error("HTTP " + res.status);

      const data = await res.json();

      // reset + placeholder
      select.innerHTML = "";
      const ph = document.createElement("option");
      ph.value = "";
      ph.textContent = "Seleccione una lista...";
      select.appendChild(ph);

      // opciones
      data.forEach((item) => {
        const opt = document.createElement("option");
        opt.value = item.id;       // id real
        opt.textContent = item.name; // name real
        select.appendChild(opt);
      });

      // aplicar selección previa si existía
      if (pendingSelectedId) {
        select.value = pendingSelectedId;
      }

      select.disabled = false;
    } catch (err) {
      console.error("Error cargando listas", err);
      select.innerHTML = `<option value="">Error cargando listas</option>`;
      select.disabled = true;
    }
  });
})();