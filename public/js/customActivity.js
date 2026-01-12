/* global Postmonger */
(function () {
    const connection = new Postmonger.Session();
    let payload = null;

    // --- UI elements (se llenan cuando el DOM esté listo)
    let contactListSelect;
    let newListCheck;
    let newListName;

    // Handshake SFMC
    connection.trigger("ready");
    connection.trigger("requestTokens");
    connection.trigger("requestEndpoints");

    // SFMC -> carga actividad (cuando abres el modal)
    connection.on("initActivity", function (data) {
        payload = data || {};

        // Opcional: si ya estaba configurado antes, repinta selección
        try {
        const args = payload?.arguments?.execute?.inArguments?.[0] || {};
        // Si guardamos estos campos luego, aquí los restauramos:
        if (contactListSelect && args.contact_list_id) {
            contactListSelect.value = args.contact_list_id;
        }
        if (newListCheck && typeof args.create_new_list !== "undefined") {
            newListCheck.checked = String(args.create_new_list) === "true";
        }
        if (newListName && args.new_list_name) {
            newListName.value = args.new_list_name;
        }
        } catch (e) {
        // sin ruido
        }
    });

    // Cuando carga la UI (HTML listo) -> obtén refs y llena combo
    document.addEventListener("DOMContentLoaded", () => {
        contactListSelect = document.getElementById("contactListSelect");
        newListCheck = document.getElementById("newListCheck");
        newListName = document.getElementById("newListName");

        // Guard rails mínimos
        if (!contactListSelect) {
        console.error("No existe #contactListSelect en index.html");
        return;
        }

        cargarContactLists();

        // UX: si marca "nueva lista", deshabilita combo
        if (newListCheck && newListName) {
        const toggle = () => {
            const creating = newListCheck.checked;
            contactListSelect.disabled = creating;
            newListName.disabled = !creating;
        };
        newListCheck.addEventListener("change", toggle);
        toggle();
        }
    });

    async function cargarContactLists() {
        try {
        // Estado inicial
        contactListSelect.innerHTML = `<option value="">Cargando...</option>`;

        const res = await fetch(
            "https://custom-activity-service-demo.vercel.app/api/ui/contactlists",
            { method: "GET" }
        );

        if (!res.ok) throw new Error("Error consultando contact lists");

        const data = await res.json(); // [{id,name},...]

        // Pintar options
        contactListSelect.innerHTML = "";
        const def = document.createElement("option");
        def.value = "";
        def.textContent = "Seleccione una lista...";
        contactListSelect.appendChild(def);

        data.forEach((item) => {
            const opt = document.createElement("option");
            opt.value = item.id;
            opt.textContent = item.name;
            contactListSelect.appendChild(opt);
        });
        } catch (err) {
            console.error(err);
            contactListSelect.innerHTML = `<option value="">Error cargando listas</option>`;
        }
    }

    // --- Guardar cuando das Next
    connection.on("clickedNext", function () {
        if (!payload) payload = {};

        // Asegura estructura
        payload.metaData = payload.metaData || {};
        payload.arguments = payload.arguments || {};
        payload.arguments.execute = payload.arguments.execute || {};

        // Lee valores UI (sin inventar nada)
        const selectedContactListId = contactListSelect ? contactListSelect.value : "";
        const createNewList = newListCheck ? newListCheck.checked : false;
        const newList = newListName ? (newListName.value || "").trim() : "";

        // ✅ Mantengo EXACTO tus bindings (no los toco)
        // ✅ y agrego 3 valores del formulario para usarlos luego en execute
        payload.arguments.execute.inArguments = [
            { request_id: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.request_id}}" },
            { contact_key: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.contact_key}}" },
            { phone_number: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.phone_number}}" },
            { status: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.status}}" },
            { created_at: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.created_at}}" },
            { updated_at: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.updated_at}}" },

            // valores del formulario (NO bindings)
            { contact_list_id: selectedContactListId },
            { create_new_list: String(createNewList) },
            { new_list_name: newList }
        ];

        payload.metaData.isConfigured = true;

        connection.trigger("updateActivity", payload);
    });
})();