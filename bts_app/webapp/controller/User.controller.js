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
          oSessionModel.detachPropertyChange(this._onSessionChange, this);
        }
      },

      _fetchData: function () {
        var oModel = this.getOwnerComponent().getModel("mainServiceModel");
        var oSessionModel = this.getOwnerComponent().getModel("session");
        var oSessionData = oSessionModel.getData();

        var tripData = {
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
              TOTAL_PRICE: totalPrice,
            };
          });
        };

        // Create the view model with initial empty data
        var oViewModel = new JSONModel(tripData);
        this.getView().setModel(oViewModel, "myTrips");

        // Function to update the view model
        var updateViewModel = function () {
          combineData();
          oViewModel.setData({
            empTrips: tripData.empTrips,
            trips: tripData.trips,
            expenses: tripData.expenses,
            combinedData: tripData.combinedData,
          });

          console.log(tripData.combinedData);
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

                    // Update the view model after all data is fetched and processed
                    updateViewModel();
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
        // // Get the selected item
        // var oSelectedItem =
        //   oEvent.getParameter("listItem") || oEvent.getSource();
        // var oContext = oSelectedItem.getBindingContext("mockBTs");
        // var sObjectId = oContext.getProperty("id"); // Assuming `id` is the unique identifier
        // // Navigate to the details view with the selected item ID
        // this._router.navTo("Details", {
        //   btId: sObjectId,
        // });
      },
    });
  }
);
