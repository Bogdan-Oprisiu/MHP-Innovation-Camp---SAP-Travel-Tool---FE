sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat",
    "../utils/CookieUtils",
    "sap/ui/unified/FileUploader",
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
        // Attach pattern-matched event to the route
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter
          .getRoute("RouteManager")
          .attachPatternMatched(
            (oEvent) => this._onObjectMatched(oEvent),
            this
          );
      },

      _onObjectMatched: function (oEvent) {
        var oSessionModel = this.getOwnerComponent().getModel("session");
        var oSessionData = oSessionModel.getData();
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

      // Method to handle filter changes based on IconTabBar selection
      onFilterSelect: function (oEvent) {
        var sKey = oEvent.getParameter("key");
        var oTable = this.byId("btTable");
        var oBinding = oTable.getBinding("items");

        var aFilters = [];

        if (sKey === "all") {
          oBinding.filter([]);
        } else if (sKey === "pending") {
          aFilters.push(
            new Filter("ACCEPTED", FilterOperator.Contains, "pending")
          );
        } else if (sKey === "approved") {
          aFilters.push(
            new Filter("ACCEPTED", FilterOperator.Contains, "approved")
          );
        } else if (sKey === "denied") {
          aFilters.push(
            new Filter("ACCEPTED", FilterOperator.Contains, "denied")
          );
        }

        oBinding.filter(aFilters);
      },

      onSearchAll: function (oEvent) {
        var oFilterBar = this.byId("filterBarAll");
        var aFilters = [];

        // Extract values from the FilterBar controls
        var sLocation = oFilterBar
          .getFilterGroupItems()[0]
          .getControl()
          .getValue();
        var sDate = oFilterBar
          .getFilterGroupItems()[1]
          .getControl()
          .getDateValue();

        if (sLocation) {
          aFilters.push(new Filter("CITY", FilterOperator.Contains, sLocation));
        }
        if (sDate) {
          // Format date for comparison
          var sFormattedDate = DateFormat.getDateInstance({
            pattern: "yyyyMMdd",
          }).format(sDate);
          aFilters.push(
            new Filter("START_DATE", FilterOperator.EQ, sFormattedDate)
          );
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
        var sLocation = oFilterBar
          .getFilterGroupItems()[0]
          .getControl()
          .getValue();
        var sDate = oFilterBar
          .getFilterGroupItems()[1]
          .getControl()
          .getDateValue();

        // Ensure status filter is applied
        aFilters.push(new Filter("ACCEPTED", FilterOperator.EQ, "approved"));

        if (sLocation) {
          aFilters.push(new Filter("CITY", FilterOperator.Contains, sLocation));
        }
        if (sDate) {
          // Format date for comparison
          var sFormattedDate = DateFormat.getDateInstance({
            pattern: "yyyyMMdd",
          }).format(sDate);
          aFilters.push(
            new Filter("START_DATE", FilterOperator.EQ, sFormattedDate)
          );
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
        var sLocation = oFilterBar
          .getFilterGroupItems()[0]
          .getControl()
          .getValue();
        var sDate = oFilterBar
          .getFilterGroupItems()[1]
          .getControl()
          .getDateValue();

        // Ensure status filter is applied
        aFilters.push(new Filter("ACCEPTED", FilterOperator.EQ, "pending"));

        if (sLocation) {
          aFilters.push(new Filter("CITY", FilterOperator.Contains, sLocation));
        }
        if (sDate) {
          // Format date for comparison
          var sFormattedDate = DateFormat.getDateInstance({
            pattern: "yyyyMMdd",
          }).format(sDate);
          aFilters.push(
            new Filter("START_DATE", FilterOperator.EQ, sFormattedDate)
          );
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
        var sLocation = oFilterBar
          .getFilterGroupItems()[0]
          .getControl()
          .getValue();
        var sDate = oFilterBar
          .getFilterGroupItems()[1]
          .getControl()
          .getDateValue();

        aFilters.push(new Filter("ACCEPTED", FilterOperator.EQ, "denied"));

        if (sLocation) {
          aFilters.push(new Filter("CITY", FilterOperator.Contains, sLocation));
        }
        if (sDate) {
          // Format date for comparison
          var sFormattedDate = DateFormat.getDateInstance({
            pattern: "yyyyMMdd",
          }).format(sDate);
          aFilters.push(
            new Filter("START_DATE", FilterOperator.EQ, sFormattedDate)
          );
        }

        // Apply filters to the table binding
        var oTable = this.byId("btTable");
        var oBinding = oTable.getBinding("items");
        oBinding.filter(aFilters);
      },

      handleUploadPress: function (oEvent) {
        var oFileUploader = this.getView().byId("fileUploader");

        // Retrieve the CSRF token
        this.csrfToken = this.getView().getModel().getSecurityToken();
        oFileUploader.setSendXHR(true);

        // Add CSRF Token header
        var oCsrfTokenHeader = new sap.ui.unified.FileUploaderParameter({
          name: "x-csrf-token",
          value: this.csrfToken,
        });
        oFileUploader.addHeaderParameter(oCsrfTokenHeader);

        // Add Slug header (if needed)
        var oSlugHeader = new sap.ui.unified.FileUploaderParameter({
          name: "slug",
          value: oFileUploader.getValue(),
        });
        oFileUploader.addHeaderParameter(oSlugHeader);

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
              oFileUploader.upload();
              oFileUploader.destroyHeaderParameters();
            },
            function (error) {
              sap.m.MessageToast.show(
                "The file cannot be read. It may have changed."
              );
            }
          )
          .then(function () {
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
    });
  }
);
