sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
  function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("bts.btsapp.controller.Welcome", {
      onInit: function () {
        // Set up a JSONModel for view-specific data like form visibility
        var oViewModel = new JSONModel({
          showLoginForm: true,
        });
        this.getView().setModel(oViewModel, "view");
      },
    });
  }
);
