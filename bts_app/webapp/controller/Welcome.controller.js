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
          id: sContainerId,
          name: sFragmentName,
          controller: this,
        }).then(
          function (oFragment) {
            var oContainer = this.byId(sContainerId);
            if (oContainer.addItem) {
              oContainer.addItem(oFragment);
            } else {
              console.error("Container does not support addItem method");
            }
          }.bind(this)
        );
      },

      onPressLogin: function () {
        // Function to check login information
        function checkLogInInfo() {
          var oModel = this.getOwnerComponent().getModel("mockUserData");

          // Ensure the model is available
          if (!oModel) {
            sap.m.MessageToast.show(
              "User data is not available. Please try again later."
            );
            return false;
          }

          // Retrieve data from the model
          var oData = oModel.getData();
          var users = oData.Users || [];

          // Check if the inputs are empty
          if (!username || !password) {
            sap.m.MessageToast.show("Please enter both username and password.");
            return false;
          }

          // Validate the username and password against the data
          var validUser = users.find(
            (user) => user.username === username && user.password === password
          );

          if (!validUser) {
            sap.m.MessageToast.show(
              "Invalid username or password. Please try again."
            );
            return false;
          }

          return validUser;
        }

        var username = this.getView().byId("usernameLogIn").getValue();
        var password = this.getView().byId("passwordLogIn").getValue();

        // Check if the login information is valid
        var validUser = checkLogInInfo.call(this, username, password);

        if (validUser) {
          // Display success message based on user role
          var message = validUser.isManager
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

      onPressSignup: function () {
        function isUsernameUnique(username, users) {
          return !users.some((user) => user.username === username);
        }

        function isPasswordSecure(password) {
          // Minimum 8 characters, at least one number and one special character
          var minLength = 8;
          var hasNumber = /\d/;
          var hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

          return (
            password.length >= minLength &&
            hasNumber.test(password) &&
            hasSpecialChar.test(password)
          );
        }

        var username = this.getView().byId("usernameSignUp").getValue();
        var password = this.getView().byId("passwordSignUp").getValue();
        var confirmPassword = this.getView()
          .byId("passwordConfirmSignUp")
          .getValue();

        if (!username || !password) {
          sap.m.MessageToast.show("Please enter both username and password.");
          return;
        }

        if (password !== confirmPassword) {
          sap.m.MessageToast.show("Passwords do not match.");
          return;
        }

        // Retrieve the model named 'mockUserData'
        var oModel = this.getOwnerComponent().getModel("mockUserData");
        if (!oModel) {
          sap.m.MessageToast.show(
            "User data is not available. Please try again later."
          );
          return;
        }

        // Get the existing data from the model
        var oData = oModel.getData() || {};
        var users = oData.Users || [];

        // Check if username is unique
        if (!isUsernameUnique(username, users)) {
          sap.m.MessageToast.show(
            "Username already exists. Please choose a different username."
          );
          return;
        }

        // Check if the password is secure
        if (!isPasswordSecure(password)) {
          sap.m.MessageToast.show(
            "Password must be at least 8 characters long and include at least one number and one special character."
          );
          return;
        }

        // Create a new user object
        var newUser = {
          username: username,
          password: password,
          isManager: false,
        };

        // Add the new user to the users array
        users.push(newUser);

        // Update the model with the new user data
        oModel.setProperty("/Users", users);

        // Display success message
        sap.m.MessageToast.show(
          `Signup successful as ${username} with the password ${password}`
        );

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
