sap.ui.define([
    "sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
function (Controller, MessageToast, JSONModel, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("bts.btsapp.controller.Manager", {
        onInit: function () {
            var oModel = new JSONModel(sap.ui.require.toUrl("bts/btsapp/model/MockBTs.json"));
            this.getView().setModel(oModel, "mockBTs");

        },


        onShowAllInProcess(){

            let msg="display all bts in process"
            MessageToast.show(msg);
            this.byId("toBeApproved").close();

            this._filterTrips("in process");



            },
           
            _filterTrips: function (status) {
                var oList = this.byId("dataList");
                var oBinding = oList.getBinding("items");
                var aFilters = [];
                if (status) {
                    aFilters.push(new Filter("status", FilterOperator.EQ, status));
                }
                oBinding.filter(aFilters);
            },

            onFilter(oEvent) {
               
            },


            onFilterSelect : function (oEvent) {
                var oBinding = this.byId("btTable").getBinding("items"),
                    sKey = oEvent.getParameter("key"),
                    // Array to combine filters
                    aFilters = []
    
                    if (sKey === "all") {
                        oBinding.filter([]);}
                    else if (sKey === "Ok") {
                    aFilters.push(new Filter("status", FilterOperator.EQ, "approved"));
                } else if (sKey === "In process") {
                    aFilters.push(new Filter("status", FilterOperator.EQ, "in process"));
                } else if (sKey === "Denied") {
                    aFilters.push(new Filter("status", FilterOperator.EQ, "denied"));
                }
    
                oBinding.filter(aFilters);
            }





            



        });


});
