/* global Postmonger */
(function () {
    const connection = new Postmonger.Session();

    let payload = null;

    // 1) Cuando cargue el iframe, avisa a Journey Builder que ya estás listo.
    //    Journey Builder responderá con initActivity.  [oai_citation:2‡Salesforce Developers](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/using-postmonger.html)
    connection.trigger("ready");

    // (Opcional pero recomendado) pedir tokens/endpoints
    connection.trigger("requestTokens");
    connection.trigger("requestEndpoints");

    // 2) Journey Builder te manda el payload actual (si ya estaba configurada o no).
    connection.on("initActivity", function (data) {
        payload = data || {};
    });

    // 3) Cuando el usuario hace click en "Listo" (Done),
    //    Journey Builder dispara clickedNext.
    //    Debes responder con updateActivity (con isConfigured=true) para cerrar el modal.  [oai_citation:3‡Salesforce Developers](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/using-postmonger.html)
    connection.on("clickedNext", function () {
        if (!payload) payload = {};

        payload.metaData = payload.metaData || {};
        payload.metaData.isConfigured = true; // <- CLAVE para que Journey deje activar  [oai_citation:4‡Salesforce Developers](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/using-postmonger.html)

        // No estamos guardando campos aún. Solo “confirmamos” configuración.
        connection.trigger("updateActivity", payload);
    });

    // Si quieres soportar Back sin romper:
    connection.on("clickedBack", function () {
        connection.trigger("prevStep");
    });
})();