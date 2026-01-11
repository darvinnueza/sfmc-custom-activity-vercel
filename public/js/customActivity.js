define(["postmonger"], function (Postmonger) {
    "use strict";

    var connection = new Postmonger.Session();
    var payload = {};

    $(window).ready(function () {
        connection.trigger("ready");
        connection.trigger("requestTokens");
        connection.trigger("requestEndpoints");

        // Botón "Listo"
        $("#btnDone").click(function () {
        $("#msg").text("Guardando...");
        save();
        $("#msg").text("Guardado. Ya puedes cerrar.");
        });
    });

    connection.on("initActivity", function (data) {
        payload = data || payload;

        // Si ya existían valores guardados, cargarlos en UI
        var inArgs = payload?.arguments?.execute?.inArguments || [];
        var merged = Object.assign({}, ...inArgs);

        $("#request_id").val(merged.request_id || "");
        $("#phone_number").val(merged.phone_number || "");
        $("#status").val(merged.status || "");

        // Habilita el botón Next/Done del modal
        connection.trigger("updateButton", { button: "next", enabled: true });
    });

    connection.on("clickedNext", function () {
        // Cuando usuario le da "Done" al modal del JB
        save();
    });

    function save() {
        var request_id = ($("#request_id").val() || "").trim();
        var phone_number = ($("#phone_number").val() || "").trim();
        var status = ($("#status").val() || "").trim();

        // IMPORTANTE: 1 campo por objeto (como el tutorial)
        payload.arguments.execute.inArguments = [
            { request_id: request_id || "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.request_id}}" },
            { contact_key: "{{Contact.Key}}" },
            { phone_number: phone_number || "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.phone_number}}" },
            { status: status || "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.status}}" }
        ];

        payload.metaData.isConfigured = true;

        connection.trigger("updateActivity", payload);
    }
});