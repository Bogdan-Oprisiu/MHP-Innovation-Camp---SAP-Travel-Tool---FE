sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
  function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("bts.btsapp.controller.Login", {
      onInit: function () {},

      onPressLogin: function () {
        // Function to check login information
        const checkLogInInfo = (username, password) => {
          const oModel = this.getOwnerComponent().getModel("mockUserData");

          // Ensure the model is available
          if (!oModel) {
            sap.m.MessageToast.show(
              "User data is not available. Please try again later."
            );
            return false;
          }

          // Retrieve data from the model
          const oData = oModel.getData();
          const users = oData.Users || [];

          // Check if the inputs are empty
          if (!username || !password) {
            sap.m.MessageToast.show("Please enter both username and password.");
            return false;
          }

          // Validate the username and password against the data
          const validUser = users.find(
            (user) => user.username === username && user.password === password
          );

          if (!validUser) {
            sap.m.MessageToast.show(
              "Invalid username or password. Please try again."
            );
            return false;
          }

          return validUser;
        };

        const username = this.getView().byId("usernameLogIn").getValue();
        const password = this.getView().byId("passwordLogIn").getValue();

        // Check if the login information is valid
        const validUser = checkLogInInfo.call(this, username, password);

        if (validUser) {
          // Display success message based on user role
          const message = validUser.isManager
            ? "Login successful as manager."
            : "Login successful as user.";

          sap.m.MessageToast.show(message);

          // Navigate to the test view
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("RouteTest");
        }
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
    });
  }
);
