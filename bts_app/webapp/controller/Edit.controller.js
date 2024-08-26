sap.ui.define(["sap/ui/core/mvc/Controller"], function (BaseController) {
  "use strict";

  return BaseController.extend("bts.btsapp.controller.Edit", {
    onInit: function () {
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter
        .getRoute("RouteEdit")
        .attachPatternMatched((oEvent) => this._onObjectMatched(oEvent), this);
    },

    _onObjectMatched: function (oEvent) {
      var sEmpId = oEvent.getParameter("arguments").empId.trim();

      var oModel = this.getOwnerComponent().getModel();
      var sPath = "/EmployeeSet(PERSONAL_NUMBER='" + sEmpId;
      ("')");

      // Read the specific trip data from the backend
      oModel.read(sPath, {
        success: (oData) => {
          var oSessionModel = this.getOwnerComponent().getModel("session");
          var oSessionData = oSessionModel.getData();
          var sId = oSessionData.personalNumber.trim();
          var sShowUserControls = oData.PERSONAL_NUMBER.trim() === sId.trim();

          oData.showUserControls = sShowUserControls;
          // console.log("Retrieved Data:", oData);
          var oEmpModel = new JSONModel(oData);
          this.getView().setModel(oEmpModel, "empInfo");
        },
        error: (oError) => {
          console.error("Error fetching trip data:", oError);
        },
      });
    },

    onNavBack: function () {
      var oSessionModel = this.getOwnerComponent().getModel("session");
      this.getOwnerComponent().getRouter().navTo(RouteUser);
    },
  });
});
