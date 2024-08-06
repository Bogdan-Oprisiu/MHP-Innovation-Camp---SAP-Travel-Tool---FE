sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
function (Controller) {
    "use strict";

    return Controller.extend("bts.btsapp.controller.Welcome", {
        onInit: function () {
            var oModel = this.getOwnerComponent().getModel("mockBTs");
            if (oModel) {
                var oData = oModel.getData();
                console.log("Existing Data: ", oData);
            } else {
                console.error("Model 'mockBTs' not found or not loaded.");
            }
        }

        
    });
});
