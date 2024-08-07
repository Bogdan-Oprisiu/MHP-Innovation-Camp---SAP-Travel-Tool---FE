sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
  ],
  function (Controller, JSONModel, Fragment) {
    "use strict";

    return Controller.extend("bts.btsapp.controller.Welcome", {
      onInit: function () {
        // Initialize view model for managing visibility
        var oViewModel = new JSONModel({
          showLoginForm: true,
        });
        this.getView().setModel(oViewModel, "view");

        // Add fragments to the FlexBox containers
        this._loadAndAddFragment("loginForm", "bts.btsapp.view.Login");
        this._loadAndAddFragment("signupForm", "bts.btsapp.view.Signup");
      },
      _loadAndAddFragment: function (sContainerId, sFragmentName) {
        Fragment.load({
          id: this.getView().getId(),
          name: sFragmentName,
          controller: this,
        })
          .then(
            function (oFragment) {
              this[sContainerId + "Fragment"] = oFragment; // Save fragment reference
              var oContainer = this.byId(sContainerId);
              oContainer.addItem(oFragment); // Use addItem to add the fragment content
            }.bind(this)
          )
          .catch(function (error) {
            console.error("Error loading fragment: ", error);
          });
      },

      onPressLogin: function () {
        var isManager = true;
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

        if (isManager) oRouter.navTo("RouteManager");
        else oRouter.navTo("RouteUser");

        // // Navigate to a test view
        // var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        // oRouter.navTo("RouteTest");
      },

      onPressShowSignup: function () {
        // Correctly retrieve the shared model
        var oViewModel = this.getView().getModel("view");
        if (oViewModel) {
          oViewModel.setProperty("/showLoginForm", false);
        } else {
          console.error("View model not found");
        }
      },

      onPressSignup: function () {
        // Navigate to a test view
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("RouteTest");
      },

      onPressShowLogin: function () {
        // Correctly retrieve the shared model
        var oViewModel = this.getView().getModel("view");
        if (oViewModel) {
          oViewModel.setProperty("/showLoginForm", true);
        } else {
          console.error("View model not found");
        }
      },
    });
  }
);
