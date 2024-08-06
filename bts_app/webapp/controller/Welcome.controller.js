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
        if (!this.loginFormFragment) {
          console.error("Login fragment is not loaded or assigned corectly");
        }

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

        var username = this.loginFormFragment.byId("usernameLogIn").getValue();
        var password = this.loginFormFragment.byId("passwordLogIn").getValue();

        // Attempt to access an element directly, assuming the fragment is a control with elements
        // console.log(this.loginFormFragment);
        // var usernameControl = this.loginFormFragment.getContent()[0];
        // var passwordControl = this.loginFormFragment.getContent()[1];

        // var username = usernameControl.getValue();
        // var password = passwordControl.getValue();

        if (!username || !password) {
          console.error("Input fields are not found in the fragment");
          return;
        }

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

        var username = this.signupFormFragment
          .byId("usernameSignUp")
          .getValue();
        var password = this.signupFormFragment
          .byId("passwordSignUp")
          .getValue();
        var confirmPassword = this.signupFormFragment
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
