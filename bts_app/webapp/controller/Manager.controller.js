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

    return Controller.extend("bts.btsapp.controller.Manager", {
      onInit: function () {
        var oModel = this.getOwnerComponent().getModel("mainServiceModel");

        var tripData = {
          emp: [],
          empTrips: [],
          trips: [],
          expenses: [],
          combinedData: [],
        };

        var oViewModel = new JSONModel(tripData);
        this.getView().setModel(oViewModel, "allTrips");

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
              (emp) =>
                emp.PERSONAL_NUMBER.trim() === empTrip.PERSONAL_NUMBER.trim()
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
              ...emp,
              ...empTrip,
              ...trip,
              ...expense,
              TOTAL_PRICE: totalPrice,
            };
          });

          console.log(tripData);

          // Update the model with combined data
          oViewModel.setProperty("/combinedData", tripData.combinedData);
        };

        // Fetch EmpTripSet data
        oModel.read("/Emp_TripSet", {
          success: (oEmpTripData) => {
            var empTrips = oEmpTripData.results;
            console.log(empTrips);
            tripData.empTrips = empTrips;

            // Fetch TripSet data
            oModel.read("/TripSet", {
              success: (oTripData) => {
                var trips = oTripData.results;
                console.log(trips);
                tripData.trips = trips;

                // Fetch ExpensesSet data
                oModel.read("/ExpensesSet", {
                  success: (oExpensesData) => {
                    var expenses = oExpensesData.results;
                    console.log(expenses);
                    tripData.expenses = expenses;

                    // Fetch EmployeeSet data
                  oModel.read("/EmployeeSet", {
                    success: (oEmployeeData) => {
                      var employees = oEmployeeData.results;
                      console.log(employees);
                      tripData.emp = employees;

                    combineData();
                  },
                  error: (oError) => {
                    console.error("Error fetching ExpensesSet data:", oError);
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
    });
  }
);
