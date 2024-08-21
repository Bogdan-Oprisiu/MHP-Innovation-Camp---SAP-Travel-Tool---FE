sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "../utils/CookieUtils",
  ],
  function (Controller, JSONModel, Fragment, MessageToast, CookieUtils) {
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

      onPressLogin: function () {
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
              CookieUtils.setCookie("username", oData.USERNAME, 30);
              CookieUtils.setCookie(
                "personalNumber",
                oData.PERSONAL_NUMBER,
                30
              );
              CookieUtils.setCookie("isManager", oData.IS_MANAGER, 30);

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
            MessageToast.show("Failed to log in. Please try again later.");
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

      onPressSignup: function () {
        // Initialise router
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

        var oModel = this.getOwnerComponent().getModel();
        var sUsername = this.byId("usernameSignUp").getValue();
        var sPassword = this.byId("passwordSignUp").getValue();
        var sConfirmPassword = this.byId("passwordConfirmSignUp").getValue();

        // Validate inputs
        if (!sUsername || !sPassword || sPassword !== sConfirmPassword) {
          sap.m.MessageToast.show("Please check your input fields.");
          return;
        }

        // Fetch from the OData service
        oModel.read("/EmployeeSet", {
          success: (oData) => {
            var iMaxPersonalNumber = 0;
            oData.results.forEach(function (employee) {
              var currentNumber = parseInt(employee.PERSONAL_NUMBER);
              if (currentNumber > iMaxPersonalNumber) {
                iMaxPersonalNumber = currentNumber;
              }
            });

            var oNewUser = {
              PERSONAL_NUMBER: String(iMaxPersonalNumber + 1),
              USERNAME: sUsername,
              PASSWORD: sPassword,
              IS_MANAGER: false,
            };

            // Create the new user
            oModel.create("/EmployeeSet", oNewUser, {
              success: function () {
                sap.m.MessageToast.show("User registered successfully.");
                oRouter.navTo("RouteUser");
              },
              error: function (oError) {
                sap.m.MessageToast.show(
                  "Registration failed. " + oError.message
                );
              },
            });
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
