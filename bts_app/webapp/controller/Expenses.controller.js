sap.ui.define(["sap/ui/core/mvc/Controller",  "sap/m/MessageToast", "sap/ui/model/json/JSONModel"], function (BaseController,MessageToast, JSONModel) {
  "use strict";

  return BaseController.extend("bts.btsapp.controller.Expenses", {
    onInit: function () {
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter
        .getRoute("RouteTripExpenses")
        .attachPatternMatched(this._onObjectMatched, this);
        var oStateModel = new JSONModel({
          empId: "",
          btId: ""
      });
      this.getView().setModel(oStateModel, "stateModel");
    },
    _onObjectMatched: function (oEvent) {
      var oSessionModel = this.getOwnerComponent().getModel("session");
      var oSessionData = oSessionModel.getData();

      var sExpId = oEvent.getParameter("arguments").expId.trim();
      var sEmpId = oEvent.getParameter("arguments").empId.trim();
      var sBtId = oEvent.getParameter("arguments").btId.trim();

      var oStateModel = this.getView().getModel("stateModel");
      oStateModel.setProperty("/empId", sEmpId);
      oStateModel.setProperty("/btId", sBtId);

      var oModel = this.getOwnerComponent().getModel();
      var sPath = "/ExpensesSet(EXPENSESID='" + sExpId + "')";

      // Read the specific data from the backend
      oModel.read(sPath, {
        success: (oData) => {
          var oSessionModel = this.getOwnerComponent().getModel("session");
          var oSessionData = oSessionModel.getData();
          
          var oExpModel = new JSONModel(oData);
          this.getView().setModel(oExpModel, "expInfo");
         
        },
        error: (oError) => {
          console.error("Error fetching data:", oError);
        }
      });
    },

  


    handleSaveExpenses: function() {
      var oView = this.getView();
      var oModel = this.getOwnerComponent().getModel("mainServiceModel"); 
  
      
      var oExpModel = oView.getModel("expInfo");
      var oFormData = oExpModel.getData();
      var oStateModel = this.getView().getModel("stateModel");
      var sEmpId = oStateModel.getProperty("/empId");
      var sBtId = oStateModel.getProperty("/btId");
  
      var sExpId = oFormData.EXPENSESID.trim();
  
      
      if (!sExpId) {
          sap.m.MessageToast.show("Expenses ID is missing");
          return;
      }
  
      
      var sPath = `/ExpensesSet(EXPENSESID='${sExpId}')`; 
  
     
      var oUpdatedData = {
          EXPENSESID: oFormData.EXPENSESID.trim(),
          CURRENCY: oFormData.CURRENCY,
          ADVANCED_PAYMENT: oFormData.ADVANCED_PAYMENT,
          DIEM_RATE: oFormData.DIEM_RATE,
          HOTEL_COSTS: oFormData.HOTEL_COSTS,
          TRAIN_TICKETS: oFormData.TRAIN_TICKETS,
          RENTAL_CAR: oFormData.RENTAL_CAR,
          GAS_COSTS: oFormData.GAS_COSTS,
          BANK_CHARGES: oFormData.BANK_CHARGES,
          BUSINESS_MEALS: oFormData.BUSINESS_MEALS,
          FOOD_BEVERAGES: oFormData.FOOD_BEVERAGES,
          IT_SUPPLIES: oFormData.IT_SUPPLIES,
          OFFICE_SUPPLIES: oFormData.OFFICE_SUPPLIES,
          AIR_FARE: oFormData.AIR_FARE
        };
  
        console.log(oUpdatedData);
   
        oModel.update(sPath, oUpdatedData, {
          success: function() {
              sap.m.MessageToast.show("Expenses information updated successfully!");
  
              var sEmpId = oStateModel.getProperty("/empId");
              var sBtId = oStateModel.getProperty("/btId");
  
              
              this.getOwnerComponent().getRouter().navTo("RouteDetails", {
                  empId: sEmpId,
                  btId: sBtId
              });
          }.bind(this),
          error: function(oError) {
              sap.m.MessageToast.show("Failed to update information.");
              console.error("Error updating expenses information:", oError);
          }
      });
  },


  

  handleCancelExpenses: function() {
    var oStateModel = this.getView().getModel("stateModel");

    var sEmpId = oStateModel.getProperty("/empId");
    var sBtId = oStateModel.getProperty("/btId");

    var oModel = this.getOwnerComponent().getModel("mainServiceModel");
    oModel.refresh(true);

    this.getOwnerComponent().getRouter().navTo("RouteDetails", {
        empId: sEmpId,
        btId: sBtId
    });
}
  });
});


