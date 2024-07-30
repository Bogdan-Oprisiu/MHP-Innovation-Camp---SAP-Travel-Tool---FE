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
    });
  }
);
