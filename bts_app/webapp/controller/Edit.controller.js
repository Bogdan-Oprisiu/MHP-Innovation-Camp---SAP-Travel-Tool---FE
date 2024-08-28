sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
  "use strict";

  return BaseController.extend("bts.btsapp.controller.Edit", {
    onInit: function () {
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter
        .getRoute("RouteEdit")
        .attachPatternMatched(this._onObjectMatched, this);
    },

    _onObjectMatched: function (oEvent) {
      var oSessionModel = this.getOwnerComponent().getModel("session");
      var oSessionData = oSessionModel.getData();
      // console.log(oSessionData);
      var sEmpId = oSessionData.personalNumber.trim();

      var oModel = this.getOwnerComponent().getModel();
      var sEmployeePath = "/Employee_with_AddressSet(PERSONAL_NUMBER='" + sEmpId + "')";
      
      
  

      // Read the specific data from the backend
      oModel.read(sEmployeePath, {
        success: (oData) => {
          var oSessionModel = this.getOwnerComponent().getModel("session");
          var oSessionData = oSessionModel.getData();
          var sId = oSessionData.personalNumber.trim();
          var sShowUserControls = oData.PERSONAL_NUMBER.trim() === sId.trim();
          
          oData.showUserControls = sShowUserControls;
          console.log("Retrieved Data:", oData);
          
          var oEmpModel = new JSONModel(oData);
          this.getView().setModel(oEmpModel, "empInfo");
        },
        error: (oError) => {
          console.error("Error fetching data:", oError);
        }
      });
    
    },
  


    handleSaveEdit: function() {
      var oView = this.getView();
      var oModel = this.getOwnerComponent().getModel("mainServiceModel"); 
  
      
      var oEmpModel = oView.getModel("empInfo");
      var oFormData = oEmpModel.getData();
  
      var sEmpId = oFormData.PERSONAL_NUMBER;
  
      
      if (!sEmpId) {
          sap.m.MessageToast.show("Personal Number is missing");
          return;
      }
  
      
      var sPath = `/Employee_with_AddressSet(PERSONAL_NUMBER='${sEmpId}')`; 
  
     
      var oUpdatedData = {
          PERSONAL_NUMBER: oFormData.PERSONAL_NUMBER,
          ADDRESSID: oFormData.ADDRESSID,
          COST_CENTER: oFormData.COST_CENTER,
          FIRST_NAME: oFormData.FIRST_NAME,
          LAST_NAME: oFormData.LAST_NAME,
          EMAIL: oFormData.EMAIL,
          USERNAME: oFormData.USERNAME,
          PHONE: oFormData.PHONE,
          JOB_TYPE: oFormData.JOB_TYPE,
          JOB_NUMBER: oFormData.JOB_NUMBER,
          City: oFormData.City,
          ZIP_CODE: oFormData.ZIP_CODE,
          HOME_ADDRESS: oFormData.HOME_ADDRESS
      };
  
   
      oModel.update(sPath, oUpdatedData, {
          success: function() {
              sap.m.MessageToast.show("User information updated successfully!");
              oModel.refresh(true); 
              this.getOwnerComponent().getRouter().navTo("RouteUser"); 
          }.bind(this),
          error: function(oError) {
              sap.m.MessageToast.show("Failed to update user information.");
              console.error("Error updating user information:", oError);
          }
      });
  },


  

    onNavBack: function () {
      var oSessionModel = this.getOwnerComponent().getModel("session");
      
      this.getOwnerComponent().getRouter().navTo("RouteUser");
    }
  });
});
