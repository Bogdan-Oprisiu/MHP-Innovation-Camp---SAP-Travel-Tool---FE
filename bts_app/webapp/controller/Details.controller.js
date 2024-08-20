sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/core/format/DateFormat", "sap/ui/model/json/JSONModel"],
  function (Controller, DateFormat,JSONModel) {
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

        var oDetails = new JSONModel();
        oDetails.setData({sEmployeeId: sEmpId,  sTripId: sBtId });
        

        this.getView().setModel(oDetails, "oDetails");


        var oMyTripsModel = this.getOwnerComponent().getModel("myTrips");
        var oAllTripsModel = this.getOwnerComponent().getModel("allTrips");

        var oModel =
          oMyTripsModel.getData() && oMyTripsModel.getData().combinedData
            ? oMyTripsModel
            : oAllTripsModel;

        // console.log(oModel.getData());
        // console.log(oAllTripsModel.getData());

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


      handleApprovePress: function () {
        this._updateTripStatus("approved");
    },

    handleDeclinePress: function () {
        this._updateTripStatus("denied");
    },

    _updateTripStatus: function (status) {
      var oView = this.getView();

      var sEmpId = this.getView().getModel("oDetails").getProperty("/sEmployeeId");
      var sTripId = this.getView().getModel("oDetails").getProperty("/sTripId");
      var oDetailsModel = this.getOwnerComponent().getModel("detail");
      
      console.log(oDetailsModel);

      var sReasonForTravel = oView.byId("reasonForTravel").getValue();
      var sRequestor = oView.byId("requestor").getValue();
      var sStartDate = oView.byId("startBusinessTrip").getValue();
      var sEndDate = oView.byId("endBusinessTrip").getValue();
      var sExpensesId = oView.byId("expensesID").getValue();


     // var sPersonalNumber = oContext.getProperty("PERSONAL_NUMBER");
      //var sTripId = oContext.getProperty("TRIPID");


      if (!sEmpId || !sEmpId) {
        sap.m.MessageToast.show("Missing trip details. Cannot proceed with the update.");
        return;
    }

    var oModel = this.getOwnerComponent().getModel("mainServiceModel");
    console.log(oModel);
  

    var sPath = `/Emp_TripSet(PERSONAL_NUMBER='${sEmpId}',TRIPID='${sEmpId}')`;
  
    var oUpdatedData = {
        PERSONAL_NUMBER: sEmpId,
        TRIPID: sTripId,
        EXPENSESID: sExpensesId,
        REQUESTER: sRequestor,
        START_DATE: sStartDate,
        END_DATE: sEndDate,
        ACCEPTED: status,
        REASON: sReasonForTravel,
    };

    oModel.update(sPath, oUpdatedData, {
        success: function() {
            sap.m.MessageToast.show("BT's status modifed!");
            oModel.refresh(true);
        },
        error: function(oError) {
            sap.m.MessageToast.show("Error");
            console.error("Error updating trip details:", oError);
        }
    });
}


});
    });

