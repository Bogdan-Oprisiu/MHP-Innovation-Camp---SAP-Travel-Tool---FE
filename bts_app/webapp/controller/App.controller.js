sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/core/routing/History"],
  function (BaseController, History) {
    "use strict";

    return BaseController.extend("bts.btsapp.controller.App", {
      onInit: function () {
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
    });
  }
);
