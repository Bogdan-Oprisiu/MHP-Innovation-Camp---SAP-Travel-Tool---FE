sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("bts.btsapp.controller.Details", {

        onInit: function () {
            this._router = this.getOwnerComponent().getRouter();
            this._router.getRoute("details").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sObjectId = oEvent.getParameter("arguments").btId;
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("User");
        }
    });
});
