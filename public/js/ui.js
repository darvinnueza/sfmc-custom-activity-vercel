/* global Postmonger */
(function () {
  const connection = new Postmonger.Session();

  let select, chk, inp;
  let pendingSelectedId = "";

  function pushUIData() {
    connection.trigger("saveUIData", {
      contactListId: (select && select.value) ? select.value : "",
      useNewList: !!(chk && chk.checked),
      newListName: (inp && inp.value) ? inp.value : ""
    });
  }

  // SFMC -> UI (setear valores al abrir)
  connection.on("showUIData", function (data) {
    pendingSelectedId = data?.contactListId || "";

    if (chk) chk.checked = !!data?.useNewList;
    if (inp) inp.value = data?.newListName || "";

    if (select && pendingSelectedId) {
      select.value = pendingSelectedId;
    }
  });

  document.addEventListener("DOMContentLoaded", async () => {
    select = document.getElementById("contactListSelect");
    chk = document.getElementById("newListCheck");
    inp = document.getElementById("newListName");

    if (!select) return;

    // listeners para ir guardando mientras cambia
    select.addEventListener("change", () => {
      pendingSelectedId = select.value || "";
      pushUIData();
    });
    if (chk) chk.addEventListener("change", pushUIData);
    if (inp) inp.addEventListener("input", pushUIData);

    // estado inicial
    select.innerHTML = `<option value="">Cargando...</option>`;
    select.disabled = true;

    try {
      // ✅ MISMO ORIGEN (NO CORS)
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
        opt.value = item.id;
        opt.textContent = item.name;
        select.appendChild(opt);
      });

      // re-aplicar selección guardada
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