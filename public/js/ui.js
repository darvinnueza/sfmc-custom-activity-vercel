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
    if (!chk?.checked) return;

    const name = (inp?.value || "").trim();
    if (!name) {
      setStatus("Ingrese un nombre para la nueva lista.", "err");
      return;
    }

    btn.disabled = true;
    setStatus("Creando lista...", "");

    try {
      const res = await fetch(
        "/api/ui/contactlists-create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name })
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Error creando lista");
      }

      // ✅ SOLO USAMOS id y name
      if (!data?.id) throw new Error("Respuesta inválida: falta id");

      savedContactListId = data.id;

      // feedback UI
      setStatus(`Lista creada: ${data.name || name}`, "ok");

      // bloquear para evitar cambios luego de crear
      if (inp) inp.disabled = true;
      if (chk) chk.disabled = true;
      if (btn) btn.disabled = true;

    } catch (e) {
      console.error(e);
      setStatus(e.message || "Error creando lista.", "err");
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