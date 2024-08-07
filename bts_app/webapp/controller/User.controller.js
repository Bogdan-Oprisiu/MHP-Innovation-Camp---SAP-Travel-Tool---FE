sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (Controller, MessageToast, JSONModel, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("bts.btsapp.controller.User", {
      onInit: function () {
        var oModel = new JSONModel(
          sap.ui.require.toUrl("bts/btsapp/model/MockBTs.json")
        );
        // this.getView().setModel(oModel, "mockBTs");

        this._router = this.getOwnerComponent().getRouter();
      },

      _filterTrips: function (status) {
        var oList = this.byId("btList");
        var oBinding = oList.getBinding("items");
        var aFilters = [];
        if (status) {
          aFilters.push(new Filter("status", FilterOperator.EQ, status));
        }
        oBinding.filter(aFilters);
      },

      onFilterSelect: function (oEvent) {
        var oBinding = this.byId("btTable").getBinding("items"),
          sKey = oEvent.getParameter("key"),
          aFilters = [];

        if (sKey === "all") {
          oBinding.filter([]);
        } else if (sKey === "in process") {
          aFilters.push(new Filter("status", FilterOperator.EQ, "in process"));
        } else if (sKey === "approved") {
          aFilters.push(new Filter("status", FilterOperator.EQ, "approved"));
        } else if (sKey === "denied") {
          aFilters.push(new Filter("status", FilterOperator.EQ, "denied"));
        }

        oBinding.filter(aFilters);
      },

      onTableRowSelection: function (oEvent) {
        // Get the selected item
        var oSelectedItem =
          oEvent.getParameter("listItem") || oEvent.getSource();
        var oContext = oSelectedItem.getBindingContext("mockBTs");
        var sObjectId = oContext.getProperty("id"); // Assuming `id` is the unique identifier

        // Navigate to the details view with the selected item ID
        this._router.navTo("Details", {
          btId: sObjectId,
        });
      },
    });
  }
);
