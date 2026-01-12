/* global Postmonger */
(function () {
  const connection = new Postmonger.Session();

  const select = document.getElementById("contactListSelect");
  const chk = document.getElementById("newListCheck");
  const inp = document.getElementById("newListName");

  let savedContactListId = "";

  /* === 1️⃣ INIT DESDE SFMC === */
  connection.on("initActivity", function (data) {
    savedContactListId = data?.arguments?.execute?.inArguments?.[0]?.contactListId || "";
    if (chk) chk.checked = data?.arguments?.execute?.inArguments?.[0]?.useNewList || false;
    if (inp) inp.value = data?.arguments?.execute?.inArguments?.[0]?.newListName || "";
  });

  /* === 2️⃣ CARGA UI === */
  document.addEventListener("DOMContentLoaded", async () => {
    select.innerHTML = `<option value="">Cargando...</option>`;
    select.disabled = true;

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

      // 🔥 APLICAR SELECCIÓN GUARDADA
      if (savedContactListId) {
        select.value = savedContactListId;
      }

      select.disabled = false;
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
              newListName: inp.value
            }
          ]
        }
      }
    };

    connection.trigger("updateActivity", payload);
  }
})();