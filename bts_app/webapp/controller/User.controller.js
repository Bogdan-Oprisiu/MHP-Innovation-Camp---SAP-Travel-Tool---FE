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
        this._clearManagerModel();

        var oSessionModel = this.getOwnerComponent().getModel("session");
        var oSessionData = oSessionModel.getData();

        if (oSessionData.authenticated) {
          this._fetchData();
        } else {
          oSessionModel.attachPropertyChange(this._onSessionChange, this);
        }
      },

      _clearManagerModel: function () {
        var oAllTripsModel = this.getOwnerComponent().getModel("allTrips");
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

        var tripData = {
          emp: [],
          empTrips: [],
          trips: [],
          expenses: [],
          combinedData: [],
        };

        var combineData = () => {
          tripData.combinedData = tripData.empTrips.map((empTrip) => {
            let trip = tripData.trips.find(
              (trip) => trip.TRIPID === empTrip.TRIPID
            );
            let expense = tripData.expenses.find(
              (expense) =>
                expense.EXPENSESID.trim() === empTrip.EXPENSESID.trim()
            );
            let emp = tripData.emp.find(
              (emp) => emp.PERSONAL_NUMBER === empTrip.PERSONAL_NUMBER
            );

            // Calculate the total price for expenses
            let totalPrice = 0;
            if (expense) {
              totalPrice =
                parseFloat(expense.DIEM_RATE) +
                parseFloat(expense.HOTEL_COSTS) +
                parseFloat(expense.TRAIN_TICKETS) +
                parseFloat(expense.RENTAL_CAR) +
                parseFloat(expense.GAS_COSTS) +
                parseFloat(expense.BANK_CHARGES) +
                parseFloat(expense.BUSINESS_MEALS) +
                parseFloat(expense.FOOD_BEVERAGES) +
                parseFloat(expense.IT_SUPPLIES) +
                parseFloat(expense.OFFICE_SUPPLIES) +
                parseFloat(expense.AIR_FARE);
            }

            return {
              ...empTrip,
              ...trip,
              ...expense,
              ...emp,
              TOTAL_PRICE: totalPrice,
            };
          });
        };

        // Function to update the view model
        var updateViewModel = () => {
          combineData();
          var oViewModel = this.getView().getModel("myTrips");
          oViewModel.setData({
            empTrips: tripData.empTrips,
            trips: tripData.trips,
            expenses: tripData.expenses,
            combinedData: tripData.combinedData,
          });
          // console.log(tripData);
        };

        // Fetch EmpTripSet data
        oModel.read("/Emp_TripSet", {
          success: (oData) => {
            // console.log(oData.results);
            // Filter the data based on PERSONAL_NUMBER matching with session data
            tripData.empTrips = oData.results.filter((empTrip) => {
              return empTrip.PERSONAL_NUMBER === oSessionData.personalNumber;
            });

            // Fetch TripSet data after Emp_TripSet is processed
            oModel.read("/TripSet", {
              success: (oData) => {
                // console.log(oData.results);
                tripData.trips = oData.results.filter((trip) => {
                  // Check if the tripId is in the filtered empTrips data
                  return tripData.empTrips.some(
                    (empTrip) => empTrip.TRIPID === trip.TRIPID
                  );
                });

                // Fetch ExpensesSet data after TripSet is processed
                oModel.read("/ExpensesSet", {
                  success: (oData) => {
                    // console.log(oData.results);
                    // Extract EXPENSESID values from empTrips
                    var expenseIds = tripData.empTrips.map((empTrip) =>
                      empTrip.EXPENSESID.trim()
                    );

                    // Filter ExpensesSet based on EXPENSESID in empTrips
                    tripData.expenses = oData.results.filter((expense) => {
                      return expenseIds.includes(expense.EXPENSESID.trim());
                    });

                    // Fetch EmployeeSet data after ExpensesSet is processed
                    oModel.read("/EmployeeSet", {
                      success: (oData) => {
                        // console.log(oData.results);
                        var employees = oData.results;
                        // console.log(employees);
                        tripData.emp = employees;

                        // Update the view model after all data is fetched and processed
                        updateViewModel();
                      },
                      error: (oError) => {
                        console.error(
                          "Error fetching EmployeeSet data:",
                          oError
                        );
                      },
                    });
                  },
                  error: (oError) => {
                    console.error("Error fetching ExpensesSet data:", oError);
                  },
                });
              },
              error: (oError) => {
                console.error("Error fetching TripSet data:", oError);
              },
            });
          },
          error: (oError) => {
            console.error("Error fetching EmpTripSet data:", oError);
          },
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
      }
    });
  }
);
