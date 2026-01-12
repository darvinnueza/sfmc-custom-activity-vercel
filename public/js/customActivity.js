/* global Postmonger */
(function () {
  const connection = new Postmonger.Session();
  let payload = null;

  connection.trigger("ready");
  connection.trigger("requestTokens");
  connection.trigger("requestEndpoints");

  connection.on("initActivity", function (data) {
    payload = data || {};
  });

  connection.on("clickedNext", function () {
    if (!payload) payload = {};

    // Asegura estructura
    payload.metaData = payload.metaData || {};
    payload.arguments = payload.arguments || {};
    payload.arguments.execute = payload.arguments.execute || {};

    // ====== 1) Lee lo que escogiste en el UI ======
    const select = document.getElementById("campaignSelect"); // tu <select id="campaignSelect">
    const selectedOption = select && select.selectedIndex >= 0 ? select.options[select.selectedIndex] : null;

    const contactListId = selectedOption ? selectedOption.value : null;
    const contactListName = selectedOption ? selectedOption.text : null;

    const checkboxNew = document.getElementById("newCampaignCheck"); // tu checkbox
    const inputNewName = document.getElementById("newCampaignName"); // tu input

    // ====== 2) Guarda TODO en inArguments ======
    payload.arguments.execute.inArguments = [
      // tus bindings (SFMC los resuelve al ejecutar)
      { request_id: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.request_id}}" },
      { contact_key: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.contact_key}}" },
      { phone_number: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.phone_number}}" },
      { status: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.status}}" },
      { created_at: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.created_at}}" },
      { updated_at: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.updated_at}}" },

      // config elegida en el modal
      { contact_list_id: contactListId },
      { contact_list_name: contactListName },
      { create_new_list: checkboxNew ? checkboxNew.checked : false },
      { new_list_name: inputNewName ? inputNewName.value : null }
    ];

    payload.metaData.isConfigured = true;

    connection.trigger("updateActivity", payload);
  });
})();