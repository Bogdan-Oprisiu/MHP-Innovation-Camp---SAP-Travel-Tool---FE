sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "../utils/CookieUtils",
    "../utils/HashingUtils",
  ],
  function (
    Controller,
    JSONModel,
    Fragment,
    MessageToast,
    CookieUtils,
    HashingUtils
  ) {
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
              this[sContainerId + "Fragment"] = oFragment;
              var oContainer = this.byId(sContainerId);
              oContainer.addItem(oFragment);
            }.bind(this)
          )
          .catch(function (error) {
            console.error("Error loading fragment: ", error);
          });
      },

      onPressLogin: async function () {
        // Initialise router
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

        // Access the OData model
        var oModel = this.getOwnerComponent().getModel("mainServiceModel");
        var oSessionModel = this.getOwnerComponent().getModel("session");

        // Access the user input
        var sUsername = this.byId("usernameLogIn").getValue();
        var sPassword = this.byId("passwordLogIn").getValue();

        // Check if username and password are not empty
        if (!sUsername || !sPassword) {
          MessageToast.show("Please enter both username and password.");
          return;
        }

        // Hash the password
        sPassword = await HashingUtils.hashPassword(sPassword);

        // Call the function import for login
        oModel.callFunction("/UserLogin", {
          method: "GET",
          urlParameters: {
            USERNAME: sUsername,
            PASSWORD: sPassword,
          },
          success: function (oData) {
            if (oData && oData.PERSONAL_NUMBER) {
              // Authentication successful, update session model and cookies
              oSessionModel.setData({
                authenticated: true,
                username: oData.USERNAME,
                personalNumber: oData.PERSONAL_NUMBER,
                isManager: oData.IS_MANAGER,
              });

              // Set cookies
              CookieUtils.setCookie("username", oData.USERNAME, 32);
              CookieUtils.setCookie(
                "personalNumber",
                oData.PERSONAL_NUMBER,
                32
              );
              CookieUtils.setCookie("isManager", oData.IS_MANAGER, 32);

              // Navigate based on role
              if (oData.IS_MANAGER) {
                oRouter.navTo("RouteManager");
              } else {
                oRouter.navTo("RouteUser");
              }
            } else {
              MessageToast.show(
                "Invalid username or password. Please try again."
              );
            }
          },
          error: function (oError) {
            console.error("Login failed:", oError);
            MessageToast.show("Invalid credentials");
          },
        });
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

      _validateUsername: function (username) {
        // Check for maximum length
        if (username.length > 20) {
          return {
            result: false,
            message: "The username can have a maximum length of 20 characters.",
          };
        }

        // Check for minimum length
        if (username.length < 5) {
          return {
            result: false,
            message: "The username must be at least 5 characters long.",
          };
        }

        // Check for at least one lowercase and one uppercase character
        if (!/[a-z]/.test(username) || !/[A-Z]/.test(username)) {
          return {
            result: false,
            message:
              "The username must contain at least one lowercase and one uppercase character.",
          };
        }

        // Check for non-ASCII characters
        if (!/^[\x00-\x7F]+$/.test(username)) {
          return {
            result: false,
            message:
              "The username contains non-ASCII characters, which are not allowed.",
          };
        }

        // Check for characters that cannot be displayed in URLs
        if (/[^a-zA-Z0-9]/.test(username)) {
          return {
            result: false,
            message:
              "The username contains invalid characters. Only letters and numbers are allowed.",
          };
        }

        // If all checks pass, return true
        return { result: true, message: "" };
      },

      _validatePassword: function (password) {
        // Check for minimum length
        if (password.length < 8) {
          return {
            result: false,
            message: "The password must be at least 8 characters long.",
          };
        }

        // Check for maximum length
        if (password.length > 64) {
          return {
            result: false,
            message: "The password must be at most 64 characters long.",
          };
        }

        // Check for at least one lowercase letter
        if (!/[a-z]/.test(password)) {
          return {
            result: false,
            message: "The password must contain at least one lowercase letter.",
          };
        }

        // Check for at least one uppercase letter
        if (!/[A-Z]/.test(password)) {
          return {
            result: false,
            message: "The password must contain at least one uppercase letter.",
          };
        }

        // Check for at least one digit
        if (!/[0-9]/.test(password)) {
          return {
            result: false,
            message: "The password must contain at least one digit.",
          };
        }

        // Check for at least one special character
        if (!/[!@#%^*(),.?":{}|<>]/.test(password)) {
          return {
            result: false,
            message:
              "The password must contain at least one special character (e.g., @, #, etc.).",
          };
        }

        // Check for spaces (no spaces allowed)
        if (/\s/.test(password)) {
          return {
            result: false,
            message: "The password must not contain spaces.",
          };
        }

        // If all checks pass, return true
        return { result: true, message: "" };
      },

      onPressSignup: async function () {
        // Initialise router
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

        // Access the OData model
        var oModel = this.getOwnerComponent().getModel();
        var oModel = this.getOwnerComponent().getModel("mainServiceModel");
        var oSessionModel = this.getOwnerComponent().getModel("session");
        var sUsername = this.byId("usernameSignUp").getValue();
        var sPassword = this.byId("passwordSignUp").getValue();
        var sConfirmPassword = this.byId("passwordConfirmSignUp").getValue();

        // Validate inputs
        if (!sUsername || !sPassword || !sConfirmPassword) {
          sap.m.MessageToast.show("All input fields are mandatory");
          return;
        }

        var validationObject = this._validateUsername(sUsername);
        if (!validationObject.result) {
          sap.m.MessageToast.show(validationObject.message);
          return;
        }

        validationObject = this._validatePassword(sPassword);
        if (!validationObject.result) {
          sap.m.MessageToast.show(validationObject.message);
          return;
        }

        if (sPassword !== sConfirmPassword) {
          sap.m.MessageToast.show("Please confirm your password");
          return;
        }

        // Hash the password
        sPassword = await HashingUtils.hashPassword(sPassword);

        // Use filter to check if the username already exists
        var oFilter = new sap.ui.model.Filter(
          "USERNAME",
          sap.ui.model.FilterOperator.EQ,
          sUsername
        );

        // Check if the username already exists
        oModel.read("/EmployeeSet", {
          filters: [oFilter],
          success: (oData) => {
            if (oData.results.length > 0) {
              // Username already exists
              sap.m.MessageToast.show(
                "Username already taken. Please choose another one."
              );
            } else {
              // Generate a random personal number
              var iRandomPersonalNumber = Math.floor(Math.random() * 100000);

              // The generated personal number is unique, proceed with user creation
              var oNewUser = {
                PERSONAL_NUMBER: String(iRandomPersonalNumber),
                USERNAME: sUsername,
                PASSWORD: sPassword,
                IS_MANAGER: false,
              };

              // Create the new user
              oModel.create("/EmployeeSet", oNewUser, {
                success: function () {
                  sap.m.MessageToast.show("User registered successfully.");
                  oRouter.navTo("RouteUser");
                  // Authentication successful, update session model and cookies
                  oSessionModel.setData({
                    authenticated: true,
                    username: oNewUser.USERNAME,
                    personalNumber: oNewUser.PERSONAL_NUMBER,
                    isManager: oNewUser.IS_MANAGER,
                  });

                  // Set cookies
                  CookieUtils.setCookie("username", oNewUser.USERNAME, 32);
                  CookieUtils.setCookie(
                    "personalNumber",
                    oNewUser.PERSONAL_NUMBER,
                    32
                  );
                  CookieUtils.setCookie("isManager", oNewUser.IS_MANAGER, 32);
                },
                error: function (oError) {
                  sap.m.MessageToast.show(
                    "Registration failed. " + oError.message
                  );
                },
              });
            }
          },
          error: (oError) => {
            sap.m.MessageToast.show(
              "Failed to fetch data from server. Please try again later."
            );
          },
        });
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
