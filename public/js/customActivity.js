/* global Postmonger */
(function () {
  const connection = new Postmonger.Session();

  let payload = {};
  let initialized = false;

  connection.on("initActivity", function (data) {
    payload = data || {};
    payload.arguments = payload.arguments || {};
    payload.arguments.execute = payload.arguments.execute || {};
    payload.arguments.execute.inArguments =
      payload.arguments.execute.inArguments || [];

    // enviar datos guardados al UI
    connection.trigger("showUIData", {
      contactListId: payload.arguments.execute.inArguments.find(a => a.contactListId)?.contactListId || "",
      useNewList: payload.arguments.execute.inArguments.find(a => a.useNewList)?.useNewList || false,
      newListName: payload.arguments.execute.inArguments.find(a => a.newListName)?.newListName || ""
    });

    initialized = true;
  });

  connection.on("requestedInteraction", function () {
    connection.trigger("ready");
  });

  connection.on("clickedNext", function () {
    save();
  });

  connection.on("clickedDone", function () {
    save();
  });

  function save() {
    if (!initialized) return;

    const select = document.getElementById("contactListSelect");
    const chk = document.getElementById("newListCheck");
    const inp = document.getElementById("newListName");

    payload.arguments.execute.inArguments = [
      { contactListId: select?.value || "" },
      { useNewList: chk?.checked || false },
      { newListName: inp?.value || "" }
    ];

    connection.trigger("updateActivity", payload);
  }
})();