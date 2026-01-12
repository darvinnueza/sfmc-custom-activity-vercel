/* global Postmonger */
(function () {
  const connection = new Postmonger.Session();

  // STEP containers
  const stepContact = document.getElementById("stepContact");
  const stepCampaign = document.getElementById("stepCampaign");

  // Step nav buttons
  const btnNext = document.getElementById("btnNext");
  const btnBack = document.getElementById("btnBack");

  // Contact list UI
  const select = document.getElementById("contactListSelect");
  const chk = document.getElementById("newListCheck");
  const inp = document.getElementById("newListName");

  // Create list
  const btnCreate = document.getElementById("btnCreateList");
  const status = document.getElementById("createStatus");

  // Campaign UI
  const campaignSelect = document.getElementById("campaignSelect");

  // Saved state
  let savedContactListId = "";
  let savedCampaignId = "";

  // -------------------------
  // Helpers: Wizard
  // -------------------------
  function goTo(step) {
    if (step === 1) {
      stepContact.style.display = "";
      stepCampaign.style.display = "none";
    } else {
      stepContact.style.display = "none";
      stepCampaign.style.display = "";
    }
  }

  function canGoNext() {
    // si usa nueva lista: exige nombre
    if (chk.checked) return !!inp.value.trim();
    // si NO usa nueva lista: exige seleccionar contactListId
    return !!select.value;
  }

  function refreshNextButton() {
    if (!btnNext) return;
    btnNext.disabled = !canGoNext();
  }

  // -------------------------
  // Contact list toggle
  // -------------------------
  function toggleNewListInput() {
    const useNew = !!chk?.checked;

    if (useNew) {
      // reset & disable combo
      select.value = "";
      select.selectedIndex = 0;
      select.disabled = true;

      inp.disabled = false;

      // botón crear: solo si hay nombre
      btnCreate.disabled = !(inp.value.trim().length > 0);
    } else {
      select.disabled = false;

      inp.disabled = true;
      inp.value = "";

      btnCreate.disabled = true;
    }

    if (status) status.textContent = "";
    refreshNextButton();
  }

  function onNewListNameChange() {
    if (!chk.checked) {
      btnCreate.disabled = true;
    } else {
      btnCreate.disabled = !(inp.value.trim().length > 0);
    }
    refreshNextButton();
  }

  // -------------------------
  // Create contact list (POST a tu backend UI)
  // -------------------------
  async function onCreateClick() {
    try {
      const name = inp.value.trim();
      if (!name) return;

      status.textContent = "Creando lista...";
      status.className = "";
      btnCreate.disabled = true;

      const payload = {
        name,
        columnNames: ["request_id", "contact_key", "phone_number", "status"],
        phoneColumns: [{ columnName: "phone_number", type: "cell" }]
      };

      // ✅ importante: MISMO ORIGIN, para evitar CORS
      const res = await fetch("/api/ui/contactlists-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error creando lista");
      }

      const data = await res.json();

      // agregar al combo (aunque esté disabled, igual mantenemos lista)
      const opt = document.createElement("option");
      opt.value = data.id;
      opt.textContent = data.name;
      select.appendChild(opt);

      // ya creada: cambia a modo "existente"
      chk.checked = false;
      toggleNewListInput();

      // seleccionar la creada
      select.value = data.id;

      status.textContent = `Lista creada: ${data.name}`;
      status.className = "ok";

      refreshNextButton();
    } catch (e) {
      status.textContent = e.message;
      status.className = "err";
      btnCreate.disabled = false;
    }
  }

  // -------------------------
  // Load contact lists
  // -------------------------
  async function loadContactLists() {
    select.innerHTML = `<option value="">Cargando...</option>`;
    select.disabled = true;

    const res = await fetch("/api/ui/contactlists");
    const data = await res.json();

    select.innerHTML = `<option value="">Seleccione una lista...</option>`;
    data.forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item.id;
      opt.textContent = item.name;
      select.appendChild(opt);
    });

    // aplica selección guardada si no está en modo nueva lista
    if (savedContactListId && !chk.checked) select.value = savedContactListId;

    // re-aplicar estado según checkbox
    toggleNewListInput();
  }

  // -------------------------
  // Load campaigns (step 2)
  // -------------------------
  let campaignsLoaded = false;
  async function loadCampaignsOnce() {
    if (campaignsLoaded) return;
    campaignsLoaded = true;

    campaignSelect.innerHTML = `<option value="">Cargando...</option>`;
    campaignSelect.disabled = true;

    // ⬅️ aquí apuntas a TU endpoint de campañas (cuando lo tengas)
    // por ahora lo dejo con el nombre correcto para que lo crees igual que contactlists.
    const res = await fetch("/api/ui/campaigns");
    const data = await res.json();

    campaignSelect.innerHTML = `<option value="">Seleccione una campaña...</option>`;
    data.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name;
      campaignSelect.appendChild(opt);
    });

    if (savedCampaignId) campaignSelect.value = savedCampaignId;

    campaignSelect.disabled = false;
  }

  // -------------------------
  // SFMC init + save
  // -------------------------
  connection.on("initActivity", function (data) {
    const args = data?.arguments?.execute?.inArguments?.[0] || {};

    savedContactListId = args.contactListId || "";
    savedCampaignId = args.campaignId || "";

    chk.checked = !!args.useNewList;
    inp.value = args.newListName || "";

    toggleNewListInput();
    refreshNextButton();
  });

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
              newListName: chk.checked ? inp.value : "",
              campaignId: campaignSelect ? campaignSelect.value : ""
            }
          ]
        }
      }
    };

    connection.trigger("updateActivity", payload);
  }

  // -------------------------
  // DOM Ready
  // -------------------------
  document.addEventListener("DOMContentLoaded", async () => {
    // listeners
    chk.addEventListener("change", toggleNewListInput);
    inp.addEventListener("input", onNewListNameChange);
    select.addEventListener("change", refreshNextButton);

    btnCreate.disabled = true;
    btnCreate.addEventListener("click", onCreateClick);

    btnNext.addEventListener("click", async () => {
      if (!canGoNext()) return;
      goTo(2);
      await loadCampaignsOnce();
    });

    btnBack.addEventListener("click", () => goTo(1));

    // load step 1 data
    try {
      await loadContactLists();
      connection.trigger("ready"); // quita spinner
    } catch (e) {
      select.innerHTML = `<option>Error cargando listas</option>`;
      connection.trigger("ready");
    }
  });
})();