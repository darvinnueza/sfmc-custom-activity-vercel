define(["postmonger"], function (Postmonger) {
    "use strict";

    var connection = new Postmonger.Session();
    var payload = {};

    $(window).ready(function () {
        // ✅ ESTO ES LO QUE QUITA EL SPINNER
        connection.trigger("ready");

        // botón Next habilitado (si quieres)
        connection.trigger("updateButton", {
            button: "next",
            text: "done",
            visible: true,
            enabled: true
        });
    });

    connection.on("initActivity", function (data) {
        payload = data || {};

        // leer lo guardado antes
        var args = payload?.arguments?.execute?.inArguments || [];
        var merged = Object.assign({}, ...args);

        if (merged.request_id) {
            document.getElementById("request_id").value = merged.request_id;
        }
    });

    connection.on("clickedNext", save);
    connection.on("clickedDone", save);

    function save() {
        var reqId = (document.getElementById("request_id").value || "").trim();

        // ✅ NO BORRAR: aquí seteamos TODO para que no se pierda lo del Event.*
        payload.arguments.execute.inArguments = [
            { request_id: reqId || "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.request_id}}" },
            { contact_key: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.contact_key}}" },
            { phone_number: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.phone_number}}" },
            { status: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.status}}" },
            { created_at: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.created_at}}" },
            { updated_at: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.updated_at}}" }
        ];

        payload.metaData.isConfigured = true;

        connection.trigger("updateActivity", payload);
    }
});