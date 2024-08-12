sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/core/format/DateFormat"],
  function (Controller, DateFormat) {
    "use strict";

    return Controller.extend("bts.btsapp.controller.Details", {
      onInit: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter
          .getRoute("RouteDetails")
          .attachPatternMatched(
            (oEvent) => this._onObjectMatched(oEvent),
            this
          );
      },

      _onObjectMatched: function (oEvent) {
        var sEmpId = oEvent.getParameter("arguments").empId;
        var sBtId = oEvent.getParameter("arguments").btId;

        // Determine if we should use the 'myTrips' or 'allTrips' model
        var oMyTripsModel = this.getOwnerComponent().getModel("myTrips");
        var oAllTripsModel = this.getOwnerComponent().getModel("allTrips");

        var oModel =
          oMyTripsModel.getData() && oMyTripsModel.getData().combinedData
            ? oMyTripsModel
            : oAllTripsModel;

        console.log(oModel.getData());
        console.log(oAllTripsModel.getData());

        if (!oModel) {
          console.error("Neither myTrips nor allTrips model is available");
          return;
        }

        var aCombinedData = oModel.getProperty("/combinedData");
        if (!aCombinedData) {
          console.error("combinedData is not available in the selected model");
          return;
        }

        var oSelectedTrip = aCombinedData.find((trip) => {
          return trip.PERSONAL_NUMBER === sEmpId && trip.TRIPID === sBtId;
        });

        if (!oSelectedTrip) {
          console.error("Selected trip not found in combinedData");
          return;
        }

        var oDetailModel = new sap.ui.model.json.JSONModel(oSelectedTrip);
        this.getView().setModel(oDetailModel, "detail");
        // console.log("Detail model set with data: ", oDetailModel.getData());
      },

      onNavBack: function () {
        var oSessionModel = this.getOwnerComponent().getModel("session");
        var bIsManager = oSessionModel.getProperty("/isManager");

        var sRoute = bIsManager ? "RouteManager" : "RouteUser";
        this.getOwnerComponent().getRouter().navTo(sRoute);
      },

      formatDate: function (sDate) {
        var oDateFormat = DateFormat.getDateInstance({
          pattern: "yyyyMMdd",
        });
        var oFormattedDate = oDateFormat.parse(sDate);
        var oDisplayFormat = DateFormat.getDateInstance({
          style: "medium",
        });
        return oDisplayFormat.format(oFormattedDate);
      },
    });
  }
);
