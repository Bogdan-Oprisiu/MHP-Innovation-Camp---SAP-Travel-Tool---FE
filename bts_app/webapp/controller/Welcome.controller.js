sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
  function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("bts.btsapp.controller.Welcome", {
      onInit: function () {
        // Set up a JSONModel with a property to manage form visibility
        var oViewModel = new JSONModel({
          showLoginForm: true,
          showSignupForm: false,
        });
        this.getView().setModel(oViewModel, "view");
      },
    });
  }
);
