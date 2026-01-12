/* global Postmonger */
(function () {
  const connection = new Postmonger.Session();

  const select = document.getElementById("contactListSelect");
  const chk = document.getElementById("newListCheck");
  const inp = document.getElementById("newListName");

  // ✅ NUEVO: botón + status
  const btn = document.getElementById("btnCreateList");
  const status = document.getElementById("createStatus");

  let savedContactListId = "";

  // ✅ NUEVO: habilita/deshabilita input + combo + botón según checkbox
  function toggleNewListInput() {
    const useNew = !!chk?.checked;

    if (useNew) {
      // Bloquear combo y resetear
      if (select) {
        select.value = "";
        select.selectedIndex = 0;
        select.disabled = true;
      }

      // Habilitar input
      if (inp) inp.disabled = false;

      // ✅ habilitar botón (pero solo si hay nombre)
      if (btn) btn.disabled = !(inp && inp.value.trim().length > 0);
    } else {
      // Habilitar combo
      if (select) select.disabled = false;

      // Bloquear input
      if (inp) {
        inp.disabled = true;
        inp.value = "";
      }

      // ✅ deshabilitar botón
      if (btn) btn.disabled = true;
    }

    // limpiar mensaje si cambias de modo
    if (status) status.textContent = "";
  }

  // ✅ NUEVO: habilitar botón cuando escriben nombre (solo si el check está marcado)
  function onNewListNameChange() {
    if (!btn) return;
    if (!chk?.checked) {
      btn.disabled = true;
      return;
    }
    btn.disabled = !(inp && inp.value.trim().length > 0);
  }

  /* === 1️⃣ INIT DESDE SFMC === */
  connection.on("initActivity", function (data) {
    savedContactListId =
      data?.arguments?.execute?.inArguments?.[0]?.contactListId || "";

    if (chk) chk.checked = data?.arguments?.execute?.inArguments?.[0]?.useNewList || false;
    if (inp) inp.value = data?.arguments?.execute?.inArguments?.[0]?.newListName || "";

    // ✅ aplicar estado al cargar
    toggleNewListInput();
    onNewListNameChange();
  });

  /* === 2️⃣ CARGA UI === */
  document.addEventListener("DOMContentLoaded", async () => {
    select.innerHTML = `<option value="">Cargando...</option>`;
    select.disabled = true;

    // ✅ estado inicial + listeners
    toggleNewListInput();
    if (chk) chk.addEventListener("change", toggleNewListInput);
    if (inp) inp.addEventListener("input", onNewListNameChange);

    try {
      const res = await fetch("/api/ui/contactlists");
      const data = await res.json();

      select.innerHTML = `<option value="">Seleccione una lista...</option>`;

      data.forEach((item) => {
        const opt = document.createElement("option");
        opt.value = item.id;
        opt.textContent = item.name;
        select.appendChild(opt);
      });

      // 🔥 APLICAR SELECCIÓN GUARDADA (solo si NO está marcado)
      if (savedContactListId && !chk.checked) {
        select.value = savedContactListId;
      }

      // ✅ NO forzar select.disabled=false aquí, porque depende del checkbox
      toggleNewListInput();

      connection.trigger("ready"); // ⬅️ ESTO QUITA EL SPINNER
    } catch (e) {
      select.innerHTML = `<option>Error cargando listas</option>`;
      connection.trigger("ready");
    }
  });

  /* === 3️⃣ GUARDAR AL DAR "LISTO" === */
  connection.on("clickedNext", save);
  connection.on("clickedDone", save);

  function save() {
    const payload = {
      arguments: {
        execute: {
          inArguments: [
            {
              contactListId: select.value,
              useNewList: chk.checked,
              newListName: chk.checked ? inp.value : ""
            }
          ]
        }
      }
    };

    connection.trigger("updateActivity", payload);
  }
})();