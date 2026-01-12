/* global Postmonger */
(function () {
  const connection = new Postmonger.Session();

  const select = document.getElementById("contactListSelect");
  const chk = document.getElementById("newListCheck");
  const inp = document.getElementById("newListName");

  const btn = document.getElementById("btnCreateList");
  const status = document.getElementById("createStatus");

  let savedContactListId = "";

  function setStatus(msg, type) {
    if (!status) return;
    status.textContent = msg || "";
    status.className = "status" + (type ? " " + type : "");
  }

  function toggleNewListInput() {
    const useNew = !!chk?.checked;

    if (useNew) {
      if (select) {
        select.value = "";
        select.selectedIndex = 0;
        select.disabled = true;
      }
      if (inp) inp.disabled = false;

      // botón solo si hay nombre
      if (btn) btn.disabled = !(inp && inp.value.trim().length > 0);

    } else {
      if (select) select.disabled = false;

      if (inp) {
        inp.disabled = true;
        inp.value = "";
      }

      if (btn) btn.disabled = true;

      // si vuelven a "existente", limpiamos id creado (opcional pero recomendado)
      savedContactListId = "";
    }

    setStatus("");
  }

  function onNewListNameChange() {
    if (!btn) return;
    if (!chk?.checked) {
      btn.disabled = true;
      return;
    }
    btn.disabled = !(inp && inp.value.trim().length > 0);
  }

  async function onCreateClick() {
    try {
      if (!inp || !inp.value.trim()) return;

      status.textContent = "Creando lista...";
      status.style.color = "#6b7280";
      btn.disabled = true;

      const payload = {
        name: inp.value.trim(),
        columnNames: [
          "request_id",
          "contact_key",
          "phone_number",
          "status"
        ],
        phoneColumns: [
          {
            columnName: "phone_number",
            type: "cell"
          }
        ]
      };

      const res = await fetch("/api/ui/contactlists-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error creando lista");
      }

      const data = await res.json();

      // actualizar UI con lo que responde el backend
      status.textContent = `Lista creada: ${data.name}`;
      status.style.color = "#065f46";

      // seleccionar automáticamente la nueva lista
      if (select) {
        const opt = document.createElement("option");
        opt.value = data.id;
        opt.textContent = data.name;
        select.appendChild(opt);
        select.value = data.id;
      }

      chk.checked = false;
      toggleNewListInput();

    } catch (e) {
      status.textContent = e.message;
      status.style.color = "#b91c1c";
      btn.disabled = false;
    }
}


  /* === 1️⃣ INIT DESDE SFMC === */
  connection.on("initActivity", function (data) {
    const args0 = data?.arguments?.execute?.inArguments?.[0] || {};

    savedContactListId = args0.contactListId || "";

    if (chk) chk.checked = !!args0.useNewList;
    if (inp) inp.value = args0.newListName || "";

    // si ya estaba configurado y era "crear nueva", bloquea checkbox para no romper estado
    // (opcional, pero ayuda a que no se pierda el id guardado)
    if (chk?.checked && savedContactListId) {
      if (chk) chk.disabled = true;
      if (inp) inp.disabled = true;
      if (btn) btn.disabled = true;
      setStatus("Lista ya creada previamente (configurada).", "ok");
    } else {
      toggleNewListInput();
      onNewListNameChange();
    }
  });

  /* === 2️⃣ CARGA UI === */
  document.addEventListener("DOMContentLoaded", async () => {
    if (!select) return;

    select.innerHTML = `<option value="">Cargando...</option>`;
    select.disabled = true;

    // listeners
    toggleNewListInput();
    if (chk) chk.addEventListener("change", toggleNewListInput);
    if (inp) inp.addEventListener("input", onNewListNameChange);
    if (btn) btn.addEventListener("click", onCreateClick);

    try {
      const res = await fetch("/api/ui/contactlists");
      const data = await res.json();

      select.innerHTML = `<option value="">Seleccione una lista...</option>`;

      (data || []).forEach((item) => {
        const opt = document.createElement("option");
        opt.value = item.id;
        opt.textContent = item.name;
        select.appendChild(opt);
      });

      // aplicar selección guardada solo si NO está en modo "crear nueva"
      if (savedContactListId && !(chk && chk.checked)) {
        select.value = savedContactListId;
      }

      // NO forzar enabled: depende del checkbox
      toggleNewListInput();

      connection.trigger("ready");
    } catch (e) {
      console.error(e);
      select.innerHTML = `<option value="">Error cargando listas</option>`;
      connection.trigger("ready");
    }
  });

  /* === 3️⃣ GUARDAR AL DAR "LISTO" === */
  connection.on("clickedNext", save);
  connection.on("clickedDone", save);

  function save() {
    const useNew = !!chk?.checked;

    const payload = {
      arguments: {
        execute: {
          inArguments: [
            {
              contactListId: useNew ? savedContactListId : (select?.value || ""),
              useNewList: useNew,
              newListName: useNew ? (inp?.value || "") : ""
            }
          ]
        }
      }
    };

    connection.trigger("updateActivity", payload);
  }
})();