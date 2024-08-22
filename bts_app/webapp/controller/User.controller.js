sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat",
    "../utils/CookieUtils",
    "sap/ui/unified/FileUploader"
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

    return Controller.extend("bts.btsapp.controller.User", {
      onInit: function () {
        var oSessionModel = this.getOwnerComponent().getModel("session");
        var oSessionData = oSessionModel.getData();

        if (oSessionData.authenticated) {
          this._fetchData();
        } else {
          oSessionModel.attachPropertyChange(this._onSessionChange, this);
        }
      },

      _clearManagerModel: function () {
        var oAllTripsModel = this.getOwnerComponent().getModel("myTrips");
        if (oAllTripsModel) {
          oAllTripsModel.setData({});
        }
      },

      _onSessionChange: function (oEvent) {
        var oSessionModel = oEvent.getSource();
        var oSessionData = oSessionModel.getData();

        if (oSessionData.authenticated) {
          this._fetchData();
        }
      },
      _fetchData: function () {
        var oModel = this.getOwnerComponent().getModel();
        var oSessionModel = this.getOwnerComponent().getModel("session");
        var oSessionData = oSessionModel.getData();

        
    
        // Filter based on PERSONAL_NUMBER
        var sFilter = "PERSONAL_NUMBER eq '" + oSessionData.personalNumber + "'";
        
 
        oModel.read("/CombinedTripDataSet", {
            filters: [new Filter("PERSONAL_NUMBER", FilterOperator.EQ, oSessionData.personalNumber)],
            success: (oData) => {
                var oViewModel = this.getView().getModel("myTrips");
    
              
                oViewModel.setData({
                    combinedData: oData.results
                });
            },
            error: (oError) => {
                console.error("Error fetching CombinedTripDataSet data:", oError);
            }
        });
    },
    

      onTableRowSelection: function (oEvent) {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        var oSelectedItem =
          oEvent.getParameter("listItem") || oEvent.getSource();
        var oContext = oSelectedItem.getBindingContext("myTrips");
        var sEmpId = oContext.getProperty("PERSONAL_NUMBER");
        var sBtId = oContext.getProperty("TRIPID");

        var oModel = this.getView().getModel("myTrips");
        var aCombinedData = oModel.getProperty("/combinedData");

        if (aCombinedData && aCombinedData.length > 0) {
          oRouter.navTo("RouteDetails", {
            empId: sEmpId,
            btId: sBtId,
          });
        } else {
          console.warn("Combined data is not yet available.");
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

      // Method to handle filter changes based on IconTabBar selection
      onFilterSelect: function (oEvent) {
        var sKey = oEvent.getParameter("key");
        var oTable = this.byId("btTable");
        var oBinding = oTable.getBinding("items");
 
        var  aFilters = [];
 
        if (sKey === "all") {
          oBinding.filter([]);
        } else if (sKey === "pending") {
          aFilters.push(new Filter("ACCEPTED", FilterOperator.Contains, "pending"));
        } else if (sKey === "approved") {
          aFilters.push(new Filter("ACCEPTED", FilterOperator.Contains, "approved"));
        } else if (sKey === "denied") {
          aFilters.push(new Filter("ACCEPTED", FilterOperator.Contains, "denied"));
        }

        oBinding.filter(aFilters);
      },

      onSearchAll: function (oEvent) {
        var oFilterBar = this.byId("filterBarAll");
        var aFilters = [];

        // Extract values from the FilterBar controls
        var sLocation = oFilterBar.getFilterGroupItems()[0].getControl().getValue();
        var sDate = oFilterBar.getFilterGroupItems()[1].getControl().getDateValue();

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
        var sLocation = oFilterBar.getFilterGroupItems()[0].getControl().getValue();
        var sDate = oFilterBar.getFilterGroupItems()[1].getControl().getDateValue();

        // Ensure status filter is applied
        aFilters.push(new Filter("ACCEPTED", FilterOperator.EQ, "approved"));

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

      onSearchInProcess: function (oEvent) {
        var oFilterBar = this.byId("filterBarPending");
        var aFilters = [];

        // Extract values from the FilterBar controls
        var sLocation = oFilterBar.getFilterGroupItems()[0].getControl().getValue();
        var sDate = oFilterBar.getFilterGroupItems()[1].getControl().getDateValue();

        // Ensure status filter is applied
        aFilters.push(new Filter("ACCEPTED", FilterOperator.EQ, "pending"));

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

        // Extract values from the FilterBar controls
        var sLocation = oFilterBar.getFilterGroupItems()[0].getControl().getValue();
        var sDate = oFilterBar.getFilterGroupItems()[1].getControl().getDateValue();

        aFilters.push(new Filter("ACCEPTED", FilterOperator.EQ, "denied"));


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

      handleUploadPress: function(oEvent) {
        var oFileUploader = this.getView().byId("fileUploader");
    
        // Retrieve the CSRF token
        this.csrfToken = this.getView().getModel().getSecurityToken();
        oFileUploader.setSendXHR(true);
    
        // Add CSRF Token header
        var oCsrfTokenHeader = new sap.ui.unified.FileUploaderParameter({
            name: 'x-csrf-token',
            value: this.csrfToken
        });
        oFileUploader.addHeaderParameter(oCsrfTokenHeader);
    
        // Add Slug header (if needed)
        var oSlugHeader = new sap.ui.unified.FileUploaderParameter({
            name: 'slug',
            value: oFileUploader.getValue()
        });
        oFileUploader.addHeaderParameter(oSlugHeader);
    
        // Add X-Requested-With header
        var oXRequestedWithHeader = new sap.ui.unified.FileUploaderParameter({
            name: 'X-Requested-With',
            value: 'XMLHttpRequest'
        });
        oFileUploader.addHeaderParameter(oXRequestedWithHeader);
    
        // Upload the file
        oFileUploader.checkFileReadable().then(function() {
            oFileUploader.upload();
            oFileUploader.destroyHeaderParameters();
        }, function(error) {
            sap.m.MessageToast.show("The file cannot be read. It may have changed.");
        }).then(function() {
            oFileUploader.clear();
        });
    },
    
    
    handleUploadComplete: function(oEvent) {
      var sResponse = oEvent.getParameter("response");
      if (sResponse) {
          sap.m.MessageToast.show("File uploaded successfully");
      } else {
          sap.m.MessageToast.show("File upload failed");
      }
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
        oRouter.navTo("RouteWelcome")
        window.location.reload(true);
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
