sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat",
  ],
  function (
    Controller,
    MessageToast,
    JSONModel,
    Filter,
    FilterOperator,
    DateFormat
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

      _onSessionChange: function (oEvent) {
        var oSessionModel = oEvent.getSource();
        var oSessionData = oSessionModel.getData();

        if (oSessionData.authenticated) {
          this._fetchData();
        }
      },

      _fetchData: function () {
        var oModel = this.getOwnerComponent().getModel("mainServiceModel");
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
        };

        // Fetch EmpTripSet data
        oModel.read("/Emp_TripSet", {
          success: (oData) => {
            // Filter the data based on PERSONAL_NUMBER matching with session data
            tripData.empTrips = oData.results.filter((empTrip) => {
              return empTrip.PERSONAL_NUMBER === oSessionData.personalNumber;
            });

            // Fetch TripSet data after Emp_TripSet is processed
            oModel.read("/TripSet", {
              success: (oData) => {
                tripData.trips = oData.results.filter((trip) => {
                  // Check if the tripId is in the filtered empTrips data
                  return tripData.empTrips.some(
                    (empTrip) => empTrip.TRIPID === trip.TRIPID
                  );
                });

                // Fetch ExpensesSet data after TripSet is processed
                oModel.read("/ExpensesSet", {
                  success: (oData) => {
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
                      success: (oEmployeeData) => {
                        var employees = oEmployeeData.results;
                        // console.log(employees);
                        tripData.emp = employees;

                        // Update the view model after all data is fetched and processed
                        updateViewModel();
                        // console.log(tripData.combinedData);
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
        } else if (sKey === "in process") {
          aFilters.push(new Filter("ACCEPTED", FilterOperator.EQ, "in process"));
        } else if (sKey === "approved") {
          aFilters.push(new Filter("ACCEPTED", FilterOperator.EQ, "approved"));
        } else if (sKey === "denied") {
          aFilters.push(new Filter("ACCEPTED", FilterOperator.EQ, "denied"));
        }
 
        oBinding.filter(aFilters);
      }
    });
  }
);
