/* global Postmonger */

(function () {
    // Carga Postmonger desde CDN (rápido para demo)
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/postmonger@0.0.16/postmonger.js";
    s.onload = init;
    document.head.appendChild(s);

    function init() {
        const connection = new Postmonger.Session();
        const status = document.getElementById("status");

        connection.on("ready", () => {
            status.innerText = "READY (Postmonger connected)";
            // Pide datos del Journey (útil para data binding luego)
            connection.trigger("requestSchema");
            connection.trigger("requestTriggerEventDefinition");
            connection.trigger("requestInteraction");
        });

        // Para ver que te llegan respuestas
        connection.on("requestedSchema", (schema) => console.log("SCHEMA:", schema));
        connection.on("requestedInteraction", (interaction) => console.log("INTERACTION:", interaction));
        connection.on("requestedTriggerEventDefinition", (ted) => console.log("TRIGGER EVENT DEF:", ted));

        // Importante: avisa que tu iframe está listo
        connection.trigger("ready");
    }
})();