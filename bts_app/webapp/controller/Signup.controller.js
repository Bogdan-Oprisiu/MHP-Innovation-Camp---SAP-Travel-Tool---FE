sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("bts.btsapp.controller.Signup", {
    onInit: function () {},

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
});
