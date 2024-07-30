sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
  function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("bts.btsapp.controller.Signup", {
      onInit: function () {
        // Retrieve the existing model or create a new one if it doesn't exist
        var oModel = this.getView().getModel();
        if (!oModel) {
          oModel = new JSONModel();
          this.getView().setModel(oModel);
        }

        // Get the current data from the model
        var oData = oModel.getData();

        // Add or update the customSignupHTML property
        oData.customSignupHTML = "<h2>Hello</h2>";

        // Set the updated data back to the model
        oModel.setData(oData);
      },

      onPressSignup: function () {
        var username = this.getView().byId("usernameSignUp").getValue();
        var password = this.getView().byId("passwordSignUp").getValue();

        if (username && password) {
          sap.m.MessageToast.show("Signup successful!");
          // Add your signup logic here
        } else {
          sap.m.MessageToast.show("Please enter both username and password.");
        }
      },

      onPressShowLogin: function () {
        // Correctly retrieve the shared model
        var oViewModel = this.getView().getModel("view");
        if (oViewModel) {
          oViewModel.setProperty("/showLoginForm", true);
          oViewModel.setProperty("/showSignupForm", false);
        } else {
          console.error("View model not found");
        }
      },
    });
  }
);
