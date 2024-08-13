sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "../utils/CookieUtils",
  ],
  function (BaseController, History, CookieUtils) {
    "use strict";

    return BaseController.extend("bts.btsapp.controller.App", {
      onInit: function () {
        // Check cookie for session data
        this._checkSessionCookie();

        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.attachRouteMatched(this.onRouteMatched, this);
      },

      onRouteMatched: function (oEvent) {
        var oSessionModel = this.getOwnerComponent().getModel("session");
        var isAuthenticated = oSessionModel.oData.authenticated;
        var isManager = oSessionModel.oData.isManager;

        var sRouteName = oEvent.getParameter("name");
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

        if (sRouteName !== "RouteWelcome" && isAuthenticated === false) {
          oRouter.navTo("RouteWelcome");
          window.location.reload(true);
        }

        if (sRouteName === "RouteManager" && isManager === false) {
          oRouter.navTo("RouteUser");
        }
      },

      _checkSessionCookie: function () {
        var oSessionModel = this.getOwnerComponent().getModel("session");
        var username = CookieUtils.getCookie("username");
        var personalNumber = CookieUtils.getCookie("personalNumber");
        var isManager = CookieUtils.getCookie("isManager");

        if (username && personalNumber) {
          oSessionModel.setData({
            authenticated: true,
            username: username,
            personalNumber: personalNumber,
            isManager: isManager === "true",
          });
        }
      },
    });
  }
);
