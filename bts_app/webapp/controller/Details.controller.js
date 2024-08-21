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
      
      formatAdvancedPayment: function (sValue) {
        return sValue === "X";
    },

    
      _onObjectMatched: function (oEvent) {
        var sEmpId = oEvent.getParameter("arguments").empId.trim();
        var sBtId = oEvent.getParameter("arguments").btId.trim();

        console.log(sEmpId);
        console.log(sBtId);

    
        var oModel = this.getOwnerComponent().getModel();
        var oSessionModel = this.getOwnerComponent().getModel("session");
        var oSessionData = oSessionModel.getData();

        var sPath = "/TripDetailsSet(PERSONAL_NUMBER='" + sEmpId + "',TRIPID='" + sBtId + "')";
    
        // Read the specific trip data from the backend
        oModel.read(sPath, {
            success: (oData) => {
              console.log("Retrieved Data:", oData);
                var oDetailModel = new JSONModel(oData);
                this.getView().setModel(oDetailModel, "detail");
            },
            error: (oError) => {
                console.error("Error fetching trip data:", oError);
            }
        });
    },

      onNavBack: function () {
        var oSessionModel = this.getOwnerComponent().getModel("session");
        var bIsManager = oSessionModel.getProperty("/isManager");

        var sRoute = bIsManager ? "RouteManager" : "RouteUser";
        this.getOwnerComponent().getRouter().navTo(sRoute);
     
        oRouter.navTo("RouteWelcome");
        window.location.reload(true);
        ////
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
      },

      handleDeclinePress: function () {
        this._updateTripStatus("denied");
      },

      _updateTripStatus: function (status) {
        var oView = this.getView();


        var sEmpId = this.getView().getModel("detail").getData().PERSONAL_NUMBER.trim();
        var sTripId = this.getView().getModel("detail").getData().TRIPID.trim();
        var oDetailsModel = this.getOwnerComponent().getModel("detail");

        console.log(oDetailsModel);

        var sReasonForTravel = oView.byId("reasonForTravel").getValue();
        var sRequestor = oView.byId("requestor").getValue();
        var sStartDate = oView.byId("startBusinessTrip").getValue();
        var sEndDate = oView.byId("endBusinessTrip").getValue();
        var sExpensesId = oView.byId("expensesID").getValue();

        var sBackendStartDate = this.convertDateToBackendFormat(sStartDate);
        var sBackendEndDate = this.convertDateToBackendFormat(sEndDate);

        if (!sEmpId || !sTripId) {
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
          },
          error: function (oError) {
            sap.m.MessageToast.show("Error");
            console.error("Error updating trip details:", oError);
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
        // Get the user-entered date in the display format
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
