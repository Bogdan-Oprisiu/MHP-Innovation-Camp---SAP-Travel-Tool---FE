sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
  ],
  function (Controller, JSONModel, MessageToast) {
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

      onPressShowSignup: function () {
        // Set properties to show signup form and hide login form
        this.getView().getModel("view").setProperty("/showLoginForm", false);
        this.getView().getModel("view").setProperty("/showSignupForm", true);
      },

      onPressShowLogin: function () {
        // Set properties to show login form and hide signup form
        this.getView().getModel("view").setProperty("/showLoginForm", true);
        this.getView().getModel("view").setProperty("/showSignupForm", false);
      },

      onPressLogin: function () {
        var username = this.getView().byId("usernameLogIn").getValue();
        var password = this.getView().byId("passwordLogIn").getValue();

        if (username && password) {
          MessageToast.show("Login successful!");
          // Add your login logic here
        } else {
          MessageToast.show("Please enter both username and password.");
        }
      },

      onPressSignup: function () {
        var username = this.getView().byId("usernameSignUp").getValue();
        var password = this.getView().byId("passwordSignUp").getValue();

        if (username && password) {
          MessageToast.show("Signup successful!");
          // Add your signup logic here
        } else {
          MessageToast.show("Please enter both username and password.");
        }
      },
    });
  }
);
