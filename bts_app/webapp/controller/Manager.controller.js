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

        //
        var oModel = this.getOwnerComponent().getModel();
        var oSessionModel = this.getOwnerComponent().getModel("session");

        var tripData = {
          emp: [],
          empTrips: [],
          trips: [],
          expenses: [],
          teams: [],
          combinedData: [],
        };

        var oAllTripsModel = this.getOwnerComponent().getModel("allTrips");
        oAllTripsModel.setData(tripData);

        var combineData = () => {
          // Find the team where the current manager is the supervisor
          var managerTeam = tripData.teams.find((team) => {
            return team.SUPERVISOR === oSessionModel.getData().username;
          });

          if (!managerTeam) {
            console.error("No team found for the current manager.");
            return;
          }

          // Filter the employees who are members of the manager's team
          var subordinatePersonalNumbers = tripData.emp
            .filter((emp) => emp.TEAMID === managerTeam.TEAMID)
            .map((emp) => emp.PERSONAL_NUMBER);

          // Filter the trips based on the subordinates' personal numbers
          tripData.combinedData = tripData.empTrips
            .filter((empTrip) => {
              return subordinatePersonalNumbers.includes(
                empTrip.PERSONAL_NUMBER.trim()
              );
            })
            .map((empTrip) => {
              let trip = tripData.trips.find(
                (trip) => trip.TRIPID === empTrip.TRIPID
              );
              let expense = tripData.expenses.find(
                (expense) =>
                  expense.EXPENSESID.trim() === empTrip.EXPENSESID.trim()
              );
              let emp = tripData.emp.find(
                (emp) =>
                  emp.PERSONAL_NUMBER.trim() === empTrip.PERSONAL_NUMBER.trim()
              );
              let team = tripData.teams.find(
                (team) => team.TEAMID === emp.TEAMID
              );

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
                ...emp,
                ...empTrip,
                ...trip,
                ...expense,
                team: team ? team.NAME : "No Team",
                TOTAL_PRICE: totalPrice,
              };
            });

          // Update the allTrips model with combined data
          oAllTripsModel.setProperty("/combinedData", tripData.combinedData);
          // console.log(oAllTripsModel.getData());
        };

        // Fetch EmpTripSet data
        oModel.read("/Emp_TripSet", {
          success: (oEmpTripData) => {
            var empTrips = oEmpTripData.results;
            tripData.empTrips = empTrips;

            // Fetch TripSet data
            oModel.read("/TripSet", {
              success: (oTripData) => {
                var trips = oTripData.results;
                tripData.trips = trips;

                // Fetch ExpensesSet data
                oModel.read("/ExpensesSet", {
                  success: (oExpensesData) => {
                    var expenses = oExpensesData.results;
                    tripData.expenses = expenses;

                    // Fetch EmployeeSet data
                    oModel.read("/EmployeeSet", {
                      success: (oEmployeeData) => {
                        var employees = oEmployeeData.results;
                        tripData.emp = employees;

                        oModel.read("/TeamSet", {
                          success: (oTeamData) => {
                            var teams = oTeamData.results;
                            tripData.teams = teams;

                            // Combine data after fetching all sets
                            combineData();
                          },
                          error: (oError) => {
                            console.error(
                              "Error fetching TeamSet data:",
                              oError
                            );
                          },
                        });
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

      _clearUserModel: function () {
        var oMyTripsModel = this.getOwnerComponent().getModel("myTrips");
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
          aFilters.push(new Filter("ACCEPTED", FilterOperator.EQ, "approved"));
        } else if (sKey === "In process") {
          aFilters.push(
            new Filter("ACCEPTED", FilterOperator.EQ, "in process")
          );
        } else if (sKey === "Denied") {
          aFilters.push(new Filter("ACCEPTED", FilterOperator.EQ, "denied"));
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
        var oFilterBar = this.byId("filterBarInProcess");
        var aFilters = [];

        // Extract values from the FilterBar controls
        var sName = oFilterBar.getFilterGroupItems()[0].getControl().getValue();
        var sLocation = oFilterBar.getFilterGroupItems()[1].getControl().getValue();
        var sDate = oFilterBar.getFilterGroupItems()[2].getControl().getDateValue();

        // Ensure status filter is applied
        aFilters.push(new Filter("ACCEPTED", FilterOperator.EQ, "in process"));

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

      onViewMyTrips: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("RouteUser");
      },
    });
  }
);
