/* global Postmonger */
(function () {
  const connection = new Postmonger.Session();
  let payload = {};

  connection.trigger("ready");
  connection.trigger("requestTokens");
  connection.trigger("requestEndpoints");

  // Cuando abres la actividad (para RESTAURAR valores)
  connection.on("initActivity", function (data) {
    payload = data || {};

    payload.metaData = payload.metaData || {};

    // Restaurar selección guardada (si existe)
    const savedId = payload.metaData.contactListId || "";
    const savedUseNew = !!payload.metaData.useNewList;
    const savedNewName = payload.metaData.newListName || "";

    // Pásale a ui.js para que setee el formulario
    connection.trigger("showUIData", {
      contactListId: savedId,
      useNewList: savedUseNew,
      newListName: savedNewName
    });
  });

  // Cuando haces click en “Listo”
  connection.on("clickedNext", function () {
    // Leer valores del formulario
    const select = document.getElementById("contactListSelect");
    const chk = document.getElementById("newListCheck");
    const inp = document.getElementById("newListName");

    const contactListId = select ? (select.value || "") : "";
    const useNewList = chk ? chk.checked : false;
    const newListName = inp ? (inp.value || "").trim() : "";

    // Asegura estructura
    payload.metaData = payload.metaData || {};
    payload.arguments = payload.arguments || {};
    payload.arguments.execute = payload.arguments.execute || {};

    // ✅ 1) Guardar configuración de UI (esto hace que NO se borre al reabrir)
    payload.metaData.contactListId = contactListId;
    payload.metaData.useNewList = useNewList;
    payload.metaData.newListName = newListName;

    // ✅ 2) Mantener tus bindings (NO los cambies)
    payload.arguments.execute.inArguments = [
      { request_id: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.request_id}}" },
      { contact_key: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.contact_key}}" },
      { phone_number: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.phone_number}}" },
      { status: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.status}}" },
      { created_at: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.created_at}}" },
      { updated_at: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.updated_at}}" },

      // (opcional pero recomendado) pasar también la config seleccionada
      { contact_list_id: contactListId },
      { use_new_list: useNewList },
      { new_list_name: newListName }
    ];

    payload.metaData.isConfigured = true;

    connection.trigger("updateActivity", payload);
  });
})();