/* global Postmonger */
(function () {
  const connection = new Postmonger.Session();
  let payload = {};

  // ✅ DISPARA READY CUANDO YA CARGÓ EL DOM (evita spinner eterno)
  document.addEventListener("DOMContentLoaded", () => {
    connection.trigger("ready");
    connection.trigger("requestTokens");
    connection.trigger("requestEndpoints");
  });

  // SFMC -> UI (cargar valores guardados)
  connection.on("initActivity", function (data) {
    payload = data || {};

    payload.metaData = payload.metaData || {};

    connection.trigger("showUIData", {
      contactListId: payload.metaData.contactListId || "",
      useNewList: !!payload.metaData.useNewList,
      newListName: payload.metaData.newListName || ""
    });
  });

  // UI -> SFMC (guardar cambios mientras el usuario configura)
  connection.on("saveUIData", function (data) {
    payload = payload || {};
    payload.metaData = payload.metaData || {};

    payload.metaData.contactListId = data?.contactListId || "";
    payload.metaData.useNewList = !!data?.useNewList;
    payload.metaData.newListName = data?.newListName || "";
  });

  // Guardar al dar “Listo”
  connection.on("clickedNext", function () {
    payload = payload || {};

    payload.metaData = payload.metaData || {};
    payload.arguments = payload.arguments || {};
    payload.arguments.execute = payload.arguments.execute || {};

    payload.arguments.execute.inArguments = [
      // ✅ valores del formulario (config)
      { contactListId: payload.metaData.contactListId || "" },
      { useNewList: !!payload.metaData.useNewList },
      { newListName: payload.metaData.newListName || "" },

      // ✅ bindings de tu DE (execute)
      { request_id: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.request_id}}" },
      { contact_key: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.contact_key}}" },
      { phone_number: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.phone_number}}" },
      { status: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.status}}" },
      { created_at: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.created_at}}" },
      { updated_at: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.updated_at}}" }
    ];

    payload.metaData.isConfigured = true;

    connection.trigger("updateActivity", payload);
  });
})();