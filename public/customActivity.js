(function () {
    const connection = new Postmonger.Session();
    let payload = {};

    const statusEl = document.getElementById("status");
    const btnSave = document.getElementById("btnSave");

    connection.on("ready", () => {
        statusEl.innerText = "READY (Postmonger connected)";
        connection.trigger("requestInteraction");
        connection.trigger("requestTriggerEventDefinition");
        connection.trigger("requestSchema");
    });

    connection.on("initActivity", (data) => {
        payload = data || {};
        console.log("INIT ACTIVITY:", payload);
    });

    btnSave.addEventListener("click", () => {
        console.log("SAVING ACTIVITY PAYLOAD:", payload);
        connection.trigger("updateActivity", payload);
        connection.trigger("done");
    });

    connection.trigger("ready");
})();