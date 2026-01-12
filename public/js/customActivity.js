/* global Postmonger */
(function () {
  const connection = new Postmonger.Session();

  let payload = {};

  // ✅ Handshake correcto (si esto no está, se queda el spinner)
  connection.trigger("ready");
  connection.trigger("requestTokens");
  connection.trigger("requestEndpoints");

  // ✅ Journey manda el payload aquí cuando abre la activity
  connection.on("initActivity", function (data) {
    payload = data || {};

    payload.metaData = payload.metaData || {};
    payload.arguments = payload.arguments || {};
    payload.arguments.execute = payload.arguments.execute || {};
    payload.arguments.execute.inArguments =
      payload.arguments.execute.inArguments || [];

    // recuperar valores guardados (si existen)
    const inArgs = payload.arguments.execute.inArguments;

    const contactListId =
      inArgs.find((a) => a.contactListId)?.contactListId || "";
    const useNewList =
      inArgs.find((a) => a.useNewList)?.useNewList || false;
    const newListName =
      inArgs.find((a) => a.newListName)?.newListName || "";

    // mandar al UI para que seleccione / pinte
    connection.trigger("showUIData", {
      contactListId,
      useNewList,
      newListName,
    });
  });

  // ✅ Guardar al dar Next / Done
  connection.on("clickedNext", function () {
    save("next");
  });

  connection.on("clickedDone", function () {
    save("done");
  });

  function save(action) {
    const select = document.getElementById("contactListSelect");
    const chk = document.getElementById("newListCheck");
    const inp = document.getElementById("newListName");

    payload.metaData = payload.metaData || {};
    payload.arguments = payload.arguments || {};
    payload.arguments.execute = payload.arguments.execute || {};

    payload.arguments.execute.inArguments = [
      { contactListId: select ? select.value : "" },
      { useNewList: chk ? chk.checked : false },
      { newListName: inp ? inp.value : "" },
    ];

    payload.metaData.isConfigured = true;

    connection.trigger("updateActivity", payload);

    // ✅ IMPORTANTE: liberar Journey Builder (si no, spinner / no cierra bien)
    connection.trigger(action);
  }
})();