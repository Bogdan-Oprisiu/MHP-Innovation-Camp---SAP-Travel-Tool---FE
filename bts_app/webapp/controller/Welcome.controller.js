sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
  function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("bts.btsapp.controller.Welcome", {
      onInit: function () {
        // // Log the mockUserData if it exists
        // var oModel = this.getOwnerComponent().getModel("mockUserData");
        // if (oModel) {
        //   var oData = oModel.getData();
        //   console.log("Existing User Data: ", oData);
        // } else {
        //   console.error("Model 'mockUserData' not found or not loaded.");
        // }

        // Set up a JSONModel for view-specific data like form visibility
        var oViewModel = new JSONModel({
          showLoginForm: true,
          showSignupForm: false,
        });
        this.getView().setModel(oViewModel, "view");
      },
    });
  }
);
