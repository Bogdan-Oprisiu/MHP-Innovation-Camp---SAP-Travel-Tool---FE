sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat",
    "../utils/CookieUtils",
  ],
  function (
    Controller,
    MessageToast,
    Filter,
    FilterOperator,
    DateFormat,
    CookieUtils
  ) {
    "use strict";

    return Controller.extend("bts.btsapp.controller.Manager", {
      onInit: function () {
        this._clearUserModel();

        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.getRoute("RouteManager").attachPatternMatched(this._onRouteMatched, this);

        //
        var oModel = this.getOwnerComponent().getModel();
        var oSessionModel = this.getOwnerComponent().getModel("session");


        var oSessionData = oSessionModel.getData();
    
        var sEmpId = oSessionData.personalNumber.trim();
        
        // Construct the path for the OData request with filter applied
        var sPath = "/TripDetailsSet?$filter=PERSONAL_NUMBER eq '" + sEmpId + "'";
        
        // Log the constructed path for debugging
        // console.log(sPath);
      
 
        oModel.read(sPath, {
          success: (oData) => {
            var oViewModel = this.getView().getModel("allTrips");

            // Set the fetched data into the view model
            oViewModel.setData({
                combinedData: oData.results
            });
            console.log(oViewModel)
        },
            error: (oError) => {
                console.error("Error fetching CombinedManagerTripDataSet data:", oError);
            }
        });
},

      _clearUserModel: function () {
        var oMyTripsModel = this.getOwnerComponent().getModel("allTrips");
        if (oMyTripsModel) {
          oMyTripsModel.setData({});
        }
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

      onFilterSelect: function (oEvent) {
        var sKey = oEvent.getParameter("key");
        var oTable = this.byId("btTable");
        var oBinding = oTable.getBinding("items");

        var aFilters = [];
        if (sKey === "Ok") {
          aFilters.push(new Filter("ACCEPTED", FilterOperator.Contains, "approved"));
        } else if (sKey === "Pending") {
          aFilters.push(
            new Filter("ACCEPTED", FilterOperator.Contains, "pending")
          );
        } else if (sKey === "Denied") {
          aFilters.push(new Filter("ACCEPTED", FilterOperator.Contains, "denied"));
        }

        oBinding.filter(aFilters);
      },


      onSearchAll: function (oEvent) {
        var oFilterBar = this.byId("filterBarAll");
        var aFilters = [];

        // Extract values from the FilterBar controls
        var sName = oFilterBar.getFilterGroupItems()[0].getControl().getValue();
        var sLocation = oFilterBar.getFilterGroupItems()[1].getControl().getValue();
        var sDate = oFilterBar.getFilterGroupItems()[2].getControl().getDateValue();

        if (sName) {
          aFilters.push(new Filter("FIRST_NAME", FilterOperator.Contains, sName));
        }
        if (sLocation) {
          aFilters.push(new Filter("CITY", FilterOperator.Contains, sLocation));
        }
        if (sDate) {
          // Format date for comparison
          var sFormattedDate = DateFormat.getDateInstance({ pattern: "yyyyMMdd" }).format(sDate);
          aFilters.push(new Filter("START_DATE", FilterOperator.EQ, sFormattedDate));
        }

        // Apply filters to the table binding
        var oTable = this.byId("btTable");
        var oBinding = oTable.getBinding("items");
        oBinding.filter(aFilters);
      },

      onSearchApproved: function (oEvent) {
        var oFilterBar = this.byId("filterBarApproved");
        var aFilters = [];
      
        // Extract values from the FilterBar controls
        var sName = oFilterBar.getFilterGroupItems()[0].getControl().getValue();
        var sLocation = oFilterBar.getFilterGroupItems()[1].getControl().getValue();
        var sDate = oFilterBar.getFilterGroupItems()[2].getControl().getDateValue();
      
        // Ensure status filter is applied
        aFilters.push(new Filter("ACCEPTED", FilterOperator.EQ, "approved"));
      
        // Apply additional filters
        if (sName) {
          aFilters.push(new Filter("FIRST_NAME", FilterOperator.Contains, sName));
        }
        if (sLocation) {
          aFilters.push(new Filter("CITY", FilterOperator.Contains, sLocation));
        }
        if (sDate) {
          var sFormattedDate = DateFormat.getDateInstance({ pattern: "yyyyMMdd" }).format(sDate);
          aFilters.push(new Filter("START_DATE", FilterOperator.EQ, sFormattedDate));
        }
      
        // Apply filters to the table binding
        var oTable = this.byId("btTable");
        var oBinding = oTable.getBinding("items");
        oBinding.filter(aFilters);
      },
      

      onSearchInProcess: function (oEvent) {
        var oFilterBar = this.byId("filterBarPending");
        var aFilters = [];

        // Extract values from the FilterBar controls
        var sName = oFilterBar.getFilterGroupItems()[0].getControl().getValue();
        var sLocation = oFilterBar.getFilterGroupItems()[1].getControl().getValue();
        var sDate = oFilterBar.getFilterGroupItems()[2].getControl().getDateValue();

        // Ensure status filter is applied
        aFilters.push(new Filter("ACCEPTED", FilterOperator.EQ, "pending"));

        if (sName) {
          aFilters.push(new Filter("FIRST_NAME", FilterOperator.Contains, sName));
        }
        if (sLocation) {
          aFilters.push(new Filter("CITY", FilterOperator.Contains, sLocation));
        }
        if (sDate) {
          // Format date for comparison
          var sFormattedDate = DateFormat.getDateInstance({ pattern: "yyyyMMdd" }).format(sDate);
          aFilters.push(new Filter("START_DATE", FilterOperator.EQ, sFormattedDate));
        }

        // Apply filters to the table binding
        var oTable = this.byId("btTable");
        var oBinding = oTable.getBinding("items");
        oBinding.filter(aFilters);
      },

      onSearchDenied: function (oEvent) {
        var oFilterBar = this.byId("filterBarDenied");
        var aFilters = [];

        // Ensure status filter is applied
        aFilters.push(new Filter("ACCEPTED", FilterOperator.EQ, "denied"));

        // Extract values from the FilterBar controls
        var sName = oFilterBar.getFilterGroupItems()[0].getControl().getValue();
        var sLocation = oFilterBar.getFilterGroupItems()[1].getControl().getValue();
        var sDate = oFilterBar.getFilterGroupItems()[2].getControl().getDateValue();

        if (sName) {
          aFilters.push(new Filter("FIRST_NAME", FilterOperator.Contains, sName));
        }
        if (sLocation) {
          aFilters.push(new Filter("CITY", FilterOperator.Contains, sLocation));
        }
        if (sDate) {
          // Format date for comparison
          var sFormattedDate = DateFormat.getDateInstance({ pattern: "yyyyMMdd" }).format(sDate);
          aFilters.push(new Filter("START_DATE", FilterOperator.EQ, sFormattedDate));
        }

        // Apply filters to the table binding
        var oTable = this.byId("btTable");
        var oBinding = oTable.getBinding("items");
        oBinding.filter(aFilters);
      },

      onTableRowSelection: function (oEvent) {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        var oSelectedItem =
          oEvent.getParameter("listItem") || oEvent.getSource();
        var oContext = oSelectedItem.getBindingContext("allTrips");
        var sEmpId = oContext.getProperty("PERSONAL_NUMBER");
        var sBtId = oContext.getProperty("TRIPID");

        oRouter.navTo("RouteDetails", {
          empId: sEmpId,
          btId: sBtId,
        });
      },

      onLogout: function () {
        var oSessionModel = this.getOwnerComponent().getModel("session");
        oSessionModel.setData({
          authenticated: false,
          username: "",
          personalNumber: "",
          isManager: false,
        });

        // Erase cookies
        CookieUtils.eraseCookie("username");
        CookieUtils.eraseCookie("personalNumber");
        CookieUtils.eraseCookie("isManager");

        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("RouteWelcome");
        window.location.reload(true);
      },


      onSwitchRole: function (){
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("RouteUser");
      },

      formatValueUpToFirstSpace: function (sValue) {
        if (sValue) {
          var iSpaceIndex = sValue.indexOf(' ');
          if (iSpaceIndex !== -1) {
            return sValue.substring(0, iSpaceIndex);
          }
          return sValue; // Return the full string if no space is found.
        }
        return ''; // Return an empty string if sValue is null or undefined
      }
    });
  }
); 