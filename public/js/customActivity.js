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

        // ✅ AQUÍ guardas los bindings que quieres que SFMC resuelva al ejecutar
        payload.arguments.execute.inArguments = [
            { request_id: "{{Event.request_id}}" },
            { contact_key: "{{Event.contact_key}}" },
            { phone_number: "{{Event.phone_number}}" },
            { status: "{{Event.status}}" },
            { created_at: "{{Event.created_at}}" },
            { updated_at: "{{Event.updated_at}}" }
        ];

        payload.metaData.isConfigured = true;

        connection.trigger("updateActivity", payload);
    });
})();