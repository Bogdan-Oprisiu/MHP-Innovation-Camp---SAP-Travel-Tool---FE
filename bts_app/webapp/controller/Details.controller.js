sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/core/format/DateFormat", "sap/ui/model/json/JSONModel"],
  function (Controller, DateFormat, JSONModel) {
    "use strict";

    return Controller.extend("bts.btsapp.controller.Details", {
      onInit: function () {
        // window.location.reload(true);
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
        oDetails.setData({ sEmployeeId: sEmpId, sTripId: sBtId });

        this.getView().setModel(oDetails, "oDetails");

        // Determine if we should use the 'myTrips' or 'allTrips' model
        var oMyTripsModel = this.getOwnerComponent().getModel("myTrips");
        var oAllTripsModel = this.getOwnerComponent().getModel("allTrips");

        var oModel =
          oMyTripsModel.getData() && oMyTripsModel.getData().combinedData
            ? oMyTripsModel
            : oAllTripsModel;

        if (!oModel) {
          console.error("Neither myTrips nor allTrips model is available");
          return;
        }

        var aCombinedData = oModel.getProperty("/combinedData");
        if (!aCombinedData) {
          console.error("combinedData is not available in the selected model");
          console.log("Log");
          var oSessionModel = this.getOwnerComponent().getModel("session");
          this.getOwnerComponent().getRouter().navTo("RouteUser");
          return;
        }

        var oSelectedTrip = aCombinedData.find((trip) => {
          return trip.PERSONAL_NUMBER === sEmpId && trip.TRIPID === sBtId;
        });

        if (!oSelectedTrip) {
          console.error("Selected trip not found in combinedData");
          return;
        }

        var oDetailModel = new JSONModel(oSelectedTrip);
        this.getView().setModel(oDetailModel, "detail");
      },

      onNavBack: function () {
        console.log("Log");
        var oSessionModel = this.getOwnerComponent().getModel("session");
        var bIsManager = oSessionModel.getProperty("/isManager");

        var sRoute = bIsManager ? "RouteManager" : "RouteUser";
        window.location.reload(true);
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

      convertDateToBackendFormat: function (sDate) {
        var oDisplayFormat = DateFormat.getDateInstance({ style: "medium" }); // Match the format used in the DatePicker
        var oDate = oDisplayFormat.parse(sDate);
        var oBackendFormat = DateFormat.getDateInstance({ pattern: "yyyyMMdd" });
        return oBackendFormat.format(oDate);
      },

      handleApprovePress: function () {
        this._updateTripStatus("approved");
        this.getOwnerComponent().getRouter().navTo("RouteManager");
      },

      handleDeclinePress: function () {
        var oView = this.getView();
        var oDialog = oView.byId("declineDialog");
        
        if (!oDialog) {
          // Create the dialog if it doesn't exist
          oDialog = sap.ui.xmlfragment("bts.btsapp.view.DeclineDialog", this);
          oView.addDependent(oDialog);
        }
        
        oDialog.open();
      },

      handleSubmitDeclineReason: function () {
        var oView = this.getView();
        var sReasonForDecline = oView.byId("declineReasonInput").getValue();
        
        if (!sReasonForDecline) {
          MessageToast.show("Please enter a reason for decline.");
          return;
        }
        
        this._updateTripStatus("denied - " + sReasonForDecline);
        
        // Close the dialog and navigate back after processing
        oView.byId("declineDialog").close();
        this.getOwnerComponent().getRouter().navTo("RouteManager");
      },

      handleDeclineDialogCancel: function () {
        this.getView().byId("declineDialog").close();
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

        var sBackendStartDate = this.convertDateToBackendFormat(sStartDate);
        var sBackendEndDate = this.convertDateToBackendFormat(sEndDate);

        if (!sEmpId || !sEmpId) {
          sap.m.MessageToast.show("Missing trip details. Cannot proceed with the update.");
          return;
        }

        var oModel = this.getOwnerComponent().getModel("mainServiceModel");
        console.log(oModel);

        var sPath = `/Emp_TripSet(PERSONAL_NUMBER='${sEmpId}',TRIPID='${sTripId}')`;

        var oUpdatedData = {
          PERSONAL_NUMBER: sEmpId,
          TRIPID: sTripId,
          EXPENSESID: sExpensesId,
          REQUESTER: sRequestor,
          START_DATE: sBackendStartDate,
          END_DATE: sBackendEndDate,
          ACCEPTED: status,
          REASON: sReasonForTravel,
        };

        oModel.update(sPath, oUpdatedData, {
          success: function () {
            sap.m.MessageToast.show("BT's status modified!");
            oModel.refresh(true);
            navBack();
          },
          error: function (oError) {
            sap.m.MessageToast.show("Error");
            console.error("Error updating trip details:", oError);
            navBack();
          },
        });
      },

      handleModifyPress: function (oEvent) {
        var oView = this.getView();

        var sEmpId = this.getView().getModel("oDetails").getProperty("/sEmployeeId");
        var sTripId = this.getView().getModel("oDetails").getProperty("/sTripId");
        var oDetailsModel = this.getOwnerComponent().getModel("detail");

        var sReasonForTravel = oView.byId("reasonForTravel").getValue();
        var sRequestor = oView.byId("requestor").getValue();
        
        var sStartDate = oView.byId("startBusinessTrip").getValue();
        var sEndDate = oView.byId("endBusinessTrip").getValue();

        // Convert the dates to backend format
        var sBackendStartDate = this.convertDateToBackendFormat(sStartDate);
        var sBackendEndDate = this.convertDateToBackendFormat(sEndDate);
        var sExpensesId = oDetailsModel.EXPENSESID;

        if (!sEmpId || !sEmpId) {
          sap.m.MessageToast.show("Missing trip details. Cannot proceed with the update.");
          return;
        }

        var oModel = this.getOwnerComponent().getModel();

        var sPath = `/Emp_TripSet(PERSONAL_NUMBER='${sEmpId}',TRIPID='${sTripId}')`;

        var oUpdatedData = {
          PERSONAL_NUMBER: sEmpId,
          TRIPID: sTripId,
          EXPENSESID: sExpensesId,
          REQUESTER: sRequestor,
          START_DATE: sBackendStartDate,
          END_DATE: sBackendEndDate,
          ACCEPTED: "in process",
          REASON: sReasonForTravel,
        };

        oModel.update(sPath, oUpdatedData, {
          success: function () {
            sap.m.MessageToast.show("Trip details updated successfully!");
            oModel.refresh(true);
          },
          error: function (oError) {
            sap.m.MessageToast.show("Failed to update trip details. Please try again.");
            console.error("Error updating trip details:", oError);
          },
        });
      },
    });
  }
);
