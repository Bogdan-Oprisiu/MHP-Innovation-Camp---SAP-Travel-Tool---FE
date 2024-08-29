sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/format/DateFormat",
    "sap/ui/model/json/JSONModel",
  ],
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

     
        formatToBoolean: function(value) {
            if (value === "X") {
                return true; 
            } else if (value === "-") {
                return false; 
            } else {
                return false; 
            }
        },
       
    

      _onObjectMatched: function (oEvent) {
        var sEmpId = oEvent.getParameter("arguments").empId.trim();
        var sBtId = oEvent.getParameter("arguments").btId.trim();

        var oModel = this.getOwnerComponent().getModel();
        var sPath =
          "/TripDetailsSet(PERSONAL_NUMBER='" +
          sEmpId +
          "',TRIPID='" +
          sBtId +
          "')";

        // Read the specific trip data from the backend
        oModel.read(sPath, {
          success: (oData) => {
            var oSessionModel = this.getOwnerComponent().getModel("session");
            var oSessionData = oSessionModel.getData();
            var sId = oSessionData.personalNumber.trim();
            var sShowUserControls = oData.PERSONAL_NUMBER.trim() === sId.trim();

            oData.showUserControls = sShowUserControls;
            // console.log("Retrieved Data:", oData);
            var oDetailModel = new JSONModel(oData);
            this.getView().setModel(oDetailModel, "detail");

            if (!sShowUserControls) {
              var oButton = this.byId("editExpenses");

              // Find the parent FormElement containing the button
              var oFormElement = oButton.getParent();

              // Remove the button from the FormElement's aggregation
              if (oFormElement) {
                oFormElement.removeField(oButton);
              }
            }
          },
          error: (oError) => {
            console.error("Error fetching trip data:", oError);
          },
        });
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
        var oBackendFormat = DateFormat.getDateInstance({
          pattern: "yyyyMMdd",
        });
        return oBackendFormat.format(oDate);
      },

      handleApprovePress: function () {
        this._updateTripStatus("approved");
        
        this.getOwnerComponent().getRouter().navTo("RouteManager");
        window.location.reload(true);
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
        window.location.reload(true);
      },

      handleDeclineDialogCancel: function () {
        this.getView().byId("declineDialog").close();
      },

      _updateTripStatus: function (status) {
        var oView = this.getView();

        var sEmpId = this.getView()
          .getModel("detail")
          .getData()
          .PERSONAL_NUMBER.trim();
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

        console.log(sEmpId);
        console.log(sTripId);

        if (!sEmpId || !sTripId) {
          sap.m.MessageToast.show(
            "Missing trip details. Cannot proceed with the update."
          );
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

        var sEmpId = this.getView()
          .getModel("detail")
          .getData()
          .PERSONAL_NUMBER.trim();
        var sTripId = this.getView().getModel("detail").getData().TRIPID.trim();

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
          sap.m.MessageToast.show(
            "Missing trip details. Cannot proceed with the update."
          );
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
          ACCEPTED: "pending",
          REASON: sReasonForTravel,
        };

        oModel.update(sPath, oUpdatedData, {
          success: function () {
            sap.m.MessageToast.show("Trip details updated successfully!");
            oModel.refresh(true);
          },
          error: function (oError) {
            sap.m.MessageToast.show(
              "Failed to update trip details. Please try again."
            );
            console.error("Error updating trip details:", oError);
          },
        });
        this.getOwnerComponent().getRouter().navTo("RouteManager");
      },
      handleModifyCancel: function(){
        var oSessionModel = this.getOwnerComponent().getModel("session");
      
        this.getOwnerComponent().getRouter().navTo("RouteUser");
      },

      handleEditExpenses: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        var oDetailModel = this.getView().getModel("detail");
        var oDetailData = oDetailModel.getData();
        var sExpId = oDetailData.EXPENSESID.trim();
        var sEmpId = oDetailData.PERSONAL_NUMBER.trim();
        var sBtId = oDetailData.TRIPID.trim();
       

        console.log("Navigating to expenses with:", {
          expId: sExpId,
          empId: sEmpId,
          btId: sBtId,
        });

        oRouter.navTo("RouteTripExpenses", {
          expId: sExpId,
          empId: sEmpId,
          btId: sBtId,
        });
      },
    });
  }
);
