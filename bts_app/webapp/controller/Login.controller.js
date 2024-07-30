sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("bts.btsapp.controller.Login", {
    onInit: function () {},

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
});
