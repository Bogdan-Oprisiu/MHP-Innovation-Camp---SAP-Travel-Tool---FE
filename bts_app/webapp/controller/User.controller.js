sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat",
    "../utils/CookieUtils",
    "sap/ui/unified/FileUploader",
    "sap/ui/model/json/JSONModel",
  ],
  function (
    Controller,
    MessageToast,
    Filter,
    FilterOperator,
    DateFormat,
    CookieUtils,
    JSONModel
  ) {
    "use strict";

    return Controller.extend("bts.btsapp.controller.User", {
      onInit: function () {
        // Attach pattern-matched event to the route
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter
          .getRoute("RouteUser")
          .attachPatternMatched(
            (oEvent) => this._onObjectMatched(oEvent),
            this
          );
        this._checkUrlAndSetUserViewFlag();
      },

      _checkUrlAndSetUserViewFlag: function () {
        var sUrl = window.location.href;
        var oSessionModel = this.getOwnerComponent().getModel("session");

        if (sUrl.includes("user")) {
          oSessionModel.setProperty("/isUserView", true);
        } else {
          oSessionModel.setProperty("/isUserView", false);
        }
      },

      handleSwitchToManagerViewPress: function () {
        // console.log(this.getOwnerComponent().getModel("session"));
        this.getOwnerComponent().getRouter().navTo("RouteManager");
      },

      _onObjectMatched: function (oEvent) {
        var oSessionModel = this.getOwnerComponent().getModel("session");
        var oSessionData = oSessionModel.getData();
        // console.log(oSessionData);
        var sEmpId = oSessionData.personalNumber.trim();
        var oTable = this.byId("btTable");

        // Force refresh of the OData model to ensure latest data is retrieved
        this.getOwnerComponent().getModel().refresh(true);

        // Example dynamic filter
        var oFilter = new sap.ui.model.Filter(
          "PERSONAL_NUMBER",
          sap.ui.model.FilterOperator.EQ,
          sEmpId
        );

        // Bind the items aggregation programmatically with a template
        oTable.bindItems({
          path: "/CombinedTripDataSet",
          filters: [oFilter],
          template: new sap.m.ColumnListItem({
            type: "Navigation",
            press: this.onTableRowSelection.bind(this),
            cells: [
              new sap.m.Text({ text: "{CITY}" }),
              new sap.m.Text({ text: "{TOTAL_EXPENSES}" }),
              new sap.m.Text({
                text: {
                  path: "START_DATE",
                  formatter: this.formatDate.bind(this),
                },
              }),
              new sap.m.Text({
                text: {
                  path: "ACCEPTED",
                  formatter: this.formatValueUpToFirstSpace.bind(this),
                },
              }),
            ],
          }),
        });
      },

      onTableRowSelection: function (oEvent) {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        var oSelectedItem =
          oEvent.getParameter("listItem") || oEvent.getSource();
        var oContext = oSelectedItem.getBindingContext();
        var sEmpId = oContext.getProperty("PERSONAL_NUMBER");
        var sBtId = oContext.getProperty("TRIPID");

        oRouter.navTo("RouteDetails", {
          empId: sEmpId,
          btId: sBtId,
        });
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

      formatValueUpToFirstSpace: function (sValue) {
        if (sValue) {
          var iSpaceIndex = sValue.indexOf(" ");
          if (iSpaceIndex !== -1) {
            return sValue.substring(0, iSpaceIndex);
          }
          return sValue;
        }
        return "";
      },

      onFilterSelect: function (oEvent) {
        // console.log(oEvent);

        var sKey = oEvent.mParameters.key;
        // console.log(sKey);
        var oTable = this.byId("btTable");
        var oBinding = oTable.getBinding("items");

        var oSessionModel = this.getOwnerComponent().getModel("session");
        var sEmpId = oSessionModel.getProperty("/personalNumber").trim(); // Get employee ID from the session model
        // Initialize the status filter
        var oStatusFilter;

        // Add the appropriate status filter based on the selected tab
        if (sKey === "pending") {
          oStatusFilter = new Filter(
            "ACCEPTED",
            FilterOperator.Contains,
            "pending"
          );
        } else if (sKey === "approved") {
          oStatusFilter = new Filter(
            "ACCEPTED",
            FilterOperator.Contains,
            "approved"
          );
        } else if (sKey === "denied") {
          oStatusFilter = new Filter(
            "ACCEPTED",
            FilterOperator.Contains,
            "denied"
          );
        }    
        // Combine both filters using the AND operator
        var aFilters = [];
        if (oStatusFilter) {
            // Combine filters with AND condition
            aFilters.push( oStatusFilter);
        } 
    
        // Apply the combined filters to the table binding
        oBinding.filter(aFilters);
      },

    onSearch: function(oEvent) {
      // console.log(oEvent);

      if(oEvent.mParameters.id.includes('filterBarInProces')){
        var sKey = "pending";
              // Get the user inputs for location and date from the filter bar
          var sLocation = this.byId("locationFilterInProcess").getValue().trim();
          var sDate = this.byId("dateFilterInProcess").getDateValue();
      } else if(oEvent.mParameters.id.includes('filterBarApproved')){
        var sKey = "approved";
                      // Get the user inputs for location and date from the filter bar
                      var sLocation = this.byId("locationFilterApproved").getValue().trim();
                      var sDate = this.byId("dateFilterApproved").getDateValue();
      } else if(oEvent.mParameters.id.includes('filterBarDenied')){
        var sKey = "denied";
                      // Get the user inputs for location and date from the filter bar
                      var sLocation = this.byId("locationFilterDenied").getValue().trim();
                      var sDate = this.byId("dateFilterDenied").getDateValue();
      }

      // var sKey = oEvent.getParameter("key");
      var oTable = this.byId("btTable");
      var oBinding = oTable.getBinding("items");
  
      var oSessionModel = this.getOwnerComponent().getModel("session");
      var sEmpId = oSessionModel.getProperty("/personalNumber").trim(); // Get employee ID from the session model
  
      // Initialize an array to hold all the filters
      var aFilters = [];
      var oStatusFilter;
      console.log(sKey);
  
      // Create the mandatory filter for PERSONAL_NUMBER
      //var oPersonalNumberFilter = new sap.ui.model.Filter("PERSONAL_NUMBER", sap.ui.model.FilterOperator.EQ, sEmpId);
      //aFilters.push(oPersonalNumberFilter);
  
              // Add the appropriate status filter based on the selected tab
              if (sKey === "pending") {
                oStatusFilter = new Filter("ACCEPTED", FilterOperator.Contains, "pending");
                aFilters.push(oStatusFilter)
            } else if (sKey === "approved") {
                oStatusFilter = new Filter("ACCEPTED", FilterOperator.Contains, "approved");
                aFilters.push(oStatusFilter)
            } else if (sKey === "denied") {
                oStatusFilter = new Filter("ACCEPTED", FilterOperator.Contains, "denied");
                aFilters.push(oStatusFilter)
            }

      // Create the location filter if a location was entered
      if (sLocation) {
          var oLocationFilter = new sap.ui.model.Filter("CITY", sap.ui.model.FilterOperator.Contains, sLocation);
          aFilters.push(oLocationFilter);
      }
  
      // Create the date filter if a date was selected
      if (sDate) {
          var sFormattedDate = sDate.toISOString().substring(0, 7).replace("-", ""); // Format date as YYYYMM
          var oDateFilter = new sap.ui.model.Filter("START_DATE", sap.ui.model.FilterOperator.EQ, sFormattedDate);
          aFilters.push(oDateFilter);
      }
  
      console.log(oStatusFilter);
      console.log(aFilters);

      if (aFilters.length > 1) {
        oCombinedFilter = new sap.ui.model.Filter({
            filters: aFilters,
            and: true
        });
    } else if (aFilters.length === 1) {
        oCombinedFilter = aFilters[0];
    }
     // Combine all filters using the AND operator
     var oCombinedFilter;

    // Apply the combined filter to the table binding
    if (oCombinedFilter) {
        oBinding.filter(oCombinedFilter);
    } else {
        oBinding.filter([]);
    }

    // Log the filters for debugging
    console.log("Filters applied:", oCombinedFilter);
  },
      handleUploadPress: function (oEvent) {
        var oFileUploader = this.getView().byId("fileUploader");

        // Retrieve the CSRF token
        this.csrfToken = this.getView().getModel().getSecurityToken();
        oFileUploader.setSendXHR(true); // Ensure XHR is used

        // Add CSRF Token header
        var oCsrfTokenHeader = new sap.ui.unified.FileUploaderParameter({
          name: "x-csrf-token",
          value: this.csrfToken,
        });
        oFileUploader.addHeaderParameter(oCsrfTokenHeader);

        // Add Slug header (for filename)
        var sFileName = oFileUploader.getValue().trim(); // This retrieves the selected file name
        var oSlugHeader = new sap.ui.unified.FileUploaderParameter({
          name: "slug",
          value: sFileName,
        });
        oFileUploader.addHeaderParameter(oSlugHeader);

        // Add MIME type header (if needed)
        var oContentTypeHeader = new sap.ui.unified.FileUploaderParameter({
          name: "Content-Type",
          value:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        oFileUploader.addHeaderParameter(oContentTypeHeader);

        // Add X-Requested-With header
        var oXRequestedWithHeader = new sap.ui.unified.FileUploaderParameter({
          name: "X-Requested-With",
          value: "XMLHttpRequest",
        });
        oFileUploader.addHeaderParameter(oXRequestedWithHeader);

        // Upload the file
        oFileUploader
          .checkFileReadable()
          .then(
            function () {
              // Proceed with the upload
              oFileUploader.upload();
              window.location.reload(true);
            },
            function (error) {
              // Handle any issues with file reading
              sap.m.MessageToast.show(
                "The file cannot be read. It may have changed."
              );
            }
          )
          .then(function () {
            // Clear the file uploader after upload
            oFileUploader.clear();
          });
      },

      handleUploadComplete: function (oEvent) {
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
        oRouter.navTo("RouteWelcome");
        window.location.reload(true);
      },

      formatValueUpToFirstSpace: function (sValue) {
        if (sValue) {
          var iSpaceIndex = sValue.indexOf(" ");
          if (iSpaceIndex !== -1) {
            return sValue.substring(0, iSpaceIndex);
          }
          return sValue; // Return the full string if no space is found.
        }
        return ""; // Return an empty string if sValue is null or undefined
      },
    });
  }
);
