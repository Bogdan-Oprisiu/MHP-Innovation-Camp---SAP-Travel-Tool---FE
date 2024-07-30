sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
  function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("bts.btsapp.controller.Login", {
      onInit: function () {
        // Retrieve the existing model or create a new one if it doesn't exist
        var oModel = this.getView().getModel();
        if (!oModel) {
          oModel = new JSONModel();
          this.getView().setModel(oModel);
        }

        // Get the current data from the model
        var oData = oModel.getData();

        // Add or update the HTML property
        oData.HTML = oData.HTML || ""; // Ensure HTML exists in the model data
        oData.customLogInHTML = "<h2>Welcome back</h2>";

        // Set the updated data back to the model
        oModel.setData(oData);
      },

      onPressLogin: function () {
        var username = this.getView().byId("usernameLogIn").getValue();
        var password = this.getView().byId("passwordLogIn").getValue();

        if (username && password) {
          sap.m.MessageToast.show("Login successful!");
          // Add your login logic here
        } else {
          sap.m.MessageToast.show("Please enter both username and password.");
        }
      },

      onPressShowSignup: function () {
        // Correctly retrieve the shared model
        var oViewModel = this.getView().getModel("view");
        if (oViewModel) {
          oViewModel.setProperty("/showLoginForm", false);
          oViewModel.setProperty("/showSignupForm", true);
        } else {
          console.error("View model not found");
        }
      },
    });
  }
);
